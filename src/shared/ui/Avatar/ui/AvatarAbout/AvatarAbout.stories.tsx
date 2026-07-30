import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
const avatar1 = '/images/avatar/avatar003.jpg';
import { AvatarAbout } from './AvatarAbout';
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
  storyAboutSingleInitial,
} from '../Avatar/Avatar.storiesHelper';

const meta: Meta<typeof AvatarAbout> = {
  ...createMeta(AvatarAbout, 'Shared/Avatar/About'),
  argTypes: {
    src: { control: 'text', description: 'Image URL' },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility and initials',
      table: { defaultValue: { summary: 'Required' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
      table: { defaultValue: { summary: "'lg'" } },
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
type Story = StoryObj<typeof AvatarAbout>;

export const Default: Story = {
  ...storyDefault({ alt: 'Avatar', size: 'lg', maxInitials: 2 }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    if (avatar) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(avatar.getAttribute('data-size')).toBe('lg');
      expect(avatar.getAttribute('data-variant')).toBe('circle');
    }
  },
};

export const WithImage: Story = {
  ...storyWithImage({ alt: 'User Avatar', size: 'lg', maxInitials: 2 }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    const image = canvasElement.querySelector('img');
    if (avatar && image) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(image.complete).toBe(true);
      expect(avatar.getAttribute('data-state')).toBe('loaded');
    }
  },
};

export const AllSizes: Story = {
  ...storyAllSizes(AvatarAbout, ['sm', 'md', 'lg']),
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('[role="img"]');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(avatars.length).toBe(3);
    const sizes = Array.from(avatars).map((a) => a.getAttribute('data-size'));
    expect(sizes.join(',')).toBe('sm,md,lg');
  },
};

export const Loading: Story = {
  ...storyLoading({ alt: 'Loading...', size: 'lg', maxInitials: 2 }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    if (avatar) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(avatar.getAttribute('data-state')).toBe('loading');
    }
  },
};

export const WithoutSkeleton: Story = {
  ...storyWithoutSkeleton({ alt: 'No Skeleton', size: 'lg', maxInitials: 2 }),
};

export const Error: Story = {
  ...storyError({ alt: 'Error State', size: 'lg', maxInitials: 2 }),
};

export const SingleInitial: Story = {
  ...storyAboutSingleInitial({ alt: 'Konstantin', size: 'lg' }),
};

export const ThemeVariants: Story = {
  ...storyThemeVariants(AvatarAbout, { src: avatar1, size: 'lg' }),
};

export const WithGradientBorder: Story = {
  ...storyGradientStates(AvatarAbout, { size: 'lg' }),
};

export const ResponsiveSizes: Story = {
  ...storyResponsiveSizes(AvatarAbout, [
    { size: 'sm', label: 'sm — 100px (3rem)' },
    { size: 'md', label: 'md — 200px (5rem)' },
    { size: 'lg', label: 'lg — 300px (8rem)' },
  ]),
};
