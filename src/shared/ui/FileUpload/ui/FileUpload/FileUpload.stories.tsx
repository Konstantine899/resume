// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FileUpload } from './FileUpload';

const meta = {
  title: 'Shared/FileUpload/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    // Narrow the viewport to the SPEC's 390px target (storybook's built-in
    // mobile1 is 320px — no custom viewports exist in .storybook/preview).
    viewport: {
      viewports: {
        narrow390: { name: 'narrow390', styles: { width: '390px', height: '844px' } },
      },
      defaultViewport: 'narrow390',
    },
  },
  tags: ['autodocs'],
  args: {
    // Fixtures, not translations: kit FileUpload has no i18n of its own
    // (plan A2) — real strings arrive from consumers through t().
    label: 'Image file',
    texts: {
      button: 'Choose image',
      hint: 'PNG, WebP or JPEG up to ~300 KB',
      notImage: 'The file is not an image',
      tooLarge: 'The image is too large — pick a smaller one',
      undecodable: 'The image could not be decoded',
      selected: 'Image selected',
    },
    onFileSelect: fn(),
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard path: tab reaches the visible button (SC 2.1.1).
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Choose image' })).toHaveFocus();
    // The hidden input is still labelled for assistive tech.
    expect(canvas.getByText('Image file')).toBeVisible();
  },
};

export const WithoutHint: Story = {
  args: {
    texts: { ...meta.args.texts, hint: undefined },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Choose image' })).toBeDisabled();
  },
};

export const Russian: Story = {
  args: {
    label: 'Файл изображения',
    texts: {
      button: 'Выбрать файл',
      hint: 'PNG, WebP или JPEG до ~300 КБ',
      notImage: 'Файл не является изображением',
      tooLarge: 'Изображение слишком большое — выберите файл поменьше',
      undecodable: 'Не удалось обработать изображение',
      selected: 'Изображение выбрано',
    },
  },
};
