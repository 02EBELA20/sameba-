import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet, Text, View } from 'react-native';
import { getThemeColors } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';

function CustomDrawerContent(props: any) {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);

  const menuItems = [
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'home-outline' as const, route: '/(drawer)/' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'search-outline' as const, route: '/(drawer)/search' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'star-outline' as const, route: '/(drawer)/favorites' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'list-outline' as const, route: '/(drawer)/ten-commandments' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'heart-outline' as const, route: '/(drawer)/prayers' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'book-outline' as const, route: '/(drawer)/scriptures' },
    { title: '  1.  2.  3.  4.  5.  6.  7.  ', icon: 'settings-outline' as const, route: '/(drawer)/settings' },
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
          <DrawerItem
            key={index}
            label={() => (
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {item.title}
              </Text>
            )}
            icon={() => (
              <Ionicons
                name={item.icon}
                size={22}
                color={colors.primary}
                style={styles.menuIcon}
              />
            )}
            onPress={() => props.navigation.navigate(item.route)}
            style={[styles.drawerItem, { backgroundColor: colors.cardBackground }]}
          />
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
      <Drawer.Screen name="scriptures" options={{ title: 'წიგნები' }} />
      <Drawer.Screen name="settings" options={{ title: 'პარამეტრები' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    marginVertical: 2,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuIcon: {
    marginLeft: 8,
  },
});
