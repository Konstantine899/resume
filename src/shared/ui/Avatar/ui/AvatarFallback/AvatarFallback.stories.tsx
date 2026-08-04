import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { AvatarFallback } from './AvatarFallback';

const meta = {
  title: 'Shared/Avatar/Fallback',
  component: AvatarFallback,
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
    name: { control: 'text', description: 'Name used to generate initials' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Fallback size',
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Fallback shape',
    },
    maxInitials: {
      control: { type: 'number', min: 1, max: 3 },
      description: 'Maximum number of initials',
    },
    fillContainer: { control: 'boolean', description: 'Fill the parent container' },
  },
} satisfies Meta<typeof AvatarFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
    variant: 'circle',
    maxInitials: 2,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('JD')).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <AvatarFallback name="Small" size="sm" />
      <AvatarFallback name="Medium" size="md" />
      <AvatarFallback name="Large" size="lg" />
      <AvatarFallback name="Hero" size="xl" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('S')).toBeInTheDocument();
    expect(canvas.getByText('M')).toBeInTheDocument();
    expect(canvas.getByText('L')).toBeInTheDocument();
    expect(canvas.getByText('H')).toBeInTheDocument();
  },
};

export const SingleInitial: Story = {
  args: {
    name: 'John Doe',
    size: 'lg',
    variant: 'circle',
    maxInitials: 1,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('J')).toBeInTheDocument();
  },
};

export const SquareVariant: Story = {
  args: {
    name: 'Jane Smith',
    size: 'lg',
    variant: 'square',
    maxInitials: 2,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('JS')).toBeInTheDocument();
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <AvatarFallback name="Alice Johnson" size="md" />
      <AvatarFallback name="Bob Williams" size="md" />
      <AvatarFallback name="Carol Brown" size="md" />
      <AvatarFallback name="Dave Miller" size="md" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('AJ')).toBeInTheDocument();
    expect(canvas.getByText('BW')).toBeInTheDocument();
    expect(canvas.getByText('CB')).toBeInTheDocument();
    expect(canvas.getByText('DM')).toBeInTheDocument();
  },
};
