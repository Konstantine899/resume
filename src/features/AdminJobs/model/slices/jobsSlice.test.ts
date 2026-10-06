// Slice/selector tests (plan_workhistory_crud WU-2: lazy hydration, collection
// CRUD, persist-first helpers; §5: injection into storeReducers).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JOBS, JobSchema, type CreateJobDto, type Job } from '@/entities/Job';
import { storeReducers } from '@/storeReducers';
import {
  addJob,
  applyJobToggle,
  applyJobUpdate,
  deleteJob,
  makeJobRecord,
  resetToDefaults,
  toggleCurrent,
  updateJob,
} from './jobsSlice';
import { selectAllJobs, selectCurrentJob, selectJobById, selectSortedJobs } from '../selectors';
import { createJobsSeed } from '../services/seed';
import { persistJobs } from '../services/storage';

const SEED = createJobsSeed();

const DTO: CreateJobDto = {
  company: 'Acme Corp',
  position: { en: 'Backend Developer', ru: 'Бэкенд-разработчик' },
  // Deliberately stale: the helper MUST recompute period (A5 — never manual).
  period: 'IGNORED',
  startDate: new Date('2019-03-01'),
  endDate: new Date('2020-08-01'),
  description: { en: ['Built APIs'], ru: ['Собрал API'] },
  technologies: ['Node.js'],
  location: 'Berlin, Germany',
  employmentType: 'full-time',
  level: 'middle',
};

const makeStore = () => configureStore({ reducer: storeReducers });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('storeReducers injection', () => {
  it('exposes the jobs slice under its plan key', () => {
    expect(storeReducers).toHaveProperty('adminJobs');
  });
});

describe('lazy hydration (first reducer call = configureStore)', () => {
  it('hydrates from a stored envelope', () => {
    const stored = createJobsSeed();
    stored.push(makeJobRecord(DTO));
    expect(persistJobs(stored)).toBe(true);

    const store = makeStore();
    expect(selectAllJobs(store.getState())).toHaveLength(SEED.length + 1);
  });

  it('falls back to seed on an empty store', () => {
    const store = makeStore();
    expect(selectAllJobs(store.getState())).toEqual(SEED);
  });

  it('falls back to seed on corrupt storage (vitrina never crashes, §7)', () => {
    localStorage.setItem('resume.jobs', '{broken');
    const store = makeStore();
    expect(selectAllJobs(store.getState())).toEqual(SEED);
  });

  it('revives dates from the stored ISO strings (A11 — getTime must not be NaN)', () => {
    persistJobs(SEED);
    const store = makeStore();
    const first = selectAllJobs(store.getState())[0];
    expect(first?.startDate).toBeInstanceOf(Date);
    expect(first?.startDate.getTime()).not.toBeNaN();
    if (first?.endDate !== null && first?.endDate !== undefined) {
      expect(first.endDate).toBeInstanceOf(Date);
    }
  });
});

describe('makeJobRecord (persist-first consistency, §3)', () => {
  it('generates unique ids, defaults current/featured, recomputes period', () => {
    const a = makeJobRecord(DTO);
    const b = makeJobRecord(DTO);

    expect(a.id).not.toBe(b.id);
    expect(a.current).toBe(false);
    expect(a.featured).toBe(false);
    expect(a.period).toBe('2019 — 2020'); // DTO.period ("IGNORED") never survives
    expect(a.endDate).toEqual(DTO.endDate);
    expect(JobSchema.safeParse(a).success).toBe(true);
  });

  it('honours current=true: endDate forced to null, period becomes Present', () => {
    const record = makeJobRecord({ ...DTO, endDate: new Date('2021-01-01') }, true);

    expect(record.current).toBe(true);
    expect(record.endDate).toBeNull();
    expect(record.period).toBe('2019 — Present');
  });

  it('defaults endDate to null when the DTO omits it', () => {
    const withoutEnd: CreateJobDto = { ...DTO };
    delete withoutEnd.endDate;
    const record = makeJobRecord(withoutEnd);

    expect(record.endDate).toBeNull();
    expect(record.period).toBe('2019 — Present');
  });

  it('keeps featured=true from the DTO when provided', () => {
    expect(makeJobRecord({ ...DTO, featured: true }).featured).toBe(true);
  });
});

describe('applyJobUpdate (period recompute + current⇄endDate sync, A5/A6)', () => {
  const base = makeJobRecord(DTO);

  it('recomputes period from new dates (plan §7 acceptance test)', () => {
    const next = applyJobUpdate(base, {
      id: base.id,
      startDate: new Date('2023-01-01'),
      current: false,
      endDate: new Date('2024-01-01'),
    });

    expect(next.period).toBe('2023 — 2024');
    expect(next.startDate).toEqual(new Date('2023-01-01'));
    expect(next.endDate).toEqual(new Date('2024-01-01'));
    expect(next.id).toBe(base.id);
  });

  it('current=true forces endDate=null and a Present period', () => {
    const next = applyJobUpdate(base, { id: base.id, current: true });

    expect(next.current).toBe(true);
    expect(next.endDate).toBeNull();
    expect(next.period).toBe('2019 — Present');
  });

  it('merges plain field patches and ignores a stale period in the payload', () => {
    const next = applyJobUpdate(base, {
      id: base.id,
      company: 'Renamed Inc',
      period: 'STALE',
    });

    expect(next.company).toBe('Renamed Inc');
    expect(next.period).toBe('2019 — 2020'); // recomputed, not taken from payload
    expect(next.position).toEqual(base.position); // untouched fields survive
  });
});

