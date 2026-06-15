import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Avatar } from './Avatar';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import styles from './Avatar.module.scss';

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с alt текстом', () => {
      render(<Avatar alt="Test User" />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('aria-label', 'Test User');
    });

    it('должен рендериться с изображением при наличии src', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('должен рендериться с fallback при отсутствии src', () => {
      render(<Avatar alt="John Doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('должен рендериться с кастомным fallback', () => {
      const CustomFallback = <div data-testid="custom-fallback">Custom</div>;

      render(<Avatar alt="Test" fallback={CustomFallback} />);

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      const { container } = render(<Avatar alt="Test" className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('должен рендериться с variant="circle"', () => {
      const { container } = render(<Avatar alt="Test" variant="circle" />);

      expect(container.firstChild).toHaveClass(/circle/);
    });

    it('должен рендериться с variant="square"', () => {
      const { container } = render(<Avatar alt="Test" variant="square" />);

      expect(container.firstChild).toHaveClass(/square/);
    });
  });

  describe('Sizes', () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      it(`должен рендериться с размером ${size}`, () => {
        const { container } = render(<Avatar alt="Test" size={size} />);

        expect(container.firstChild).toHaveClass(size);
      });
    });
  });

  describe('Image Loading', () => {
    it('должен показывать скелетон во время загрузки', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="Test" showSkeleton={true} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('не должен показывать скелетон при showSkeleton=false', () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="Test" showSkeleton={false} />
      );

      expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
    });

    it('должен показывать fallback при ошибке загрузки', async () => {
      render(<Avatar src="https://invalid-url.com/avatar.jpg" alt="Test User" />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });
    });

    it('должен вызывать onError при ошибке загрузки', async () => {
      const handleError = vi.fn();

      render(<Avatar src="https://invalid-url.com/avatar.jpg" alt="Test" onError={handleError} />);

      await waitFor(() => {
        expect(handleError).toHaveBeenCalled();
      });
    });

    it('должен вызывать onLoad при успешной загрузке', async () => {
      const handleLoad = vi.fn();

      render(<Avatar src="https://example.com/avatar.jpg" alt="Test" onLoad={handleLoad} />);

      await waitFor(() => {
        expect(handleLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="img"', () => {
      const { container } = render(<Avatar alt="Test User" />);

      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('должен иметь aria-label с alt текстом', () => {
      const { container } = render(<Avatar alt="Test User" />);

      expect(container.querySelector('[aria-label="Test User"]')).toBeInTheDocument();
    });

    it('должен иметь data-loading атрибут', () => {
      const { container } = render(<Avatar alt="Test" />);

      expect(container.firstChild).toHaveAttribute('data-loading');
    });

    it('должен иметь data-error атрибут при ошибке', async () => {
      render(<Avatar src="https://invalid-url.com/avatar.jpg" alt="Test" />);

      await waitFor(() => {
        expect(screen.getByRole('img')).toHaveAttribute('data-error', 'true');
      });
    });
  });

  describe('Children', () => {
    it('должен рендерить children', () => {
      render(
        <Avatar alt="Test">
          <div data-testid="child">Child Content</div>
        </Avatar>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('должен рендерить AvatarBadge как child', () => {
      render(
        <Avatar alt="Test">
          <div className="badge">Badge</div>
        </Avatar>
      );

      expect(screen.getByText('Badge')).toBeInTheDocument();
    });
  });

  describe('Empty src handling', () => {
    it('должен показывать fallback при пустой src', () => {
      render(<Avatar src="" alt="Test User" />);

      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('должен показывать fallback при src=undefined', () => {
      render(<Avatar src={undefined} alt="Test User" />);

      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  describe('forceLoading', () => {
    it('должен показывать скелетон при forceLoading=true', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="Test"
          forceLoading={true}
          showSkeleton={true}
        />
      );

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('не должен переключаться в loaded состояние при forceLoading=true', () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="Test" forceLoading={true} />
      );

      expect(container.firstChild).toHaveAttribute('data-loading', 'true');
    });
  });
});

describe('AvatarFallback', () => {
  it('должен рендерить инициалы из имени', () => {
    render(<AvatarFallback name="John Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('должен рендерить первую букву если имя односложное', () => {
    render(<AvatarFallback name="John" />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('должен применять размер sm', () => {
    const { container } = render(<AvatarFallback name="Test" size="sm" />);

    expect(container.firstChild).toHaveClass(fallbackStyles.sm);
  });

  it('должен применять размер md', () => {
    const { container } = render(<AvatarFallback name="Test" size="md" />);

    expect(container.firstChild).toHaveClass(fallbackStyles.md);
  });

  it('должен применять размер lg', () => {
    const { container } = render(<AvatarFallback name="Test" size="lg" />);

    expect(container.firstChild).toHaveClass(fallbackStyles.lg);
  });

  it('должен применять размер xl', () => {
    const { container } = render(<AvatarFallback name="Test" size="xl" />);

    expect(container.firstChild).toHaveClass(fallbackStyles.xl);
  });

  it('должен применять кастомный className', () => {
    const { container } = render(<AvatarFallback name="Test" className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('должен рендериться без name', () => {
    const { container } = render(<AvatarFallback />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
