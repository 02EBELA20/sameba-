import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  AppState,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { DEVOTIONAL_VERSES, DevotionalVerse } from "../src/data/devotional";
import { getFavorites, toggleFavorite } from "../src/services/storage";
import { subscriptionService } from "../src/services/subscription";
import { useSubscription } from "../src/components/SubscriptionProvider";
import { usePremiumGuard } from "../src/hooks/usePremiumGuard";

import {
  initNotifications,
  enableVerseNotifications,
  disableVerseNotifications,
  getNotifEnabled,
  maintainScheduleIfNeeded,
  openOSNotificationSettings,
  getIntervalHours,
  setIntervalHours,
} from "../src/services/notifications";

function pickRandomVerse(): DevotionalVerse {
  const i = Math.floor(Math.random() * DEVOTIONAL_VERSES.length);
  return DEVOTIONAL_VERSES[i] ?? DEVOTIONAL_VERSES[0];
}

export default function HomeScreen() {
  const [verse, setVerse] = useState<DevotionalVerse>(() => DEVOTIONAL_VERSES[0]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [interval, setInterval] = useState<1 | 3>(1);
  const [loadingNotif, setLoadingNotif] = useState(true);
  
  const { authResult, loading: loadingAuth, refreshAuth } = useSubscription();
  const { requirePremium, canAccessPremium, isInTrial } = usePremiumGuard();

  const isFav = useMemo(
    () => favoriteIds.includes(verse.id),
    [favoriteIds, verse.id]
  );

  const loadHomeState = async () => {
    setFavoriteIds(await getFavorites());

    const on = await getNotifEnabled();
    setNotifEnabled(on);

    const h = await getIntervalHours();
    setInterval(h);

    if (on) await maintainScheduleIfNeeded(false);
  };

  useEffect(() => {
    initNotifications();
    setVerse(pickRandomVerse());

    (async () => {
      try {
        await loadHomeState();
      } finally {
        setLoadingNotif(false);
      }
    })();

    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        await loadHomeState();
      }
    });

    return () => sub.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHomeState();
    }, [])
  );

  const openDetails = () => {
    router.push({ pathname: "/verse/[id]", params: { id: String(verse.id) } });
  };

  const toggleFav = async () => {
    if (!requirePremium('save_favorite')) return;
    
    const next = await toggleFavorite(verse.id);
    setFavoriteIds(next);
  };

  const toggleNotif = async () => {
    if (!notifEnabled && !requirePremium('enable_notifications')) {
      Alert.alert("პრემიუმ ფუნქცია", "ნოტიფიკაციები ხელმისაწვდომელია მხოლოდ პრემიუმ მომხმარებლებისთვის.", [
        { text: "პრემიუმზე გადასვლა", onPress: () => router.push("/membership") },
        { text: "გაუქმება", style: "cancel" }
      ]);
      return;
    }
    
    try {
      if (notifEnabled) {
        await disableVerseNotifications();
        setNotifEnabled(false);
      } else {
        const granted = await enableVerseNotifications();
        if (granted) {
          setNotifEnabled(true);
          await maintainScheduleIfNeeded(false);
        }
      }
    } catch (error) {
      console.error('ნოტიფიკაციის შეცვლის შეცდომა:', error);
      Alert.alert('შეცდომა', 'ნოტიფიკაციების ჩართვა ვერ მოხერხდა.');
    } finally {
      setLoadingNotif(false);
    }
  };

  const onSelectInterval = async (h: 1 | 3) => {
    if (h === 3 && !canAccessPremium) {
      Alert.alert("პრემიუმ ფუნქცია", "3 საათიანი ინტერვალი ხელმისაწვდომელია მხოლოდ პრემიუმ მომხმარებლებისთვის.", [
        { text: "პრემიუმზე გადასვლა", onPress: () => router.push("/membership") },
        { text: "გაუქმება", style: "cancel" }
      ]);
      return;
    }

    setInterval(h);
    await setIntervalHours(h);

    // თუ ჩართულია — ახლიდან დაგეგმოს ახალი ინტერვალით
    if (notifEnabled) {
      await maintainScheduleIfNeeded(true);
      Alert.alert("განახლდა ✅", `ახლა მოვა ყოველ ${h} საათში ერთხელ.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bigTitle}>SAMEBA</Text>
      <Text style={styles.subtitle}>ყოველდღიური მუხლები, რომ ღმერთის სიტყვა მუდამ ჩვენთან იყოს.</Text>

      {/* Notifications toggle */}
      <View style={styles.notifRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.notifLabel}>შეტყობინებები</Text>
          <Text style={styles.notifHint}>
            ჩართე, რომ ტელეფონის დაბლოკილ ეკრანზე პერიოდულად გამოჩნდეს მუხლი.
          </Text>
        </View>

        <Switch
          value={notifEnabled}
          onValueChange={toggleNotif}
          disabled={loadingNotif}
        />
      </View>

      {/* Interval buttons */}
      <View style={styles.intervalRow}>
        <Pressable
          onPress={() => onSelectInterval(1)}
          style={[
            styles.intervalBtn,
            interval === 1 ? styles.intervalBtnOn : styles.intervalBtnOff,
          ]}
        >
          <Text style={interval === 1 ? styles.intervalTextOn : styles.intervalTextOff}>
            ყოველ 1 საათში
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectInterval(3)}
          style={[
            styles.intervalBtn,
            interval === 3 ? styles.intervalBtnOn : styles.intervalBtnOff,
            !canAccessPremium && !loadingAuth && styles.intervalBtnDisabled,
          ]}
          disabled={!canAccessPremium && !loadingAuth}
        >
          <Text style={interval === 3 ? styles.intervalTextOn : styles.intervalTextOff}>
            {canAccessPremium ? 'ყოველ 3 საათში' : '🔒 ყოველ 3 საათში'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.card} onPress={openDetails}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardLabel}>მუხლი</Text>

          <Pressable
            onPress={(e: any) => {
              e?.stopPropagation?.();
              toggleFav();
            }}
            hitSlop={10}
            style={styles.starBtn}
          >
            <Text style={styles.star}>{isFav ? "⭐" : "☆"}</Text>
          </Pressable>
        </View>

        <Text style={styles.message} numberOfLines={4} ellipsizeMode="tail">
          {verse.text}
        </Text>

        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse}
        </Text>

        <Text style={styles.hint}>დააჭირე სრულად სანახავად →</Text>
      </Pressable>

      <View style={styles.btnRow}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push("/membership")}>
          <Text style={styles.primaryBtnText}>შემდეგი მუხლი</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/favorites")}>
          <Text style={styles.secondaryBtnText}>ფავორიტები</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        {/* Premium Status - მოკლებული სტატუსისთვის */}
        {canAccessPremium ? (
          <Pressable 
            style={[styles.premiumBtn, styles.premiumActiveBtn]} 
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.premiumActiveBtnText}>
              {isInTrial ? '🆓 საცდელი აქტიურია' : '✅ პრემიუმ აქტიურია'}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.premiumBtn} onPress={() => router.push("/membership")}>
            <Text style={styles.premiumBtnText}>პრემიუმ წევრობა</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  bigTitle: { fontSize: 28, fontWeight: "800" },
  subtitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#333333", 
    textAlign: "center", 
    marginTop: 10,
    marginBottom: 10, 
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  notifRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifLabel: { fontSize: 14, fontWeight: "800" },
  notifHint: { marginTop: 4, fontSize: 12, opacity: 0.6 },

  intervalRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  intervalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  intervalBtnOn: { backgroundColor: "#2F80ED" },
  intervalBtnOff: { backgroundColor: "#EEE" },
  intervalBtnDisabled: { 
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  intervalTextOn: { color: "white", fontWeight: "800" },
  intervalTextOff: { color: "black", fontWeight: "800" },

  card: {
    marginTop: 14,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between" },
  cardLabel: { opacity: 0.6 },
  starBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  star: { fontSize: 22 },
  message: { marginTop: 10, fontSize: 18, lineHeight: 26 },
  reference: { marginTop: 10, opacity: 0.7 },
  hint: { marginTop: 10, opacity: 0.5 },

  btnRow: { marginTop: 16 },
  primaryBtn: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#2F80ED",
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800" },
  secondaryBtn: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EEE",
    alignItems: "center",
  },
  secondaryBtnText: { fontWeight: "800" },
  premiumBtn: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFD700",
    alignItems: "center",
  },
  premiumActiveBtn: {
    backgroundColor: "#28a745",
  },
  loadingButton: {
    opacity: 0.7,
    justifyContent: "center",
  },
  premiumBtnText: { 
    color: "#333", 
    fontWeight: "800", 
  
  },
  premiumActiveBtnText: {
    color: "white",
    fontWeight: "800",
  },
});
