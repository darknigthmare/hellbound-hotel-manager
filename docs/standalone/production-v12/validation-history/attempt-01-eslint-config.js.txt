import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'dist-combat/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Recovered browser QA scripts are preserved CommonJS evidence. Their
    // page.evaluate callbacks intentionally use browser globals.
    files: [
      'docs/standalone/local-recovery-2026-11-26/**/*.cjs',
      'docs/standalone/production-v10/browser-harness/**/*.cjs',
      'docs/standalone/production-v11/browser-harness/**/*.cjs'
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.browser, ...globals.node, screen: 'off' }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts', 'scripts/**/*.mjs', 'docs/standalone/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);
