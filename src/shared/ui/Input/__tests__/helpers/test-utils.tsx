// ============================================
// Input Test Helpers
// ============================================

import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

// ============================================
// Custom render with providers
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Wrap render with a form context (for form integration tests)
   */
  withForm?: boolean;
}

/**
 * Custom render that wraps components with all necessary providers.
 * Extends RTL's render with Input-specific defaults.
 */
function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions): RenderResult {
  return render(ui, options);
}

export { renderWithProviders };

// ============================================
// userEvent setup
// ============================================

/**
 * Pre-configured userEvent instance.
 * Using setup() is the recommended RTL pattern — it creates fresh keyboard state per test.
 */
function setupUserEvent() {
  return userEvent.setup();
}

export { setupUserEvent };

// ============================================
// Test data factories
// ============================================

interface InputTestConfig {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

/**
 * Generate a predictable test ID for input elements.
 * Useful when multiple inputs are rendered in one test.
 */
function getInputTestId(label: string): string {
  return `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Default input props factory for smoke tests.
 * Returns minimal props needed for the most common test scenarios.
 */
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

// ============================================
// Re-exports for convenience
// ============================================

export { screen } from '@testing-library/react';
