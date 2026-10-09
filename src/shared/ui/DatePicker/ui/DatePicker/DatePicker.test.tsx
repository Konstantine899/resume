// src/shared/ui/DatePicker/ui/DatePicker/DatePicker.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';

const mockLanguage = vi.hoisted(() => ({ current: 'en' as 'en' | 'ru' }));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: mockLanguage.current,
    t: (key: string) => key,
  }),
}));

describe('DatePicker', () => {
  beforeEach(() => {
    mockLanguage.current = 'en';
    vi.useFakeTimers({ now: new Date(2026, 5, 15), toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering (controlled)', () => {
    it('value=null → пустой input, календарь закрыт', () => {
      render(<DatePicker value={null} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      expect(screen.queryByRole('grid')).toBeNull();
    });

    it('value=ISO → input показывает dd.mm.yyyy (OPEN-4)', () => {
      render(<DatePicker value="2026-06-15" onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('15.06.2026');
    });

    it('label прокидывается на Input', () => {
      render(<DatePicker value={null} onChange={vi.fn()} label="Start date" />);

      expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    });

    it('error-строка прокидывается на Input (kit-контракт: string)', () => {
      render(<DatePicker value={null} onChange={vi.fn()} error="Invalid date" />);

      expect(screen.getByText('Invalid date')).toBeInTheDocument();
    });
  });

  describe('Popover open/close', () => {
    it('клик по триггеру открывает календарь, Esc закрывает', async () => {
      const user = userEvent.setup();
      render(<DatePicker value={null} onChange={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));
      expect(screen.getByRole('grid')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('grid')).toBeNull();
    });

    it('выбор дня в календаре → onChange(ISO) и поповер закрывается', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value={null} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));
      await user.click(screen.getByRole('gridcell', { name: /^20 / }));

      expect(onChange).toHaveBeenCalledWith('2026-06-20');
      expect(screen.queryByRole('grid')).toBeNull();
    });
  });

  describe('Manual text input', () => {
    it('ввод dd.mm.yyyy → onChange с ISO', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value={null} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '20.06.2026');

      expect(onChange).toHaveBeenCalledWith('2026-06-20');
      expect(screen.queryByText('calendarInvalidDate')).toBeNull();
    });

    it('невалидный ввод → подсветка ошибки, без исключений', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value={null} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '99.99.9999');

      expect(screen.getByText('calendarInvalidDate')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('пустой ввод (backspace до конца) → onChange(null)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value="2026-06-15" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Clearable', () => {
    it('clear-кнопка вызывает onChange(null)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value="2026-06-15" onChange={onChange} clearable />);

      await user.click(screen.getByLabelText('Clear input'));

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('min/max пробрасываются в Calendar', () => {
    it('дни вне диапазона получают aria-disabled', async () => {
      const user = userEvent.setup();
      render(
        <DatePicker value={null} onChange={vi.fn()} minDate="2026-06-10" maxDate="2026-06-20" />
      );

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));

      expect(screen.getByRole('gridcell', { name: /^5 / })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByRole('gridcell', { name: /^25 / })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});
