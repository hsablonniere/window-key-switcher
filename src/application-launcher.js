import Gio from 'gi://Gio';
import { logger } from './logger.js';

/**
 * @typedef {import('./config-schema.types.d.ts').Config} Config
 */

export class ApplicationLauncher {
  /** @type {Config} */
  #config;

  /**
   * @param {Config} config
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * @param {string} slotId
   */
  launch(slotId) {
    const slot = this.#config.slots[slotId];
    logger.log(`Launch ${slot.name} for slot ${slotId} with ${slot.launcher}...`);
    const appInfo = Gio.DesktopAppInfo.new(slot.launcher);
    if (!appInfo) {
      throw new Error(`Failed to find desktop file: ${slot.launcher}`);
    }

    appInfo.launch([], null);
    logger.log(`${slot.name} launched successfully!`);
  }
}
