import type { Meta, StoryObj } from '@storybook/react-vite';
import avatar1 from '../Avatar/assets/avatar003.jpg';
import { AvatarHero } from './AvatarHero';
import {
  createMeta,
  storyDefault,
  storyWithImage,
  storyAllSizes,
  storyLoading,
  storyWithoutSkeleton,
  storyError,
  storyThemeVariants,
  storyGradientStates,
  storyResponsiveSizes,
  storyHeroWithoutEffects,
  storyHeroEffectsComparison,
} from '../../lib/storyHelpers/AvatarStoriesHelper';

const meta: Meta<typeof AvatarHero> = {
  ...createMeta(AvatarHero, 'Shared/Avatar/Hero'),
  argTypes: {
    src: { control: 'text', description: 'Image URL' },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility and initials',
      table: { defaultValue: { summary: "'Avatar'" } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
      table: { defaultValue: { summary: "'xl'" } },
    },
    showGlow: {
      control: 'boolean',
      description: 'Show pulsing glow effect',
      table: { defaultValue: { summary: 'false' } },
    },
    showRing: {
      control: 'boolean',
      description: 'Show decorative ring',
      table: { defaultValue: { summary: 'false' } },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: { defaultValue: { summary: 'true' } },
    },
    className: { control: 'text', description: 'Additional CSS classes' },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarHero>;

export const Default: Story = {
  ...storyDefault({ alt: 'Avatar', size: 'xl', showGlow: true, showRing: true }),
};

export const WithImage: Story = {
  ...storyWithImage({ alt: 'Hero Avatar', size: 'xl', showGlow: true, showRing: true }),
};

export const AllSizes: Story = {
  ...storyAllSizes(AvatarHero, ['sm', 'md', 'lg', 'xl'], { showGlow: true, showRing: true }),
};

export const Loading: Story = {
  ...storyLoading({ alt: 'Loading...', size: 'xl', showGlow: true, showRing: true }),
};

export const WithoutSkeleton: Story = {
  ...storyWithoutSkeleton({ alt: 'No Skeleton', size: 'xl', showGlow: true, showRing: true }),
};

export const Error: Story = {
  ...storyError({ alt: 'Error State', size: 'xl', showGlow: true, showRing: true }),
};

export const ThemeVariants: Story = {
  ...storyThemeVariants(AvatarHero, {
    src: avatar1,
    size: 'xl',
    showGlow: true,
    showRing: true,
  }),
};

export const WithGradientBorder: Story = {
  ...storyGradientStates(AvatarHero, { size: 'xl', showGlow: true, showRing: true }),
};

export const ResponsiveSizes: Story = {
  ...storyResponsiveSizes(
    AvatarHero,
    [
      { size: 'sm', label: 'sm — 3rem (48px)' },
      { size: 'md', label: 'md — 5rem (80px)' },
      { size: 'lg', label: 'lg — 8rem (128px)' },
      { size: 'xl', label: 'xl — 14-20rem (responsive)' },
    ],
    { showGlow: true, showRing: true }
  ),
};

export const WithoutEffects: Story = {
  ...storyHeroWithoutEffects(AvatarHero),
};

export const EffectsComparison: Story = {
  ...storyHeroEffectsComparison(AvatarHero, avatar1),
};
