const globals = require('globals');
const pluginJs = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginPrettier = require('eslint-plugin-prettier');
const configPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['dist/**', 'cypress.config.cjs', 'jest.config.cjs', 'eslint.config.js'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  configPrettier,
];
