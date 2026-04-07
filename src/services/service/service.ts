import type { Service } from './types';

export const init = (): Service => ({
  check: () => 'OK',
});
