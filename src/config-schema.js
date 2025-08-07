import { z } from 'zod';

export const ConfigSchema = z.object({
  slots: z.record(
    z.string().regex(/^[0-9]$/, 'Slot ID must be 0-9'),
    z.object({
      name: z.string().min(1, 'Name is required'),
      wmClass: z.string().min(1, 'Window Manager class is required'),
      launcher: z.string().endsWith('.desktop').min(1, 'Launhcer is required'),
    }),
  ),
  settings: z.object({
    visualIndicator: z.union([
      z.literal(false),
      z.object({
        duration: z.number().positive(),
        opacity: z.number().min(0).max(1),
        color: z.string(),
      }),
    ]),
    quickSwitchTimeout: z.number().positive(),
  }),
});
