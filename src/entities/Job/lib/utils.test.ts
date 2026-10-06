// formatJobPeriod tests (plan_workhistory_crud A5/§6): the display-string
// dup of the dates, em-dash exactly like the seed — recomputed in the
// reducer, never entered by hand.

import { describe, expect, it } from 'vitest';

// Same-layer test: relative imports only — an `@/entities/Job` alias here
// is an "entities → entities" FSD violation (resume-fsd-relative-import).
import { JOBS } from '../constants';
import { formatJobPeriod } from './utils';

describe('formatJobPeriod', () => {
  it('renders an open range as Present when current', () => {
    expect(formatJobPeriod(new Date('2022-06-01'), null, true)).toBe('2022 — Present');
  });

  it('renders Present for a null endDate even when the flag is already off', () => {
    // Honest-data rule: no invented end date ⇒ open range shown; the admin
    // form must set endDate before a current=false record can be saved (§7).
    expect(formatJobPeriod(new Date('2019-03-01'), null, false)).toBe('2019 — Present');
  });

  it('renders a closed range as start — end', () => {
    expect(formatJobPeriod(new Date('2020-01-15'), new Date('2022-05-01'), false)).toBe(
      '2020 — 2022'
    );
  });

  it('renders a same-year range as the duplicated year', () => {
    expect(formatJobPeriod(new Date('2023-01-01'), new Date('2023-12-31'), false)).toBe(
      '2023 — 2023'
    );
  });

  it('reproduces every seed period verbatim (data ↔ helper invariant)', () => {
    for (const job of JOBS) {
      expect(formatJobPeriod(job.startDate, job.endDate, job.current)).toBe(job.period);
    }
  });
});
