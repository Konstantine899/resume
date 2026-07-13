// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// eslint.config.js
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { createRequire } from 'module';

// Prettier interoperability — disables formatting rules that conflict with Prettier
import prettierConfig from 'eslint-config-prettier';

// React-specific lint rules (JSX semantics, a11y, key propping)
import reactPlugin from 'eslint-plugin-react';

// Local FSD imports plugin
const require = createRequire(import.meta.url);
const fsdImports = require('./.opencode/plugins/eslint-plugin-fsd-imports.js');

// Strict mode rules for P0 security enforcement
const strictRules = {
  // Type safety - NO any types
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  
  // Security - NO console.log in production
  'no-console': 'error',
  
  // React best practices
  'react-hooks/exhaustive-deps': 'error',
  'react-hooks/rules-of-hooks': 'error',
  'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
  
  // No direct state mutations (caught by no-param-reassign + immutability checks)
  'no-param-reassign': ['error', { props: true }],
  
  // Error boundaries required
  'no-eval': 'error',
  'no-implied-eval': 'error',
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'config', 'storybook-static'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        __IS_DEV__: 'readonly',
        __API__: 'readonly',
        __PROJECT__: 'readonly',
      },
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      'fsd-imports': fsdImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // React JSX semantics (works with React 19 automatic JSX runtime)
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      // Override with strict rules for production code
      ...strictRules,
    },
  },
  // FSD Architecture validation
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...strictRules,
      // Extra strict for security-critical code
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      'no-implicit-coercion': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      // FSD Architecture rules
      'fsd-imports/layer-dependency': 'error',
      'fsd-imports/no-circular': 'error',
      'fsd-imports/public-api-only': [
        'error',
        {
          allowInternal: ['lib', 'constants', 'types', 'model'],
          disallowPatterns: ['**/ui/**', '**/api/**'],
        },
      ],
    },
  },
  storybook.configs["flat/recommended"],
  // Prettier — must be LAST to override formatting rules
  prettierConfig,
);
