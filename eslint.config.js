import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'public', 'node_modules', '*.config.js', '*.config.cjs'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // The demo is built on generated/mock data whose shapes are deliberately
      // loose; enforcing explicit types here would mean typing all mock data.
      '@typescript-eslint/no-explicit-any': 'off',
      // The codebase already marks intentionally-unused bindings with a leading
      // underscore — honour that convention instead of flagging them.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // New in eslint-plugin-react-hooks v7. Flags the app's existing
      // async-fetch-inside-useEffect pattern; keep it visible as a warning
      // rather than blocking, pending an effect refactor.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
)
