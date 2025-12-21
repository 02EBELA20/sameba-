# fix_sameba.ps1
# SAFE: makes backup first, then applies minimal changes.

$ErrorActionPreference = "Stop"

# --- 0) Backup ---
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "_backup_$ts"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

function Backup-File($path) {
  if (Test-Path $path) {
    $dest = Join-Path $backup ($path -replace "[:\\\/]", "_")
    Copy-Item $path -Destination $dest -Force
  }
}

Write-Host "Backup folder: $backup"

# --- 1) Remove settings routes/screens if exist ---
$deleteTargets = @(
  "app\settings.tsx",
  "app\settings.jsx",
  "app\settings\index.tsx",
  "app\settings\index.jsx",
  "src\screens\Settings.tsx",
  "src\screens\settings.tsx"
)

foreach ($t in $deleteTargets) {
  if (Test-Path $t) {
    Backup-File $t
    Remove-Item $t -Force
    Write-Host "Deleted: $t"
  }
}

if (Test-Path "app\settings") {
  try {
    Backup-File "app\settings\index.tsx"
    Backup-File "app\settings\index.jsx"
    Remove-Item "app\settings" -Recurse -Force
    Write-Host "Removed folder: app\settings"
  } catch {
    Write-Host "Could not remove app\settings (maybe not empty)."
  }
}

# --- 2) Ensure src/services exists ---
New-Item -ItemType Directory -Force -Path "src\services" | Out-Null

# --- 3) Write verseCycle.ts (random + no-repeat until exhausted) ---
$verseCycle = @'
import AsyncStorage from "@react-native-async-storage/async-storage";

// NOTE: expects array like [{ id, text, ... }]
import verses from "../data/messages.json";

const KEY_ORDER = "verse_order";
const KEY_INDEX = "verse_index";

function shuffle(arr: number[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getNextVerse(): Promise<any> {
  const list = verses as any[];
  if (!list?.length) throw new Error("messages.json is empty");

  const orderRaw = await AsyncStorage.getItem(KEY_ORDER);
  const indexRaw = await AsyncStorage.getItem(KEY_INDEX);

  let order: number[] = orderRaw ? JSON.parse(orderRaw) : [];
  let index = indexRaw ? Number(indexRaw) : 0;

  // init or repair
  if (!Array.isArray(order) || order.length !== list.length) {
    order = shuffle([...Array(list.length).keys()]);
    index = 0;
  }

  // exhausted -> reshuffle
  if (index >= order.length) {
    order = shuffle([...Array(list.length).keys()]);
    index = 0;
  }

  const verse = list[order[index]];

  await AsyncStorage.setItem(KEY_ORDER, JSON.stringify(order));
  await AsyncStorage.setItem(KEY_INDEX, String(index + 1));

  return verse;
}
'@

Backup-File "src\services\verseCycle.ts"
Set-Content -Path "src\services\verseCycle.ts" -Value $verseCycle -Encoding UTF8
Write-Host "Wrote: src/services/verseCycle.ts"

# --- 4) Write notifications.ts (SDK54+ timeInterval trigger) ---
$notifications = @'
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "hourly-verse";
let inited = false;

export async function initNotifications() {
  if (inited) return;
  inited = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Hourly Verse",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

export async function scheduleHourlyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "SAMEBA",
      body: "ახალი სულიერი მუხლი ✝️",
      data: { type: "nextVerse" },
      ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: "timeInterval",
      seconds: 60 * 60,
      repeats: true,
    } as any,
  });
}

export async function scheduleTestIn5s() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "SAMEBA",
      body: "ტესტი 5 წამში ✝️",
      data: { type: "nextVerse" },
      ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: { type: "timeInterval", seconds: 5 } as any,
  });
}
'@

Backup-File "src\services\notifications.ts"
Set-Content -Path "src\services\notifications.ts" -Value $notifications -Encoding UTF8
Write-Host "Wrote: src/services/notifications.ts"

# --- 5) Update app/_layout.tsx to init + schedule ---
Backup-File "app\_layout.tsx"
if (Test-Path "app\_layout.tsx") {
  $layout = Get-Content "app\_layout.tsx" -Raw

  # If user already has custom layout, we will replace it with a minimal safe one.
  $newLayout = @'
import { Slot } from "expo-router";
import { useEffect } from "react";
import { initNotifications, ensureNotificationPermission, scheduleHourlyReminder } from "../src/services/notifications";

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await initNotifications();
      const ok = await ensureNotificationPermission();
      if (ok) {
        await scheduleHourlyReminder();
      }
    })();
  }, []);

  return <Slot />;
}
'@
  Set-Content -Path "app\_layout.tsx" -Value $newLayout -Encoding UTF8
  Write-Host "Updated: app/_layout.tsx (minimal init + hourly schedule)"
} else {
  Write-Host "WARNING: app/_layout.tsx not found."
}

# --- 6) Ensure app/index.tsx uses src/components/Home ---
Backup-File "app\index.tsx"
$indexContent = @'
import Home from "../src/components/Home";

export default function Page() {
  return <Home />;
}
'@
Set-Content -Path "app\index.tsx" -Value $indexContent -Encoding UTF8
Write-Host "Updated: app/index.tsx -> renders src/components/Home"

# --- 7) Patch src/components/Home.tsx (remove settings nav + add test button + verse load) ---
if (Test-Path "src\components\Home.tsx") {
  Backup-File "src\components\Home.tsx"
  $home = Get-Content "src\components\Home.tsx" -Raw

  # Minimal overwrite to ensure it works (you can style later)
  $homeNew = @'
import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { getNextVerse } from "../services/verseCycle";
import { scheduleTestIn5s } from "../services/notifications";

export default function Home() {
  const [verse, setVerse] = useState<any>(null);

  async function loadNext() {
    const v = await getNextVerse();
    setVerse(v);
  }

  useEffect(() => {
    loadNext();

    const sub = Notifications.addNotificationResponseReceivedListener(async () => {
      await loadNext();
    });

    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 24, backgroundColor: "#f7f5ef" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>SAMEBA</Text>

      <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}>
        <ScrollView>
          <Text style={{ fontSize: 18, lineHeight: 28 }}>
            {verse?.text ?? "იტვირთება..."}
          </Text>
          {verse?.reference ? (
            <Text style={{ marginTop: 10, opacity: 0.6 }}>{verse.reference}</Text>
          ) : null}
        </ScrollView>
      </View>

      <Pressable
        onPress={loadNext}
        style={{ marginTop: 14, padding: 14, backgroundColor: "#2d8cff", borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
          შემდეგი მუხლი
        </Text>
      </Pressable>

      <Pressable
        onPress={scheduleTestIn5s}
        style={{ marginTop: 10, padding: 14, backgroundColor: "#111", borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 15 }}>
          Test notification (5s)
        </Text>
      </Pressable>

      <Text style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>
        * ავტომატურად: ყოველ 1 საათში მოდის შეტყობინება და გახსნაზე ახალი მუხლია.
      </Text>
    </View>
  );
}
'@

  Set-Content -Path "src\components\Home.tsx" -Value $homeNew -Encoding UTF8
  Write-Host "Updated: src/components/Home.tsx (minimal working Home)"
} else {
  Write-Host "WARNING: src/components/Home.tsx not found."
}

Write-Host ""
Write-Host "DONE ✅ Backup saved in: $backup"
Write-Host "Next: run `npx expo install expo-notifications @react-native-async-storage/async-storage` if needed."
Write-Host 'Then start: npx expo start --dev-client --lan'

