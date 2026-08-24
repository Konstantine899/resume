import React from 'react';
import { describe, expect, it } from 'vitest';
import { inferIconSize } from './inferIconSize';

const MockIcon = ({ size }: { size?: number }) => <svg data-size={size} />;

describe('inferIconSize', () => {
  const asElement = (node: React.ReactNode): React.ReactElement<{ size?: number }> =>
    node as React.ReactElement<{ size?: number }>;

  it('должен устанавливать размер 12 для size="xs"', () => {
    const result = asElement(inferIconSize(<MockIcon />, 'xs'));
    expect(result.props.size).toBe(12);
  });

  it('должен устанавливать размер 16 для size="sm"', () => {
    const result = asElement(inferIconSize(<MockIcon />, 'sm'));
    expect(result.props.size).toBe(16);
  });

  it('должен устанавливать размер 20 для size="md"', () => {
    const result = asElement(inferIconSize(<MockIcon />, 'md'));
    expect(result.props.size).toBe(20);
  });

  it('должен устанавливать размер 24 для size="lg"', () => {
    const result = asElement(inferIconSize(<MockIcon />, 'lg'));
    expect(result.props.size).toBe(24);
  });

  it('должен устанавливать размер 28 для size="xl"', () => {
    const result = asElement(inferIconSize(<MockIcon />, 'xl'));
    expect(result.props.size).toBe(28);
  });

  it('должен сохранять ручной размер при override', () => {
    const result = asElement(inferIconSize(<MockIcon size={32} />, 'sm'));
    expect(result.props.size).toBe(32);
  });

  it('должен возвращать non-element как есть', () => {
    const text = 'icon';
    expect(inferIconSize(text, 'md')).toBe(text);
  });
});
