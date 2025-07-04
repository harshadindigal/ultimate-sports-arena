# Ultimate Sports Arena Setup Guide

This guide will help you set up the Ultimate Sports Arena application with Elasticsearch as the backend.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Elasticsearch instance (cloud or local)

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshadindigal/ultimate-sports-arena.git
   cd ultimate-sports-arena
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory with the following content:
   ```
   ELASTICSEARCH_URI=https://your-elasticsearch-instance:443
   ELASTICSEARCH_API_KEY=your-elasticsearch-api-key
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=30d
   ```

4. **Initialize Elasticsearch**
   ```bash
   npm run init-elastic
   ```

5. **Collect sports data**
   ```bash
   npm run collect-data
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

## Testing

To test the data sources and Elasticsearch connection:

```bash
npm run test-sources
npm run test-elastic
```

## Troubleshooting

- If you encounter the error "Missing script: init-elastic", make sure you are running the command from the root directory of the project.
- If you have connection issues with Elasticsearch, verify that your credentials are correct and that your IP is allowed to access the Elasticsearch instance.
