import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
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
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
    alt: 'John Doe',
    size: 'md',
    variant: 'circle',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('aria-label', 'John Doe');
    await waitFor(
      () => {
        expect(avatar).toHaveAttribute('data-state', 'loaded');
      },
      { timeout: 5000 }
    );
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('data-variant', 'circle');
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Avatar src="/images/avatar/avatar003.jpg" alt="Circle" size="md" variant="circle" />
      <Avatar src="/images/avatar/avatar003.jpg" alt="Square" size="md" variant="square" />
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
      <Avatar src="/images/avatar/avatar003.jpg" alt="SM" size="sm" />
      <Avatar src="/images/avatar/avatar003.jpg" alt="MD" size="md" />
      <Avatar src="/images/avatar/avatar003.jpg" alt="LG" size="lg" />
      <Avatar src="/images/avatar/avatar003.jpg" alt="XL" size="xl" />
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
    size: 'xl',
    variant: 'circle',
    heroStyle: true,
    showGlow: true,
    showRing: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByText('JD');
    expect(fallback).toBeInTheDocument();
  },
};

export const LoadingState: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Loading avatar',
    size: 'xl',
    variant: 'circle',
    heroStyle: true,
    showGlow: true,
    showRing: true,
    showSkeleton: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img');
    expect(avatar).toBeInTheDocument();
    await waitFor(
      () => {
        expect(avatar).toHaveAttribute('data-state', 'error');
      },
      { timeout: 2000 }
    );
  },
};

export const WithGlowEffect: Story = {
  args: {
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
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
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
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
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
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

export const PolymorphicAsLink: Story = {
  args: {
    component: 'a',
    href: '/profile',
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
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
    src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='64'%20height='64'%3E%3Ccircle%20cx='32'%20cy='32'%20r='32'%20fill='%23a3a3a3'/%3E%3C/svg%3E",
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
    const badge = canvasElement.querySelector('[style*="rgb(34, 197, 94)"]');
    expect(badge).toBeInTheDocument();
  },
};
