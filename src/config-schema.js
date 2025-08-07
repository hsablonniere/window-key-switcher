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
        duration: z.number().positive().optional().default(150),
        opacity: z.number().min(0).max(1).optional().default(0.15),
        color: z.string().optional().default('30, 64, 175'),
      })
    ]).optional().default({
      duration: 150,
      opacity: 0.15,
      color: '30, 64, 175'
    }),
    quickSwitchTimeout: z.number().positive().optional().default(2000),
  }).optional(),
});
