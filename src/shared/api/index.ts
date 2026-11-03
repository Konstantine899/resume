// ============================================
// shared/api — RTK Query Public API
// ============================================

export { apiSlice, baseQuery, baseQueryWithReauth, reauthBaseQuery } from './apiSlice';
export * from './authToken';
export type {
  ContactDocumentDto,
  UpdateAboutPortraitArg,
  UpdateAboutPortraitResult,
  AuthCredentials,
  AuthTokenResponse,
  AuthUser,
} from './types';
