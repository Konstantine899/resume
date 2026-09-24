// ============================================
// Form Component - Tests
// ============================================

import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Form } from './Form';

describe('Form', () => {
  it('renders a form element', () => {
    render(<Form>content</Form>);
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByText('content').tagName).toBe('FORM');
  });

  it('forwards ref to the native form element', () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref}>ref</Form>);
    expect(ref.current).toBeInstanceOf(HTMLFormElement);
  });

  it('sets noValidate to true by default', () => {
    render(<Form>default</Form>);
    expect(screen.getByText('default')).toHaveAttribute('novalidate');
  });

  it('allows disabling noValidate explicitly', () => {
    render(<Form noValidate={false}>native</Form>);
    expect(screen.getByText('native')).not.toHaveAttribute('novalidate');
  });

  it('passes through native form attributes', () => {
    render(
      <Form action="/submit" method="post" aria-label="contact">
        attrs
      </Form>
    );
    const form = screen.getByRole('form', { name: 'contact' });
    expect(form).toHaveAttribute('action', '/submit');
    expect(form).toHaveAttribute('method', 'post');
  });

  it('merges className with the base form class', () => {
    render(<Form className="extra">classed</Form>);
    const form = screen.getByText('classed');
    expect(form.className).toContain('extra');
  });

  it('adds a gap modifier class when gap is provided', () => {
    render(<Form gap="sm">gapped</Form>);
    // CSS module key is `gap-sm` in test env, camel-cased `gapSm` in prod
    // (localsConvention: 'camelCaseOnly') — assert on the stable fragment.
    expect(screen.getByText('gapped').className).toMatch(/gap/);
  });

  it('calls onSubmit when submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit} aria-label="submit-test">
        <button type="submit">submit</button>
      </Form>
    );
    await user.click(screen.getByRole('button', { name: 'submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders children in the form', () => {
    render(
      <Form aria-label="children-test">
        <input aria-label="field" />
      </Form>
    );
    expect(screen.getByRole('form', { name: 'children-test' })).toContainElement(
      screen.getByRole('textbox')
    );
  });
});
