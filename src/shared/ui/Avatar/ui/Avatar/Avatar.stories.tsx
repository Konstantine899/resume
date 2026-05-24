import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Shared/UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const HeroStyle: Story = {
  args: {
    alt: 'Konstantin Atroshchenko',
    heroStyle: true,
    showGlow: true,
    showRing: true,
    size: 'xl',
  },
};

export const HeroStyleSmall: Story = {
  args: {
    alt: 'KA',
    heroStyle: true,
    size: 'md',
  },
};

export const HeroStyleWithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    alt: 'Professional Photo',
    heroStyle: true,
    showGlow: true,
    showRing: true,
    size: 'xl',
  },
};

export const HeroStyleSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar alt="SM" heroStyle size="sm" />
      <Avatar alt="MD" heroStyle size="md" />
      <Avatar alt="LG" heroStyle size="lg" />
      <Avatar alt="XL" heroStyle size="xl" />
    </div>
  ),
};

export const WithEffects: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar alt="Glow" heroStyle showGlow size="lg" />
      <Avatar alt="Ring" heroStyle showRing size="lg" />
      <Avatar alt="Both" heroStyle showGlow showRing size="lg" />
    </div>
  ),
};
