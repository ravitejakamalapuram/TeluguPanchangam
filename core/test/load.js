import { createRequire } from 'node:module';
import { createEngine } from '../index.js';

export const Astronomy = createRequire(import.meta.url)('../../lib/astronomy.js');
export const engine = createEngine({ Astronomy });
