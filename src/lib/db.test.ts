import { expect, test, describe, mock, beforeEach } from "bun:test";
import { db } from "./db";
import { insforge } from "./insforge";

describe("Database Operations", () => {
  let chainMock: any;

  beforeEach(() => {
    chainMock = {};
    const methods = [
      'select', 'insert', 'update', 'delete',
      'eq', 'neq', 'order', 'limit', 'single'
    ];
    methods.forEach(method => {
      chainMock[method] = mock().mockReturnValue(chainMock);
    });

    // Default resolve value
    chainMock.then = (resolve: any) => resolve({ data: [], error: null });

    insforge.database = {
      from: mock().mockReturnValue(chainMock)
    } as any;
  });

  describe("clients", () => {
    test("getAll", async () => {
      const mockData = [{ id: '1', name: 'Test Client' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.clients.getAll();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('clients');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(chainMock.limit).toHaveBeenCalledWith(300);
    });

    test("create", async () => {
      const newClient = { name: 'New Client' };
      const mockData = [{ id: '1', ...newClient }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.clients.create(newClient);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('clients');
      expect(chainMock.insert).toHaveBeenCalledWith([newClient]);
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("update", async () => {
      const updates = { name: 'Updated Name' };
      const mockData = [{ id: '1', ...updates }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.clients.update('1', updates);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('clients');
      expect(chainMock.update).toHaveBeenCalledWith(updates);
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("delete", async () => {
      chainMock.then = (resolve: any) => resolve({ error: null });

      const result = await db.clients.delete('1');
      expect(result.error).toBeNull();
      expect(insforge.database.from).toHaveBeenCalledWith('clients');
      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe("subscriptions", () => {
    test("getAll", async () => {
      const mockData = [{ id: '1', status: 'Active' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.subscriptions.getAll();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('subscriptions');
      expect(chainMock.select).toHaveBeenCalledWith('*, client:clients(*), tier:subscription_tiers(*)');
      expect(chainMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(chainMock.limit).toHaveBeenCalledWith(300);
    });

    test("create", async () => {
      const newSub = { status: 'Active' as const };
      const mockData = [{ id: '1', ...newSub }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.subscriptions.create(newSub);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('subscriptions');
      expect(chainMock.insert).toHaveBeenCalledWith([newSub]);
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("update", async () => {
      const updates = { status: 'Cancelled' as const };
      const mockData = [{ id: '1', ...updates }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.subscriptions.update('1', updates);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('subscriptions');
      expect(chainMock.update).toHaveBeenCalledWith(updates);
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });
  });

  describe("offers", () => {
    test("getAll", async () => {
      const mockData = [{ id: '1', title: 'Summer Sale' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.offers.getAll();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('offers');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(chainMock.limit).toHaveBeenCalledWith(300);
    });

    test("create", async () => {
      const newOffer = { title: 'New Offer' };
      const mockData = [{ id: '1', ...newOffer }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.offers.create(newOffer);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('offers');
      expect(chainMock.insert).toHaveBeenCalledWith([newOffer]);
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("update", async () => {
      const updates = { title: 'Updated Offer' };
      const mockData = [{ id: '1', ...updates }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.offers.update('1', updates);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('offers');
      expect(chainMock.update).toHaveBeenCalledWith(updates);
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("delete", async () => {
      chainMock.then = (resolve: any) => resolve({ error: null });

      const result = await db.offers.delete('1');
      expect(result.error).toBeNull();
      expect(insforge.database.from).toHaveBeenCalledWith('offers');
      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe("products", () => {
    test("getAll", async () => {
      const mockData = [{ id: '1', name: 'Product A' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.getAll();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(chainMock.limit).toHaveBeenCalledWith(300);
    });

    test("getBySlug", async () => {
      const mockData = { id: '1', name: 'Product A', slug: 'product-a' };
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.getBySlug('product-a');
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.eq).toHaveBeenCalledWith('slug', 'product-a');
      expect(chainMock.single).toHaveBeenCalled();
    });

    test("create", async () => {
      const newProduct = { name: 'New Product' };
      const mockData = [{ id: '1', ...newProduct }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.create(newProduct);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.insert).toHaveBeenCalledWith([newProduct]);
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("update", async () => {
      const updates = { name: 'Updated Product' };
      const mockData = [{ id: '1', ...updates }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.update('1', updates);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.update).toHaveBeenCalledWith(updates);
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("delete", async () => {
      chainMock.then = (resolve: any) => resolve({ error: null });

      const result = await db.products.delete('1');
      expect(result.error).toBeNull();
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.delete).toHaveBeenCalled();
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
    });

    test("getFeatured", async () => {
      const mockData = [{ id: '1', name: 'Product A', is_featured: true }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.getFeatured();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.eq).toHaveBeenCalledWith('is_featured', true);
      expect(chainMock.eq).toHaveBeenCalledWith('is_active', true);
      expect(chainMock.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(chainMock.limit).toHaveBeenCalledWith(4);
    });

    test("getRelated", async () => {
      const mockData = [{ id: '2', name: 'Product B' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.getRelated('cat-1', '1');
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.eq).toHaveBeenCalledWith('is_active', true);
      expect(chainMock.neq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.eq).toHaveBeenCalledWith('category', 'cat-1');
      expect(chainMock.limit).toHaveBeenCalledWith(3);
    });

    test("toggleFeatured", async () => {
      const mockData = [{ id: '1', is_featured: true }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.toggleFeatured('1', true);
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('products');
      expect(chainMock.update).toHaveBeenCalledWith({ is_featured: true });
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });

    test("addImage", async () => {
      const mockData = [{ id: 'img-1', product_id: '1', image_url: 'url', is_primary: true }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.products.addImage('1', 'url');
      expect(result.data).toEqual(mockData[0] as any);
      expect(insforge.database.from).toHaveBeenCalledWith('product_images');
      expect(chainMock.insert).toHaveBeenCalledWith([{ product_id: '1', image_url: 'url', is_primary: true }]);
      expect(chainMock.select).toHaveBeenCalled();
    });
  });

  describe("orders", () => {
    test("getAll", async () => {
      const mockData = [{ id: '1', total: 100 }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.orders.getAll();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('orders');
      expect(chainMock.select).toHaveBeenCalledWith('*, client:clients(*)');
      expect(chainMock.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(chainMock.limit).toHaveBeenCalledWith(300);
    });

    test("create", async () => {
      const order = { total: 100 };
      const items = [{ product_id: 'p1', quantity: 1 }];

      let callCount = 0;
      chainMock.then = (resolve: any) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: [{ id: 'order-1', ...order }], error: null });
        } else {
          resolve({ error: null });
        }
      };

      const result = await db.orders.create(order, items);
      expect(result.data).toEqual({ id: 'order-1', ...order } as any);
      expect(result.error).toBeNull();

      expect(insforge.database.from).toHaveBeenCalledWith('orders');
      expect(chainMock.insert).toHaveBeenCalledWith([order]);
      expect(chainMock.select).toHaveBeenCalled();

      expect(insforge.database.from).toHaveBeenCalledWith('order_items');
      expect(chainMock.insert).toHaveBeenCalledWith([{ product_id: 'p1', quantity: 1, order_id: 'order-1' }]);
    });

    test("updateStatus", async () => {
      const mockData = [{ id: '1', status: 'Shipped' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.orders.updateStatus('1', 'Shipped');
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('orders');
      expect(chainMock.update).toHaveBeenCalledWith({ status: 'Shipped' });
      expect(chainMock.eq).toHaveBeenCalledWith('id', '1');
      expect(chainMock.select).toHaveBeenCalled();
    });
  });

  describe("dashboard", () => {
    test("getLatestKPIs", async () => {
      const mockData = [{ id: '1', metric_name: 'Revenue' }];
      chainMock.then = (resolve: any) => resolve({ data: mockData, error: null });

      const result = await db.dashboard.getLatestKPIs();
      expect(result.data).toEqual(mockData as any);
      expect(insforge.database.from).toHaveBeenCalledWith('kpi_snapshots');
      expect(chainMock.select).toHaveBeenCalledWith('*');
      expect(chainMock.order).toHaveBeenCalledWith('snapshot_date', { ascending: false });
      expect(chainMock.limit).toHaveBeenCalledWith(10);
    });

    test("getRecentActivity", async () => {
      const mockSubs = [{ id: 's1' }];
      const mockOrders = [{ id: 'o1' }];

      let callCount = 0;
      chainMock.then = (resolve: any) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockSubs, error: null });
        } else {
          resolve({ data: mockOrders, error: null });
        }
      };

      const result = await db.dashboard.getRecentActivity();
      expect(result.subscriptions).toEqual(mockSubs as any);
      expect(result.orders).toEqual(mockOrders as any);

      expect(insforge.database.from).toHaveBeenCalledWith('subscriptions');
      expect(insforge.database.from).toHaveBeenCalledWith('orders');
    });
  });
});
