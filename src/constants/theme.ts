// GPIT UI Style Guide — sourced from claud.md

export type Theme = 'light' | 'dark';

const LightColors = {
  background: '#FFFFFF',
  primaryText: '#000000',       // black — main text, focused states
  primaryHighlight: '#E91E63',  // pink — reserved for brand accents only
  secondaryPink: '#E91E64',
  buttonBg: '#595959',
  buttonBgPressed: '#404040',
  buttonText: '#FFFFFF',
  border: '#D0D0D0',            // gray — inactive border/line
  borderFocus: '#595959',       // dark gray — focused border/line
  inputBg: '#FFFFFF',
  error: '#D32F2F',
  placeholder: '#A0A0A0',       // gray — placeholder & muted text
} as const;

const DarkColors = {
  background: '#1C1C1E',
  primaryText: '#FFFFFF',       // white — main text in dark mode
  primaryHighlight: '#E91E63',  // pink — brand accent remains same
  secondaryPink: '#E91E64',
  buttonBg: '#404040',
  buttonBgPressed: '#595959',
  buttonText: '#FFFFFF',
  border: '#404040',            // darker gray — inactive border/line
  borderFocus: '#FFFFFF',       // white — focused border/line in dark mode
  inputBg: '#2C2C2E',
  error: '#FF453A',             // lighter red for dark mode
  placeholder: '#8E8E93',       // lighter gray — placeholder in dark mode
} as const;

export function getColors(theme: Theme = 'light') {
  return theme === 'dark' ? DarkColors : LightColors;
}

export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const FontSize = {
  xs: 10,
  sm: 11,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 22,
} as const;

// Inter — modern professional UI font used by Linear, GitHub, Figma, Vercel.
// Drop TTFs into assets/fonts/ and run: npx react-native-asset
export const FontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;
