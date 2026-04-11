// GPIT UI Style Guide — Uber-style: Black CTAs · Pink accents · Light sheet
import { Platform } from 'react-native';

export const Colors = {
  background:        '#FFFFFF',        // white — main UI color
  primaryText:       '#1C1C1E',        // near-black — all main text
  primaryHighlight:  '#E91E63',        // pink — accent lines, icons, indicators
  secondaryDark:     '#3A3A3C',        // dark gray — pressed states

  // Button
  buttonBg:          '#595959',
  buttonBgPressed:   '#3D3D3D',
  buttonText:        '#FFFFFF',

  // Inputs / Lines
  border:            '#E0E0E0',        // light gray
  borderFocus:       '#E91E63',        // pink ring on focus
  inputBg:           '#FFFFFF',
  error:             '#D32F2F',
  placeholder:       '#9E9E9E',        // mid gray
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
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semiBold: '600' as const,
  bold:     '700' as const,
};

export const FontSize = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 26,
} as const;

export const FontFamily = {
  regular: Platform.select({ ios: 'Avenir Next', android: 'sans-serif',        default: undefined }),
  medium:  Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: undefined }),
  bold:    Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: undefined }),
} as const;
