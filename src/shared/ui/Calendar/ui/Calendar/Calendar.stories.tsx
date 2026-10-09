// src/shared/ui/Calendar/ui/Calendar/Calendar.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import { Calendar } from './Calendar';

const meta = {
  title: 'Shared/Calendar/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '2026-06-15',
  },
  play: async ({ canvasElement, args }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await user.click(canvas.getByRole('gridcell', { name: /^20 / }));

    await expect(args.onChange).toHaveBeenCalledWith('2026-06-20');
  },
};

export const Empty: Story = {
  args: {
    value: null,
  },
};

export const WithMinMax: Story = {
  args: {
    value: '2026-06-15',
    minDate: '2026-06-10',
    maxDate: '2026-06-20',
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('gridcell', { name: /^5 / })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(canvas.getByRole('gridcell', { name: /^25 / })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  },
};

export const RussianMondayStart: Story = {
  args: {
    value: '2026-06-15',
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('ru');
    const canvas = within(canvasElement);

    const headers = canvas.getAllByRole('columnheader').map((el) => el.textContent ?? '');
    await expect(headers[0]).toBe('Пн');
    await expect(headers[6]).toBe('Вс');
  },
};

export const NarrowViewport: Story = {
  args: {
    value: '2026-06-15',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
