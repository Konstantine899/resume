// src/shared/ui/PageSizeGroup/ui/PageSizeGroup/PageSizeGroup.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import { PageSizeGroup } from './PageSizeGroup';

const meta = {
  title: 'Shared/PageSizeGroup/PageSizeGroup',
  component: PageSizeGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    sizes: [5, 10, 20],
    value: 5,
    onChange: fn(),
  },
} satisfies Meta<typeof PageSizeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    // Visible caption, not aria-only — owner directive 2026-10-09.
    await expect(canvas.getByText('Items per page')).toBeVisible();

    await user.click(canvas.getByRole('button', { name: '10' }));

    await expect(args.onChange).toHaveBeenCalledWith(10);
  },
};

export const ActiveMiddle: Story = {
  args: {
    value: 10,
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: '10' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(canvas.getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  },
};

export const Russian: Story = {
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('ru');
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Элементов на странице')).toBeVisible();
  },
};
