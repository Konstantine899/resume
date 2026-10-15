// src/shared/ui/DatePicker/ui/DatePicker/DatePicker.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Shared/DatePicker/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '2026-06-15',
    label: 'Start date',
    clearable: true,
  },
  play: async ({ canvasElement, args }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    // ISO in, dd.mm.yyyy on display (OPEN-4).
    await expect(canvas.getByRole('textbox')).toHaveValue('15.06.2026');

    const user = userEvent.setup();
    await user.click(canvas.getByRole('button', { name: 'calendarOpen' }));
    await user.click(canvas.getByRole('gridcell', { name: /^20 / }));

    await expect(args.onChange).toHaveBeenCalledWith('2026-06-20');
  },
};

export const Empty: Story = {
  args: {
    value: null,
    label: 'End date',
    clearable: true,
  },
};

export const WithMinMax: Story = {
  args: {
    value: null,
    label: 'Pick a day',
    minDate: '2026-06-10',
    maxDate: '2026-06-20',
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await user.click(canvas.getByRole('button', { name: 'calendarOpen' }));

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

export const WithError: Story = {
  args: {
    value: null,
    label: 'Date',
    error: 'Invalid date',
  },
};

export const Disabled: Story = {
  args: {
    value: '2026-06-15',
    label: 'Date',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    await i18n.changeLanguage('en');
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'calendarOpen' })).toBeDisabled();
  },
};

export const NarrowViewport: Story = {
  args: {
    value: '2026-06-15',
    label: 'Start date',
    clearable: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
