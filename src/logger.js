export const LOG_PREFIX = 'window-key-switcher: ';

export const logger = {
  /**
   * @param {string} message - Message to log
   */
  log(message) {
    message.split('\n').forEach((line) => console.log(LOG_PREFIX + line));
  },

  /**
   * @param {Error} error - Error to log
   */
  error(error) {
    console.error(LOG_PREFIX + error.message);
    (error.stack ?? '').split('\n').forEach((line) => console.log(LOG_PREFIX + line));
  },
};
