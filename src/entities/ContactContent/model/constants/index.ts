// ============================================
// CONTACT_EMAIL — ContactContent default (plan Contact CRUD §5)
// ============================================
//
// Lives in entities because BOTH features need it: `features/Contact`
// renders the mailto link and `features/AdminContact` seeds the store
// with it — features → features is banned (FSD probe EXIT=1), so the
// entity layer owns the single source (R-2: no second copy that could
// drift). Formerly `features/Contact/model/constants.ts`.

export const CONTACT_EMAIL = 'kostay375298918971@gmail.com';
