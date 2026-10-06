import type { Job } from '@/entities/Job';

export interface WorkHistoryProps {
  className?: string;

  /**
   * WorkHistory CRUD WU-4 (Design C): HomePage owns the sole useSelector and
   * feeds the store value through this prop; a bare render keeps the seed
   * fallback (nullish `??`, never length-based — an explicit [] must render
   * the empty state, not the seed).
   */
  content?: Job[];

  'data-testid'?: string;
}

export interface WorkHistoryTranslations {
  workHistory: string;
  present: string;
}
