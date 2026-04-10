import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig([
  // JavaScript files
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      js,
    },
    extends: ['js/recommended'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },

  // TypeScript files (excluding migrations)
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['db/migrations/**/*.ts', 'db/migrate.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },

  // Migration files (JavaScript rules only)
  {
    files: ['db/migrations/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },

  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.min.js', 'coverage/**', '.git/**'],
  },
]);
