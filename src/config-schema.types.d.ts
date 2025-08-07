import { z } from 'zod';
import { ConfigSchema } from './config-schema.js';

export type Config = z.infer<typeof ConfigSchema>;
