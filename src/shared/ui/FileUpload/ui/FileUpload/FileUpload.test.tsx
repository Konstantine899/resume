// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.test.tsx
//
// WU-4 (plan_project_images) + rev.4 (owner directive 2026-10-10): kit
// FileUpload — file input + dropzone that emits a COMPRESSED Blob + a
// filesystem-safe name (webp when canvas supports it, else explicit jpeg —
// Safari silently falls back to png otherwise). The consumer writes the
// blob into a real directory; the kit never emits a dataURL. jsdom has no
// image decoding and no canvas backend, so `Image`, the 2d context/toBlob
// and object URLs are stubbed; the production pipeline is otherwise real
// (FileReader, handlers, state).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileUpload } from './FileUpload';
import type { FileUploadSelection, FileUploadTexts } from '../../model/types';

const TEXTS: FileUploadTexts = {
  button: 'Choose image',
  hint: 'PNG, WebP or JPEG',
  notImage: 'The file is not an image',
  tooLarge: 'The image is too large',
  undecodable: 'The image could not be decoded',
  selected: 'Image selected',
};

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

/** toBlob mock: webp-capable runtime unless the test flips `webpCapable`. */
let webpCapable = true;
const mockCanvasToBlob = () =>
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    callback: BlobCallback,
    type?: string
  ) {
    const resolved =
      type === 'image/webp'
        ? webpCapable
          ? 'image/webp'
          : 'image/png' // Safari's silent fallback — not webp!
        : 'image/jpeg';
    callback(new Blob(['compressed'], { type: resolved }));
  });

