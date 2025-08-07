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
    // Visual indicator settings
    visualIndicatorEnabled: z.boolean().optional().default(true),
    visualIndicatorDuration: z.number().positive().optional().default(150),
    visualIndicatorOpacity: z.number().min(0).max(1).optional().default(0.15),
    
    // Window cycling settings
    quickSwitchTimeout: z.number().positive().optional().default(2000),
  }).optional().default({}),
});
