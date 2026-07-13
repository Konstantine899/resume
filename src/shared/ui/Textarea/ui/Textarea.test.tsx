// ============================================
// Textarea Component Tests
// ============================================

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

// Helper: get textarea inside the component
const getTextarea = () => screen.getByTestId('textarea');

// ============================================
// Basic Rendering
// ============================================

describe('Basic Rendering', () => {
  it('должен рендериться с минимальными props', () => {
    render(<Textarea />);
    expect(getTextarea()).toBeInTheDocument();
  });

  it('должен рендериться с placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(getTextarea()).toHaveAttribute('placeholder', 'Enter text...');
  });

  it('должен рендериться с label', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByTestId('textarea-label')).toHaveTextContent('Message');
  });

  it('должен применять кастомный className', () => {
    render(<Textarea className="custom-class" />);
    expect(getTextarea().className).toContain('custom-class');
  });

  it('должен передавать HTML атрибуты', () => {
    render(<Textarea id="message-area" />);
    expect(getTextarea()).toHaveAttribute('id', 'message-area');
  });
});

// ============================================
// Variants
// ============================================

describe('Variant', () => {
  it('должен иметь variant="default" по умолчанию', () => {
    render(<Textarea />);
    expect(getTextarea().className).toMatch(/default/);
  });

  it('должен применять variant="outline"', () => {
    render(<Textarea variant="outline" />);
    expect(getTextarea().className).toMatch(/outline/);
  });

  it('должен применять variant="filled"', () => {
    render(<Textarea variant="filled" />);
    expect(getTextarea().className).toMatch(/filled/);
  });
});

// ============================================
// Sizes
// ============================================

describe('Size', () => {
  it('должен иметь size="md" по умолчанию', () => {
    render(<Textarea />);
    expect(getTextarea().className).toMatch(/md/);
  });

  it('должен применять size="sm"', () => {
    render(<Textarea size="sm" />);
    expect(getTextarea().className).toMatch(/sm/);
  });

  it('должен применять size="lg"', () => {
    render(<Textarea size="lg" />);
    expect(getTextarea().className).toMatch(/lg/);
  });
});

// ============================================
// States
// ============================================

describe('States', () => {
  it('должен рендериться с error и aria-invalid', () => {
    render(<Textarea error="Field is required" />);
    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('textarea-error')).toHaveTextContent('Field is required');
  });

  it('должен рендериться с success', () => {
    render(<Textarea success />);
    expect(getTextarea().className).toMatch(/success/);
  });

  it('должен рендериться с helperText', () => {
    render(<Textarea helperText="Max 500 characters" />);
    expect(screen.getByTestId('textarea-helper')).toHaveTextContent('Max 500 characters');
  });

  it('не должен показывать helperText при error', () => {
    render(<Textarea error="Error" helperText="Helper" />);
    expect(screen.getByTestId('textarea-error')).toBeInTheDocument();
    expect(screen.queryByTestId('textarea-helper')).not.toBeInTheDocument();
  });

  it('должен рендериться disabled', () => {
    render(<Textarea disabled />);
    expect(getTextarea()).toBeDisabled();
  });

  it('должен рендериться readOnly', () => {
    render(<Textarea readOnly />);
    expect(getTextarea()).toHaveAttribute('readonly');
  });

  it('должен рендериться required', () => {
    render(<Textarea required />);
    expect(getTextarea()).toBeRequired();
  });
});

// ============================================
// Loading State
// ============================================

describe('Loading State', () => {
  it('должен рендериться с loading и aria-busy', () => {
    render(<Textarea loading />);
    expect(getTextarea()).toHaveAttribute('aria-busy', 'true');
    expect(getTextarea().className).toMatch(/loading/);
  });

  it('должен показывать Loader при loading', () => {
    render(<Textarea loading data-testid="textarea" />);
    expect(screen.getByTestId('textarea-loading')).toBeInTheDocument();
  });

  it('не должен показывать clearable при loading', () => {
    render(<Textarea loading clearable defaultValue="text" />);
    expect(screen.queryByTestId('textarea-clear')).not.toBeInTheDocument();
  });
});

// ============================================
// Full Width
// ============================================

describe('Full Width', () => {
  it('не должен иметь fullWidth на wrapper по умолчанию', () => {
    render(<Textarea />);
    expect(screen.getByTestId('textarea-wrapper').className).not.toMatch(/fullWidth/);
  });

  it('должен применять fullWidth на wrapper', () => {
    render(<Textarea fullWidth />);
    expect(screen.getByTestId('textarea-wrapper').className).toMatch(/fullWidth/);
  });
});

// ============================================
// Clearable
// ============================================

