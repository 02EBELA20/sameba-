export const COLORS = {
  primary: '#8B6914',
  accent: '#4A1C5E',
  background: '#F5EDD8',
  cardBackground: '#FDFAF4',
  text: '#2C1810',
  textSecondary: '#6B4E2A',
  border: '#D4B896',
  shadow: '#2C1810',
  goldAccent: '#C9960C',
  white: '#FFFFFF',
}

export const DARK_COLORS = {
  primary: '#C9960C',
  accent: '#9B59B6',
  background: '#1A0F0A',
  cardBackground: '#2C1810',
  text: '#F5EDD8',
  textSecondary: '#C4A882',
  border: '#4A2E1A',
  shadow: '#000000',
  goldAccent: '#F0C040',
  white: '#FFFFFF',
}

export const TYPOGRAPHY = {
  fontSize: { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const, extrabold: '800' as const },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 },
}

export function getThemeColors(isDark: boolean) {
  return isDark ? DARK_COLORS : COLORS;
}
