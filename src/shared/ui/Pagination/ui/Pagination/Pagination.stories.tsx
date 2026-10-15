// src/shared/ui/Pagination/ui/Pagination/Pagination.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import { Pagination } from './Pagination';

const meta = {
  title: 'Shared/Pagination/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    page: 5,
    totalPages: 10,
  },
  play: async ({ canvasElement, args }) => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    const pageFour = canvas.getByLabelText('Page 4');
    await user.click(pageFour);

    await expect(args.onPageChange).toHaveBeenCalledWith(4);
  },
};

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 10,
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Previous page')).toBeDisabled();
  },
};

export const LastPage: Story = {
  args: {
    page: 10,
    totalPages: 10,
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Next page')).toBeDisabled();
  },
};

export const WideWindow: Story = {
  args: {
    page: 5,
    totalPages: 20,
    siblings: 2,
  },
};

export const SinglePage: Story = {
  args: {
    page: 1,
    totalPages: 1,
  },
};
