import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from '@storybook/test';
const avatar1 = '/images/avatar/avatar003.jpg';
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
  storyHeroEffectsComparison,
} from '../Avatar/Avatar.storiesHelper';

const meta: Meta<typeof AvatarHero> = {
  ...createMeta(AvatarHero, 'Shared/Avatar/Hero'),
  title: 'Shared/Avatar/Hero',
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
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    const glow = canvasElement.querySelector('[class*="photo-glow"]');
    const ring = canvasElement.querySelector('[class*="photo-ring"]');
    if (avatar) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(avatar.getAttribute('data-size')).toBe('xl');
      expect(glow).not.toBeNull();
      expect(ring).not.toBeNull();
    }
  },
};

export const WithImage: Story = {
  ...storyWithImage({ alt: 'Hero Avatar', size: 'xl', showGlow: true, showRing: true }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    const image = canvasElement.querySelector('img');
    if (avatar && image) {
      await waitFor(
        () => {
          expect(image.complete).toBe(true);
        },
        { timeout: 5000 }
      );
      expect(avatar.getAttribute('data-state')).toBe('loaded');
    }
  },
};

export const AllSizes: Story = {
  ...storyAllSizes(AvatarHero, ['sm', 'md', 'lg', 'xl'], { showGlow: true, showRing: true }),
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('[role="img"]');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(avatars.length).toBe(4);
    const sizes = Array.from(avatars).map((a) => a.getAttribute('data-size'));
    expect(sizes.join(',')).toBe('sm,md,lg,xl');
  },
};

export const Loading: Story = {
  ...storyLoading({ alt: 'Loading...', size: 'xl', showGlow: true, showRing: true }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    if (avatar) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(avatar.getAttribute('data-state')).toBe('loading');
    }
  },
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

export const EffectsComparison: Story = {
  ...storyHeroEffectsComparison(AvatarHero, avatar1),
};
