const orders = Array.from({ length: 10000 }).map((_, i) => ({
  order_number: `ORD-${i}`,
  customer_name: `Customer ${i}`,
  customer_email: `customer${i}@example.com`,
}));

const searchTerm = "123";

console.time("Before optimization");
for (let j = 0; j < 100; j++) {
  const filteredOrders = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
}
console.timeEnd("Before optimization");

console.time("After optimization");
for (let j = 0; j < 100; j++) {
  const term = searchTerm.toLowerCase();
  const filteredOrders2 = orders.filter(o =>
    o.order_number.toLowerCase().includes(term) ||
    o.customer_name.toLowerCase().includes(term) ||
    (o.customer_email || '').toLowerCase().includes(term)
  )
}
console.timeEnd("After optimization");
