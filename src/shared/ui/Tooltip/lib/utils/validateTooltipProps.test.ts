import { describe, expect, it } from 'vitest';
import { validateTooltipProps } from './validateTooltipProps';

const validPosition = 'top';

describe('validateTooltipProps', () => {
  it('returns no warnings for fully valid options', () => {
    const warnings = validateTooltipProps({
      position: validPosition,
      trigger: 'hover',
      showDelay: 10,
      hideDelay: 10,
      offset: 5,
      maxWidth: 100,
      color: '#ffffff',
      arrowShadowColor: '#000000',
      content: 'hello',
    });
    expect(warnings).toEqual([]);
  });

  it('returns no warnings when called with no arguments', () => {
    expect(validateTooltipProps()).toEqual([]);
  });

  it('warns on invalid position', () => {
    expect(
      validateTooltipProps({ position: 'nowhere' as never }).some((w) => w.prop === 'position')
    ).toBe(true);
  });

  it('warns on invalid trigger', () => {
    expect(
      validateTooltipProps({ trigger: 'teleport' as never }).some((w) => w.prop === 'trigger')
    ).toBe(true);
  });

  it('warns when showDelay is negative', () => {
    expect(validateTooltipProps({ showDelay: -1 }).some((w) => w.prop === 'showDelay')).toBe(true);
  });

  it('warns when hideDelay is negative', () => {
    expect(validateTooltipProps({ hideDelay: -5 }).some((w) => w.prop === 'hideDelay')).toBe(true);
  });

  it('warns when offset is negative', () => {
    expect(validateTooltipProps({ offset: -2 }).some((w) => w.prop === 'offset')).toBe(true);
  });

  it('warns when maxWidth is not positive', () => {
    expect(validateTooltipProps({ maxWidth: 0 }).some((w) => w.prop === 'maxWidth')).toBe(true);
  });

  it('warns on dangerous color (CSS injection)', () => {
    expect(validateTooltipProps({ color: 'url( evil )' }).some((w) => w.prop === 'color')).toBe(
      true
    );
  });

  it('warns on dangerous arrowShadowColor', () => {
    expect(
      validateTooltipProps({ arrowShadowColor: 'url(http://evil)' }).some(
        (w) => w.prop === 'arrowShadowColor'
      )
    ).toBe(true);
  });

  it('warns on empty content string', () => {
    expect(validateTooltipProps({ content: '' }).some((w) => w.prop === 'content')).toBe(true);
  });
});