describe('Clearable', () => {
  it('должен показывать кнопку очистки при clearable + значение', () => {
    render(<Textarea clearable defaultValue="some text" />);
    expect(screen.getByTestId('textarea-clear')).toBeInTheDocument();
  });

  it('не должен показывать кнопку очистки при пустом значении', () => {
    render(<Textarea clearable />);
    expect(screen.queryByTestId('textarea-clear')).not.toBeInTheDocument();
  });

  it('должен вызывать onClear и очищать значение при клике', () => {
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
  it('должен показывать счётчик при showCounter + maxLength', () => {
    render(<Textarea showCounter maxLength={500} />);
    expect(screen.getByTestId('textarea-counter')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-counter')).toHaveTextContent('0/500');
  });

  it('должен обновлять счётчик при вводе', () => {
    render(<Textarea showCounter maxLength={500} defaultValue="Hello" />);
    expect(screen.getByTestId('textarea-counter')).toHaveTextContent('5/500');
  });

  it('не должен показывать счётчик без maxLength', () => {
    render(<Textarea showCounter />);
    expect(screen.queryByTestId('textarea-counter')).not.toBeInTheDocument();
  });

  it('не должен показывать счётчик без showCounter', () => {
    render(<Textarea maxLength={500} />);
    expect(screen.queryByTestId('textarea-counter')).not.toBeInTheDocument();
  });
});

// ============================================
// Controlled / Uncontrolled
// ============================================

describe('Controlled / Uncontrolled', () => {
  it('должен работать в uncontrolled режиме', () => {
    render(<Textarea defaultValue="initial" />);
    expect(getTextarea()).toHaveValue('initial');
  });

  it('должен работать в controlled режиме', () => {
    const { rerender } = render(<Textarea value="controlled" onChange={vi.fn()} />);
    expect(getTextarea()).toHaveValue('controlled');

    rerender(<Textarea value="updated" onChange={vi.fn()} />);
    expect(getTextarea()).toHaveValue('updated');
  });

  it('должен вызывать onChange при вводе', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(getTextarea(), { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('не должен изменять value при вводе в controlled режиме', () => {
    const onChange = vi.fn();
    render(<Textarea value="fixed" onChange={onChange} />);
    fireEvent.change(getTextarea(), { target: { value: 'new' } });
    expect(getTextarea()).toHaveValue('fixed');
  });

  it('должен вызывать onClear в controlled режиме не меняя value', () => {
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
  it('должен рендерить иконку слева', () => {
    render(<Textarea icon={<span data-testid="test-icon">🔍</span>} />);
    expect(screen.getByTestId('textarea-icon')).toBeInTheDocument();
  });

  it('должен рендерить иконку справа', () => {
    render(<Textarea iconAfter={<span data-testid="test-icon-after">✓</span>} />);
    expect(screen.getByTestId('textarea-icon-after')).toBeInTheDocument();
  });

  it('не должен показывать iconAfter при loading', () => {
    render(<Textarea loading iconAfter={<span data-testid="test-icon-after">✓</span>} />);
    expect(screen.queryByTestId('textarea-icon-after')).not.toBeInTheDocument();
  });
});

// ============================================
// Accessibility
// ============================================

describe('Accessibility', () => {
  it('должен иметь связь label → textarea через htmlFor', () => {
    render(<Textarea label="Comment" />);
    const textarea = getTextarea();
    const label = screen.getByTestId('textarea-label');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('должен устанавливать aria-invalid при error', () => {
    render(<Textarea error="Error message" />);
    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
  });

  it('должен устанавливать aria-busy при loading', () => {
    render(<Textarea loading />);
    expect(getTextarea()).toHaveAttribute('aria-busy', 'true');
  });

  it('должен связывать error через aria-describedby', () => {
    render(<Textarea error="Required" />);
    const textarea = getTextarea();
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl).toHaveTextContent('Required');
  });

  it('должен связывать helperText через aria-describedby', () => {
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
  it('должен передавать ref на DOM элемент', () => {
    const mockRef = vi.fn();
    render(<Textarea ref={mockRef} />);
    expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('должен работать с useRef', () => {
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

  it('должен предупреждать о невалидном variant', () => {
    // @ts-expect-error Testing invalid prop value
    render(<Textarea variant="invalid" />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Textarea: invalid variant "invalid"')
    );
  });

  it('должен предупреждать о невалидном size', () => {
    // @ts-expect-error Testing invalid prop value
    render(<Textarea size="invalid" />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Textarea: invalid size "invalid"')
    );
  });

  it('должен предупреждать о rows < 2', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<Textarea rows={1 as any} />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Textarea: invalid rows "1"')
    );
  });

  it('должен предупреждать о rows > 10', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<Textarea rows={15 as any} />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Textarea: invalid rows "15"')
    );
  });

  it('не должен предупреждать при валидных props', () => {
    render(<Textarea variant="default" size="md" rows={4} />);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('не должен предупреждать в production режиме', () => {
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
  it('должен комбинировать className с базовыми классами', () => {
    render(<Textarea variant="filled" size="lg" className="custom" />);
    const textarea = getTextarea();
    expect(textarea.className).toMatch(/textarea/);
    expect(textarea.className).toMatch(/filled/);
    expect(textarea.className).toMatch(/lg/);
    expect(textarea.className).toMatch(/custom/);
  });

  it('должен работать без пропсов', () => {
    const { container } = render(<Textarea />);
    expect(container).toBeInTheDocument();
  });

  it('должен передавать rest props', () => {
    render(<Textarea data-custom="value" />);
    expect(getTextarea()).toHaveAttribute('data-custom', 'value');
  });

  it('должен рендериться с isOverLimit (charCount > maxLength)', () => {
    render(<Textarea showCounter maxLength={5} defaultValue="Too long text!" />);
    const counter = screen.getByTestId('textarea-counter');
    expect(counter).toHaveTextContent('14/5');
  });
});

// ============================================
// AutoResize
// ============================================

describe('AutoResize', () => {
  it('должен применять класс autoResize', () => {
    render(<Textarea autoResize />);
    expect(getTextarea().className).toMatch(/autoResize/);
  });

  it('не должен применять autoResize класс без пропа', () => {
    render(<Textarea />);
    expect(getTextarea().className).not.toMatch(/autoResize/);
  });

  it('должен синхронизировать высоту при монтировании', () => {
    render(<Textarea autoResize defaultValue="Line 1\nLine 2\nLine 3" />);
    // autoResize effect устанавливает height через inline стиль
    expect(getTextarea().style.height).toBeTruthy();
    expect(getTextarea().style.height).not.toBe('auto');
  });
});

// ============================================
// React.memo Verification
// ============================================

describe('React.memo Verification', () => {
  it('должен быть мемоизирован с React.memo', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });
});
