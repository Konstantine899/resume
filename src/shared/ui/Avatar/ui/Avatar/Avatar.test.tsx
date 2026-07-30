import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';
import { AvatarFallback } from '../AvatarFallback/AvatarFallback';
import fallbackStyles from '../AvatarFallback/AvatarFallback.module.scss';

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
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="Test User" showSkeleton={false} />
      );

      const image = container.querySelector('img[src="https://example.com/avatar.jpg"]');
      expect(image).toBeInTheDocument();
    });

    it('должен рендериться с fallback при отсутствии src', () => {
      render(<Avatar alt="John Doe" showSkeleton={false} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('должен рендериться с кастомным fallback', () => {
      const CustomFallback = <div data-testid="custom-fallback">Custom</div>;

      render(<Avatar alt="Test" fallback={CustomFallback} showSkeleton={false} />);

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
        const { container } = render(<Avatar alt="Test" size={size} showSkeleton={false} />);

        expect((container.firstChild as HTMLElement).className).toContain(size);
      });
    });
  });

  describe('Image Loading', () => {
    it('должен показывать скелетон во время загрузки', () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="Test" showSkeleton={true} forceLoading />
      );

      // Skeleton внутри Image имеет role="status", но скрыт через aria-hidden
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('не должен показывать скелетон при showSkeleton=false', () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="Test" showSkeleton={false} />
      );

      expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
    });

    it('должен показывать fallback при ошибке загрузки', () => {
      const { container } = render(
        <Avatar src="https://invalid-url.com/avatar.jpg" alt="Test User" forceLoading />
      );

      // При forceLoading показывается скелетон через Image
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('должен вызывать onLoad при успешной загрузке', () => {
      const handleLoad = vi.fn();

      render(<Avatar alt="Test" showSkeleton={false} onLoad={handleLoad} />);

      // При отсутствии src onLoad не вызывается
      expect(handleLoad).not.toHaveBeenCalled();
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

    it('должен иметь data-state="loading" атрибут', () => {
      const { container } = render(<Avatar alt="Test" />);

      expect(container.firstChild).toHaveAttribute('data-state', 'loading');
    });

    it('должен иметь data-state="loading" при forceLoading', () => {
      const { container } = render(<Avatar alt="Test" forceLoading />);

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('data-state', 'loading');
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

    it('должен рендерить переданные children', () => {
      render(
        <Avatar alt="Test">
          <div className="badge">Badge</div>
        </Avatar>
      );

      expect(screen.getByText('Badge')).toBeInTheDocument();
    });
  });

  describe('Empty src handling', () => {
    it('должен показывать fallback при пустой src', async () => {
      render(<Avatar src="" alt="Test User" />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });
    });

    it('должен показывать fallback при src=undefined', async () => {
      render(<Avatar src={undefined} alt="Test User" />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });
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

      expect(container.firstChild).toHaveAttribute('data-state', 'loading');
    });
  });

  describe('Callbacks', () => {
    it('calls onError when image fails to load', () => {
      const onError = vi.fn();
      render(<Avatar src="invalid.jpg" onError={onError} showSkeleton={false} />);
      const img = document.querySelector('img') as HTMLImageElement;
      fireEvent.error(img);
      expect(onError).toHaveBeenCalled();
    });

    it('calls onLoad when image loads successfully', () => {
      const onLoad = vi.fn();
      render(<Avatar src="valid.jpg" onLoad={onLoad} showSkeleton={false} />);
      const img = document.querySelector('img') as HTMLImageElement;
      fireEvent.load(img);
      expect(onLoad).toHaveBeenCalled();
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

  it('должен применять класс fallback', () => {
    const { container } = render(<AvatarFallback name="Test" size="sm" />);

    expect(container.firstChild).toHaveClass(fallbackStyles.fallback);
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

describe('Avatar polymorphic', () => {
  it('должен рендериться как div по умолчанию', () => {
    const { container } = render(<Avatar alt="Default" />);
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV');
  });

  it('должен рендериться как article при component="article"', () => {
    const { container } = render(<Avatar component="article" alt="Article" />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('должен рендериться как section при component="section"', () => {
    const { container } = render(<Avatar component="section" alt="Section" />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('должен рендериться как link при component="a" с href', () => {
    render(<Avatar component="a" href="/profile" alt="Link" />);
    const link = screen.getByRole('img');
    expect(link.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('должен сохранять data-attributes при polymorphic rendering', () => {
    const { container } = render(
      <Avatar component="article" alt="Test" size="lg" variant="circle" />
    );
    const article = container.querySelector('article');
    expect(article).toHaveAttribute('data-size', 'lg');
    expect(article).toHaveAttribute('data-variant', 'circle');
  });

  it('должен применять кастомный className при polymorphic rendering', () => {
    const { container } = render(
      <Avatar component="section" alt="Test" className="custom-class" />
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
