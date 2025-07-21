import 'dotenv/config';
import { database } from '@repo/database';
import { getAlgoliaSyncService } from '@repo/search';
import { log, logError } from '@repo/observability/server';

async function syncProductsToAlgolia() {
  log.info('Starting Algolia sync...');
  
  const algoliaSync = getAlgoliaSyncService();
  
  try {
    // Clear existing index to start fresh
    log.info('Clearing existing Algolia index...');
    await algoliaSync.clearIndex();
    
    // Get total count of available products
    const totalCount = await database.product.count({
      where: { status: 'AVAILABLE' }
    });
    
    log.info(`Found ${totalCount} available products to sync`);
    
    // Process in batches of 100
    const batchSize = 100;
    let processed = 0;
    
    for (let offset = 0; offset < totalCount; offset += batchSize) {
      const products = await database.product.findMany({
        where: { status: 'AVAILABLE' },
        skip: offset,
        take: batchSize,
        include: {
          category: true,
          seller: true,
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
      
      // Bulk index this batch
      await algoliaSync.bulkIndex(products);
      processed += products.length;
      
      log.info(`Processed ${processed}/${totalCount} products (${Math.round(processed/totalCount * 100)}%)`);
    }
    
    log.info('Algolia sync completed successfully!');
    
  } catch (error) {
    logError('Failed to sync products to Algolia:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run the sync
syncProductsToAlgolia().catch((error) => {
  logError('Unhandled error during sync:', error);
  process.exit(1);
});