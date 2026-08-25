import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { AvatarImage } from './AvatarImage';

const meta = {
  title: 'Shared/Avatar/Image',
  component: AvatarImage,
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
    src: { control: 'text', description: 'Image URL' },
    alt: { control: 'text', description: 'Alternative text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
    showSkeleton: { control: 'boolean', description: 'Show skeleton while loading' },
    forceLoading: { control: 'boolean', description: 'Force loading state' },
  },
} satisfies Meta<typeof AvatarImage>;

export default meta;
type Story = StoryObj<typeof meta>;

const getContainer = (canvasElement: HTMLElement): HTMLElement => {
  const container = canvasElement.querySelector('[data-state]') as HTMLElement | null;
  if (container === null) {
    throw new TypeError('AvatarImage container with [data-state] not found');
  }
  return container;
};

export const Default: Story = {
  args: {
    src: '/images/avatar/avatar003.jpg',
    alt: 'John Doe',
    size: 'md',
    variant: 'circle',
    showSkeleton: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const container = getContainer(canvasElement);
    await waitFor(
      () => {
        expect(container).toHaveAttribute('data-state', 'loaded');
      },
      { timeout: 5000 }
    );
    expect(container).toHaveAttribute('data-size', 'md');
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <AvatarImage src="/images/avatar/avatar003.jpg" alt="SM" size="sm" />
      <AvatarImage src="/images/avatar/avatar003.jpg" alt="MD" size="md" />
      <AvatarImage src="/images/avatar/avatar003.jpg" alt="LG" size="lg" />
      <AvatarImage src="/images/avatar/avatar003.jpg" alt="XL" size="xl" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const containers = canvasElement.querySelectorAll('[data-state]');
    expect(containers).toHaveLength(4);
    const sizes = Array.from(containers).map((el) => el.getAttribute('data-size'));
    expect(sizes.join(',')).toBe('sm,md,lg,xl');
  },
};

export const SquareVariant: Story = {
  args: {
    src: '/images/avatar/avatar003.jpg',
    alt: 'Square avatar',
    size: 'lg',
    variant: 'square',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const container = getContainer(canvasElement);
    expect(container).toHaveAttribute('data-variant', 'square');
  },
};

export const Loading: Story = {
  args: {
    src: '/images/avatar/avatar003.jpg',
    alt: 'Loading avatar',
    size: 'md',
    variant: 'circle',
    showSkeleton: true,
    forceLoading: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const container = getContainer(canvasElement);
    expect(container).toHaveAttribute('data-state', 'loading');
  },
};

export const Error: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Broken avatar',
    size: 'md',
    variant: 'circle',
    showSkeleton: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const container = getContainer(canvasElement);
    await waitFor(
      () => {
        expect(container).toHaveAttribute('data-state', 'error');
      },
      { timeout: 2000 }
    );
  },
};
