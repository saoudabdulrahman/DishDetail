import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-throw-literal': 'error',
    },
  },
  {
    files: ['server.js', 'seed/**/*.js'],
    rules: {
      'no-process-exit': 'off',
    },
  },
  {
    files: ['**/*.test.{js,mjs,cjs}', '**/*.spec.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
  eslintConfigPrettier,
];
