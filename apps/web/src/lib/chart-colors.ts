/**
 * Validated chart palette (see the platform's dataviz guidelines). Fixed
 * categorical order — never cycled — plus a single-hue sequential ramp for
 * magnitude encodings (top hashtags, best posting hour, etc).
 */
export const CATEGORICAL: string[] = [
  '#2a78d6', // blue
  '#008300', // green
  '#e87ba4', // magenta
  '#eda100', // yellow
  '#1baf7a', // aqua
  '#eb6834', // orange
  '#4a3aa7', // violet
  '#e34948', // red
];

export const CATEGORICAL_DARK: string[] = [
  '#3987e5',
  '#008300',
  '#d55181',
  '#c98500',
  '#199e70',
  '#d95926',
  '#9085e9',
  '#e66767',
];

export const SEQUENTIAL_BLUE = [
  '#cde2fb',
  '#9ec5f4',
  '#6da7ec',
  '#3987e5',
  '#256abf',
  '#184f95',
  '#0d366b',
];

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const CHART_INK = {
  light: { secondary: '#52514e', muted: '#898781', grid: '#e1e0d9', axis: '#c3c2b7' },
  dark: { secondary: '#c3c2b7', muted: '#898781', grid: '#2c2c2a', axis: '#383835' },
};
