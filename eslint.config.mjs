import { createRequire } from 'node:module';

// TypeScript 7 Go compiler does not provide the JS programmatic AST API.
// Forward typescript-eslint, sonarjs, and other ESLint plugins to @typescript/typescript6.
const require = createRequire(import.meta.url);
try {
  const tsPath = require.resolve('typescript');
  const ts6 = require('@typescript/typescript6');
  require.cache[tsPath] = {
    id: tsPath,
    filename: tsPath,
    loaded: true,
    exports: ts6,
  };
} catch {
  // Fallback if @typescript/typescript6 is not present
}

const js = (await import('@eslint/js')).default;
const tseslint = (await import('typescript-eslint')).default;
const reactHooks = (await import('eslint-plugin-react-hooks')).default;
const importX = (await import('eslint-plugin-import-x')).default;
const vitest = (await import('@vitest/eslint-plugin')).default;
const n = (await import('eslint-plugin-n')).default;
const security = (await import('eslint-plugin-security')).default;
const sonarjs = (await import('eslint-plugin-sonarjs')).default;
const json = (await import('eslint-plugin-json')).default;
const jsxA11yX = (await import('eslint-plugin-jsx-a11y-x')).default;
const globals = (await import('globals')).default;

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
