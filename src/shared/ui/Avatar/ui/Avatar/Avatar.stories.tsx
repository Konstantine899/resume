import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Avatar } from './Avatar';

const meta = {
  title: 'Shared/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
    },
    showGlow: { control: 'boolean' },
    showRing: { control: 'boolean' },
    heroStyle: { control: 'boolean' },
    showSkeleton: { control: 'boolean' },
    forceLoading: { control: 'boolean' },
    component: {
      control: 'select',
      options: ['div', 'article', 'section', 'a'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'John Doe',
    size: 'md',
    variant: 'circle',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'John Doe');
    expect(avatar).toHaveAttribute('data-state', 'loaded');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('data-variant', 'circle');
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="Circle"
        size="md"
        variant="circle"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="Square"
        size="md"
        variant="square"
      />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const avatars = canvasElement.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute('data-variant', 'circle');
    expect(avatars[1]).toHaveAttribute('data-variant', 'square');
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="SM"
        size="sm"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="MD"
        size="md"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="LG"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop"
        alt="XL"
        size="xl"
      />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const avatars = canvasElement.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(4);
    expect(avatars[0]).toHaveAttribute('data-size', 'sm');
    expect(avatars[1]).toHaveAttribute('data-size', 'md');
    expect(avatars[2]).toHaveAttribute('data-size', 'lg');
    expect(avatars[3]).toHaveAttribute('data-size', 'xl');
  },
};

export const FallbackWithInitials: Story = {
  args: {
    alt: 'John Doe',
    size: 'md',
    variant: 'circle',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByText('JD');
    expect(fallback).toBeInTheDocument();
  },
};

export const LoadingState: Story = {
  args: {
    src: 'https://invalid-url.example/broken.jpg',
    alt: 'Loading avatar',
    size: 'md',
    variant: 'circle',
    showSkeleton: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-state', 'error');
  },
};

export const WithGlowEffect: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Glowing avatar',
    size: 'lg',
    variant: 'circle',
    heroStyle: true,
    showGlow: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const glow = canvasElement.querySelector('[class*="glow"]');
    expect(glow).toBeInTheDocument();
    const avatar = canvas.getByRole('img');
    expect(avatar).toHaveAttribute('data-hero-style', 'true');
  },
};

export const WithRingEffect: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Avatar with ring',
    size: 'lg',
    variant: 'circle',
    heroStyle: true,
    showRing: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const ring = canvasElement.querySelector('[class*="ring"]');
    expect(ring).toBeInTheDocument();
  },
};

export const CombinedEffects: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Avatar with all effects',
    size: 'xl',
    variant: 'circle',
    heroStyle: true,
    showGlow: true,
    showRing: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const glow = canvasElement.querySelector('[class*="glow"]');
    const ring = canvasElement.querySelector('[class*="ring"]');
    expect(glow).toBeInTheDocument();
    expect(ring).toBeInTheDocument();
  },
};

export const PolymorphicAsArticle: Story = {
  args: {
    component: 'article',
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Article avatar',
    size: 'md',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const article = canvasElement.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute('data-variant', 'circle');
  },
};

export const PolymorphicAsSection: Story = {
  args: {
    component: 'section',
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Section avatar',
    size: 'md',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const section = canvasElement.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('data-size', 'md');
  },
};

export const PolymorphicAsLink: Story = {
  args: {
    component: 'a',
    href: '/profile',
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Link avatar',
    size: 'md',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const link = canvasElement.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile');
    expect(link).toHaveAttribute('role', 'img');
  },
};

export const WithChildren: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    alt: 'Avatar with badge',
    size: 'lg',
    children: (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          background: '#22c55e',
          border: '2px solid white',
          borderRadius: '50%',
        }}
      />
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    expect(avatar).toBeInTheDocument();
    const badge = canvasElement.querySelector('[style*="background: #22c55e"]');
    expect(badge).toBeInTheDocument();
  },
};
