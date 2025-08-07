import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ApplicationLauncher } from './application-launcher.js';
import { ConfigManager } from './config-manager.js';
import { HotkeyManager } from './hotkey-manager.js';
import { logger } from './logger.js';
import { WindowManager } from './window-manager.js';

const CONFIG_FILEPATH = '.config/window-key-switcher/config.json';

/**
 * GNOME Shell extension for hotkey-based application launcher and window switcher.
 * Provides 10 configurable hotkey slots (1-9, then 0).
 */
export default class WindowKeySwitcherExtension extends Extension {
  /** @type {ApplicationLauncher|null} */
  #applicationLauncher = null;
  /** @type {WindowManager|null} */
  #windowManager = null;
  /** @type {HotkeyManager|null} */
  #hotkeyManager = null;

  /**
   * Default method called by GNOME Shell when the extension is enabled.
   */
  enable () {
    this.start()
      .then(() => logger.log('Extension enabled!'))
      .catch((e) => logger.error(e));
  }

  /**
   * Default method called by GNOME Shell when the extension is disabled.
   */
  disable () {
    this.#hotkeyManager?.stop();
    this.#windowManager?.destroy();
  }

  async start () {
    logger.log('Init Gnome settings...');
    const gnomeSettings = this.getSettings();

    logger.log('Init config manager...');
    const configManager = new ConfigManager(CONFIG_FILEPATH);
    const config = await configManager.load();

    logger.log('Init application launcher...');
    this.#applicationLauncher = new ApplicationLauncher(config);

    logger.log('Init window manager...');
    this.#windowManager = new WindowManager(config);

    logger.log('Init hotkey manager...');
    this.#hotkeyManager = new HotkeyManager(gnomeSettings, config, (slotId, forceCreate) => {
      return this.onHotkey(slotId, forceCreate);
    });
    this.#hotkeyManager.start();
  }

  /**
   * Handles hotkey activation for a specific slot.
   * @param {string} slotId - The ID of the hotkey slot (1-9, 0).
   * @param {boolean} forceCreate - If true, forces creation of a new window for the slot.
   */
  onHotkey (slotId, forceCreate) {
    if (!this.#windowManager || !this.#applicationLauncher) {
      return;
    }
    const hasWindowsForSlot = this.#windowManager.hasWindowsForSlot(slotId);
    if (!hasWindowsForSlot || forceCreate) {
      this.#applicationLauncher.launch(slotId);
      this.#windowManager.waitForNewWindowAndFocus(slotId);
    }
    else {
      this.#windowManager.focus(slotId);
    }
  }
}
