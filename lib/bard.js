import axios from 'axios';

class BardClient {
  constructor(baseUrl = 'https://bard.rizzy.eu.org') {
    this.baseUrl = baseUrl;
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Sends a text-based query to the Bard API.
   * @param {string} question - The question to ask.
   * @returns {Promise<Object>} - The API response data.
   * @throws {Error} - If the question is missing or the API request fails.
   */
  async askQuestion(question) {
    if (!question) {
      throw new Error('Please specify a question!');
    }

    try {
      const response = await this.httpClient.post('/api/onstage', { ask: question });
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Sends an image-based query to the Bard API.
   * @param {string} question - The question to ask.
   * @param {string} imageUrl - The URL of the image to include in the query.
   * @returns {Promise<Object>} - The API response data.
   * @throws {Error} - If the question or image URL is missing, or the API request fails.
   */
  async askQuestionWithImage(question, imageUrl) {
    if (!question) {
      throw new Error('Please specify a question!');
    }
    if (!imageUrl) {
      throw new Error('Please specify a URL for the image!');
    }

    try {
      const response = await this.httpClient.post('/api/onstage/image', {
        ask: question,
        image: imageUrl,
      });
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

export default BardClient;
