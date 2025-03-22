import got from 'got';

// Default serialization and deserialization functions
const stringify = (obj) => JSON.stringify(obj, null, 2);

const parse = (str) =>
  JSON.parse(str, (_, v) => {
    if (
      v !== null &&
      typeof v === 'object' &&
      v.type === 'Buffer' &&
      Array.isArray(v.data)
    ) {
      return Buffer.from(v.data);
    }
    return v;
  });

class CloudDBAdapter {
  /**
   * Creates a new CloudDBAdapter instance.
   * @param {string} url - The URL of the remote database.
   * @param {Object} options - Configuration options.
   * @param {Function} options.serialize - Custom serialization function.
   * @param {Function} options.deserialize - Custom deserialization function.
   * @param {Object} options.fetchOptions - Custom fetch options for `got`.
   */
  constructor(url, { serialize = stringify, deserialize = parse, fetchOptions = {} } = {}) {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL: Database URL must be a valid string.');
    }

    this.url = url;
    this.serialize = serialize;
    this.deserialize = deserialize;
    this.fetchOptions = {
      headers: {
        Accept: 'application/json;q=0.9,text/plain',
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };
  }

  /**
   * Sends an HTTP request to the remote database.
   * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
   * @param {Object|null} body - The request body (if applicable).
   * @returns {Promise<Object>} - The deserialized response data.
   * @throws {Error} - If the request fails.
   */
  async request(method, body = null) {
    try {
      const options = {
        method,
        ...this.fetchOptions,
      };

      if (body) {
        if (typeof body !== 'object' || body === null) {
          throw new Error('Request body must be a non-null object.');
        }
        options.body = this.serialize(body);
      }

      const res = await got(this.url, options);

      if (res.statusCode !== 200) {
        throw new Error(`Request failed with status ${res.statusCode}: ${res.statusMessage}`);
      }

      return this.deserialize(res.body);
    } catch (error) {
      console.error(`[CloudDBAdapter] ${method} request error:`, error.message);
      throw new Error(`CloudDBAdapter Error: ${error.message}`);
    }
  }

  /**
   * Reads data from the remote database.
   * @returns {Promise<Object>} - The deserialized response data.
   */
  async read() {
    return this.request('GET');
  }

  /**
   * Writes data to the remote database.
   * @param {Object} obj - The data to write.
   * @returns {Promise<Object>} - The deserialized response data.
   */
  async write(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid data: Write data must be a non-null object.');
    }
    return this.request('POST', obj);
  }

  /**
   * Updates data in the remote database.
   * @param {Object} obj - The data to update.
   * @returns {Promise<Object>} - The deserialized response data.
   */
  async update(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid data: Update data must be a non-null object.');
    }
    return this.request('PUT', obj);
  }

  /**
   * Partially updates data in the remote database.
   * @param {Object} obj - The data to patch.
   * @returns {Promise<Object>} - The deserialized response data.
   */
  async patch(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid data: Patch data must be a non-null object.');
    }
    return this.request('PATCH', obj);
  }

  /**
   * Deletes data from the remote database.
   * @returns {Promise<Object>} - The deserialized response data.
   */
  async delete() {
    return this.request('DELETE');
  }
}

export default CloudDBAdapter;
