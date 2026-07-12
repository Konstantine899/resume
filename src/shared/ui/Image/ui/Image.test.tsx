import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Image } from './Image';
import { ImageProps } from '../model/types';

const TEST_IMAGE_SRC = '/test-image.jpg';
const TEST_IMAGE_ALT = 'Test image';
const TEST_FALLBACK_SRC = '/fallback.jpg';

const renderImage = (props: Partial<ImageProps> = {}) => {
  return render(
    <Image src={props.src || TEST_IMAGE_SRC} alt={props.alt || TEST_IMAGE_ALT} {...props} />
  );
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
      expect(container).toHaveClass('variantDefault');
    });

    it('applies rounded variant', () => {
      renderImage({ variant: 'rounded' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('variantRounded');
    });

    it('applies circular variant', () => {
      renderImage({ variant: 'circular' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('variantCircular');
    });

    it('applies thumbnail variant', () => {
      renderImage({ variant: 'thumbnail' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('variantThumbnail');
    });
  });

  describe('Sizes', () => {
    it('applies sm size (64px)', () => {
      renderImage({ size: 'sm' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('sizeSm');
    });

    it('applies md size (128px)', () => {
      renderImage({ size: 'md' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('sizeMd');
    });

    it('applies lg size (256px)', () => {
      renderImage({ size: 'lg' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('sizeLg');
    });

    it('applies full size (100%)', () => {
      renderImage({ size: 'full' });
      const container = screen.getByRole('img').closest('figure');
      expect(container).toHaveClass('sizeFull');
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
      expect(container).toHaveClass('priority');
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
        expect(container).toHaveClass('error');
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
      renderImage({ fallback: 'Fallback content' });
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
        expect(placeholder).toHaveClass('placeholderHidden');
      });
    });

    it('shows error state on load failure', async () => {
      renderImage();
      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        const container = img.closest('figure');
        expect(container).toHaveClass('error');
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
      const img = screen.getByRole('presentation');
      expect(img).toHaveAttribute('aria-hidden', 'true');
      expect(img).toHaveAttribute('alt', '');
    });

    it('combines children with image', () => {
      renderImage({ children: <button>Action</button> });
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});
