import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { logger } from './logger.js';

const FADE_TIME = 50; // Quick fade

/**
 * Creates a blue overlay on top of the focused window
 */
export class VisualIndicator {
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
  
  /**
   * @param {object} settings - Visual indicator settings
   * @param {boolean} settings.enabled - Whether the indicator is enabled
   * @param {number} settings.duration - Display duration in milliseconds
   * @param {number} settings.opacity - Opacity level (0-1)
   */
  constructor(settings = {}) {
    this.#enabled = settings.enabled ?? true;
    this.#duration = settings.duration ?? 150;
    this.#opacity = settings.opacity ?? 0.15;
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
    
    // Create the blue overlay that covers the entire window
    const overlayColor = `rgba(30, 64, 175, ${this.#opacity})`;
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
    
    // Quick fade in
    this.#overlay.opacity = 0;
    this.#overlay.ease({
      opacity: 255,
      duration: FADE_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    });
    
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
      this.#overlay.ease({
        opacity: 0,
        duration: FADE_TIME,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        onComplete: () => {
          if (this.#overlay) {
            this.#overlay.destroy();
            this.#overlay = null;
          }
        },
      });
    }
  }

  /**
   * Clean up when extension is disabled
   */
  destroy() {
    this.hide();
  }
}