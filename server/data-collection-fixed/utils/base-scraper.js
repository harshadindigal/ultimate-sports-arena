
const axios = require('axios');
const cheerio = require('cheerio');

class BaseScraper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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

  async parsePage(html) {
    if (!html) return null;
    return cheerio.load(html);
  }
}

module.exports = BaseScraper;
