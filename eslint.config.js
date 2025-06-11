import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .prettierignore file
const prettierIgnore = readFileSync(
  join(process.cwd(), '.prettierignore'),
  'utf-8'
)
  .split('\n')
  .filter(Boolean)
  .map((line) => line.trim())
  .filter((line) => !line.startsWith('#'));

export default [
  {
    ignores: prettierIgnore,
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
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
    },
  },
];
