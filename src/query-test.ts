import { insforge } from './lib/insforge';

async function queryConfig() {
  const { data, error } = await insforge.database.from('products').select('*').limit(1);
  console.log('PRODUCTS:', JSON.stringify(data?.[0], null, 2));

  const { data: imgData, error: imgErr } = await insforge.database.from('product_images').select('*').limit(1);
  console.log('PRODUCT IMAGES:', imgData, imgErr);
}
queryConfig();