describe('applyJobToggle / toggleCurrent (A6)', () => {
  it('turns the current flag ON: endDate null, period Present', () => {
    const record = makeJobRecord(DTO);
    const toggled = applyJobToggle(record);

    expect(toggled.current).toBe(true);
    expect(toggled.endDate).toBeNull();
    expect(toggled.period).toBe('2019 — Present');
  });

  it('turns the current flag OFF without inventing an endDate (no fake dates)', () => {
    const toggled = applyJobToggle(makeJobRecord(DTO, true));

    expect(toggled.current).toBe(false);
    expect(toggled.endDate).toBeNull(); // honest: no end known yet; the form must set it
    expect(toggled.period).toBe('2019 — Present');
  });

  it('toggleCurrent dispatch flips the stored record', () => {
    const store = makeStore();
    const target = selectCurrentJob(store.getState());

    expect(target).toBeDefined();
    store.dispatch(toggleCurrent(target?.id ?? ''));

    expect(selectCurrentJob(store.getState())).toBeUndefined();
  });

  it('toggleCurrent is a no-op for an unknown id', () => {
    const store = makeStore();
    const before = JSON.stringify(selectAllJobs(store.getState()));

    store.dispatch(toggleCurrent('missing'));

    expect(JSON.stringify(selectAllJobs(store.getState()))).toBe(before);
  });
});

describe('reducers', () => {
  it('addJob appends the record verbatim (id/defaults come from the helper)', () => {
    const store = makeStore();
    const record = makeJobRecord(DTO);

    store.dispatch(addJob(record));

    const all = selectAllJobs(store.getState());
    expect(all).toHaveLength(SEED.length + 1);
    expect(all[all.length - 1]).toEqual(record);
  });

  it('updateJob merges the computed patch and preserves id', () => {
    const store = makeStore();
    const target = selectJobById(store.getState(), '1');

    store.dispatch(
      updateJob({
        id: '1',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        current: false,
      })
    );

    const updated = selectJobById(store.getState(), '1');
    expect(updated?.period).toBe('2023 — 2024');
    expect(updated?.id).toBe(target?.id);
    expect(updated?.company).toBe(target?.company);
  });

  it('updateJob is a no-op for an unknown id', () => {
    const store = makeStore();
    const before = JSON.stringify(selectAllJobs(store.getState()));

    store.dispatch(updateJob({ id: 'missing', company: 'Nope' }));

    expect(JSON.stringify(selectAllJobs(store.getState()))).toBe(before);
  });

  it('deleteJob removes only the target; an unknown id is a no-op', () => {
    const store = makeStore();

    store.dispatch(deleteJob('2'));
    expect(selectAllJobs(store.getState())).toHaveLength(SEED.length - 1);
    expect(selectJobById(store.getState(), '2')).toBeUndefined();

    store.dispatch(deleteJob('missing'));
    expect(selectAllJobs(store.getState())).toHaveLength(SEED.length - 1);
  });

  it('resetToDefaults returns exactly the seed', () => {
    const store = makeStore();
    store.dispatch(deleteJob('1'));

    store.dispatch(resetToDefaults());

    expect(selectAllJobs(store.getState())).toEqual(SEED);
    expect(selectAllJobs(store.getState())).not.toBe(JOBS); // never the live constant
  });
});

describe('selectors', () => {
  it('selectAllJobs reads the adminJobs key of the root state', () => {
    const store = makeStore();
    expect(selectAllJobs(store.getState())).toBe(store.getState().adminJobs);
  });

  it('selectSortedJobs orders newest first (startDate desc)', () => {
    const store = makeStore();
    const newest = makeJobRecord({ ...DTO, startDate: new Date('2024-02-01') });
    store.dispatch(addJob(newest));

    const sorted = selectSortedJobs(store.getState());

    expect(sorted[0]?.id).toBe(newest.id);
    expect(sorted.map((job: Job) => job.id)).toEqual([newest.id, '1', '2', '3']);
  });

  it('selectJobById finds and misses', () => {
    const store = makeStore();
    expect(selectJobById(store.getState(), '3')?.company).toBe('Digital Agency Pro');
    expect(selectJobById(store.getState(), 'missing')).toBeUndefined();
  });

  it('selectCurrentJob returns the single current record (seed id 1)', () => {
    const store = makeStore();
    expect(selectCurrentJob(store.getState())?.id).toBe('1');
  });
});
