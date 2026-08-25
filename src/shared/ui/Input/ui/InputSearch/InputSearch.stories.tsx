import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { InputSearch } from './InputSearch';

const meta = {
  title: 'Shared/Input/InputSearch',
  component: InputSearch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof InputSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    await userEvent.type(input, 'query');
    expect(input).toHaveValue('query');
  },
};

export const WithError: Story = {
  args: {
    label: 'Search',
    error: 'No results found',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('No results found')).toBeInTheDocument();
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Search',
    fullWidth: true,
    placeholder: 'Search anything...',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Story />
      </div>
    ),
  ],
};
