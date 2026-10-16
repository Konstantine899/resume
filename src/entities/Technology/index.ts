// ============================================
// Technology Entity - Public API
// ============================================

export type { Technology, TechnologyRootState, TechnologyUpdatePatch } from './model/types/types';

// Constants (seed = verbatim TECH_ICONS move, D3)
export { TECHNOLOGIES_SEED, seedTechnologies } from './model/constants/constants';

// Zod schemas (storage envelope + feature form-factory base)
export { TechnologySchema, TechnologiesEnvelopeSchema } from './model/schemes/schema';
export type { TechnologiesEnvelope } from './model/schemes/schema';

// Storage (persist-THEN-dispatch call sites)
export {
  TECHNOLOGIES_STORAGE_KEY,
  persistTechnologies,
  readTechnologies,
  removeTechnologies,
} from './model/services/storage';

// Slice actions — the reducer itself is injected deep in storeReducers (D1)
export {
  addTechnology,
  removeTechnology,
  updateTechnology,
} from './model/slices/technologiesSlice';

// Selectors (D4 seed fallback)
export { selectAllTechnologies, selectTechnologyKeys } from './model/selectors/selectors';

// Utils
export { resolveTechIcons } from './lib/utils';
