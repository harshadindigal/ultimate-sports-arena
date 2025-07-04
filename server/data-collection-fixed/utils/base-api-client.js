
const axios = require('axios');

class BaseApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl
    });
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error in GET ${endpoint}: ${error.message}`);
      return null;
    }
  }
}

module.exports = BaseApiClient;
