import libraryConfig from '@rezerva/eslint-config/library';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    ignores: ['dist/**', 'eslint.config.mjs'],
  },
];
