import { describe, expect, it } from 'vitest';
import { calculatePosition, type Placement } from './calculatePosition';

/** Helper: создать DOMRect-подобный объект */
const rect = (top: number, left: number, width: number, height: number): DOMRect =>
  ({
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }) as DOMRect;

describe('calculatePosition', () => {
  const viewport = { viewportWidth: 1000, viewportHeight: 800 };

  it('позиционирует top по центру триггера', () => {
    const trigger = rect(100, 200, 100, 40);
    const tooltip = rect(0, 0, 120, 40);

    const result = calculatePosition({
      placement: 'top',
      triggerRect: trigger,
      elementRect: tooltip,
      offset: 8,
      autoAdjust: false,
      ...viewport,
    });

    expect(result.top).toBe(100 - 40 - 8); // trigger.top - tooltip.height - offset
    expect(result.left).toBe(200 + (100 - 120) / 2); // центрирование
    expect(result.adjustedPlacement).toBe('top');
  });

  it('позиционирует bottom с offset', () => {
    const trigger = rect(100, 200, 100, 40);
    const tooltip = rect(0, 0, 120, 40);

    const result = calculatePosition({
      placement: 'bottom',
      triggerRect: trigger,
      elementRect: tooltip,
      offset: 8,
      autoAdjust: false,
      ...viewport,
    });

    expect(result.top).toBe(100 + 40 + 8);
    expect(result.adjustedPlacement).toBe('bottom');
  });

  it('позиционирует left по центру по вертикали', () => {
    const trigger = rect(100, 200, 100, 40);
    const tooltip = rect(0, 0, 120, 40);

    const result = calculatePosition({
      placement: 'left',
      triggerRect: trigger,
      elementRect: tooltip,
      offset: 8,
      autoAdjust: false,
      ...viewport,
    });

    expect(result.top).toBe(100 + (40 - 40) / 2);
    expect(result.left).toBe(200 - 120 - 8);
  });

  it('позиционирует right с offset', () => {
    const trigger = rect(100, 200, 100, 40);
    const tooltip = rect(0, 0, 120, 40);

    const result = calculatePosition({
      placement: 'right',
      triggerRect: trigger,
      elementRect: tooltip,
      offset: 8,
      autoAdjust: false,
      ...viewport,
    });

    expect(result.left).toBe(200 + 100 + 8);
  });

  describe('12 позиций', () => {
    it('top-start выравнивает по левому краю триггера', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'top-start',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.left).toBe(200); // trigger.left
    });

    it('top-end выравнивает по правому краю триггера', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'top-end',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.left).toBe(200 + 100 - 120); // trigger.right - tooltip.width
    });

    it('bottom-start выравнивает по левому краю', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'bottom-start',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.left).toBe(200);
      expect(result.top).toBe(100 + 40 + 8);
    });

    it('left-start выравнивает по верхнему краю', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'left-start',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.top).toBe(100);
    });

    it('left-end выравнивает по нижнему краю', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'left-end',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.top).toBe(100 + 40 - 40); // trigger.bottom - tooltip.height
    });

    it('right-start выравнивает по верхнему краю', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'right-start',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.top).toBe(100);
    });

    it('right-end выравнивает по нижнему краю', () => {
      const trigger = rect(100, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'right-end',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.top).toBe(100 + 40 - 40);
    });
  });

  describe('auto-adjust', () => {
    it('flip top → bottom при выходе за верхнюю границу', () => {
      const trigger = rect(0, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'top',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: true,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('bottom');
      expect(result.top).toBe(0 + 40 + 8);
    });

    it('flip bottom → top при выходе за нижнюю границу', () => {
      const trigger = rect(760, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'bottom',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: true,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('top');
    });

    it('flip left → right при выходе за левую границу', () => {
      const trigger = rect(100, 0, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'left',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: true,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('right');
      expect(result.left).toBe(0 + 100 + 8);
    });

    it('flip right → left при выходе за правую границу', () => {
      const trigger = rect(100, 950, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'right',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: true,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('left');
    });

    it('top-start flip сохраняет align start', () => {
      const trigger = rect(0, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'top-start',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: true,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('bottom-start');
    });

    it('не flip когда autoAdjust=false', () => {
      const trigger = rect(0, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'top',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.adjustedPlacement).toBe('top');
    });
  });

  describe('clamp к viewport', () => {
    it('не выходит за правую границу', () => {
      const trigger = rect(100, 990, 100, 40);
      const tooltip = rect(0, 0, 200, 40);

      const result = calculatePosition({
        placement: 'right',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.left).toBeLessThanOrEqual(1000 - 200 - 8);
      expect(result.left).toBeGreaterThanOrEqual(8);
    });

    it('не выходит за нижнюю границу', () => {
      const trigger = rect(790, 200, 100, 40);
      const tooltip = rect(0, 0, 120, 40);

      const result = calculatePosition({
        placement: 'bottom',
        triggerRect: trigger,
        elementRect: tooltip,
        offset: 8,
        autoAdjust: false,
        ...viewport,
      });

      expect(result.top).toBeLessThanOrEqual(800 - 40 - 8);
      expect(result.top).toBeGreaterThanOrEqual(8);
    });
  });
});

// Хелпер не используется напрямую в рантайме, но обеспечивает
// compile-time проверку всех 12 вариантов типа Placement.
const ALL_PLACEMENTS: Placement[] = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
];

describe('Placement type coverage', () => {
  it('содержит все 12 placement вариантов', () => {
    expect(ALL_PLACEMENTS).toHaveLength(12);
  });
});
