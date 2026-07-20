import { cn, formatNumber, formatPercent } from './utils';

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });
});

describe('formatNumber', () => {
  it('compacts large numbers', () => {
    expect(formatNumber(12500)).toMatch(/12,5\s?k/i);
  });

  it('leaves small numbers untouched', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatPercent', () => {
  it('formats a ratio as a percentage', () => {
    expect(formatPercent(0.1234)).toContain('12,34');
  });
});
