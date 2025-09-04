export const OrderIndexSchema = {
  '$.id': { type: 'TEXT', AS: 'id' }, // lookup by order ID
  '$.customerId': { type: 'TEXT', AS: 'customerId' }, // find orders per customer
  '$.status': { type: 'TEXT', AS: 'status' }, // filter by status (pending, shipped, etc.)
  '$.totalPrice': { type: 'NUMERIC', AS: 'totalPrice' }, // range queries ("orders > $100")
  '$.createdAt': { type: 'TEXT', AS: 'createdAt' }, // for sorting/recent orders
};
export const ProductIndexSchema = {
  '$.id': { type: 'TEXT', AS: 'id' }, // lookup by ID
  '$.name': { type: 'TEXT', AS: 'name' }, // search by name
  '$.sku': { type: 'TEXT', AS: 'sku' }, // search by SKU
  '$.price': { type: 'NUMERIC', AS: 'price' }, // filter/range queries
  '$.stockQuantity': { type: 'NUMERIC', AS: 'stockQuantity' }, // check stock
};
