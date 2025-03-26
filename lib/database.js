import { resolve, dirname } from 'path';
import _fs, { existsSync, readFileSync } from 'fs';
const { promises: fs } = _fs;

class Database {
  /**
   * Create a new Database instance.
   * @param {String} filepath Path to the JSON database file.
   * @param  {...any} args Additional arguments for JSON.stringify.
   */
  constructor(filepath, ...args) {
    this.file = resolve(filepath);
    this.logger = console;
    this._jsonargs = args;
    this._data = {}; // Default empty data
    this._state = false;
    this._queue = new Set(); // Using Set to prevent duplicate tasks

    this._load(); // Load data initially

    // Background task to process queue operations
    this._interval = setInterval(async () => {
      if (!this._state && this._queue.size > 0) {
        this._state = true;
        const task = this._queue.values().next().value;
        this._queue.delete(task);
        try {
          await this[task]();
        } catch (error) {
          this.logger.error(`Error executing ${task}:`, error);
        }
        this._state = false;
      }
    }, 1000);
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.save(); // Auto-save on data update
  }

  /**
   * Queue Load
   */
  load() {
    this._queue.add('_load');
  }

  /**
   * Queue Save
   */
  save() {
    this._queue.add('_save'); // Prevent duplicate `_save()` calls
  }

  /**
   * Load database from file
   */
  _load() {
    try {
      if (!existsSync(this.file)) {
        this.logger.info('Database file not found. Initializing new database.');
        this._data = {};
      } else {
        const content = readFileSync(this.file, 'utf-8').trim();
        this._data = content ? JSON.parse(content) : {};
      }
    } catch (error) {
      this.logger.error('Failed to load database:', error);
      this._data = {};
    }
  }

  /**
   * Save database to file asynchronously
   */
  async _save() {
    try {
      const dir = dirname(this.file);
      if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs));
      this.logger.info(`Database saved successfully to ${this.file}`);
    } catch (error) {
      this.logger.error('Failed to save database:', error);
    }
  }
}

export default Database;