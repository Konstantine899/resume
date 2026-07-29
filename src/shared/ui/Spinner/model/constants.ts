import type { SpinnerSize, SpinnerSpeed, SpinnerThickness } from './types';

export const speedMap: Record<
  SpinnerSpeed,
  { spinner: string; doubleRing: { outer: string; inner: string } }
> = {
  slow: { spinner: '1.2s', doubleRing: { outer: '1.5s', inner: '1.3s' } },
  normal: { spinner: '0.8s', doubleRing: { outer: '1s', inner: '0.85s' } },
  fast: { spinner: '0.4s', doubleRing: { outer: '0.6s', inner: '0.5s' } },
};

export const thicknessMap: Record<SpinnerThickness, { spinner: string; doubleRing: string }> = {
  thin: { spinner: '1.5px', doubleRing: '3px' },
  normal: { spinner: '2px', doubleRing: '4px' },
  thick: { spinner: '3px', doubleRing: '5px' },
};

export const SPINNER_SIZES: readonly SpinnerSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
