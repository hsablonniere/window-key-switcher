import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { logger } from './logger.js';

const WINDOW_WAIT_TIMEOUT_MS = 5_000;

/**
 * @typedef {import('./config-schema.types.d.ts').Config} Config
 */

/**
 * Creates a blue overlay on top of the focused window
 */
class WindowDecorator {
  /** @type {St.Widget|null} */
  #overlay = null;
  /** @type {number|null} */
  #timeoutId = null;
  /** @type {boolean} */
  #enabled;
  /** @type {number} */
  #duration;
  /** @type {number} */
  #opacity;
  /** @type {string} */
  #color;

  /**
   * @param {object} settings - Visual indicator settings
   * @param {boolean} settings.enabled - Whether the indicator is enabled
   * @param {number} settings.duration - Display duration in milliseconds
   * @param {number} settings.opacity - Opacity level (0-1)
   * @param {string} settings.color - RGB color values (e.g., '30, 64, 175')
   */
  constructor(settings = {}) {
    this.#enabled = settings.enabled ?? true;
    this.#duration = settings.duration ?? 150;
    this.#opacity = settings.opacity ?? 0.15;
    this.#color = settings.color ?? '30, 64, 175';
  }

  /**
   * Shows the blue overlay on top of the given window
   * @param {Meta.Window} window - The window to highlight
   */
  show(window) {
    // Skip if disabled
    if (!this.#enabled) {
      return;
    }

    logger.log(`Showing blue overlay for window ${window.get_wm_class()}`);

    // Cancel any existing effect
    this.hide();

    // Get window frame rectangle (includes decorations and is monitor-aware)
    const frameRect = window.get_frame_rect();
    if (!frameRect) {
      logger.log('Could not get window frame rectangle');
      return;
    }

    // Create the overlay that covers the entire window
    const overlayColor = `rgba(${this.#color}, ${this.#opacity})`;
    this.#overlay = new St.Widget({
      name: 'window-indicator-overlay',
      reactive: false,
      can_focus: false,
      track_hover: false,
      style: `background-color: ${overlayColor};`,
      x: frameRect.x,
      y: frameRect.y,
      width: frameRect.width,
      height: frameRect.height,
    });

    // Add the overlay to the window group
    const windowGroup = Shell.Global.get().window_group;
    windowGroup.add_child(this.#overlay);

    // Set up timeout to auto-hide
    this.#timeoutId = setTimeout(() => {
      this.hide();
    }, this.#duration);
  }

  /**
   * Hides and cleans up the overlay
   */
  hide() {
    // Clear timeout
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }

    // Remove overlay
    if (this.#overlay) {
      this.#overlay.destroy();
      this.#overlay = null;
    }
  }

  /**
   * Clean up when extension is disabled
   */
  destroy() {
    this.hide();
  }
}

export class WindowManager {
  /** @type {Config} */
  #config;
  /** @type {number} */
  #lastHotkeyTimestamp = 0;
  /** @type {Map<string, number>} */
  #lastFocusedWindowIds = new Map();
  /** @type {Map<string, number>} */
  #currentCycleIndex = new Map();
  /** @type {WindowDecorator} */
  #visualIndicator;
  /** @type {number} */
  #quickSwitchTimeout;

  /**
   * @param {Config} config
   */
  constructor(config) {
    this.#config = config;
    this.#quickSwitchTimeout = config.settings?.quickSwitchTimeout ?? 2000;

    // Pass visual indicator settings to the VisualIndicator
    const visualIndicator = config.settings?.visualIndicator;
    let visualSettings;

    if (visualIndicator === false) {
      visualSettings = { enabled: false };
    } else if (visualIndicator && typeof visualIndicator === 'object') {
      visualSettings = {
        enabled: true,
        duration: visualIndicator.duration ?? 150,
        opacity: visualIndicator.opacity ?? 0.15,
        color: visualIndicator.color ?? '30, 64, 175',
      };
    } else {
      // Default settings
      visualSettings = {
        enabled: true,
        duration: 150,
        opacity: 0.15,
        color: '30, 64, 175',
      };
    }

    this.#visualIndicator = new WindowDecorator(visualSettings);
  }

  /**
   * Checks if there are any windows associated with the given slot ID.
   * @param {string} slotId
   * @returns {boolean}
   */
  hasWindowsForSlot(slotId) {
    return this.#getWindowsForSlot(slotId).length > 0;
  }

  /**
   * Returns an array of windows associated with the given slot ID.
   * @param {string} slotId
   * @returns {Array<Meta.Window>}
   */
  #getWindowsForSlot(slotId) {
    const slot = this.#config.slots[slotId];
    if (!slot) {
      return [];
    }

    const workspaceManager = Shell.Global.get().workspace_manager;
    const activeWorkspace = workspaceManager.get_active_workspace();
    const activeWorkspaceWindows = activeWorkspace.list_windows();

    const slotWindows = activeWorkspaceWindows.filter((window) => {
      const isNormalWindow = window.get_window_type() === Meta.WindowType.NORMAL;
      const matchesSlot = (window.get_wm_class() || '') === slot.wmClass;
      return isNormalWindow && matchesSlot;
    });

