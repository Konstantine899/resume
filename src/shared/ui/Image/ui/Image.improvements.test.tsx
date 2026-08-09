import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
