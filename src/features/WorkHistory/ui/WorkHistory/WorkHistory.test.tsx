import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JOBS } from '@/entities/Job';
import { WorkHistory } from './WorkHistory';

// Mutable language switch: the factory closes over the binding lazily (read
// at render time), so it is never touched during the hoisted module init.
let testLanguage: 'en' | 'ru' = 'en';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: testLanguage,
  }),
}));

// Capture `delay` so the timeline stagger (§8: index × 150) is assertable.
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid="animated-section" data-delay={delay}>
      {children}
    </div>
  ),
}));

// WU-1 (plan_workhistory_crud §12): characterization harness for the vitrina
// from scratch — the feature had NO tests at all. Bare render, NO
// StoreProvider (Design C: the section reads no store). Content-prop /
// empty-state / memo cases land RED→GREEN together in WU-4.
describe('WorkHistory vitrina (WU-1)', () => {
  beforeEach(() => {
    testLanguage = 'en';
  });

  it('renders exactly three jobs, newest first (Tech Corp → StartUp → Agency)', () => {
    render(<WorkHistory />);

    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Senior Full-Stack Developer',
      'Frontend Developer',
      'Junior Web Developer',
    ]);
    expect(screen.getByText('Tech Corp International')).toBeInTheDocument();
    expect(screen.getByText('StartUp Innovations')).toBeInTheDocument();
    expect(screen.getByText('Digital Agency Pro')).toBeInTheDocument();
  });

  it('shows the Present badge only on the current job (seed: id 1)', () => {
    render(<WorkHistory />);

    expect(screen.getAllByText('present')).toHaveLength(1);
  });

  it('renders the period of every job in DOM order', () => {
    render(<WorkHistory />);

    const period = JOBS.map((j) => j.period);
    const rendered = period.map((p) => screen.getByText(p) as HTMLElement);
    expect(rendered).toHaveLength(3);
    const [first, second, third] = rendered as [HTMLElement, HTMLElement, HTMLElement];
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(second.compareDocumentPosition(third) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('carries the §8 invariants: #experience, default testid, one h2, 4 timeline slots', () => {
    render(<WorkHistory />);

    const section = document.getElementById('experience');
    expect(section).toBeInTheDocument();
    expect(screen.getByTestId('work-history')).toBe(section);

    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('workHistory');

    const timeline = within(section as HTMLElement).getAllByTestId('animated-section');
    // heading slot + one slot per job card
    expect(timeline).toHaveLength(JOBS.length + 1);
  });

  it('staggers card entrance animations at index × 150 ms', () => {
    render(<WorkHistory />);

    const delays = screen
      .getAllByTestId('animated-section')
      .map((el) => el.getAttribute('data-delay'));
    // [0] = heading (no delay prop), then cards at 0/150/300
    expect(delays).toEqual([null, '0', '150', '300']);
  });

  it('renders positions and bullets in Russian when language=ru', () => {
    testLanguage = 'ru';
    render(<WorkHistory />);

    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Старший Full-Stack разработчик',
      'Фронтенд-разработчик',
      'Junior-веб-разработчик',
    ]);
    expect(
      screen.getByText('Руководил разработкой микросервисной архитектуры для 1M+ пользователей')
    ).toBeInTheDocument();
  });

  it('renders achievement bullets as a list (4 + 4 + 3 per seed)', () => {
    render(<WorkHistory />);

    const items = within(document.getElementById('experience') as HTMLElement).getAllByRole(
      'listitem'
    );
    expect(items).toHaveLength(11);
    expect(items[0]).toHaveTextContent(
      'Led development of microservices architecture serving 1M+ users'
    );
  });

  it('accepts a custom data-testid override', () => {
    render(<WorkHistory data-testid="jobs-section" />);

    expect(screen.getByTestId('jobs-section')).toBeInTheDocument();
    expect(screen.queryByTestId('work-history')).not.toBeInTheDocument();
  });
});

// WorkHistory CRUD WU-4 (plan §9 Design C): the vitrina stays store-free —
// HomePage feeds the store value through `content`; an explicit [] must win
// over the seed (nullish, never length-based) and show the i18n empty state.
describe('WorkHistory: content prop, empty state, memo (WU-4)', () => {
  it('renders the workHistoryEmpty key when content=[] (no seed fallback)', () => {
    render(<WorkHistory content={[]} />);

    expect(screen.getByText('workHistoryEmpty')).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    for (const job of JOBS) {
      expect(screen.queryByText(job.company)).not.toBeInTheDocument();
    }
  });

  it('renders the provided content instead of the seed', () => {
    const custom = [{ ...(JOBS[0] as (typeof JOBS)[number]), company: 'Store Corp' }];
    render(<WorkHistory content={custom} />);

    expect(screen.getByText('Store Corp')).toBeInTheDocument();
    expect(screen.getByText('present')).toBeInTheDocument();
    expect(screen.queryByText('StartUp Innovations')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  });

  it('falls back to the seed when content is undefined (bare render)', () => {
    render(<WorkHistory content={undefined} />);

    expect(screen.getByText('Tech Corp International')).toBeInTheDocument();
    expect(screen.queryByText('workHistoryEmpty')).not.toBeInTheDocument();
  });

  it('is memoized with React.memo', () => {
    const memoType = (WorkHistory as unknown as { $$typeof?: symbol }).$$typeof;
    expect(memoType).toBe(Symbol.for('react.memo'));
  });
});
