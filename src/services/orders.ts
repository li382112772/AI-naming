import { Order } from '@/types';
import { ordersStore } from './db';

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const order: Order = {
    ...orderData,
    id,
    createdAt: now,
  };
  await ordersStore.setItem(id, order);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  return await ordersStore.getItem<Order>(id);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const order = await getOrder(id);
  if (!order) return null;

  const updatedOrder = {
    ...order,
    status,
    paidAt: status === 'paid' ? Date.now() : order.paidAt
  };
  await ordersStore.setItem(id, updatedOrder);
  return updatedOrder;
}

export async function listOrders(): Promise<Order[]> {
  const orders: Order[] = [];
  await ordersStore.iterate((value: Order) => {
    orders.push(value);
  });
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