const renderFU = (props: Partial<Parameters<typeof FileUpload>[0]> = {}) => {
  const mock = vi.fn<(file: FileUploadSelection) => void>();
  const utils = render(
    <FileUpload label="Project image" texts={TEXTS} onFileSelect={mock} {...props} />
  );
  // Tests that pass their own handler never touch `.mock` — the default is
  // always a typed Mock, so callers can assert on calls.
  return { ...utils, onFileSelect: mock };
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
  webpCapable = true;
  vi.stubGlobal('Image', FakeImage);
  // jsdom implements neither — the preview uses object URLs now.
  vi.stubGlobal(
    'URL',
    Object.assign(Object.create(URL) as typeof URL, {
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    })
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as ReturnType<HTMLCanvasElement['getContext']>);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('FileUpload: selection pipeline', () => {
  it('calls onFileSelect with a webp Blob + sanitized name when canvas supports webp', async () => {
    const toBlob = mockCanvasToBlob();
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'My Photo (1).PNG', { type: 'image/png' }));

    await waitFor(() =>
      expect(onFileSelect).toHaveBeenCalledWith({
        blob: expect.any(Blob),
        name: 'my-photo-1.webp',
      })
    );
    const selection = onFileSelect.mock.calls[0]?.[0] as { blob: Blob };
    expect(selection.blob.type).toBe('image/webp');
    // webp is probed first and accepted — jpeg never requested.
    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.8);
  });

  it('falls back to an explicit JPEG when webp is unsupported (Safari)', async () => {
    // Probe answers png (Safari's silent fallback), real encode returns jpeg.
    webpCapable = false;
    mockCanvasToBlob();
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'photo.heic', { type: 'image/heic' }));

    await waitFor(() =>
      expect(onFileSelect).toHaveBeenCalledWith({
        blob: expect.any(Blob),
        name: 'photo.jpg',
      })
    );
    const selection = onFileSelect.mock.calls[0]?.[0] as { blob: Blob };
    expect(selection.blob.type).toBe('image/jpeg');
  });

  it('rejects a non-image file with the notImage error (role=alert)', async () => {
    const { onFileSelect } = renderFU();

    attachFile(new File(['plain'], 'notes.txt', { type: 'text/plain' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.notImage);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects an undecodable image through img.onerror (HEIC-style)', async () => {
    imageBehavior = 'error';
    mockCanvasToBlob();
    const { onFileSelect } = renderFU();

    attachFile(new File(['x'], 'photo.heic', { type: 'image/heic' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.undecodable);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects a compressed blob over the byte cap (tooLarge)', async () => {
    mockCanvasToBlob();
    const { onFileSelect } = renderFU({ maxBlobBytes: 1 });

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.tooLarge);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('accepts a dropped file through the dropzone handlers', async () => {
    mockCanvasToBlob();
    const { onFileSelect } = renderFU();
    const file = new File(['x'], 'dropped.png', { type: 'image/png' });

    const zone = screen.getByRole('group', { name: 'Project image' });
    fireEvent.drop(zone, { dataTransfer: { files: [file], items: [] } });

    await waitFor(() =>
      expect(onFileSelect).toHaveBeenCalledWith({
        blob: expect.any(Blob),
        name: 'dropped.webp',
      })
    );
  });

  it('clears a previous error once a valid file is selected', async () => {
    mockCanvasToBlob();
    const { onFileSelect } = renderFU();

    attachFile(new File(['plain'], 'notes.txt', { type: 'text/plain' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    attachFile(new File(['x'], 'photo.png', { type: 'image/png' }));
    // Await the PIPELINE END, not just the error clearing (setErrorCode(null)
    // is synchronous) — otherwise the Image onload timer outlives the test
    // and fires after afterEach restored the canvas mock.
    await waitFor(() => expect(onFileSelect).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('FileUpload: raw SVG passthrough (skills-icon-upload)', () => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>';

  it('passes an SVG through WITHOUT canvas — original type + .svg name', async () => {
    const toBlob = mockCanvasToBlob();
    const { onFileSelect } = renderFU();

    attachFile(new File([SVG], 'React Logo.svg', { type: 'image/svg+xml' }));

    await waitFor(() =>
      expect(onFileSelect).toHaveBeenCalledWith({
        blob: expect.any(Blob),
        name: 'react-logo.svg',
      })
    );
    const selection = onFileSelect.mock.calls[0]?.[0] as { blob: Blob };
    expect(selection.blob.type).toBe('image/svg+xml');
    // Vector must never touch the raster pipeline.
    expect(toBlob).not.toHaveBeenCalled();
  });

  it('rejects an SVG over the byte cap with tooLarge (size check, not canvas)', async () => {
    const toBlob = mockCanvasToBlob();
    const { onFileSelect } = renderFU({ maxBlobBytes: 1 });

    attachFile(new File([SVG], 'big.svg', { type: 'image/svg+xml' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.tooLarge);
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(toBlob).not.toHaveBeenCalled();
  });

  it('rejects an SVG containing a <script> tag (undecodable)', async () => {
    const { onFileSelect } = renderFU();

    attachFile(
      new File(['<svg><script>alert(1)</script></svg>'], 'evil.svg', { type: 'image/svg+xml' })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.undecodable);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects an SVG containing a javascript: URL (undecodable)', async () => {
    const { onFileSelect } = renderFU();

    attachFile(
      new File(['<svg><a href="javascript:alert(1)">x</a></svg>'], 'evil.svg', {
        type: 'image/svg+xml',
      })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.undecodable);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('rejects a file typed as SVG that has no <svg> root (undecodable)', async () => {
    const { onFileSelect } = renderFU();

    attachFile(new File(['just text'], 'fake.svg', { type: 'image/svg+xml' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTS.undecodable);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('accepts a dropped SVG through the dropzone without canvas', async () => {
    const toBlob = mockCanvasToBlob();
    const { onFileSelect } = renderFU();
    const file = new File([SVG], 'dropped.svg', { type: 'image/svg+xml' });

    const zone = screen.getByRole('group', { name: 'Project image' });
    fireEvent.drop(zone, { dataTransfer: { files: [file], items: [] } });

    await waitFor(() =>
      expect(onFileSelect).toHaveBeenCalledWith({
        blob: expect.any(Blob),
        name: 'dropped.svg',
      })
    );
    expect(toBlob).not.toHaveBeenCalled();
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
    mockCanvasToBlob();
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
