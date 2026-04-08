// GPIT UI Style Guide — sourced from claud.md
import { Platform } from 'react-native';

export const Colors = {
  background: '#FFFFFF',
  primaryText: '#595959',       // dark gray — main text, focused states
  primaryHighlight: '#E91E63',  // pink — reserved for brand accents only
  secondaryPink: '#E91E64',

  // Button
  buttonBg: '#595959',
  buttonBgPressed: '#404040',
  buttonText: '#FFFFFF',

  // Inputs / Lines
  border: '#D0D0D0',            // gray — inactive border/line
  borderFocus: '#595959',       // dark gray — focused border/line
  inputBg: '#FFFFFF',
  error: '#D32F2F',
  placeholder: '#A0A0A0',       // gray — placeholder & muted text
} as const;

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

export const FontFamily = {
  regular: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: undefined }),
  medium: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: undefined }),
  bold: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: undefined }),
} as const;
