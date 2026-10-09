// src/shared/ui/Calendar/ui/Calendar/Calendar.test.tsx

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar';

// Deterministic labels: t(key) => key — assertions target raw i18n keys
// (same contract as Pagination.test.tsx / SkillsEditorList.test.tsx).
const mockLanguage = vi.hoisted(() => ({ current: 'en' as 'en' | 'ru' }));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: mockLanguage.current,
    t: (key: string) => key,
  }),
}));

/**
 * Доступное имя ячейки дня: `${day} ${t(monthKey)}` → «10 calendarMonthJune».
 * identity-мок t() сохраняет различимость дней (месяц в имени ячейки).
 */
const getDayCell = (day: number): HTMLElement =>
  screen.getByRole('gridcell', { name: new RegExp(`^${day} calendarMonth`) });

describe('Calendar', () => {
  beforeEach(() => {
    mockLanguage.current = 'en';
    // Frozen "today": 2026-06-15 (понедельник) — детерминизм value=null и «Сегодня».
    // toFake: ['Date'] freezes ONLY the clock — userEvent's internal timers stay
    // real (full useFakeTimers hangs every userEvent call at 5000ms).
    vi.useFakeTimers({ now: new Date(2026, 5, 15), toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('value=null → рендерит текущий месяц без выбранного дня (SPEC)', () => {
      render(<Calendar value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByText('calendarMonthJune 2026')).toBeInTheDocument();
      expect(screen.queryByRole('gridcell', { selected: true, hidden: true })).toBeNull();
    });

    it('рендерит APG-структуру: grid → rows → gridcells, 6 недель фиксированной геометрии', () => {
      render(<Calendar value="2026-06-10" onChange={vi.fn()} />);

      const grid = screen.getByRole('grid');
      // 1 header-row + 6 week-rows.
      expect(within(grid).getAllByRole('row')).toHaveLength(7);
      const selected = getDayCell(10);
      expect(selected).toHaveAttribute('aria-selected', 'true');
    });

    it('месяц по value: март 2026 отображается для 2026-03-15', () => {
      render(<Calendar value="2026-03-15" onChange={vi.fn()} />);

      expect(screen.getByText('calendarMonthMarch 2026')).toBeInTheDocument();
    });

    it('firstDayOfWeek=en (0) — заголовки недели с calendarWeekday_0 (Sunday)', () => {
      render(<Calendar value={null} onChange={vi.fn()} />);

      const headers = screen.getAllByRole('columnheader').map((el) => el.textContent ?? '');
      expect(headers[0]).toBe('calendarWeekday_0');
      expect(headers[6]).toBe('calendarWeekday_6');
    });

    it('firstDayOfWeek=ru (1) — заголовки недели с calendarWeekday_1 (Monday), вс последнее', () => {
      mockLanguage.current = 'ru';
      render(<Calendar value={null} onChange={vi.fn()} />);

      const headers = screen.getAllByRole('columnheader').map((el) => el.textContent ?? '');
      expect(headers[0]).toBe('calendarWeekday_1');
      expect(headers[6]).toBe('calendarWeekday_0');
    });
  });

  describe('Keyboard navigation (ARIA APG)', () => {
    it('ArrowRight/ArrowLeft двигают фокус по дням', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-10" onChange={vi.fn()} />);

      const start = getDayCell(10);
      start.focus();
      expect(start).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(getDayCell(11)).toHaveFocus();

      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(getDayCell(9)).toHaveFocus();
    });

    it('ArrowUp/ArrowDown двигают фокус по неделям (±7 дней)', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-10" onChange={vi.fn()} />);

      getDayCell(10).focus();
      await user.keyboard('{ArrowDown}');
      expect(getDayCell(17)).toHaveFocus();

      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(getDayCell(3)).toHaveFocus();
    });

    it('PageUp/PageDown двигают фокус по месяцам', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-15" onChange={vi.fn()} />);

      getDayCell(15).focus();
      await user.keyboard('{PageDown}');
      expect(screen.getByText('calendarMonthJuly 2026')).toBeInTheDocument();
      expect(getDayCell(15)).toHaveFocus();

      await user.keyboard('{PageUp}{PageUp}');
      expect(screen.getByText('calendarMonthMay 2026')).toBeInTheDocument();
      expect(getDayCell(15)).toHaveFocus();
    });

    it('Home/End ведут в начало/конец недели', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-17" onChange={vi.fn()} />); // среда

      getDayCell(17).focus();
      await user.keyboard('{Home}');
      // en: неделя вс–сб → воскресенье перед средой = 14-е.
      expect(getDayCell(14)).toHaveFocus();

      await user.keyboard('{End}');
      expect(getDayCell(20)).toHaveFocus(); // суббота
    });

    it('навигация через границу месяца перерисовывает новый месяц (SPEC)', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-30" onChange={vi.fn()} />);

      getDayCell(30).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByText('calendarMonthJuly 2026')).toBeInTheDocument();
      expect(getDayCell(1)).toHaveFocus();
    });

    it('roving tabindex: ровно одна ячейка дня с tabIndex=0', () => {
      render(<Calendar value="2026-06-10" onChange={vi.fn()} />);

      const zero = screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0);
      expect(zero).toHaveLength(1);
      expect(zero[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Selection', () => {
    it('Enter выбирает сфокусированный день и зовёт onChange с ISO', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar value={null} onChange={onChange} />);

      getDayCell(15).focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('2026-06-15');
    });

    it('Space тоже выбирает день', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar value={null} onChange={onChange} />);

      getDayCell(20).focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith('2026-06-20');
    });

    it('клик по дню выбирает его', async () => {
      const onChange = vi.fn();
      render(<Calendar value={null} onChange={onChange} />);

      await userEvent.click(getDayCell(12));

      expect(onChange).toHaveBeenCalledWith('2026-06-12');
    });
  });

  describe('min/max constraints (SPEC)', () => {
    it('дни вне minDate/maxDate — aria-disabled и не выбираются кликом', async () => {
      const onChange = vi.fn();
      render(
        <Calendar value={null} onChange={onChange} minDate="2026-06-10" maxDate="2026-06-20" />
      );

      const before = getDayCell(9);
      expect(before).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(before);
      expect(onChange).not.toHaveBeenCalled();

      const after = getDayCell(21);
      expect(after).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(after);
      expect(onChange).not.toHaveBeenCalled();

      // Границы включительно — выбираются.
      await userEvent.click(getDayCell(10));
      expect(onChange).toHaveBeenCalledWith('2026-06-10');
    });

    it('Enter на отключённом дне не вызывает onChange (SPEC)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar value={null} onChange={onChange} maxDate="2026-06-10" />);

      getDayCell(12).focus();
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('клавиатурный фокус пересекает границу месяца и при min/max (сетка навигируема)', async () => {
      const user = userEvent.setup();
      render(<Calendar value={null} onChange={vi.fn()} maxDate="2026-06-10" />);

      getDayCell(30).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('calendarMonthJuly 2026')).toBeInTheDocument();
    });
  });

  describe('Today marker', () => {
    it('сегодняшний день помечен data-today (SPEC: «Сегодня» через токен)', () => {
      render(<Calendar value={null} onChange={vi.fn()} />);

      expect(getDayCell(15)).toHaveAttribute('data-today', 'true');
    });
  });

  describe('A11y roles', () => {
    it('дни соседних месяцев aria-hidden (не в дереве доступности)', () => {
      render(<Calendar value="2026-06-10" onChange={vi.fn()} />);

      // Июнь 2026 в сетке en начинается с вс 31 мая и заканчивается сб 11 июля.
      const hidden = screen.getAllByRole('gridcell', { hidden: true });
      expect(hidden.length).toBeGreaterThan(0);
    });

    it('кнопки навигации по месяцам доступны по имени', () => {
      render(<Calendar value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'calendarPrevMonth' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'calendarNextMonth' })).toBeInTheDocument();
    });

    it('навигация по месяцам кнопками работает', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-15" onChange={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'calendarPrevMonth' }));
      expect(screen.getByText('calendarMonthMay 2026')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'calendarNextMonth' }));
      await user.click(screen.getByRole('button', { name: 'calendarNextMonth' }));
      expect(screen.getByText('calendarMonthJuly 2026')).toBeInTheDocument();
    });
  });

  describe('Month-crossing edge cases', () => {
    it('PageDown с 31 янв → февраль невисокосного: фокус зажат на 28-м', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-01-31" onChange={vi.fn()} />);

      getDayCell(31).focus();
      await user.keyboard('{PageDown}');

      expect(screen.getByText('calendarMonthFebruary 2026')).toBeInTheDocument();
      expect(getDayCell(28)).toHaveFocus();
    });

    it('2028-02-29 доступна (високосный год)', () => {
      render(<Calendar value="2028-02-10" onChange={vi.fn()} />);

      expect(screen.getByText('calendarMonthFebruary 2028')).toBeInTheDocument();
      expect(getDayCell(29)).toBeInTheDocument();
    });

    it('ArrowLeft с 1-го числа уходит в конец предыдущего месяца (SPEC)', async () => {
      const user = userEvent.setup();
      render(<Calendar value="2026-06-01" onChange={vi.fn()} />);

      getDayCell(1).focus();
      await user.keyboard('{ArrowLeft}');

      expect(screen.getByText('calendarMonthMay 2026')).toBeInTheDocument();
      expect(getDayCell(31)).toHaveFocus();
    });
  });
});
