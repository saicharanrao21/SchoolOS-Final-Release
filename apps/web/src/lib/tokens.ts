export type DensityMode = 'DEFAULT' | 'COMPACT' | 'MOBILE';

export const designTokens = {
  colors: {
    primary: {
      DEFAULT: '#2563eb', // Enterprise Blue
      hover: '#1d4ed8',
      light: '#eff6ff',
      dark: '#1e40af',
    },
    secondary: {
      DEFAULT: '#4f46e5', // Indigo
      hover: '#4338ca',
      light: '#eef2ff',
    },
    surface: {
      background: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      hover: '#f1f5f9',
      active: '#e2e8f0',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    status: {
      success: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      warning: { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' },
      error: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
      info: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      neutral: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    },
  },
  density: {
    DEFAULT: {
      tableCellPadding: 'px-4 py-3.5',
      cardPadding: 'p-6',
      buttonPadding: 'px-4 py-2.5',
      inputPadding: 'px-3.5 py-2',
      fontSize: 'text-sm',
      iconSize: 'w-4 h-4',
    },
    COMPACT: {
      tableCellPadding: 'px-3 py-2',
      cardPadding: 'p-4',
      buttonPadding: 'px-3 py-1.5',
      inputPadding: 'px-2.5 py-1.5',
      fontSize: 'text-xs',
      iconSize: 'w-3.5 h-3.5',
    },
    MOBILE: {
      tableCellPadding: 'px-3 py-3',
      cardPadding: 'p-4',
      buttonPadding: 'px-4 py-3',
      inputPadding: 'px-3 py-2.5',
      fontSize: 'text-base',
      iconSize: 'w-5 h-5',
    },
  },
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
};
