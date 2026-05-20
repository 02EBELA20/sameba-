import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { getThemeColors } from '../../src/constants/theme';

function CustomDrawerContent(props: any) {
  const colors = getThemeColors();

  const router = useRouter();

  const menuItems = [
    { title: 'მთავარი', icon: 'home-outline' as const, route: '/' },
    { title: 'ძიება', icon: 'search-outline' as const, route: '/search' },
    { title: 'ფავორიტები', icon: 'star-outline' as const, route: '/favorites' },
    { title: 'ათი მცნება', icon: 'list-outline' as const, route: '/ten-commandments' },
    { title: 'ლოცვები', icon: 'heart-outline' as const, route: '/prayers' },
    { title: 'წმინდა წერილები', icon: 'book-outline' as const, route: '/spiritual-materials' },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/clouds-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.drawerTitle, { color: colors.primary }]}>
            SAMEBA
          </Text>
        </View>

        <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable
            key={`${item.title}-${index}`}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? colors.primary + '30' : colors.surface }
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
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemText, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      </DrawerContentScrollView>
    </ImageBackground>
  );
}

export default function DrawerLayout() {
  const colors = getThemeColors();

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
        drawerActiveBackgroundColor: colors.surfaceSecondary,
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
  backgroundImage: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  drawerTitle: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: '#2F2F2F',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7A736B',
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  menuItemText: {
    fontSize: 18,
    lineHeight: 24,
    includeFontPadding: true,
    flex: 1,
    marginLeft: 12,
    flexShrink: 1,
  },
  menuIcon: {
    marginRight: 0,
    marginLeft: 0,
  },
});
