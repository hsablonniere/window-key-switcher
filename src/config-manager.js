import Gio from 'gi://Gio';
import { ZodError } from 'zod';
import { ConfigSchema } from './config-schema.js';

/**
 * @typedef {import('./config-schema.types.d.ts').Config} Config
 */

export class ConfigManager {
  /** @type {string} */
  #filepath;

  /**
   * @param {string} filepath - Path to the configuration file
   */
  constructor(filepath) {
    this.#filepath = filepath;
  }

  /**
   * Loads, parses and validates the configuration file.
   * @returns {Promise<Config>} The parsed and validated configuration object
   * @throws {Error} If the file cannot be loaded, parsed, or is invalid
   */
  async load() {
    const configByteArray = this.#loadByteArray();
    const configJson = this.#byteArrayToText(configByteArray);
    const configRaw = this.#textToJson(configJson);
    const config = this.#validateConfig(configRaw);
    return config;
  }

  /**
   * Loads the configuration file from the file system as a byte array.
   * @returns {Uint8Array} The raw file contents as bytes
   * @throws {Error} If the file cannot be read
   */
  #loadByteArray() {
    const file = Gio.File.new_for_path(this.#filepath);
    const [_success, contents] = file.load_contents(null);
    return contents;
  }

  /**
   * Converts a byte array to a UTF-8 string.
   * @param {Uint8Array} byteArray - The byte array to decode
   * @returns {string} The decoded text string
   */
  #byteArrayToText(byteArray) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(byteArray);
  }

  /**
   * Parses a JSON string into an object.
   * @param {string} jsonString - The JSON string to parse
   * @returns {any} The parsed JSON object
   */
  #textToJson(jsonString) {
    return JSON.parse(jsonString);
  }

  /**
   * Validates the configuration object against the expected schema.
   * @param {any} configRaw - The configuration object to validate
   * @returns {Config}
   * @throws {Error} If the configuration is invalid
   */
  #validateConfig(configRaw) {
    try {
      return ConfigSchema.parse(configRaw);
    } catch (error) {
      if (error instanceof ZodError) {
        const humanErrors = error.issues
          .map((issue) => {
            const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
            return `${issue.message}${path}`;
          })
          .join(', ');
        throw new Error(`Configuration validation failed: ${humanErrors}`);
      }
      throw error;
    }
  }
}
