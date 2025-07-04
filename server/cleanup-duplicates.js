
const { elasticClient } = require('./config/elastic');

// Function to remove duplicates from an index based on a field
async function removeDuplicates(index, field) {
  try {
    console.log(`Removing duplicates from ${index} based on ${field}...`);
    
    // Get all documents in the index
    const result = await elasticClient.search({
      index,
      body: {
        size: 1000,
        query: {
          match_all: {}
        }
      }
    });
    
    const documents = result.hits.hits;
    console.log(`Found ${documents.length} documents in ${index}`);
    
    // Group documents by the specified field
    const groupedDocs = {};
    documents.forEach(doc => {
      const fieldValue = doc._source[field];
      if (!groupedDocs[fieldValue]) {
        groupedDocs[fieldValue] = [];
      }
      groupedDocs[fieldValue].push(doc);
    });
    
    // For each group, keep the first document and delete the rest
    let deletedCount = 0;
    for (const [fieldValue, docs] of Object.entries(groupedDocs)) {
      if (docs.length > 1) {
        console.log(`Found ${docs.length} duplicates for ${field} = ${fieldValue}`);
        
        // Keep the first document (with leagues if available)
        const docsToDelete = docs.slice(1);
        
        // Delete duplicate documents
        for (const doc of docsToDelete) {
          await elasticClient.delete({
            index,
            id: doc._id
          });
          deletedCount++;
        }
      }
    }
    
    console.log(`Deleted ${deletedCount} duplicate documents from ${index}`);
    return deletedCount;
  } catch (error) {
    console.error(`Error removing duplicates from ${index}: ${error.message}`);
    return 0;
  }
}

// Main function
async function main() {
  try {
    // Remove duplicates from the sports index
    const deletedSports = await removeDuplicates('sports', 'name');
    
    console.log(`\nDeleted ${deletedSports} duplicate sports entries`);
    process.exit(0);
  } catch (error) {
    console.error(`Error in main function: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
