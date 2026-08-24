import { describe, it, expect } from 'vitest';
import React from 'react';
import { Mail } from 'lucide-react';
import { inferIconSize, INPUT_SIZE_TO_ICON } from './inferIconSize';

describe('inferIconSize', () => {
  it('infers icon size from input size when icon has no explicit size', () => {
    const icon = React.createElement(Mail);
    const result = inferIconSize(icon, 'lg');
    expect(result).toBeDefined();
    const element = result as React.ReactElement<{ size?: number }>;
    expect(element.props.size).toBe(INPUT_SIZE_TO_ICON.lg);
  });

  it('preserves explicit icon size when set', () => {
    const icon = React.createElement(Mail, { size: 32 });
    const result = inferIconSize(icon, 'md');
    const element = result as React.ReactElement<{ size?: number }>;
    expect(element.props.size).toBe(32);
  });

  it('uses correct mapping: sm → 16', () => {
    const icon = React.createElement(Mail);
    const result = inferIconSize(icon, 'sm');
    const element = result as React.ReactElement<{ size?: number }>;
    expect(element.props.size).toBe(16);
  });

  it('uses correct mapping: md → 20', () => {
    const icon = React.createElement(Mail);
    const result = inferIconSize(icon, 'md');
    const element = result as React.ReactElement<{ size?: number }>;
    expect(element.props.size).toBe(20);
  });

  it('uses correct mapping: lg → 24', () => {
    const icon = React.createElement(Mail);
    const result = inferIconSize(icon, 'lg');
    const element = result as React.ReactElement<{ size?: number }>;
    expect(element.props.size).toBe(24);
  });

  it('returns non-element nodes as-is', () => {
    expect(inferIconSize('text', 'md')).toBe('text');
    expect(inferIconSize(123, 'md')).toBe(123);
    expect(inferIconSize(null, 'md')).toBeNull();
  });
});
