import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ['dist/', 'node_modules/', 'examples/'],
  },
  {
    rules: {
      // Allow explicit any for flexibility in event emitter and type casting
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow empty interfaces for extensibility and marker types
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
);
