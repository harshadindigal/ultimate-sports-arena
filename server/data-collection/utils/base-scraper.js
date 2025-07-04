
const axios = require('axios');
const cheerio = require('cheerio');
const { elasticClient } = require('../../config/elastic');

class BaseScraper {
  constructor(baseUrl, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36') {
    this.baseUrl = baseUrl;
    this.userAgent = userAgent;
    this.axios = axios.create({
      headers: {
        'User-Agent': this.userAgent
      }
    });
  }

  async fetchPage(url) {
    try {
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}: ${error.message}`);
      return null;
    }
  }

  parseHTML(html) {
    return cheerio.load(html);
  }

  async scrape(url) {
    const html = await this.fetchPage(url);
    if (!html) return null;
    return this.parseHTML(html);
  }

  // Implement rate limiting with exponential backoff
  async rateLimitedFetch(url, retries = 3, delay = 1000) {
    try {
      return await this.fetchPage(url);
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying ${url} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.rateLimitedFetch(url, retries - 1, delay * 2);
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

module.exports = BaseScraper;
