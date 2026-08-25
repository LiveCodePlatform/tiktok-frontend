import api from './api';

const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  checkOrder: async (productCode) => {
    const response = await api.get(`/order/${productCode}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  bulkDeleteOrders: async (ids) => {
    const response = await api.post('/orders/bulk-delete', { ids });
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  bulkUpdateOrderStatus: async (ids, status) => {
    const response = await api.post('/orders/bulk-status', { ids, status });
    return response.data;
  }
};

export default orderService;
