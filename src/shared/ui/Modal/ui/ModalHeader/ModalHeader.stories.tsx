import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ModalHeader } from './ModalHeader';

const meta = {
  title: 'Shared/Modal/Header',
  component: ModalHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    showCloseButton: { control: 'boolean' },
  },
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = { onClose: () => {} };

export const Default: Story = {
  args: { ...baseArgs, title: 'Modal Header' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Modal Header')).toBeInTheDocument();
    expect(canvas.getByRole('button')).toBeInTheDocument();
  },
};

export const WithSubtitle: Story = {
  args: { ...baseArgs, title: 'Header', subtitle: 'This is a subtitle' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Header')).toBeInTheDocument();
    expect(canvas.getByText('This is a subtitle')).toBeInTheDocument();
  },
};

export const NoCloseButton: Story = {
  args: { ...baseArgs, title: 'No Close', showCloseButton: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('No Close')).toBeInTheDocument();
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const CustomTitle: Story = {
  args: { ...baseArgs, title: 'Custom Title', subtitle: 'With description' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Custom Title')).toBeInTheDocument();
    expect(canvas.getByText('With description')).toBeInTheDocument();
  },
};
