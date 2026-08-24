// ============================================
// validateToastProps Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateToastProps } from './validateToastProps';

describe('validateToastProps', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('должен предупреждать в dev при невалидном type', () => {
    validateToastProps({
      message: 'Test',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: 'invalid-type' as any,
      duration: 5000,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Toast] Invalid type'),
      expect.objectContaining({ type: 'invalid-type' })
    );
  });

  it('должен предупреждать в dev при пустом message', () => {
    validateToastProps({
      message: '',
      type: 'success',
      duration: 5000,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Toast] Empty message is not recommended',
      expect.objectContaining({ message: '' })
    );
  });

  it('должен предупреждать в dev при отрицательном duration', () => {
    validateToastProps({
      message: 'Test',
      type: 'info',
      duration: -100,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Toast] Duration must be >= 0 (0 = no auto-close)',
      expect.objectContaining({ duration: -100 })
    );
  });

  it('не должен предупреждать в production', () => {
    process.env.NODE_ENV = 'production';

    validateToastProps({
      message: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: 'invalid-type' as any,
      duration: -100,
    });

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
