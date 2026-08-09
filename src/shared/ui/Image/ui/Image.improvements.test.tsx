import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import i18n from '@/shared/lib/i18n/config/i18n';
import { Image } from './Image';

const TEST_IMAGE_ALT = 'Test image';

const renderImage = (props: Partial<React.ComponentProps<typeof Image>> = {}) => {
  return render(
    <Image src={props.src ?? '/test-image.jpg'} alt={props.alt ?? TEST_IMAGE_ALT} {...props} />
  );
};

/** Fire an error on the content img and wait until the error state settles. */
const triggerError = async () => {
  const img = screen.getByRole('img');
  fireEvent.error(img);
  await waitFor(() => {
    expect(img.getAttribute('aria-describedby')).toBeTruthy();
  });
  return img;
};

describe('Image improvements (IMG-04 srcSet)', () => {
  it('renders both src and srcset from the object src form', () => {
    const srcObject = { src: '/responsive.jpg', srcSet: '/small.jpg 400w, /large.jpg 800w' };
    renderImage({ src: srcObject });
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/responsive.jpg');
    expect(img).toHaveAttribute('srcset', '/small.jpg 400w, /large.jpg 800w');
  });

  it('renders only src (no srcset attribute) for an object src without srcSet', () => {
    renderImage({ src: { src: '/solo.jpg' } });
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/solo.jpg');
    expect(img).not.toHaveAttribute('srcset');
  });

  it('passes native string srcSet through restProps unchanged (string src form)', () => {
    renderImage({ src: '/base.jpg', srcSet: '/retina.jpg 2x' });
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/base.jpg');
    expect(img).toHaveAttribute('srcset', '/retina.jpg 2x');
  });
});

describe('Image improvements (IMG-06 i18n fallback)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the English fallback text by default', async () => {
    renderImage();
    await triggerError();
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  it('renders the Russian fallback text when language is ru', async () => {
    await i18n.changeLanguage('ru');
    renderImage();
    await triggerError();
    expect(screen.getByText('Изображение недоступно')).toBeInTheDocument();
  });

  it('renders a custom fallback ReactNode verbatim (untranslated escape hatch)', async () => {
    renderImage({ fallback: <span>Custom fallback</span> });
    await triggerError();
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});

describe('Image improvements (IMG-08 aria-describedby target)', () => {
  it('resolves aria-describedby to a real fallback node in the error state', async () => {
    renderImage({ alt: 'Photo' });
    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      expect(document.getElementById('image-Photo-error')).toBeInTheDocument();
    });

    expect(img.getAttribute('aria-describedby')).toBe('image-Photo-error');
    const describedNode = document.getElementById('image-Photo-error');
    expect(describedNode).not.toBeNull();
    expect(describedNode?.textContent).toBe('Image not available');
  });

  it('adds no aria-describedby and no id node outside the error state', () => {
    renderImage({ alt: 'Photo' });
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-describedby')).toBeNull();
    expect(document.getElementById('image-Photo-error')).toBeNull();
  });
});

describe('Image improvements (ERB-01 onLoadErrorTelemetry)', () => {
  it('fires exactly once per error event with the resolved payload', async () => {
    const telemetry = vi.fn();
    renderImage({ src: '/photo.jpg', onLoadErrorTelemetry: telemetry });
    await triggerError();

    expect(telemetry).toHaveBeenCalledTimes(1);
    const info = telemetry.mock.calls[0][0];
    expect(info.src).toBe('/photo.jpg');
    expect(info.alt).toBe(TEST_IMAGE_ALT);
    expect(info.event).toBeDefined();
  });

  it('uses the resolved src from the object src union', async () => {
    const telemetry = vi.fn();
    renderImage({
      src: { src: '/obj.jpg', srcSet: '/obj@2x.jpg 2x' },
      onLoadErrorTelemetry: telemetry,
    });
    await triggerError();

    const info = telemetry.mock.calls[0][0];
    expect(info.src).toBe('/obj.jpg');
  });

  it('is suppressed while forceLoading is active (funnel gate)', () => {
    const telemetry = vi.fn();
    renderImage({ onLoadErrorTelemetry: telemetry, forceLoading: true });
    fireEvent.error(screen.getByRole('img'));
    expect(telemetry).not.toHaveBeenCalled();
  });

  it('keeps the payload shape stable (no extra fields)', async () => {
    const telemetry = vi.fn();
    renderImage({ onLoadErrorTelemetry: telemetry });
    await triggerError();

    expect(Object.keys(telemetry.mock.calls[0][0]).sort()).toEqual(['alt', 'event', 'src']);
  });

  it('does not reorder or gate the existing onLoadError callback', async () => {
    const telemetry = vi.fn();
    const onLoadError = vi.fn();
    renderImage({ onLoadErrorTelemetry: telemetry, onLoadError });
    await triggerError();

    expect(onLoadError).toHaveBeenCalledTimes(1);
    expect(telemetry).toHaveBeenCalledTimes(1);
  });

  it('fires once per error event through the fallback-img chain (documented per-event semantics)', async () => {
    const telemetry = vi.fn();
    renderImage({
      src: '/broken.jpg',
      fallback: '/fallback-broken.jpg',
      onLoadErrorTelemetry: telemetry,
    });
    const primary = screen.getByRole('img');
    fireEvent.error(primary);

    fireEvent.error(screen.getByRole('presentation'));

    expect(telemetry).toHaveBeenCalledTimes(2);
  });
});

describe('Image improvements (ERB-02 dev-only console.warn)', () => {
  const originalEnv = process.env.NODE_ENV;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    warnSpy.mockRestore();
  });

  it('logs the diagnostic warn in development with src and alt', async () => {
    process.env.NODE_ENV = 'development';
    renderImage({ src: '/dev-broken.jpg', alt: 'Dev alt' });
    await triggerError();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('[Image] Failed to load image', {
      src: '/dev-broken.jpg',
      alt: 'Dev alt',
    });
  });

  it('emits zero console.warn under the test environment', async () => {
    process.env.NODE_ENV = 'test';
    renderImage();
    await triggerError();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('emits zero console.warn under production', async () => {
    process.env.NODE_ENV = 'production';
    renderImage();
    await triggerError();

    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Image improvements (ERB-04 ErrorBoundary wrap)', () => {
  // React logs boundary-caught render errors via console.error in dev — silence
  // so the suite output stays clean (behavior under test is the DOM, not the log).
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('swaps a render-phase-throwing consumer fallback for the minimal fallback and keeps the page mounted', async () => {
    const ThrowsInRender = () => {
      throw new Error('render boom in fallback');
    };
    renderImage({ fallback: <ThrowsInRender /> });
    const figure = screen.getByRole('img').closest('figure');

    fireEvent.error(screen.getByRole('img'));

    // The throwing fallback subtree is replaced by the boundary's static null
    // fallback — the Image figure (and the page) stays mounted, no loop.
    await waitFor(() => {
      expect(figure).toBeInTheDocument();
    });
    expect(screen.getByRole('img')).toBeInTheDocument();
    // The poisoning fallback node is gone (id node absent).
    expect(document.getElementById(`image-${TEST_IMAGE_ALT}-error`)).toBeNull();
  });
});
