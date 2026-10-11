// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.test.tsx
//
// WU-4 (plan_project_images): kit FileUpload — file input + dropzone that
// emits a COMPRESSED dataURL (webp when canvas supports it, else explicit
// jpeg — Safari silently falls back to png otherwise). jsdom has no image
// decoding and no canvas backend, so `Image` and the 2d context/toDataURL
// are stubbed; the production pipeline is otherwise real (FileReader,
// handlers, state).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileUpload } from './FileUpload';
import type { FileUploadTexts } from '../../model/types';

const TEXTS: FileUploadTexts = {
  button: 'Choose image',
  hint: 'PNG, WebP or JPEG',
  notImage: 'The file is not an image',
  tooLarge: 'The image is too large',
  undecodable: 'The image could not be decoded',
  selected: 'Image selected',
};

const WEBP_URL = 'data:image/webp;base64,AAAA';
const JPEG_URL = 'data:image/jpeg;base64,BBBB';

/** Controllable stand-in for the DOM Image (jsdom never decodes pixels). */
let imageBehavior: 'load' | 'error' = 'load';
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 3200;
  naturalHeight = 1800;
  set src(_value: string) {
    setTimeout(() => (imageBehavior === 'load' ? this.onload?.() : this.onerror?.()), 0);
  }
}

const renderFU = (props: Partial<Parameters<typeof FileUpload>[0]> = {}) => {
  const onFileSelect = props.onFileSelect ?? vi.fn();
  const utils = render(
    <FileUpload label="Project image" texts={TEXTS} onFileSelect={onFileSelect} {...props} />
  );
  return { ...utils, onFileSelect };
};

// The dropzone group ALSO carries the label as its accessible name
// (aria-labelledby), so getByLabelText would match two nodes — query the
// input by its type instead and assert the label association explicitly.
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

const attachFile = (file: File) => {
  fireEvent.change(fileInput(), { target: { files: [file] } });
};

beforeEach(() => {
  imageBehavior = 'load';
  vi.stubGlobal('Image', FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as ReturnType<HTMLCanvasElement['getContext']>);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('FileUpload: selection pipeline', () => {
  it('calls onFileSelect with a webp dataURL when canvas supports webp', async () => {
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));

    await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(WEBP_URL));
    // webp is probed first and accepted — jpeg never requested.
    expect(toDataURL).toHaveBeenCalledTimes(1);
    expect(toDataURL).toHaveBeenCalledWith('image/webp', 0.8);
  });

  it('falls back to an explicit JPEG when webp is unsupported (Safari)', async () => {
    // Probe returns png (Safari's silent fallback), real encode returns jpeg.
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation((type?: string) =>
      type === 'image/webp' ? 'data:image/png;base64,STUB' : JPEG_URL
    );
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'photo.heic', { type: 'image/heic' }));

    await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(JPEG_URL));
  });

  it('rejects a non-image file with the notImage error (role=alert)', async () => {
    const { onFileSelect } = renderFU();

    attachFile(new File(['plain'], 'notes.txt', { type: 'text/plain' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.notImage);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects an undecodable image through img.onerror (HEIC-style)', async () => {
    imageBehavior = 'error';
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'photo.heic', { type: 'image/heic' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.undecodable);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects a compressed dataURL over the character cap (tooLarge)', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    const { onFileSelect } = renderFU({ maxDataUrlChars: 10 });

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.tooLarge);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('accepts a dropped file through the dropzone handlers', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    const { onFileSelect } = renderFU();
    const file = new File(['x'], 'dropped.png', { type: 'image/png' });

    const zone = screen.getByRole('group', { name: 'Project image' });
    fireEvent.drop(zone, { dataTransfer: { files: [file], items: [] } });

    await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(WEBP_URL));
  });

  it('clears a previous error once a valid file is selected', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    const { onFileSelect } = renderFU();

    attachFile(new File(['plain'], 'notes.txt', { type: 'text/plain' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));
    // Await the PIPELINE END, not just the error clearing (setErrorCode(null)
    // is synchronous) — otherwise the Image onload timer outlives the test
    // and fires after afterEach restored the canvas mock.
    await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(WEBP_URL));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('FileUpload: accessibility', () => {
  it('associates the visible label with the file input', () => {
    renderFU();
    const label = screen.getByText('Project image');
    expect(fileInput().id).toBeTruthy();
    expect(label).toHaveAttribute('for', fileInput().id);
  });

  it('exposes a keyboard-reachable button that opens the file dialog', async () => {
    const user = userEvent.setup();
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);
    renderFU();

    await user.tab();
    expect(screen.getByRole('button', { name: TEXTS.button })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('links the error to the input via aria-describedby and announces it via role=alert', async () => {
    renderFU();

    attachFile(new File(['plain'], 'notes.txt', { type: 'text/plain' }));
    const alert = await screen.findByRole('alert');

    expect(alert).toHaveAttribute('role', 'alert');
    const describedBy = fileInput().getAttribute('aria-describedby') ?? '';
    expect(describedBy.split(' ')).toContain(alert.id);
  });

  it('announces a successful selection through an aria-live=polite region', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(WEBP_URL);
    renderFU();

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));

    await waitFor(() => {
      const live = document.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toBe(TEXTS.selected);
    });
  });

  it('disables the input and the button when disabled', () => {
    renderFU({ disabled: true });
    expect(fileInput()).toBeDisabled();
    expect(screen.getByRole('button', { name: TEXTS.button })).toBeDisabled();
  });

  it('renders no hardcoded text of its own (plan A2)', () => {
    const FIXTURE = 'Маркер-без-перевода-9f3a';
    const { container } = render(
      <FileUpload
        label={`${FIXTURE}-label`}
        texts={{ ...TEXTS, button: `${FIXTURE}-button`, hint: `${FIXTURE}-hint` }}
        onFileSelect={vi.fn()}
      />
    );

    // Exact textContent equality: every rendered character is an input
    // fixture — no kit-owned copy, no extra text nodes.
    expect(container.textContent).toBe(`${FIXTURE}-label${FIXTURE}-button${FIXTURE}-hint`);
  });
});
