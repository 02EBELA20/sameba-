export const COLORS = {
  primary: '#8B6F47',        // Bronze-brown - Orthodox icon/metal tones
  secondary: '#A0826D',      // Muted gold-brown - subtle gold accents
  background: '#F4E8D0',     // Warm parchment - traditional paper feel
  cardBackground: '#FAF6F0',  // Soft ivory - aged paper look
  text: '#3D352A',          // Deep warm charcoal - elegant dark brown
  textSecondary: '#6B5D4F',  // Soft brown-gray - readable but muted
  border: '#D4C4B0',        // Subtle parchment-brown - aged paper edges
  shadow: '#8B6F4715',       // Very soft bronze shadow - gentle depth
  goldAccent: '#B8956F',     // Refined Orthodox gold - traditional accents
  white: '#FFFFFF',
}

export const DARK_COLORS = {
  primary: '#C4A574',        // Warmer bronze for dark mode
  secondary: '#D4B595',      // Lighter muted gold for dark mode
  background: '#2A2520',     // Dark parchment - not harsh
  cardBackground: '#3D352A',  // Soft dark bronze cards
  text: '#FAF6F0',          // Warm ivory text for dark mode
  textSecondary: '#D4C4B0',  // Parchment secondary text
  border: '#6B5D4F',         // Dark parchment borders
  shadow: '#00000030',       // Darker shadows for dark mode
  goldAccent: '#E5C29F',     // Warmer Orthodox gold accent
  white: '#FFFFFF',
}

export const TYPOGRAPHY = {
  fontSize: { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const, extrabold: '800' as const },
  lineHeight: { 
    tight: 14,    // 11 * 1.27 - increased for Georgian
    normal: 22,   // 13 * 1.69 - increased for better readability
    relaxed: 30,  // 15 * 2.0 - increased for comfortable reading
  },
}

export function getThemeColors(isDark: boolean) {
  return isDark ? DARK_COLORS : COLORS;
}
