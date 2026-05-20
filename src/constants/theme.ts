export type AppThemeColors = {
  background: string;
  backgroundSoft: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
  primaryDark: string;
  accent: string;
  active: string;
  drawerActive: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  header: string;
  buttonText: string;
  icon: string;
  shadow: string;
  white: string;
};

export const DEFAULT_THEME_COLORS: AppThemeColors = {
  background: '#F3F8FC',
  backgroundSoft: '#EAF4FB',
  surface: '#FFFFFF',
  surfaceSecondary: '#E8F1F7',
  primary: '#2F5F7E',
  primaryDark: '#23485F',
  accent: '#6FA8C9',
  active: '#2E8C89',
  drawerActive: '#DCECF6',
  text: '#1F2D36',
  textSecondary: '#50616C',
  textMuted: '#7A8A94',
  border: '#D5E4EE',
  header: '#2F5F7E',
  buttonText: '#FFFFFF',
  icon: '#2F5F7E',
  shadow: '#000000',
  white: '#FFFFFF',
};

export const TYPOGRAPHY = {
  fontSize: { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const, extrabold: '800' as const },
  lineHeight: { 
    tight: 14,    // 11 * 1.27 - increased for Georgian
    normal: 22,   // 13 * 1.69 - increased for better readability
    relaxed: 30,  // 15 * 2.0 - increased for comfortable reading
  },
}

export function getThemeColors() {
  return DEFAULT_THEME_COLORS;
}
