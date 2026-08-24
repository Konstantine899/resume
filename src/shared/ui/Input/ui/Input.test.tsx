import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail } from 'lucide-react';
import { Input } from './Input';

describe('Input', () => {
  describe('Basic Rendering', () => {
    it('renders input correctly', () => {
      render(<Input placeholder="Test input" />);
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });

    it('forwards className to input element', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('applies fullWidth class to wrapper', () => {
      render(<Input fullWidth />);
      const wrapper = screen.getByTestId('input-wrapper');
      expect(wrapper.className).toMatch(/fullWidth/);
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input using htmlFor', () => {
      render(<Input label="Email" id="email-input" />);
      const label = screen.getByLabelText('Email');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('id', 'email-input');
    });

    it('renders required indicator when required prop is true', () => {
      render(<Input label="Email" required />);
      // Звёздочка рендерится через CSS ::after — label-текст остаётся чистым
      const label = screen.getByText('Email');
      expect(label.className).toContain('required');
    });

    it('does not render required indicator when required is false', () => {
      render(<Input label="Email" required={false} />);
      const label = screen.getByText('Email');
      expect(label.className).not.toContain('required');
    });
  });

  describe('Accessibility', () => {
    it('generates unique id when not provided', () => {
      const { container } = render(<Input label="Test" />);
      const input = container.querySelector('input');
      const label = container.querySelector('label');
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input?.id);
    });

    it('uses provided id', () => {
      render(<Input label="Email" id="custom-id" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when no error', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-busy when loading', () => {
      render(<Input label="Email" loading />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).not.toHaveAttribute('aria-busy');
    });

    it('sets aria-describedby for error message', () => {
      render(<Input label="Email" error="Invalid email" id="email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('sets aria-describedby for helper text', () => {
      render(<Input label="Email" helperText="We'll never share your email" id="email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-helper');
    });

    it('error takes precedence over helper text for aria-describedby', () => {
      render(
        <Input
          label="Email"
          error="Invalid email"
          helperText="We'll never share your email"
          id="email"
        />
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('hides icons from screen readers with aria-hidden', () => {
      render(<Input label="Email" icon={<Mail aria-hidden="true" />} />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides iconAfter from screen readers with aria-hidden', () => {
      render(
        <Input label="Email" iconAfter={<Mail data-testid="icon-after" aria-hidden="true" />} />
      );
      const iconAfter = screen.getByTestId('icon-after');
      expect(iconAfter).toHaveAttribute('aria-hidden', 'true');
    });

    it('error message has role="alert"', () => {
      render(<Input label="Email" error="Invalid email" id="email" />);
      expect(screen.getByText('Invalid email')).toHaveAttribute('role', 'alert');
    });

    it('error message has correct id', () => {
      render(<Input label="Email" error="Invalid email" id="email" />);
      expect(screen.getByText('Invalid email')).toHaveAttribute('id', 'email-error');
    });

    it('helper text has correct id', () => {
      render(<Input label="Email" helperText="Helpful info" id="email" />);
      expect(screen.getByText('Helpful info')).toHaveAttribute('id', 'email-helper');
    });

    it('sets aria-required when required prop is true', () => {
      const { container } = render(<Input label="Email" required />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('does not set aria-required when required prop is false', () => {
      const { container } = render(<Input label="Email" />);
      const input = container.querySelector('input');
      expect(input).not.toHaveAttribute('aria-required');
    });
  });

  describe('Error State', () => {
    it('renders error message when error prop is provided', () => {
      render(<Input label="Email" error="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('applies error class to input', () => {
      const { container } = render(<Input error="Error" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('error');
    });

    it('does not render helper text when error is present', () => {
      render(<Input label="Email" error="Invalid" helperText="Helper text" />);
      expect(screen.getByText('Invalid')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('applies error styling', () => {
      const { container } = render(<Input error="Error message" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('error');
    });

    it('still shows error and loading indicator when both error and loading are set', () => {
      render(<Input loading error="Error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('applies success class when success prop is true', () => {
      const { container } = render(<Input success />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('success');
    });

    it('does not apply success class when success is false', () => {
      const { container } = render(<Input success={false} />);
      expect(container.querySelector('input')).not.toHaveClass('success');
    });
  });

  describe('Loading State', () => {
    it('renders Loader component when loading', () => {
      render(<Input loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies loading class to input', () => {
      const { container } = render(<Input loading />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('loading');
    });

    it('hides iconAfter when loading', () => {
      render(<Input iconAfter={<Mail data-testid="icon-after" />} loading />);
      expect(screen.queryByTestId('icon-after')).not.toBeInTheDocument();
    });

    it('sets aria-busy to true', () => {
      render(<Input loading />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Skeleton', () => {
    it('does not render input when skeleton is true', () => {
      render(<Input skeleton placeholder="test" />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('sets data-skeleton on wrapper', () => {
      render(<Input skeleton />);
      const wrapper = screen.getByTestId('input-wrapper');
      expect(wrapper).toHaveAttribute('data-skeleton');
    });

    it('sets aria-busy on wrapper when skeleton', () => {
      render(<Input skeleton />);
      const wrapper = screen.getByTestId('input-wrapper');
      expect(wrapper).toHaveAttribute('aria-busy');
    });

    it('shows Spinner when loading is true and skeleton is false', () => {
      render(<Input loading />);
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });

    it('hides Spinner when skeleton is true even if loading is also true', () => {
      render(<Input loading skeleton />);
      // Skeleton replaces the input and has its own role="status",
      // but the Spinner inside loadingIndicator must NOT be rendered
      expect(screen.queryByTestId('spinner-circle')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('hides iconAfter when skeleton', () => {
      render(<Input skeleton iconAfter={<Mail data-testid="icon-after" />} />);
      expect(screen.queryByTestId('icon-after')).not.toBeInTheDocument();
    });

    it('hides clear button when skeleton', () => {
      render(<Input skeleton clearable defaultValue="test" />);
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('hides password toggle when skeleton', () => {
      render(<Input skeleton type="password" showPasswordToggle />);
      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument();
    });

    it('hides character counter when skeleton', () => {
      render(<Input skeleton showCounter maxLength={100} defaultValue="test" />);
      expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('sets data-size on wrapper', () => {
      const { rerender } = render(<Input size="sm" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-size', 'sm');

      rerender(<Input size="md" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-size', 'md');

      rerender(<Input size="lg" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-size', 'lg');
    });

    it('sets data-variant on wrapper', () => {
      const { rerender } = render(<Input variant="default" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-variant', 'default');

      rerender(<Input variant="outline" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-variant', 'outline');

      rerender(<Input variant="filled" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-variant', 'filled');

      rerender(<Input variant="floating" label="Email" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-variant', 'floating');
    });

    it('sets data-status on wrapper', () => {
      const { rerender } = render(<Input error="Error" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', 'error');

      rerender(<Input success />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', 'success');

      rerender(<Input loading />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', 'loading');

      rerender(<Input skeleton />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', 'skeleton');

      rerender(<Input />);
      expect(screen.getByTestId('input-wrapper')).not.toHaveAttribute('data-status');
    });

    it('data-status gives error priority over other states', () => {
      render(<Input error="Error" loading skeleton />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', 'error');
    });

    it('sets data-state with space-separated state tokens', () => {
      const { rerender } = render(<Input loading />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-state', 'loading');

      rerender(<Input loading error="Error" />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-state', 'loading error');

      rerender(<Input disabled readOnly />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute(
        'data-state',
        'disabled readonly'
      );

      rerender(<Input skeleton loading error="Error" disabled readOnly />);
      expect(screen.getByTestId('input-wrapper')).toHaveAttribute(
        'data-state',
        'loading error disabled readonly skeleton'
      );
    });

    it('does not set data-state when no states are active', () => {
      render(<Input />);
      expect(screen.getByTestId('input-wrapper')).not.toHaveAttribute('data-state');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input?.className).toContain('input');
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Input disabled onClick={handleClick} />);
      fireEvent.click(screen.getByRole('textbox'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('ReadOnly State', () => {
    it('sets readOnly attribute when readOnly prop is true', () => {
      render(<Input readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('does not set readOnly when readOnly is false', () => {
      render(<Input readOnly={false} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
    });
  });

  describe('Variants', () => {
    it('applies default variant', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('default');
    });

    it('applies outline variant', () => {
      const { container } = render(<Input variant="outline" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('outline');
    });

    it('applies filled variant', () => {
      const { container } = render(<Input variant="filled" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('filled');
    });
  });

  describe('Sizes', () => {
    it('applies md size by default', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('md');
    });

    it('applies sm size', () => {
      const { container } = render(<Input size="sm" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('sm');
    });

    it('applies xs size', () => {
      const { container } = render(<Input size="xs" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('xs');
    });

    it('applies lg size', () => {
      const { container } = render(<Input size="lg" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('lg');
    });

    it('applies xl size', () => {
      const { container } = render(<Input size="xl" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('xl');
    });
  });

  describe('Icons', () => {
    it('renders icon before input', () => {
      render(<Input icon={<Mail data-testid="mail-icon" />} />);
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('renders iconAfter after input', () => {
      render(<Input iconAfter={<Mail data-testid="mail-icon-after" />} />);
      expect(screen.getByTestId('mail-icon-after')).toBeInTheDocument();
    });

    it('renders both icon and iconAfter', () => {
      render(
        <Input
          icon={<Mail data-testid="mail-icon-before" />}
          iconAfter={<Mail data-testid="mail-icon-after" />}
        />
      );
      expect(screen.getByTestId('mail-icon-before')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon-after')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="This is helpful text" />);
      expect(screen.getByText('This is helpful text')).toBeInTheDocument();
    });

    it('does not render helper text when error is present', () => {
      render(<Input helperText="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('calls onChange when input value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when input is focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      fireEvent.blur(screen.getByRole('textbox'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown when key is pressed', () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('type');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards placeholder to input', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Enter text...');
    });

    it('forwards defaultValue to input', () => {
      render(<Input defaultValue="Initial value" />);
      expect(screen.getByRole('textbox')).toHaveValue('Initial value');
    });

    it('forwards name attribute', () => {
      render(<Input name="username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('forwards autoComplete attribute', () => {
      render(<Input autoComplete="off" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'off');
    });

    it('forwards required attribute', () => {
      render(<Input required />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('required');
    });

    it('forwards minLength attribute', () => {
      render(<Input minLength={5} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('minlength', '5');
    });

    it('forwards maxLength attribute', () => {
      render(<Input maxLength={100} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '100');
    });

    it('forwards pattern attribute', () => {
      render(<Input pattern="[a-z]+" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[a-z]+');
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      render(
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          variant="outline"
          size="lg"
          error="Invalid email"
          icon={<Mail aria-hidden="true" />}
          fullWidth
          required
          id="email-input"
        />
      );

      const input = document.querySelector('input');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'your@email.com');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('required');
      expect(screen.getByText('Email')).toHaveClass(/required/);
      expect(screen.getByText('Invalid email')).toHaveAttribute('role', 'alert');
    });
  });

  describe('Character Counter', () => {
    it('shows character counter when showCounter and maxLength are provided', () => {
      render(<Input showCounter maxLength={100} defaultValue="Hello" />);
      expect(screen.getByTestId('counter')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('/100')).toBeInTheDocument();
    });

    it('updates counter as user types', async () => {
      render(<Input showCounter maxLength={10} />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Hello');
      expect(screen.getByTestId('counter')).toHaveTextContent('5/10');
    });

    it('shows warning style when approaching max length', () => {
      render(<Input showCounter maxLength={10} defaultValue="123456789" />);
      const counter = screen.getByTestId('counter');
      const countElement = counter.querySelector('span');
      expect(countElement?.className).toContain('warning');
    });

    it('includes counter in aria-describedby', () => {
      render(<Input showCounter maxLength={100} label="Test" />);
      const input = screen.getByLabelText('Test');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('Clear Button', () => {
    it('shows clear button when clearable is true and has value', () => {
      render(<Input clearable defaultValue="Test" />);
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('hides clear button when input is empty', () => {
      render(<Input clearable />);
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('hides clear button when disabled', () => {
      render(<Input clearable disabled defaultValue="Test" />);
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('hides clear button when readOnly', () => {
      render(<Input clearable readOnly defaultValue="Test" />);
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('hides clear button when loading', () => {
      render(<Input clearable loading defaultValue="Test" />);
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('calls onClear when clicked', async () => {
      const onClear = vi.fn();
      render(<Input clearable defaultValue="Test" onClear={onClear} />);
      await userEvent.click(screen.getByRole('button', { name: /clear/i }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('clears input value when clicked', async () => {
      render(<Input clearable defaultValue="Test" />);
      await userEvent.click(screen.getByRole('button', { name: /clear/i }));
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('Floating Label', () => {
    it('renders floating label variant', () => {
      render(<Input variant="floating" label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('has transparent placeholder for floating label', () => {
      render(<Input variant="floating" label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('placeholder', ' ');
    });

    it('renders icon with floating label', () => {
      render(<Input variant="floating" label="Email" icon={<Mail aria-hidden="true" />} />);
      expect(screen.getByTestId('icon-floating')).toBeInTheDocument();
    });

    it('renders iconAfter with floating label', () => {
      render(
        <Input
          variant="floating"
          label="Email"
          iconAfter={<Mail data-testid="icon-after-floating" aria-hidden="true" />}
        />
      );
      expect(screen.getByTestId('icon-after-floating')).toBeInTheDocument();
    });

    it('renders both icon and iconAfter with floating label', () => {
      render(
        <Input
          variant="floating"
          label="Email"
          icon={<Mail aria-hidden="true" data-testid="icon-floating-both" />}
          iconAfter={<Mail data-testid="icon-after-floating-both" aria-hidden="true" />}
        />
      );
      expect(screen.getByTestId('icon-floating-both')).toBeInTheDocument();
      expect(screen.getByTestId('icon-after-floating-both')).toBeInTheDocument();
    });
  });

  describe('Password Toggle', () => {
    it('shows password toggle button when showPasswordToggle is true', () => {
      render(<Input type="password" showPasswordToggle />);
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('has correct initial type=password', () => {
      render(<Input type="password" showPasswordToggle />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('changes icon from Eye to EyeOff', async () => {
      render(<Input type="password" showPasswordToggle />);
      const toggle = screen.getByRole('button', { name: /show password/i });
      expect(toggle).toBeInTheDocument();
      await userEvent.click(toggle);
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    });

    it('does not show toggle for non-password types', () => {
      render(<Input type="text" showPasswordToggle />);
      expect(screen.queryByRole('button', { name: /password/i })).not.toBeInTheDocument();
    });
  });

  describe('Polymorphic component prop', () => {
    it('renders as <a> when component="a" with href', () => {
      render(<Input component="a" href="/test" label="Link" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders as <button> when component="button"', () => {
      render(<Input component="button" label="Btn" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('preserves Input styles with polymorphic component', () => {
      render(<Input component="a" href="/test" variant="outline" size="lg" label="Link" />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('input');
      expect(link.className).toContain('outline');
    });

    it('renders as default <input> when no component prop', () => {
      const { container } = render(<Input label="Default" />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });

    it('forwards ref to polymorphic element', () => {
      const ref = { current: null };
      render(<Input component="a" href="/test" ref={ref} label="Link" />);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('asChild prop', () => {
    it('renders child element instead of input when asChild=true', () => {
      const { container } = render(
        <Input asChild label="Test">
          <textarea data-testid="custom-input" />
        </Input>
      );
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
      expect(container.querySelector('input')).not.toBeInTheDocument();
    });

    it('forwards className to child element', () => {
      render(
        <Input asChild className="custom-class" label="Test">
          <input data-testid="custom" />
        </Input>
      );
      const custom = screen.getByTestId('custom');
      expect(custom.className).toContain('custom-class');
      expect(custom.className).toContain('input');
    });

    it('forwards aria attributes to child', () => {
      render(
        <Input asChild label="Email" error="Invalid" id="test" required>
          <input />
        </Input>
      );
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('forwards value and onChange to child', async () => {
      const handleChange = vi.fn();
      render(
        <Input asChild label="Test" onChange={handleChange}>
          <input defaultValue="initial" />
        </Input>
      );
      const input = screen.getByLabelText('Test');
      await userEvent.type(input, 'x');
      expect(handleChange).toHaveBeenCalled();
    });

    it('forwards ref to child element', () => {
      const ref = { current: null };
      render(
        <Input asChild ref={ref} label="Test">
          <textarea />
        </Input>
      );
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('asChild takes precedence over component prop', () => {
      render(
        <Input asChild component="a" label="Test">
          <input data-testid="asChild-input" />
        </Input>
      );
      expect(screen.getByTestId('asChild-input')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('works as uncontrolled with defaultValue', () => {
      render(<Input defaultValue="test" />);
      const input = document.querySelector('input');
      expect(input).toHaveValue('test');
    });

    it('works as controlled with value', () => {
      render(<Input value="controlled" onChange={() => {}} />);
      const input = document.querySelector('input');
      expect(input).toHaveValue('controlled');
    });

    it('handles clear in uncontrolled mode', async () => {
      render(<Input clearable defaultValue="test" />);
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await userEvent.click(clearButton);
      const input = document.querySelector('input');
      expect(input).toHaveValue('');
    });

    it('updates displayed value when controlled value changes via rerender', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      const input = document.querySelector('input');
      expect(input).toHaveValue('initial');

      rerender(<Input value="updated" onChange={() => {}} />);
      expect(input).toHaveValue('updated');
    });

    it('calls onChange when user types in controlled mode', () => {
      const handleChange = vi.fn();
      render(<Input value="controlled" onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });
});
