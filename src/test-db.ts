import { insforge } from './lib/insforge';

async function testSchema() {
  const tables = ['clients', 'subscription_tiers', 'subscriptions', 'offers', 'products', 'product_images', 'orders', 'order_items', 'service_requests', 'kpi_snapshots'];
  
  for (const table of tables) {
    try {
      const { data, error } = await insforge.database.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table ${table} error:`, error);
      } else {
        console.log(`Table ${table} EXISTS. rows:`, data?.length);
      }
    } catch (e) {
      console.log(`Table ${table} threw:`, e.message);
    }
  }
}

testSchema();
