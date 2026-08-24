# ADR 0005: Strict TDD Mode

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

Code quality in AI-assisted development tends to degrade over time because:

- AI generates code faster than tests
- Tests are seen as optional or "add later" work
- Without a testing discipline, regressions accumulate silently
- The project's FSD architecture needs verification at import boundaries

## Decision

Adopt **Strict TDD Mode**: tests must be written before or simultaneously with implementation code. Enforced by:

1. **Husky pre-commit hooks** that run `validate:strict` (TypeScript + ESLint with `--max-warnings 0`)
2. **SDD verify phase** (`sdd-verify-deepseek`) that checks implementation against spec acceptance criteria
3. **Coverage targets**: 90%+ lines, 85%+ branches, 95%+ functions
4. **Test pyramid**: 70% unit, 20% integration, 10% e2e
5. **`npm run validate`** as a single command that must pass before commit
6. **No `test:only` or `.only` — blocked in CI**

## Consequences

### Positive

- Regressions caught immediately, not weeks later
- Tests document behavior as a living spec
- AI generates more testable code when it knows tests are required
- Import boundary violations caught at lint time (FSD rules)
- CI acts as a second gate, not the only gate

### Negative

- Slower initial velocity — tests take time
- Test maintenance cost when refactoring
- Some UI tests are inherently fragile (snapshot tests, e2e selectors)
- Coverage targets can incentivize shallow tests

## Alternatives Considered

| Alternative               | Reason against                                               |
| ------------------------- | ------------------------------------------------------------ |
| Test after implementation | Tests are deprioritized; coverage drops over time            |
| AI-generated tests only   | Tests often pass without asserting real behavior             |
| No testing requirements   | Works for prototypes; unacceptable for maintainable software |
| 100% coverage target      | Unrealistic; incentivizes meaningless tests                  |
