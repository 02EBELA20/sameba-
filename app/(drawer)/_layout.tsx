import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getThemeColors } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';

function CustomDrawerContent(props: any) {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);

  const router = useRouter();

  const menuItems = [
    { title: 'მთავარი', icon: 'home-outline' as const, route: '/' },
    { title: 'ძიება', icon: 'search-outline' as const, route: '/search' },
    { title: 'ფავორიტები', icon: 'star-outline' as const, route: '/favorites' },
    { title: 'ათი მცნება', icon: 'list-outline' as const, route: '/ten-commandments' },
    { title: 'ლოცვები', icon: 'heart-outline' as const, route: '/prayers' },
    { title: 'წმინდა წერილები', icon: 'book-outline' as const, route: '/spiritual-materials' },
    { title: 'პარამეტრები', icon: 'settings-outline' as const, route: '/settings' },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.drawerContent, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          სამება
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          სამების სახელითა, მამისა, ძისა და სულიწმინდისა, ამინ.
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? colors.primary + '30' : colors.cardBackground }
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuItemContent}>
              <Ionicons
                name={item.icon}
                size={22}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {item.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        drawerActiveBackgroundColor: colors.primary + '20',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'მთავარი' }} />
      <Drawer.Screen name="search" options={{ title: 'ძიება' }} />
      <Drawer.Screen name="favorites" options={{ title: 'ფავორიტები' }} />
      <Drawer.Screen name="ten-commandments" options={{ title: 'ათი მცნება' }} />
      <Drawer.Screen name="prayers" options={{ title: 'ლოცვები' }} />
      <Drawer.Screen name="spiritual-materials" options={{ title: 'სულიერი მასალები' }} />
      <Drawer.Screen name="spiritual-materials/gospels" options={{ title: 'სახარება' }} />
      <Drawer.Screen name="settings" options={{ title: 'პარამეტრები' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    marginVertical: 3,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
    marginLeft: 0,
  },
});
