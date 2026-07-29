import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withForm?: boolean;
}

function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions): RenderResult {
  return render(ui, options);
}

export { renderWithProviders };

function setupUserEvent() {
  return userEvent.setup();
}

export { setupUserEvent };

interface InputTestConfig {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

function getInputTestId(label: string): string {
  return `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
}

function createInputProps(overrides: InputTestConfig = {}) {
  return {
    label: overrides.label ?? 'Test Input',
    placeholder: overrides.placeholder ?? 'Enter value',
    ...(overrides.error && { error: overrides.error }),
    ...(overrides.helperText && { helperText: overrides.helperText }),
    'data-testid': getInputTestId(overrides.label ?? 'test-input'),
  };
}

export { getInputTestId, createInputProps };

export { screen } from '@testing-library/react';
