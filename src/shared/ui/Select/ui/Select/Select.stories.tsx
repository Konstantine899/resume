// src/shared/ui/Select/ui/Select/Select.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Select } from './Select';
import type { SelectOption } from '../../model/types';

const OPTIONS: SelectOption[] = [
  { value: 'full-time', label: 'Full time' },
  { value: 'part-time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship', disabled: true },
];

const meta = {
  title: 'Shared/Select/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // Fixtures, not translations: kit Select has no i18n of its own
    // (plan A2) — real strings arrive from consumers through t().
    options: OPTIONS,
    value: 'part-time',
    onChange: fn(),
    label: 'Employment type',
    fullWidth: true,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    const select = canvas.getByRole('combobox', { name: 'Employment type' });
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('part-time');

    await user.selectOptions(select, 'Full time');
    await expect(select).toHaveValue('full-time');
  },
};

export const WithPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Choose…',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Employment type' })).toHaveValue('');
  },
};

export const Error: Story = {
  args: {
    error: 'Pick one to continue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('alert')).toHaveTextContent('Pick one to continue');
    await expect(canvas.getByRole('combobox', { name: 'Employment type' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

export const HelperText: Story = {
  args: {
    helperText: 'As stated in the contract',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Employment type' })).toBeDisabled();
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, minWidth: 260 }}>
      <Select
        options={OPTIONS}
        value="full-time"
        onChange={fn()}
        label="Default"
        variant="default"
      />
      <Select
        options={OPTIONS}
        value="full-time"
        onChange={fn()}
        label="Outline"
        variant="outline"
      />
      <Select options={OPTIONS} value="full-time" onChange={fn()} label="Filled" variant="filled" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, minWidth: 260 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Select
          key={size}
          options={OPTIONS}
          value="full-time"
          onChange={fn()}
          label={size.toUpperCase()}
          size={size}
        />
      ))}
    </div>
  ),
};

export const Russian: Story = {
  args: {
    // ru fixtures prove the component does not own copy (plan A2).
    label: 'Тип занятости',
    placeholder: 'Выберите…',
    options: [
      { value: 'full-time', label: 'Полная занятость' },
      { value: 'part-time', label: 'Частичная занятость' },
      { value: 'contract', label: 'Контракт' },
    ],
    value: 'full-time',
  },
};

export const Narrow390: Story = {
  args: {
    placeholder: 'Choose…',
    value: '',
  },
  parameters: {
    // SPEC: exact 390px — Storybook's built-in `mobile1` is 320px
    // (gotcha resume-kit-empty-state).
    viewport: {
      viewports: {
        narrow390: {
          name: 'Narrow 390px',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'narrow390',
    },
  },
};
