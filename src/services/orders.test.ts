import { describe, it, expect, beforeEach } from 'vitest';
import { createOrder, getOrder, updateOrderStatus, listOrders } from './orders';
import { Order } from '@/types';
import { ordersStore } from './db';

describe('Order Service', () => {
  const mockOrder: Omit<Order, 'id' | 'createdAt'> = {
    sessionId: 'session1',
    seriesId: 'series1',
    amount: 9.9,
    status: 'pending'
  };

  beforeEach(async () => {
    await ordersStore.clear();
  });

  it('should create an order', async () => {
    const order = await createOrder(mockOrder);
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
  });

  it('should update order status', async () => {
    const order = await createOrder(mockOrder);
    const updated = await updateOrderStatus(order.id, 'paid');
    expect(updated?.status).toBe('paid');
    expect(updated?.paidAt).toBeDefined();
  });

  it('should list all orders', async () => {
    await createOrder(mockOrder);
    await createOrder({ ...mockOrder, amount: 19.9 });
    const orders = await listOrders();
    expect(orders).toHaveLength(2);
  });

  it('should return null when updating non-existent order', async () => {
    const updated = await updateOrderStatus('non-existent', 'paid');
    expect(updated).toBeNull();
  });
});
