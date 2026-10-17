// ============================================
// shared/api — RTK Query stub Public API
// ============================================
//
// The ONLY import path for the api slice (storeReducers, StoreProvider,
// tests). Wire format and endpoints are finalized with the real backend
// (plan §3.7 / decision D3).

export { apiSlice, stubBaseQuery } from './apiSlice';
export type { ContactDocumentDto } from './types';
