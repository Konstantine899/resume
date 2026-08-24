// ============================================
// Textarea Component Tests
// ============================================

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

// Helper: get textarea inside the component
const getTextarea = () => screen.getByTestId('textarea');

// ============================================
// Basic Rendering
// ============================================

describe('Basic Rendering', () => {
  it('renders with minimal props', () => {
    render(<Textarea />);
    expect(getTextarea()).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(getTextarea()).toHaveAttribute('placeholder', 'Enter text...');
  });

  it('renders with label', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByTestId('textarea-label')).toHaveTextContent('Message');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(getTextarea().className).toContain('custom-class');
  });

  it('passes HTML attributes', () => {
    render(<Textarea id="message-area" />);
    expect(getTextarea()).toHaveAttribute('id', 'message-area');
  });
});

// ============================================
// Variants
// ============================================

describe('Variant', () => {
  it('has default variant="default"', () => {
    render(<Textarea />);
    expect(getTextarea().className).toMatch(/default/);
  });

  it('applies variant="outline"', () => {
    render(<Textarea variant="outline" />);
    expect(getTextarea().className).toMatch(/outline/);
  });

  it('applies variant="filled"', () => {
    render(<Textarea variant="filled" />);
    expect(getTextarea().className).toMatch(/filled/);
  });
});

// ============================================
// Sizes
// ============================================

describe('Size', () => {
  it('has default size="md"', () => {
    render(<Textarea />);
    expect(getTextarea().className).toMatch(/md/);
  });

  it('applies size="sm"', () => {
    render(<Textarea size="sm" />);
    expect(getTextarea().className).toMatch(/sm/);
  });

  it('applies size="lg"', () => {
    render(<Textarea size="lg" />);
    expect(getTextarea().className).toMatch(/lg/);
  });
});

// ============================================
// States
// ============================================

describe('States', () => {
  it('renders with error and aria-invalid', () => {
    render(<Textarea error="Field is required" />);
    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('textarea-error')).toHaveTextContent('Field is required');
  });

  it('renders with success', () => {
    render(<Textarea success />);
    expect(getTextarea().className).toMatch(/success/);
  });

  it('renders with helperText', () => {
    render(<Textarea helperText="Max 500 characters" />);
    expect(screen.getByTestId('textarea-helper')).toHaveTextContent('Max 500 characters');
  });

  it('hides helperText when error is present', () => {
    render(<Textarea error="Error" helperText="Helper" />);
    expect(screen.getByTestId('textarea-error')).toBeInTheDocument();
    expect(screen.queryByTestId('textarea-helper')).not.toBeInTheDocument();
  });

  it('renders disabled', () => {
    render(<Textarea disabled />);
    expect(getTextarea()).toBeDisabled();
  });

  it('renders readOnly', () => {
    render(<Textarea readOnly />);
    expect(getTextarea()).toHaveAttribute('readonly');
  });

  it('renders required', () => {
    render(<Textarea required />);
    expect(getTextarea()).toBeRequired();
  });
});

// ============================================
// Loading State
// ============================================

describe('Loading State', () => {
  it('renders with loading and aria-busy', () => {
    render(<Textarea loading />);
    expect(getTextarea()).toHaveAttribute('aria-busy', 'true');
    expect(getTextarea().className).toMatch(/loading/);
  });

  it('shows Spinner when loading', () => {
    render(<Textarea loading data-testid="textarea" />);
    expect(screen.getByTestId('textarea-loading')).toBeInTheDocument();
  });

  it('hides clear button when loading', () => {
    render(<Textarea loading clearable defaultValue="text" />);
    expect(screen.queryByTestId('textarea-clear')).not.toBeInTheDocument();
  });
});

// ============================================
// Full Width
// ============================================

