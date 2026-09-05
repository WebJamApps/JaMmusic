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
const unicorn = (await import('eslint-plugin-unicorn')).default;
const promise = (await import('eslint-plugin-promise')).default;
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
      unicorn,
      promise,
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
      'sonarjs/no-small-switch': 'off',
      ...promise.configs['flat/recommended'].rules,
      'promise/always-return': 'off',
      'promise/catch-or-return': ['error', { allowFinally: true, terminationMethod: ['catch', 'finally'] }],
      ...unicorn.configs['flat/recommended'].rules,
      'unicorn/filename-case': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/no-empty-file': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/explicit-length-check': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/no-this-outside-of-class': 'off',
      'unicorn/prefer-promise-with-resolvers': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/no-incorrect-query-selector': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/prefer-global-number-constants': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/dom-node-dataset': 'off',
      'unicorn/prefer-dom-node-html-methods': 'off',
      'unicorn/prefer-modern-dom-apis': 'off',
      'unicorn/prefer-single-call': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-switch': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/no-for-each': 'off',
      'unicorn/prefer-split-limit': 'off',
      'unicorn/prefer-simple-condition-first': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-array-reverse': 'off',
      'unicorn/prefer-includes': 'off',
      'unicorn/prefer-observer-apis': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      'unicorn/default-export-style': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/prefer-regexp-test': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-dom-node-replace-children': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/empty-brace-spaces': 'off',
      'unicorn/prefer-string-slice': 'off',
      'unicorn/prefer-boolean-return': 'off',
      'unicorn/prefer-smaller-scope': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-date-now': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/prefer-blob-reading-methods': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/consistent-compound-words': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/prefer-logical-operator-over-ternary': 'off',
      'unicorn/no-console-spaces': 'off',
      'unicorn/require-array-sort-compare': 'off',
      'unicorn/new-for-builtins': 'off',
      'unicorn/consistent-conditional-object-spread': 'off',
      'unicorn/prefer-number-coercion': 'off',
      'unicorn/prefer-number-properties': 'off',
      'unicorn/no-lonely-if': 'off',
      'unicorn/text-encoding-identifier-case': 'off',
      'unicorn/prefer-array-from-map': 'off',
      'unicorn/prefer-response-static-json': 'off',
      'unicorn/prefer-scoped-selector': 'off',
      'unicorn/prefer-https': 'off',
      'unicorn/prefer-string-repeat': 'off',
      'unicorn/logical-assignment-operators': 'off',
      'unicorn/require-css-escape': 'off',
      'unicorn/prefer-location-assign': 'off',
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
      'sonarjs/no-skipped-tests': 'off',
      'promise/param-names': 'off',
      'promise/always-return': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    processor: 'json/json',
  },
];
