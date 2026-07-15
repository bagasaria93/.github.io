export interface Theme {
  bg: string;
  card: string;
  ink: string;
  inkDim: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  danger: string;
  success: string;
  dark: boolean;
}

export const lightTheme: Theme = {
  bg: '#f5f6f8',
  card: '#ffffff',
  ink: '#12181b',
  inkDim: '#6b7684',
  border: '#e7e9ee',
  primary: '#0d9488',
  primaryDark: '#0f766e',
  accent: '#f97316',
  danger: '#ef4444',
  success: '#10b981',
  dark: false,
};

export const darkTheme: Theme = {
  bg: '#0a0f0f',
  card: '#141b1b',
  ink: '#f2f5f4',
  inkDim: '#8ba098',
  border: '#223030',
  primary: '#2dd4bf',
  primaryDark: '#14b8a6',
  accent: '#fb923c',
  danger: '#f87171',
  success: '#34d399',
  dark: true,
};

export function getTheme(dark: boolean): Theme {
  return dark ? darkTheme : lightTheme;
}
