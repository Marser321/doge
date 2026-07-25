/**
 * Kept as a manual connectivity probe for local development.
 * Run through the application APIs so RLS and server auth are exercised.
 */
export async function queryHealth(baseUrl = 'http://127.0.0.1:3100') {
  const response = await fetch(`${baseUrl}/api/catalog/products`);
  if (!response.ok) throw new Error(`Catalog health check failed: ${response.status}`);
  return response.json();
}
