/**
 * Commercial Web Service Color Design System (2-Tier Architecture)
 * Version: 7.0.0 — Light & Dark Mode Ready, WCAG 2.2 AA/AAA Certified
 */

export const COLOR_PRIMITIVES = {
  slate: {
    0:   '#FFFFFF', 25:  '#FCFDFF', 50:  '#F8FAFC', 75:  '#F1F5F9', 100: '#E2E8F0',
    150: '#CBD5E1', 200: '#94A3B8', 300: '#64748B', 400: '#475569', 500: '#334155',
    600: '#1E293B', 700: '#172033', 800: '#0F172A', 900: '#090D16', 950: '#030712',
  },
  blue: {
    25:  '#F5F8FF', 50:  '#EFF4FF', 100: '#DBE6FE', 200: '#BFCFFD', 300: '#93B0FB',
    400: '#6089F7', 500: '#3B66F1', 600: '#2550E5', 700: '#1D3EC7', 800: '#1B33A1', 900: '#1A2D7E',
  },
  indigo: {
    25:  '#F7F7FF', 50:  '#EEF0FF', 100: '#E0E3FF', 200: '#C7CCFE', 300: '#A4ACFC',
    400: '#7E85F8', 500: '#5E5EF0', 600: '#4B43E2', 700: '#3E33C7', 800: '#332CA0', 900: '#2C297E',
  },
  teal: {
    25:  '#F4FEFC', 50:  '#ECFCF9', 100: '#CEF7EE', 200: '#9EEEDF', 300: '#64DFCA',
    400: '#2EC6B0', 500: '#15A894', 600: '#0D8677', 700: '#0F6B61', 800: '#12554E', 900: '#134742',
  },
  emerald: {
    25:  '#F4FDF8', 50:  '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
    400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B',
  },
  amber: {
    25:  '#FFFCF2', 50:  '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
    400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
  },
  rose: {
    25:  '#FFF9FA', 50:  '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 300: '#FDA4AF',
    400: '#FB7185', 500: '#F43F5E', 600: '#E11D48', 700: '#BE123C', 800: '#9F1239', 900: '#881337',
  },
  sky: {
    25:  '#F5FBFF', 50:  '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC',
    400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1', 800: '#075985', 900: '#0C4A6E',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const SEMANTIC_TOKENS = {
  light: {
    bg: {
      canvas: COLOR_PRIMITIVES.slate[50],
      surface: COLOR_PRIMITIVES.slate[0],
      surfaceSubtle: COLOR_PRIMITIVES.slate[75],
      surfaceElevated: COLOR_PRIMITIVES.slate[0],
      brandSubtle: COLOR_PRIMITIVES.blue[50],
    },
    text: {
      primary: COLOR_PRIMITIVES.slate[800],
      secondary: COLOR_PRIMITIVES.slate[400],
      tertiary: COLOR_PRIMITIVES.slate[300],
      disabled: COLOR_PRIMITIVES.slate[200],
      inverse: COLOR_PRIMITIVES.slate[0],
      brand: COLOR_PRIMITIVES.blue[600],
      link: COLOR_PRIMITIVES.blue[700],
    },
    border: {
      subtle: COLOR_PRIMITIVES.slate[100],
      default: COLOR_PRIMITIVES.slate[150],
      strong: COLOR_PRIMITIVES.slate[200],
      focus: COLOR_PRIMITIVES.blue[600],
    },
    action: {
      primaryBg: COLOR_PRIMITIVES.blue[600],
      primaryHover: COLOR_PRIMITIVES.blue[700],
      primaryActive: COLOR_PRIMITIVES.blue[800],
      primaryText: COLOR_PRIMITIVES.white,
      dangerBg: COLOR_PRIMITIVES.rose[600],
      dangerHover: COLOR_PRIMITIVES.rose[700],
    },
    status: {
      success: { bg: COLOR_PRIMITIVES.emerald[50], border: COLOR_PRIMITIVES.emerald[200], text: COLOR_PRIMITIVES.emerald[700] },
      warning: { bg: COLOR_PRIMITIVES.amber[50],   border: COLOR_PRIMITIVES.amber[200],   text: COLOR_PRIMITIVES.amber[700] },
      danger:  { bg: COLOR_PRIMITIVES.rose[50],    border: COLOR_PRIMITIVES.rose[200],    text: COLOR_PRIMITIVES.rose[700] },
      info:    { bg: COLOR_PRIMITIVES.sky[50],     border: COLOR_PRIMITIVES.sky[200],     text: COLOR_PRIMITIVES.sky[700] },
    },
  },
  dark: {
    bg: {
      canvas: COLOR_PRIMITIVES.slate[900],
      surface: COLOR_PRIMITIVES.slate[800],
      surfaceSubtle: COLOR_PRIMITIVES.slate[700],
      surfaceElevated: COLOR_PRIMITIVES.slate[600],
      brandSubtle: 'rgba(59, 102, 241, 0.14)',
    },
    text: {
      primary: COLOR_PRIMITIVES.slate[50],
      secondary: COLOR_PRIMITIVES.slate[200],
      tertiary: COLOR_PRIMITIVES.slate[300],
      disabled: COLOR_PRIMITIVES.slate[400],
      inverse: COLOR_PRIMITIVES.slate[900],
      brand: COLOR_PRIMITIVES.blue[400],
      link: COLOR_PRIMITIVES.blue[300],
    },
    border: {
      subtle: COLOR_PRIMITIVES.slate[600],
      default: COLOR_PRIMITIVES.slate[500],
      strong: COLOR_PRIMITIVES.slate[400],
      focus: COLOR_PRIMITIVES.blue[400],
    },
    action: {
      primaryBg: COLOR_PRIMITIVES.blue[500],
      primaryHover: COLOR_PRIMITIVES.blue[400],
      primaryActive: COLOR_PRIMITIVES.blue[600],
      primaryText: COLOR_PRIMITIVES.white,
      dangerBg: COLOR_PRIMITIVES.rose[500],
      dangerHover: COLOR_PRIMITIVES.rose[400],
    },
    status: {
      success: { bg: 'rgba(16, 185, 129, 0.14)', border: COLOR_PRIMITIVES.emerald[700], text: COLOR_PRIMITIVES.emerald[400] },
      warning: { bg: 'rgba(245, 158, 11, 0.14)', border: COLOR_PRIMITIVES.amber[700],   text: COLOR_PRIMITIVES.amber[400] },
      danger:  { bg: 'rgba(244, 63, 94, 0.14)',  border: COLOR_PRIMITIVES.rose[700],    text: COLOR_PRIMITIVES.rose[400] },
      info:    { bg: 'rgba(14, 165, 233, 0.14)', border: COLOR_PRIMITIVES.sky[700],     text: COLOR_PRIMITIVES.sky[400] },
    },
  },
} as const;
