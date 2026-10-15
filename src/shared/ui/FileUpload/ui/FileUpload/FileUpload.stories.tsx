// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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

// Real browser pipeline: a genuine 1×1 PNG goes through decode → canvas →
// toBlob — rev.4 contract: onFileSelect receives a Blob + sanitized name.
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const UploadsAFile: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const bytes = Uint8Array.from(atob(TINY_PNG_BASE64), (char) => char.charCodeAt(0));
    const file = new File([bytes], 'Demo Photo.png', { type: 'image/png' });
    await userEvent.upload(input as HTMLInputElement, [file]);

    await waitFor(() =>
      expect(args.onFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'demo-photo.webp', blob: expect.any(Blob) })
      )
    );
    expect(canvas.getByText('Image selected')).toBeInTheDocument();
  },
};

// skills-icon-upload rev.2: image/svg+xml takes the RAW passthrough — the
// original File is the blob (no canvas), the name keeps the .svg extension.
export const UploadsAnSvg: Story = {
  args: {
    texts: { ...meta.args.texts, hint: 'SVG up to ~50 KB' },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const file = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>'],
      'React Logo.svg',
      {
        type: 'image/svg+xml',
      }
    );
    await userEvent.upload(input as HTMLInputElement, [file]);

    await waitFor(() =>
      expect(args.onFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'react-logo.svg', blob: expect.any(Blob) })
      )
    );
    const selection = args.onFileSelect.mock.calls[
      args.onFileSelect.mock.calls.length - 1
    ]?.[0] as { blob: Blob };
    expect(selection.blob.type).toBe('image/svg+xml');
    expect(canvas.getByText('Image selected')).toBeInTheDocument();
  },
};
