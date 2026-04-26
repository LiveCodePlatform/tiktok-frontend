import api from './api';

const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  checkOrder: async (salecode) => {
    const response = await api.get(`/order/${salecode}`);
    return response.data;
  },

  checkout: async (orderData) => {
    const response = await api.post('/order/checkout', orderData);
    return response.data;
  }
};

export default orderService;
