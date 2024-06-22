// @ts-check
// note: no support for eslint 9 from typescript-eslint, so using an alpha
// version for now

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