    return slotWindows;
  }

  /**
   * Focuses the window associated with the given slot ID.
   * @param {string} slotId
   */
  focus(slotId) {
    logger.log(`Focus window for slot ${slotId}...`);
    const windowsForSlot = this.#getWindowsForSlot(slotId);

    const currentTime = Date.now();
    const isQuickSwitch = (currentTime - this.#lastHotkeyTimestamp) < this.#quickSwitchTimeout;
    this.#lastHotkeyTimestamp = currentTime;

    // No windows => do nothing
    if (windowsForSlot.length === 0) {
      logger.log(`No windows found for slot ${slotId}`);
      return;
    }

    // Single window case
    if (windowsForSlot.length === 1) {
      const window = windowsForSlot[0];
      if (this.#isWindowFocused(window)) {
        logger.log(`The only window for slot ${slotId} is already focused`);
        return;
      } else {
        this.#focusWindow(window);
        this.#updateFocusTracking(slotId, window);
        return;
      }
    }

    // Multiple windows case
    const currentFocusedWindow = windowsForSlot.find(w => this.#isWindowFocused(w));

    if (currentFocusedWindow) {
      // A window from this slot is currently focused
      let nextWindow;

      if (isQuickSwitch) {
        // Quick switch: cycle to next window
        const currentIndex = windowsForSlot.indexOf(currentFocusedWindow);
        const nextIndex = (currentIndex + 1) % windowsForSlot.length;
        nextWindow = windowsForSlot[nextIndex];
        this.#currentCycleIndex.set(slotId, nextIndex);
        logger.log(`Quick switch: cycling to next window (index ${nextIndex})`);
      } else {
        // Slow switch: focus the last focused window that isn't current
        const lastFocusedWindowId = this.#lastFocusedWindowIds.get(slotId);
        if (lastFocusedWindowId && lastFocusedWindowId !== currentFocusedWindow.get_id()) {
          nextWindow = windowsForSlot.find((w) => w.get_id() === lastFocusedWindowId);
        }

        // If no valid last focused, or it doesn't exist anymore, cycle to next
        if (!nextWindow) {
          const currentIndex = windowsForSlot.indexOf(currentFocusedWindow);
          const nextIndex = (currentIndex + 1) % windowsForSlot.length;
          nextWindow = windowsForSlot[nextIndex];
          this.#currentCycleIndex.set(slotId, nextIndex);
        }
        logger.log(`Slow switch: focusing last/next window`);
      }

      // Save current as last focused before switching
      this.#lastFocusedWindowIds.set(slotId, currentFocusedWindow.get_id());
      this.#focusWindow(nextWindow);
      this.#updateFocusTracking(slotId, nextWindow);
    } else {
      // No window from this slot is focused, focus the first one
      const firstWindow = windowsForSlot[0];
      this.#focusWindow(firstWindow);
      this.#updateFocusTracking(slotId, firstWindow);
      this.#currentCycleIndex.set(slotId, 0);
    }
  }

  /**
   * Checks if the given window is currently focused.
   * @param {Meta.Window} window
   * @returns {boolean}
   */
  #isWindowFocused(window) {
    const display = Shell.Global.get().display;
    const focusedWindow = display.get_focus_window();
    return focusedWindow?.get_id() === window.get_id();
  }

  /**
   * Focuses the specified window and updates tracking.
   * @param {Meta.Window} window
   */
  #focusWindow(window) {
    logger.log(`Focus window ${window.get_wm_class()}`);
    const timestamp = Shell.Global.get().get_current_time();
    window.activate(timestamp);

    // Show the spotlight effect
    this.#visualIndicator.show(window);
  }

  /**
   * Updates the focus tracking for a slot when a window is focused.
   * @param {string} slotId
   * @param {Meta.Window} window
   */
  #updateFocusTracking(slotId, window) {
    // Don't update last focused if it's the same window
    const currentLastFocusedWindowId = this.#lastFocusedWindowIds.get(slotId);
    if (currentLastFocusedWindowId !== window.get_id()) {
      logger.log(`Updating focus tracking for slot ${slotId}: window ${window.get_id()}`);
    }
  }

  /**
   * Waits for a new window to appear for the specified slot ID and focuses it.
   * @param {string} slotId - The ID of the slot to wait for.
   */
  waitForNewWindowAndFocus(slotId) {
    logger.log(`Wait for new window for slot ${slotId}...`);
    const slot = this.#config.slots[slotId];
    this.#waitForWindow(slot.wmClass)
      .then((window) => {
        this.#focusWindow(window);
        this.#updateFocusTracking(slotId, window);
      })
      .catch(logger.error);
  }

  /**
   * Wait for a window with the specified wmClass to appear
   * @param {string} wmClass - The window class to wait for
   * @returns {Promise<Meta.Window>} Promise that resolves with the window object
   */
  async #waitForWindow(wmClass) {
    /** @type {number|null} */
    let signalId = null;
    /** @type {any|null} */
    let timeoutId = null;

    function cleanup() {
      if (signalId) {
        Shell.Global.get().get_display().disconnect(signalId);
        signalId = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    return new Promise((resolve, reject) => {
      logger.log(`Wait for "window-created" with wmClass ${wmClass}`);
      // Not sure if "Shell.Global.get().get_display().connect" is slow
      // Maybe just create one for all
      signalId = Shell.Global.get()
        .get_display()
        .connect('window-created', (_display, window) => {
          logger.log(`Signal "window-created" for (${window.get_wm_class()})`);
          const isNormalWindow = window.get_window_type() === Meta.WindowType.NORMAL;
          const matchesWmClass = (window.get_wm_class() || '') === wmClass;
          if (isNormalWindow && matchesWmClass) {
            cleanup();
            // Small safety delay, not sure if still necessary
            setTimeout(() => resolve(window), 100);
          }
        });

      // Set up timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for window with wmClass: ${wmClass}`));
      }, WINDOW_WAIT_TIMEOUT_MS);
    });
  }

  /**
   * Clean up resources when the extension is disabled
   */
  destroy() {
    this.#visualIndicator?.destroy();
  }
}
