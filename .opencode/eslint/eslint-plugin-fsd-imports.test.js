import { describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import plugin from './eslint-plugin-fsd-imports.js';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

const rule = plugin.rules['tests-public-api-only'];

describe('eslint-plugin-fsd-imports / tests-public-api-only', () => {
  it('rule exists and is a problem rule', () => {
    expect(rule).toBeDefined();
    expect(rule.meta.type).toBe('problem');
  });

  // RuleTester.run registers its own describe/it blocks — call at suite level.
  tester.run('tests-public-api-only (valid cases)', rule, {
    valid: [
      // Non-test file: rule does not apply
      {
        code: `import { getNavItems } from '@/widgets/Sidebar/model/constants';`,
        filename: 'src/pages/Home/ui/HomePage.tsx',
      },
      // Test importing its own slice internals (co-located unit)
      {
        code: `import { About } from './About';`,
        filename: 'src/features/About/ui/About.test.tsx',
      },
      {
        code: `import { About } from '@/features/About/ui/About';`,
        filename: 'src/features/About/ui/About.test.tsx',
      },
      // Test importing another slice through its public API
      {
        code: `import { Sidebar } from '@/widgets/Sidebar';
import { ThemeSwitch } from '@/features/ThemeSwitch';`,
        filename: 'src/pages/Home/ui/HomePage.test.tsx',
      },
      // Test importing shared/ui/Component public API
      {
        code: `import { Button } from '@/shared/ui/Button';
import { ModalCloseButton } from '@/shared/ui/Modal';`,
        filename: 'src/features/Contact/ui/Contact.test.tsx',
      },
      // Test importing shared/lib/public-function public API (no deep)
      {
        code: `import { useToast } from '@/shared/lib/contexts/ToastContext';`,
        filename: 'src/shared/ui/Toast/ui/Toast.improvements.test.tsx',
      },
      // Relative import of another file in same slice — fine
      {
        code: `import { useToast } from '../lib/hooks/useToast';`,
        filename: 'src/shared/lib/contexts/ToastContext/ui/ToastContext.test.tsx',
      },
    ],
    invalid: [],
  });

  tester.run('tests-public-api-only (invalid cases)', rule, {
    valid: [],
    invalid: [
      // Test deep-importing another widget's model
      {
        code: `import { getNavItems } from '@/widgets/Sidebar/model/constants';`,
        filename: 'src/pages/Home/ui/HomePage.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
      // Test deep-importing shared component internals
      {
        code: `import { TOAST_CONSTANTS } from '@/shared/ui/Toast/model/constants';`,
        filename: 'src/shared/lib/contexts/ToastContext/ui/ToastContext.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
      // Test deep-importing another slice's hook
      {
        code: `import { useToast } from '@/shared/lib/contexts/ToastContext/lib/hooks/useToast';`,
        filename: 'src/shared/ui/Toast/ui/Toast.improvements.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
      // Test deep-importing i18n config
      {
        code: `import i18n from '@/shared/lib/i18n/config/i18n';`,
        filename: 'src/shared/ui/Image/ui/Image.improvements.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
      // __tests__ dir: no own slice, deep import is a violation
      {
        code: `import { getNavItems } from '@/widgets/Sidebar/model/constants';`,
        filename: 'src/__tests__/icon-adoption.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
      // __tests__ dir: deep shared import is a violation
      {
        code: `import { TOAST_ICONS } from '@/shared/ui/Toast/model/constants';`,
        filename: 'src/__tests__/icon-adoption.test.tsx',
        errors: [{ messageId: 'violation' }],
      },
    ],
  });
});