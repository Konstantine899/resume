// src/shared/ui/DatePicker/ui/DatePicker/DatePicker.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Controller, useForm, useWatch } from 'react-hook-form';
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

    it('навигация по месяцам (chevron) НЕ закрывает поповер — предсуществующий баг', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-06-15" onChange={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));
      await user.click(screen.getByRole('button', { name: 'calendarPrevMonth' }));

      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByText('calendarMonthMay 2026')).toBeInTheDocument();
    });

    it('drill-down: выбор месяца/года не закрывает поповер, только день закрывает', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value={null} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));

      await user.click(screen.getByRole('button', { name: /calendarSelectMonth/ }));
      expect(screen.getByRole('button', { name: 'calendarMonthJune' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /calendarSelectYear/ }));
      expect(screen.getByText('2020–2029')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '2024' }));
      await user.click(screen.getByRole('button', { name: 'calendarMonthMarch' }));
      expect(screen.getByRole('grid')).toBeInTheDocument();

      await user.click(screen.getByRole('gridcell', { name: /^20 calendarMonthMarch/ }));

      expect(onChange).toHaveBeenCalledWith('2024-03-20');
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

  // ---- SPEC: интеграция с формой -------------------------------------
  describe('RHF Controller integration (SPEC)', () => {
    /** Харнесс: значение формы читается напрямую, ISO round-trip виден. */
    const RHFHarness: React.FC<{ initial: string | null }> = ({ initial }) => {
      const { control } = useForm<{ date: string | null }>({ defaultValues: { date: initial } });
      const watched = useWatch({ control, name: 'date' });
      return (
        <div>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} label="Picked date" />
            )}
          />
          <output data-testid="form-value">{watched ?? 'null'}</output>
        </div>
      );
    };

    it('ISO round-trip: до и после выбора даты форма держит ISO yyyy-mm-dd', async () => {
      const user = userEvent.setup();
      render(<RHFHarness initial="2026-06-15" />);

      // Граница формы: ISO, дисплей — dd.mm.yyyy.
      expect(screen.getByTestId('form-value')).toHaveTextContent('2026-06-15');
      expect(screen.getByRole('textbox')).toHaveValue('15.06.2026');

      await user.click(screen.getByRole('button', { name: 'calendarOpen' }));
      await user.click(screen.getByRole('gridcell', { name: /^20 / }));

      // После выбора форма снова видит только ISO — не Date, не dd.mm.yyyy.
      expect(screen.getByTestId('form-value')).toHaveTextContent('2026-06-20');
      expect(screen.getByRole('textbox')).toHaveValue('20.06.2026');
    });

    it('disabled блокирует и инпут, и поповер', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-06-15" onChange={vi.fn()} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
      const trigger = screen.getByRole('button', { name: 'calendarOpen' });
      expect(trigger).toBeDisabled();

      // Поповер не открывается: нативный disabled не пропускает клик.
      await user.click(trigger);
      expect(screen.queryByRole('grid')).toBeNull();
    });
  });
});
