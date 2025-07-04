
const axios = require('axios');
const { elasticClient } = require('../../config/elastic');

class BaseApiClient {
  constructor(baseUrl, apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    
    const headers = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    this.axios = axios.create({
      baseURL: baseUrl,
      headers
    });
  }

  async fetchData(endpoint, params = {}) {
    try {
      const response = await this.axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from API ${endpoint}: ${error.message}`);
      return null;
    }
  }

  // Implement rate limiting with exponential backoff
  async rateLimitedFetch(endpoint, params = {}, retries = 3, delay = 1000) {
    try {
      return await this.fetchData(endpoint, params);
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying ${endpoint} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.rateLimitedFetch(endpoint, params, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // Save data to Elasticsearch
  async saveToElasticsearch(index, data) {
    try {
      const result = await elasticClient.index({
        index,
        body: data,
        refresh: true
      });
      return result;
    } catch (error) {
      console.error(`Error saving to Elasticsearch: ${error.message}`);
      return null;
    }
  }

  // Bulk save to Elasticsearch
  async bulkSaveToElasticsearch(index, dataArray) {
    try {
      const body = dataArray.flatMap(doc => [
        { index: { _index: index } },
        doc
      ]);

      const result = await elasticClient.bulk({
        refresh: true,
        body
      });
      return result;
    } catch (error) {
      console.error(`Error bulk saving to Elasticsearch: ${error.message}`);
      return null;
    }
  }
}

module.exports = BaseApiClient;
