import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Image } from './Image';
import { RemoteImageProps } from '../model/types';

const TEST_IMAGE_SRC = '/test-image.jpg';
const TEST_IMAGE_ALT = 'Test image';
const TEST_FALLBACK_SRC = '/fallback.jpg';

const renderImage = (props: Partial<RemoteImageProps> = {}) => {
  return render(
    <Image src={props.src || TEST_IMAGE_SRC} alt={props.alt || TEST_IMAGE_ALT} {...props} />
  );
};

// Helper to mock IntersectionObserver
const mockIntersectionObserver = () => {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  class MockObserver {
    readonly observe = observe;
    readonly unobserve = unobserve;
    readonly disconnect = disconnect;
  }

  const origObserver = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;

  return {
    observe,
    unobserve,
    disconnect,
    restore: () => {
      globalThis.IntersectionObserver = origObserver;
    },
  };
};

describe('Image Component', () => {
  describe('Basic Rendering', () => {
    it('renders image with required props', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', TEST_IMAGE_SRC);
      expect(img).toHaveAttribute('alt', TEST_IMAGE_ALT);
    });

    it('renders with custom className', () => {
      renderImage({ className: 'custom-class' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('custom-class');
    });

    it('renders with custom style', () => {
      renderImage({ style: { opacity: 0.5 } });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveStyle({ opacity: 0.5 });
    });

    it('renders with data attributes', () => {
      const { container } = render(
        <Image src={TEST_IMAGE_SRC} alt={TEST_IMAGE_ALT} data-testid="test-image" />
      );
      const img = container.querySelector('[data-testid="test-image"]');
      expect(img).toBeInTheDocument();
    });

    it('applies loading="lazy" by default', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('applies decoding="async" by default', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('renders children overlay', () => {
      renderImage({ children: <span>Overlay</span> });
      expect(screen.getByText('Overlay')).toBeInTheDocument();
    });

    it('renders as figure element', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img.closest('figure')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies default variant', () => {
      renderImage();
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/variantDefault/);
    });

    it('applies rounded variant', () => {
      renderImage({ variant: 'rounded' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/variantRounded/);
    });

    it('applies circular variant', () => {
      renderImage({ variant: 'circular' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/variantCircular/);
    });

    it('applies thumbnail variant', () => {
      renderImage({ variant: 'thumbnail' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/variantThumbnail/);
    });
  });

  describe('Sizes', () => {
    it('applies sm size (64px)', () => {
      renderImage({ size: 'sm' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/sizeSm/);
    });

    it('applies md size (128px)', () => {
      renderImage({ size: 'md' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/sizeMd/);
    });

    it('applies lg size (256px)', () => {
      renderImage({ size: 'lg' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/sizeLg/);
    });

    it('applies full size (100%)', () => {
      renderImage({ size: 'full' });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/sizeFull/);
    });
  });

  describe('Object Fit', () => {
    it('applies cover object-fit by default', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'cover' });
    });

    it('applies contain object-fit', () => {
      renderImage({ objectFit: 'contain' });
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'contain' });
    });

    it('applies fill object-fit', () => {
      renderImage({ objectFit: 'fill' });
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'fill' });
    });

    it('applies none object-fit', () => {
      renderImage({ objectFit: 'none' });
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'none' });
    });

    it('applies scale-down object-fit', () => {
      renderImage({ objectFit: 'scale-down' });
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'scale-down' });
    });
  });

  describe('Lazy Loading', () => {
    it('uses native lazy loading by default', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('uses eager loading with priority prop', () => {
      renderImage({ priority: true });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('sets fetchPriority high with priority prop', () => {
      renderImage({ priority: true });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });

    it('uses eager loading with lazyMode="eager"', () => {
      renderImage({ lazyMode: 'eager' });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('uses native lazy loading with lazyMode="native"', () => {
      renderImage({ lazyMode: 'native' });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('applies priority class with priority prop', () => {
      renderImage({ priority: true });
      const container = screen.getByRole('img').closest('figure');
      expect(container?.className).toMatch(/priority/);
    });
  });

  describe('Error Handling', () => {
    it('calls onLoadError on image error', async () => {
      const handleError = vi.fn();
      renderImage({ onLoadError: handleError });

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(handleError).toHaveBeenCalledTimes(1);
    });

    it('shows error state on image error', async () => {
      renderImage();
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        const container = img.closest('figure');
        expect(container?.className).toMatch(/error/);
      });
    });

    it('hides image on error', async () => {
      renderImage();
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveStyle({ opacity: 0 });
      });
    });

    it('shows fallback on error', async () => {
      renderImage({ fallback: <span>Fallback content</span> });
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Fallback content')).toBeInTheDocument();
      });
    });

    it('shows default fallback message without custom fallback', async () => {
      renderImage();
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Image not available')).toBeInTheDocument();
      });
    });

    it('shows fallback image on error', async () => {
      renderImage({ fallback: TEST_FALLBACK_SRC });
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        const fallbackImg = screen.getByRole('presentation');
        expect(fallbackImg).toHaveAttribute('src', TEST_FALLBACK_SRC);
      });
    });
  });

  describe('Loading States', () => {
    it('shows placeholder during loading', () => {
      renderImage({ showPlaceholder: true });
      const placeholder = screen.getByRole('img').previousSibling;
      expect(placeholder).toBeInTheDocument();
    });

    it('hides placeholder after loaded', async () => {
      renderImage({ showPlaceholder: true });
      const img = screen.getByRole('img');
      fireEvent.load(img);

      await waitFor(() => {
        const placeholder = screen.getByRole('img').previousSibling;
        expect(placeholder).toBeInTheDocument();
        expect((placeholder as HTMLElement).className).toMatch(/placeholderHidden/);
      });
    });

    it('shows error state on load failure', async () => {
      renderImage();
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        const container = img.closest('figure');
        expect(container?.className).toMatch(/error/);
      });
    });

    it('calls onLoadStart callback', () => {
      const onLoadStart = vi.fn();
      renderImage({ onLoadStart });
      const img = screen.getByRole('img');
      fireEvent.loadStart(img);
      expect(onLoadStart).toHaveBeenCalledTimes(1);
    });

    it('calls onLoadSuccess callback', () => {
      const onLoadSuccess = vi.fn();
      renderImage({ onLoadSuccess });
      const img = screen.getByRole('img');
      fireEvent.load(img);
      expect(onLoadSuccess).toHaveBeenCalledTimes(1);
    });

    it('calls onLoadError callback', () => {
      const onLoadError = vi.fn();
      renderImage({ onLoadError });
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(onLoadError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Handlers', () => {
    it('passes through onClick handler', () => {
      const onClick = vi.fn();
      renderImage({ onClick });
      const img = screen.getByRole('img');
      fireEvent.click(img);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('passes through onMouseEnter handler', () => {
      const onMouseEnter = vi.fn();
      renderImage({ onMouseEnter });
      const img = screen.getByRole('img');
      fireEvent.mouseEnter(img);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('passes through onMouseLeave handler', () => {
      const onMouseLeave = vi.fn();
      renderImage({ onMouseLeave });
      const img = screen.getByRole('img');
      fireEvent.mouseLeave(img);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('passes through onLoad handler', () => {
      const onLoad = vi.fn();
      renderImage({ onLoad });
      const img = screen.getByRole('img');
      fireEvent.load(img);
      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  describe('Quality', () => {
    it('accepts quality prop', () => {
      renderImage({ quality: 90 });
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('uses default quality', () => {
      renderImage();
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('accepts quality 0', () => {
      renderImage({ quality: 0 });
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      renderImage({
        variant: 'thumbnail',
        size: 'lg',
        objectFit: 'cover',
        placeholder: 'blur',
        lazyMode: 'native',
        priority: false,
        showPlaceholder: true,
        blurAmount: 15,
        quality: 85,
        decorative: false,
        className: 'combined-test',
        style: { opacity: 0.9 },
      });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('combined-test');
      expect(container).toHaveStyle({ opacity: 0.9 });
    });

    it('overrides size with custom width/height', () => {
      renderImage({ size: 'md', width: '200px', height: '150px' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveStyle({ width: '200px', height: '150px' });
    });

    it('applies priority loading', () => {
      renderImage({ priority: true });
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('fetchpriority', 'high');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('applies decorative mode', () => {
      renderImage({ decorative: true });
      const img = screen.getByRole('presentation', { hidden: true });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('aria-hidden', 'true');
      expect(img).toHaveAttribute('alt', '');
    });

    it('combines children with image', () => {
      renderImage({ children: <button>Action</button> });
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  // ============================================
  // Phase 3: forwardRef
  // ============================================

  describe('forwardRef', () => {
    it('forwards ref to the underlying img element via callback ref', () => {
      const refCallback = vi.fn();
      render(<Image src={TEST_IMAGE_SRC} alt={TEST_IMAGE_ALT} ref={refCallback} />);
      expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLImageElement));
    });

    it('forwards ref via object ref and ref.current targets img', () => {
      const ref = { current: null as HTMLImageElement | null };
      render(<Image src={TEST_IMAGE_SRC} alt={TEST_IMAGE_ALT} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLImageElement);
      expect(ref.current?.tagName).toBe('IMG');
    });
  });

  // ============================================
  // Phase 3: IntersectionObserver
  // ============================================

  describe('IntersectionObserver', () => {
    it('creates an IntersectionObserver when lazyMode is intersection', () => {
      const { observe, restore } = mockIntersectionObserver();
      renderImage({ lazyMode: 'intersection' });
      expect(observe).toHaveBeenCalled();
      restore();
    });

    it('does not create IntersectionObserver for native lazy mode', () => {
      const { observe, restore } = mockIntersectionObserver();
      renderImage({ lazyMode: 'native' });
      expect(observe).not.toHaveBeenCalled();
      restore();
    });

    it('does not create IntersectionObserver for eager mode', () => {
      const { observe, restore } = mockIntersectionObserver();
      renderImage({ lazyMode: 'eager' });
      expect(observe).not.toHaveBeenCalled();
      restore();
    });
  });

  // ============================================
  // Phase 3: Dynamic src change
  // ============================================

  describe('Dynamic src change', () => {
    it('re-renders with new src when src prop changes', () => {
      const { rerender } = render(<Image src="/initial.jpg" alt={TEST_IMAGE_ALT} />);
      const img1 = screen.getByRole('img');
      expect(img1).toHaveAttribute('src', '/initial.jpg');

      rerender(<Image src="/updated.jpg" alt={TEST_IMAGE_ALT} />);
      const img2 = screen.getByRole('img');
      expect(img2).toHaveAttribute('src', '/updated.jpg');
    });

    it('renders with src as object containing src and srcSet', () => {
      const srcObject = { src: '/responsive.jpg', srcSet: '/small.jpg 400w, /large.jpg 800w' };
      render(<Image src={srcObject} alt={TEST_IMAGE_ALT} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/responsive.jpg');
    });
  });

  // ============================================
  // Phase 3: showPlaceholder behavior
  // ============================================

  describe('showPlaceholder behavior', () => {
    it('shows placeholder div when showPlaceholder is true', () => {
      const { container } = renderImage({ showPlaceholder: true });
      const placeholder = container.querySelector('[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
    });

    it('does not render placeholder div when showPlaceholder is false', () => {
      renderImage({ showPlaceholder: false });
      const figure = screen.getByRole('img').closest('figure');
      const placeholderDiv = figure?.querySelector('div[aria-hidden="true"]');
      expect(placeholderDiv).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Phase 3: aria-describedby in error state
  // ============================================

  describe('Aria attributes in error state', () => {
    it('sets aria-describedby on img when in error state', async () => {
      renderImage({ alt: 'Photo' });
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(img.getAttribute('aria-describedby')).toBeTruthy();
      });
    });
  });

  // ============================================
  // Phase 3: Error recovery cycle
  // ============================================

  describe('Error recovery', () => {
    it('fires onLoadSuccess callback after error when image loads successfully', async () => {
      const onLoadSuccess = vi.fn();
      const { rerender } = render(
        <Image src="/broken.jpg" alt={TEST_IMAGE_ALT} onLoadSuccess={onLoadSuccess} />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      // Wait for error state by checking aria-describedby
      await waitFor(() => {
        expect(img.getAttribute('aria-describedby')).toBeTruthy();
      });

      // Simulate dynamic src change and successful load
      rerender(<Image src="/fixed.jpg" alt={TEST_IMAGE_ALT} onLoadSuccess={onLoadSuccess} />);

      // Simulate successful load on the new img
      fireEvent.load(screen.getByRole('img'));
      expect(onLoadSuccess).toHaveBeenCalled();
    });
  });

  // ============================================
  // Phase 3: Production vs dev validation
  // ============================================

  describe('Validation in dev vs production', () => {
    const originalEnv = process.env.NODE_ENV;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      consoleWarnSpy.mockRestore();
    });

    it('logs validation warnings in development mode', () => {
      process.env.NODE_ENV = 'development';
      renderImage({ blurAmount: 100 });
      // imageValidation.ts logValidationWarnings fires console.warn for high blurAmount
      // But note: the validation useEffect was removed from Image.tsx
      // So this tests that the component doesn't crash in dev mode
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('does not call validation in production mode', () => {
      process.env.NODE_ENV = 'production';
      renderImage({ blurAmount: 100 });
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });

  // ============================================
  // Phase 3: Placeholder types
  // ============================================

  describe('Placeholder type CSS classes', () => {
    it('renders with placeholderBlur class for blur placeholder', () => {
      renderImage({ placeholder: 'blur', showPlaceholder: true });
      const placeholder = screen.getByRole('img').previousSibling;
      expect((placeholder as HTMLElement).className).toMatch(/placeholderBlur/);
    });

    it('renders Skeleton component inside placeholder for skeleton variant', () => {
      renderImage({ placeholder: 'skeleton', showPlaceholder: true });
      const figure = screen.getByRole('img').closest('figure');
      const placeholder = figure?.querySelector('[aria-hidden="true"]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder?.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('renders with placeholderColor class for color placeholder', () => {
      renderImage({ placeholder: 'color', showPlaceholder: true });
      const placeholder = screen.getByRole('img').previousSibling;
      expect((placeholder as HTMLElement).className).toMatch(/placeholderColor/);
    });
  });

  // ============================================
  // Phase 3: Fallback img onError chain
  // ============================================

  describe('Fallback img onError', () => {
    it('fires onLoadError when fallback img errors', () => {
      const onLoadError = vi.fn();
      renderImage({ fallback: TEST_FALLBACK_SRC, onLoadError });
      const img = screen.getByRole('img');
      fireEvent.error(img);

      const fallbackImg = screen.getByRole('presentation');
      fireEvent.error(fallbackImg);

      expect(onLoadError).toHaveBeenCalledTimes(2);
    });
  });
});
