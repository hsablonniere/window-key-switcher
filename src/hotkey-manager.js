import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import { wm as gnomeMainWm } from 'resource:///org/gnome/shell/ui/main.js';
import { logger } from './logger.js';

/**
 * @typedef {import('./config-schema.types.d.ts').Config} Config
 */

const SLOTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export class HotkeyManager {
  /** @type {any} */
  #gnomeSettings;
  /** @type {Config} */
  #config;
  /** @type {(slotId: string, forceCreate: boolean) => void}  */
  #onHotkey;

  /**
   * @param {any} gnomeSettings
   * @param {Config} config
   * @param {(slotId: string, forceCreate: boolean) => void} onHotkey
   */
  constructor(gnomeSettings, config, onHotkey) {
    this.#gnomeSettings = gnomeSettings;
    this.#config = config;
    this.#onHotkey = onHotkey;
  }

  /**
   * Get the hotkey identifier for a specific slot.
   * @param {string} slotId - The slot identifier (1-9, 0)
   * @param {boolean} force - Whether this is a force launch hotkey
   */
  #getHotkey(slotId, force = false) {
    return force ? `window-key-switcher-${slotId}-force` : `window-key-switcher-${slotId}`;
  }

  start() {
    logger.log(`Configure hotkeys for slots...`);
    for (const slotId of SLOTS) {
      // Only register keybinding if slot is configured
      const slot = this.#config.slots[slotId];
      if (!slot) {
        logger.log(`Slot ${slotId}: no configuration`);
        continue;
      }

      // Register regular hotkey (focus/launch)
      const hotkey = this.#getHotkey(slotId);
      gnomeMainWm.addKeybinding(
        hotkey,
        this.#gnomeSettings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.NORMAL,
        () => this.#onHotkey(slotId, false),
      );

      // Register force launch hotkey
      const forceHotkey = this.#getHotkey(slotId, true);
      gnomeMainWm.addKeybinding(
        forceHotkey,
        this.#gnomeSettings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.NORMAL,
        () => this.#onHotkey(slotId, true),
      );

      logger.log(`Slot ${slotId}: configured hotkeys for ${slot.name}`);
    }
  }

  stop() {
    logger.log(`Remove hotkeys for slots...`);
    for (const slotId of SLOTS) {
      const slot = this.#config.slots[slotId];
      if (!slot) {
        logger.log(`Slot ${slotId}: no configuration`);
        continue;
      }
      
      // Remove regular hotkey
      const hotkey = this.#getHotkey(slotId);
      gnomeMainWm.removeKeybinding(hotkey);
      
      // Remove force hotkey
      const forceHotkey = this.#getHotkey(slotId, true);
      gnomeMainWm.removeKeybinding(forceHotkey);
      
      logger.log(`Slot ${slotId}: removed hotkeys for ${slot.name}`);
    }
  }
}
