import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import vitest from '@vitest/eslint-plugin';
import n from 'eslint-plugin-n';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import json from 'eslint-plugin-json';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import globals from 'globals';

// jsx-a11y-x recommended rules, enforced as errors.
// Defensive: the v0.2.0 recommended preset lists rules it doesn't actually
// define (e.g. label-has-for), which crashes ESLint — so only enable rules the
// plugin really exports.
const a11yRules = Object.fromEntries(
  Object.keys(jsxA11yX.configs.recommended.rules)
    .filter((name) => name.replace('jsx-a11y-x/', '') in jsxA11yX.rules)
    .map((name) => [name, 'error']),
);

// Take the SonarJS recommended ruleset but downgrade every rule to 'warn'
// (preserving any per-rule options) so it surfaces issues without failing CI.
const sonarjsWarn = Object.fromEntries(
  Object.entries(sonarjs.configs.recommended.rules).map(([name, val]) => [
    name, Array.isArray(val) ? ['warn', ...val.slice(1)] : 'warn',
  ]),
);

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'server.js',
      'vite.config.ts',
      'eslint.config.mjs',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // SonarJS code-quality rules. Enabled as WARNINGS for now: the recommended
  // preset flags pre-existing issues across the codebase, so surface them
  // without breaking CI. A follow-up can fix those and promote sonarjs to error.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { sonarjs },
    rules: sonarjsWarn,
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        google: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'import-x': importX,
      n,
      security,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-underscore-dangle': 'off',
      'no-param-reassign': 'off',
      'no-useless-assignment': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-len': ['error', { code: 150 }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y-x': jsxA11yX },
    rules: a11yRules,
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', 'test/**/*.{ts,tsx,js,jsx}'],
    plugins: { vitest },
    languageOptions: {
      globals: { ...vitest.environments.env.globals, jest: 'readonly' },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-conditional-expect': 'off',
      'vitest/no-commented-out-tests': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unassigned-vars': 'off',
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    processor: 'json/json',
  },
];
