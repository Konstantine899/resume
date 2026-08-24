import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { i18n } from '@/shared/lib/i18n';
import { Image } from './Image';
import type { LocalImageProps, RemoteImageProps } from '../model/types';

const TEST_IMAGE_ALT = 'Test image';
const TEST_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%23f0f0f0' width='256' height='256'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23999'%3ETest Image%3C/text%3E%3C/svg%3E`;

const renderImage = (props: Partial<RemoteImageProps> = {}) => {
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

describe('Image improvements (UI Kit Best Practices)', () => {
  describe('conditional types (decorative/alt)', () => {
    it('requires alt for non-decorative images (compile-time check)', () => {
      renderImage({ alt: 'Test', decorative: false });
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test');
    });

    it('allows empty alt for decorative images', () => {
      renderImage({ alt: '', decorative: true, src: TEST_IMAGE_SVG });
      const img = screen.getByRole('presentation', { hidden: true });
      expect(img).toHaveAttribute('alt', '');
      expect(img.closest('figure')).toHaveClass(/decorative/);
    });

    it('applies decorative class to container', () => {
      renderImage({ alt: 'Decorative', decorative: true, src: TEST_IMAGE_SVG });
      const figure = screen.getByRole('presentation', { hidden: true }).closest('figure');
      expect(figure).toHaveClass(/decorative/);
    });
  });

  describe('polymorphic as prop (MUI pattern)', () => {
    it('renders as figure by default', () => {
      renderImage({});
      const figure = screen.getByRole('img').closest('figure');
      expect(figure).toBeInTheDocument();
    });

    it('renders as picture when as="picture"', () => {
      renderImage({ as: 'picture' } as unknown as Parameters<typeof renderImage>[0]);
      const picture = screen.getByRole('img').closest('picture');
      expect(picture).toBeInTheDocument();
    });

    it('renders as div when as="div"', () => {
      renderImage({ as: 'div' } as unknown as Parameters<typeof renderImage>[0]);
      const div = screen.getByRole('img').closest('div');
      expect(div).toBeInTheDocument();
    });

    it('preserves all classes and data attributes with custom as', () => {
      renderImage({ as: 'div', variant: 'rounded', size: 'lg' } as unknown as Parameters<
        typeof renderImage
      >[0]);
      const container = screen.getByRole('img').closest('div');
      expect(container).toHaveClass(/variantRounded/);
      expect(container).toHaveClass(/sizeLg/);
      expect(container).toHaveAttribute('data-variant', 'rounded');
      expect(container).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('htmlWidth/htmlHeight props (Chakra UI pattern)', () => {
    it('passes htmlWidth to img element', () => {
      renderImage({ htmlWidth: 800 });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '800');
    });

    it('passes htmlHeight to img element', () => {
      renderImage({ htmlHeight: 600 });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('height', '600');
    });

    it('passes both htmlWidth and htmlHeight', () => {
      renderImage({ htmlWidth: 1200, htmlHeight: 800 });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '1200');
      expect(img).toHaveAttribute('height', '800');
    });

    it('htmlWidth does not affect CSS width style', () => {
      renderImage({ htmlWidth: 800, size: 'sm' });
      const img = screen.getByRole('img');
      const container = img.closest('figure') as HTMLElement;
      expect(img).toHaveAttribute('width', '800');
      expect(container).toHaveClass(/sizeSm/);
    });
  });

  describe('srcSet responsive images (All UI kits)', () => {
    it('supports srcSet for responsive images', () => {
      renderImage({
        src: { src: '/photo.jpg', srcSet: '/photo@2x.jpg 2x, /photo@3x.jpg 3x' },
        htmlWidth: 400,
        htmlHeight: 300,
      });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/photo.jpg');
      expect(img).toHaveAttribute('srcset', '/photo@2x.jpg 2x, /photo@3x.jpg 3x');
      expect(img).toHaveAttribute('width', '400');
      expect(img).toHaveAttribute('height', '300');
    });
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

  describe('IMR-10 edge-case tests', () => {
    const BROKEN_SRC = 'https://example.invalid/broken.jpg';
    const LONG_ALT = 'a'.repeat(550);

    it('alt 500+ chars renders with stable image-{alt}-error id', async () => {
      render(<Image src={BROKEN_SRC} alt={LONG_ALT} />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      await waitFor(() => {
        expect(document.getElementById(`image-${LONG_ALT}-error`)).toBeInTheDocument();
      });
      expect(screen.getByText(/image not available/i)).toBeInTheDocument();
    });

    it('invalid URL telemetry carries exact src', async () => {
      const spy = vi.fn();
      render(<Image src={BROKEN_SRC} alt="Broken" onLoadErrorTelemetry={spy} />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith({
          src: BROKEN_SRC,
          alt: 'Broken',
          event: expect.any(Object),
        });
      });
    });

    it('empty alt + decorative → role=presentation, no aria-describedby', async () => {
      const { container } = render(<Image src={BROKEN_SRC} alt="" decorative />);
      const img = screen.getByRole('presentation', { hidden: true });
      fireEvent.error(img);
      await waitFor(() => {
        expect(img).toHaveAttribute('aria-hidden', 'true');
      });
      const figure = container.querySelector('figure');
      expect(img).toHaveAttribute('role', 'presentation');
      expect(img).not.toHaveAttribute('aria-describedby');
      expect(figure).toHaveAttribute('data-loading', 'error');
      expect(document.querySelector('[id^="image-"][id$="-error"]')).not.toBeInTheDocument();
    });

    it('load→error race settles last-wins', async () => {
      render(<Image src="/valid.jpg" alt="Test" />);
      const img = screen.getByRole('img');
      fireEvent.load(img);
      fireEvent.error(img);
      await waitFor(() => {
        expect(screen.getByText(/image not available/i)).toBeInTheDocument();
      });
      const figure = screen.getByRole('img').closest('figure');
      expect(figure).toHaveAttribute('data-loading', 'error');
    });

    it('error→load race settles last-wins (verify existing behavior)', async () => {
      render(<Image src="/valid.jpg" alt="Test" />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      fireEvent.load(img);
      await waitFor(() => {
        expect(screen.queryByText(/image not available/i)).not.toBeInTheDocument();
      });
      const figure = screen.getByRole('img').closest('figure');
      expect(figure).toHaveAttribute('data-loading', 'loaded');
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

describe('Image missing coverage (Этап 4)', () => {
  it('renders Spinner component for placeholder="spinner"', () => {
    render(
      <Image
        src="/test.jpg"
        alt="Spinner placeholder"
        placeholder="spinner"
        showPlaceholder
        forceLoading
      />
    );
    // Spinner has data-testid="spinner-circle"
    expect(screen.getByTestId('spinner-circle')).toBeInTheDocument();
  });

  it('suppresses onLoadSuccess/onLoadError callbacks when forceLoading is active', () => {
    const onLoadSuccess = vi.fn();
    const onLoadError = vi.fn();
    render(
      <Image
        src="/broken.jpg"
        alt="Force loading"
        forceLoading
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
      />
    );
    const img = screen.getByRole('img');
    fireEvent.load(img);
    fireEvent.error(img);
    expect(onLoadSuccess).not.toHaveBeenCalled();
    expect(onLoadError).not.toHaveBeenCalled();
  });

  it('applies blurAmount to the blur placeholder filter', () => {
    render(
      <Image
        src="/test.jpg"
        alt="Blur test"
        placeholder="blur"
        blurAmount={20}
        showPlaceholder
        forceLoading
      />
    );
    const img = screen.getByRole('img');
    // During loading with blur placeholder, the image style has filter: blur(20px)
    expect(img).toHaveStyle({ filter: 'blur(20px)' });
  });

  it('passes srcSet from object src to the img element (IMG-04)', () => {
    const srcObject = { src: '/responsive.jpg', srcSet: '/small.jpg 400w, /large.jpg 800w' };
    render(<Image src={srcObject} alt="SrcSet test" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/responsive.jpg');
    expect(img).toHaveAttribute('srcset', '/small.jpg 400w, /large.jpg 800w');
  });

  it('fires onLoadStart via loadstart event listener', () => {
    const onLoadStart = vi.fn();
    render(<Image src={TEST_IMAGE_SVG} alt="Loadstart test" onLoadStart={onLoadStart} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    // Manually fire loadstart (React doesn't delegate this synthetic event)
    img.dispatchEvent(new Event('loadstart', { bubbles: false }));
    expect(onLoadStart).toHaveBeenCalledTimes(1);
  });

  it('handles very long alt text (500+ characters)', () => {
    const longAlt = 'A'.repeat(600);
    render(<Image src={TEST_IMAGE_SVG} alt={longAlt} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', longAlt);
  });

  it('handles empty alt for decorative images', () => {
    render(<Image src={TEST_IMAGE_SVG} alt="" decorative />);
    const img = screen.getByRole('presentation', { hidden: true });
    expect(img).toHaveAttribute('alt', '');
    expect(img.closest('figure')).toHaveClass(/decorative/);
  });

  it('handles objectFit="none" (original size)', () => {
    render(<Image src={TEST_IMAGE_SVG} alt="None" objectFit="none" />);
    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ objectFit: 'none' });
  });

  it('handles objectFit="scale-down"', () => {
    render(<Image src={TEST_IMAGE_SVG} alt="Scale-down" objectFit="scale-down" />);
    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ objectFit: 'scale-down' });
  });

  it('handles sequential load and error events', async () => {
    const onLoadSuccess = vi.fn();
    const onLoadError = vi.fn();
    render(
      <Image
        src={TEST_IMAGE_SVG}
        alt="Load/Error test"
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
      />
    );
    const img = screen.getByRole('img');
    // Fire load first (simulates successful load)
    fireEvent.load(img);
    expect(onLoadSuccess).toHaveBeenCalledTimes(1);
    // Error after load is still possible (e.g., network issue on re-fetch)
    fireEvent.error(img);
    expect(onLoadError).toHaveBeenCalledTimes(1);
  });
});

describe('Image discriminated union (#4 local mode)', () => {
  it('renders the resolved local asset URL after the loader resolves', async () => {
    const loader = vi.fn().mockResolvedValue({ default: '/local-asset.webp' });
    const localProps: LocalImageProps = {
      type: 'local',
      import: loader,
      alt: 'Local asset',
    };
    render(<Image {...localProps} />);

    // The img element exists from the start, but stays pending with NO src
    // attribute at all (React omits empty-string src) — no empty-src load race.
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('src');

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', '/local-asset.webp');
    });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('stays pending (placeholder) until the loader resolves', () => {
    // Never-resolving loader keeps pendingLocal=true → loadingStatus 'loading'.
    const loader = vi.fn(() => new Promise<never>(() => {}));
    const localProps: LocalImageProps = {
      type: 'local',
      import: loader,
      alt: 'Never resolves',
    };
    render(<Image {...localProps} />);

    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('src');
    const figure = img.closest('figure');
    expect(figure).toHaveAttribute('data-loading', 'loading');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('enters the error flow when the local loader rejects', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('asset missing'));
    const localProps: LocalImageProps = {
      type: 'local',
      import: loader,
      alt: 'Broken local',
    };
    render(<Image {...localProps} />);

    await waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });

    fireEvent.error(screen.getByRole('img'));
    await waitFor(() => {
      expect(screen.getByText('Image not available')).toBeInTheDocument();
    });
  });

  it('rejects src+import mixing at compile time (src?: never guard)', () => {
    const loader = () => Promise.resolve({ default: '/a.webp' });
    // @ts-expect-error — LocalImageProps.src is `never`: src and import must not mix
    const mixed: LocalImageProps = { type: 'local', import: loader, src: '/x.jpg', alt: 'x' };
    expect(mixed).toBeDefined();
  });
});
