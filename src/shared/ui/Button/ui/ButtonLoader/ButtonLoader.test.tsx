import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLoader } from './ButtonLoader';

describe('ButtonLoader', () => {
  it('должен рендерить null при loading=false', () => {
    const { container } = render(<ButtonLoader loading={false} loadingVariant="spinner" />);

    expect(container.firstChild).toBeNull();
  });

  it('должен рендерить Spinner при loading=true и loadingVariant="spinner"', () => {
    render(<ButtonLoader loading={true} loadingVariant="spinner" />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('должен рендерить Skeleton при loading=true и loadingVariant="skeleton"', () => {
    const { container } = render(<ButtonLoader loading={true} loadingVariant="skeleton" />);

    const skeleton = container.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