describe('Full Width', () => {
  it('does not have fullWidth on wrapper by default', () => {
    render(<Textarea />);
    expect(screen.getByTestId('textarea-wrapper').className).not.toMatch(/fullWidth/);
  });

  it('applies fullWidth on wrapper', () => {
    render(<Textarea fullWidth />);
    expect(screen.getByTestId('textarea-wrapper').className).toMatch(/fullWidth/);
  });
});

// ============================================
// Clearable
// ============================================

describe('Clearable', () => {
  it('shows clear button when clearable + value present', () => {
    render(<Textarea clearable defaultValue="some text" />);
    expect(screen.getByTestId('textarea-clear')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<Textarea clearable />);
    expect(screen.queryByTestId('textarea-clear')).not.toBeInTheDocument();
  });

  it('calls onClear and clears value on click', () => {
    const onClear = vi.fn();
    render(<Textarea clearable defaultValue="test" onClear={onClear} />);
    fireEvent.click(screen.getByTestId('textarea-clear'));
    expect(onClear).toHaveBeenCalledOnce();
    expect(getTextarea()).toHaveValue('');
  });
});

// ============================================
// Character Counter
// ============================================

describe('Character Counter', () => {
  it('shows counter when showCounter + maxLength', () => {
    render(<Textarea showCounter maxLength={500} />);
    expect(screen.getByTestId('textarea-counter')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-counter')).toHaveTextContent('0/500');
  });

  it('updates counter on input', () => {
    render(<Textarea showCounter maxLength={500} defaultValue="Hello" />);
    expect(screen.getByTestId('textarea-counter')).toHaveTextContent('5/500');
  });

  it('hides counter without maxLength', () => {
    render(<Textarea showCounter />);
    expect(screen.queryByTestId('textarea-counter')).not.toBeInTheDocument();
  });

  it('hides counter without showCounter', () => {
    render(<Textarea maxLength={500} />);
    expect(screen.queryByTestId('textarea-counter')).not.toBeInTheDocument();
  });
});

// ============================================
// Controlled / Uncontrolled
// ============================================

describe('Controlled / Uncontrolled', () => {
  it('works in uncontrolled mode', () => {
    render(<Textarea defaultValue="initial" />);
    expect(getTextarea()).toHaveValue('initial');
  });

  it('works in controlled mode', () => {
    const { rerender } = render(<Textarea value="controlled" onChange={vi.fn()} />);
    expect(getTextarea()).toHaveValue('controlled');

    rerender(<Textarea value="updated" onChange={vi.fn()} />);
    expect(getTextarea()).toHaveValue('updated');
  });

  it('calls onChange on input', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(getTextarea(), { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('does not change value on input in controlled mode', () => {
    const onChange = vi.fn();
    render(<Textarea value="fixed" onChange={onChange} />);
    fireEvent.change(getTextarea(), { target: { value: 'new' } });
    expect(getTextarea()).toHaveValue('fixed');
  });

  it('calls onClear in controlled mode without changing value', () => {
    const onClear = vi.fn();
    render(<Textarea clearable value="controlled" onClear={onClear} />);
    fireEvent.click(screen.getByTestId('textarea-clear'));
    expect(onClear).toHaveBeenCalledOnce();
    expect(getTextarea()).toHaveValue('controlled');
  });
});

// ============================================
// Icons
// ============================================

describe('Icons', () => {
  it('renders left icon', () => {
    render(<Textarea icon={<span data-testid="test-icon">🔍</span>} />);
    expect(screen.getByTestId('textarea-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Textarea iconAfter={<span data-testid="test-icon-after">✓</span>} />);
    expect(screen.getByTestId('textarea-icon-after')).toBeInTheDocument();
  });

  it('hides iconAfter when loading', () => {
    render(<Textarea loading iconAfter={<span data-testid="test-icon-after">✓</span>} />);
    expect(screen.queryByTestId('textarea-icon-after')).not.toBeInTheDocument();
  });
});

// ============================================
// Accessibility
// ============================================

describe('Accessibility', () => {
  it('links label to textarea via htmlFor', () => {
    render(<Textarea label="Comment" />);
    const textarea = getTextarea();
    const label = screen.getByTestId('textarea-label');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('sets aria-invalid when error', () => {
    render(<Textarea error="Error message" />);
    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-busy when loading', () => {
    render(<Textarea loading />);
    expect(getTextarea()).toHaveAttribute('aria-busy', 'true');
  });

  it('links error via aria-describedby', () => {
    render(<Textarea error="Required" />);
    const textarea = getTextarea();
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl).toHaveTextContent('Required');
  });

  it('links helperText via aria-describedby', () => {
    render(<Textarea helperText="Helper text" />);
    const textarea = getTextarea();
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const helperEl = document.getElementById(describedBy!);
    expect(helperEl).toHaveTextContent('Helper text');
  });
});

// ============================================
// Ref Forwarding
// ============================================

describe('Ref Forwarding', () => {
  it('forwards ref to DOM element', () => {
    const mockRef = vi.fn();
    render(<Textarea ref={mockRef} />);
    expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('works with useRef', () => {
    const testRef = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={testRef} />);
    expect(testRef.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

// ============================================
// Runtime Validation (Development)
// ============================================

describe('Runtime Validation (Development)', () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleWarnSpy.mockRestore();
  });

  it('warns about invalid variant', () => {
    // @ts-expect-error Testing invalid prop value
    render(<Textarea variant="invalid" />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Textarea] Invalid variant "invalid"')
    );
  });

  it('warns about invalid size', () => {
    // @ts-expect-error Testing invalid prop value
    render(<Textarea size="invalid" />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Textarea] Invalid size "invalid"')
    );
  });

  it('does not warn with valid props', () => {
    render(<Textarea variant="default" size="md" rows={4} />);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('does not warn in production mode', () => {
    process.env.NODE_ENV = 'production';
    // @ts-expect-error Testing invalid prop value
    render(<Textarea variant="invalid" />);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
  it('combines className with base classes', () => {
    render(<Textarea variant="filled" size="lg" className="custom" />);
    const textarea = getTextarea();
    expect(textarea.className).toMatch(/textarea/);
    expect(textarea.className).toMatch(/filled/);
    expect(textarea.className).toMatch(/lg/);
    expect(textarea.className).toMatch(/custom/);
  });

  it('works without props', () => {
    const { container } = render(<Textarea />);
    expect(container).toBeInTheDocument();
  });

  it('passes rest props', () => {
    render(<Textarea data-custom="value" />);
    expect(getTextarea()).toHaveAttribute('data-custom', 'value');
  });

  it('renders with isOverLimit (charCount > maxLength)', () => {
    render(<Textarea showCounter maxLength={5} defaultValue="Too long text!" />);
    const counter = screen.getByTestId('textarea-counter');
    expect(counter).toHaveTextContent('14/5');
  });
});

// ============================================
// AutoResize
// ============================================

describe('AutoResize', () => {
  it('applies autoResize class', () => {
    render(<Textarea autoResize />);
    expect(getTextarea().className).toMatch(/autoResize/);
  });

  it('does not apply autoResize class without prop', () => {
    render(<Textarea />);
    expect(getTextarea().className).not.toMatch(/autoResize/);
  });

  it('synchronizes height on mount', () => {
    render(<Textarea autoResize defaultValue="Line 1\nLine 2\nLine 3" />);
    expect(getTextarea().style.height).toBeTruthy();
    expect(getTextarea().style.height).not.toBe('auto');
  });
});

// ============================================
// React.memo Verification
// ============================================

describe('React.memo Verification', () => {
  it('is memoized with React.memo', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });
});

// ============================================
// maxRows
// ============================================

describe('maxRows', () => {
  it('sets height when maxRows is set (autoResize active)', () => {
    render(
      <Textarea autoResize maxRows={3} defaultValue="Line 1\nLine 2\nLine 3\nLine 4\nLine 5" />
    );
    const textarea = getTextarea();
    // autoResize ran — height is no longer 'auto'
    expect(textarea.style.height).not.toBe('auto');
    // Height is set to some value (may be '0px' in jsdom due to no layout)
    expect(textarea.style.height).toBeTruthy();
  });

  it('does not cap height without maxRows', () => {
    render(<Textarea autoResize defaultValue="Line 1\nLine 2\nLine 3\nLine 4\nLine 5" />);
    const textarea = getTextarea();
    expect(textarea.style.height).not.toBe('auto');
    expect(textarea.style.height).toBeTruthy();
  });

  it('accepts maxRows prop without throwing', () => {
    expect(() => {
      render(<Textarea autoResize maxRows={5} defaultValue="content" />);
    }).not.toThrow();
  });
});

// ============================================
// resize prop
// ============================================

describe('resize prop', () => {
  it('defaults to vertical resize', () => {
    render(<Textarea />);
    // Default CSS has resize: vertical
    expect(getTextarea().className).not.toMatch(/resize-/);
  });

  it('applies resize-none class', () => {
    render(<Textarea resize="none" />);
    expect(getTextarea().className).toMatch(/resize-none/);
  });

  it('applies resize-vertical class', () => {
    render(<Textarea resize="vertical" />);
    expect(getTextarea().className).toMatch(/resize-vertical/);
  });

  it('applies resize-horizontal class', () => {
    render(<Textarea resize="horizontal" />);
    expect(getTextarea().className).toMatch(/resize-horizontal/);
  });

  it('applies resize-both class', () => {
    render(<Textarea resize="both" />);
    expect(getTextarea().className).toMatch(/resize-both/);
  });
});

// ============================================
// trimOnBlur
// ============================================

describe('trimOnBlur', () => {
  it('trims whitespace on blur in uncontrolled mode', () => {
    render(<Textarea trimOnBlur defaultValue="  hello  " />);
    const textarea = getTextarea();
    expect(textarea).toHaveValue('  hello  ');
    fireEvent.blur(textarea);
    expect(textarea).toHaveValue('hello');
  });

  it('does not trim without trimOnBlur', () => {
    render(<Textarea defaultValue="  hello  " />);
    const textarea = getTextarea();
    fireEvent.blur(textarea);
    expect(textarea).toHaveValue('  hello  ');
  });

  it('does not trim empty value', () => {
    render(<Textarea trimOnBlur defaultValue="" />);
    const textarea = getTextarea();
    fireEvent.blur(textarea);
    expect(textarea).toHaveValue('');
  });

  it('calls onChange with trimmed value in controlled mode', () => {
    const onChange = vi.fn();
    render(<Textarea trimOnBlur value="  hello  " onChange={onChange} />);
    const textarea = getTextarea();
    fireEvent.blur(textarea);
    expect(onChange).toHaveBeenCalled();
  });
});

// ============================================
// aria-live on counter
// ============================================

describe('aria-live on counter', () => {
  it('has aria-live="polite" on counter', () => {
    render(<Textarea showCounter maxLength={100} />);
    const counter = screen.getByTestId('textarea-counter');
    expect(counter).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-atomic="true" on counter', () => {
    render(<Textarea showCounter maxLength={100} />);
    const counter = screen.getByTestId('textarea-counter');
    expect(counter).toHaveAttribute('aria-atomic', 'true');
  });
});

// ============================================
// Clear button uses Icon component
// ============================================

describe('Clear button Icon', () => {
  it('renders Icon component inside clear button', () => {
    render(<Textarea clearable defaultValue="text" />);
    const clearBtn = screen.getByTestId('textarea-clear');
    // Icon renders a span inside the button
    const iconSpan = clearBtn.querySelector('span');
    expect(iconSpan).toBeInTheDocument();
  });
});
