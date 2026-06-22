import nestjsConfig from '@rezerva/eslint-config/nestjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nestjsConfig,
  {
    ignores: ['dist/**', 'eslint.config.mjs'],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
