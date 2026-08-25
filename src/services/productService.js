import api from './api';

const productService = {
  getProducts: async (category) => {
    const url = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
    const response = await api.get(url);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  bulkDeleteProducts: async (ids) => {
    const response = await api.post('/products/bulk-delete', { ids });
    return response.data;
  },

  adjustStock: async (id, adjustmentValue) => {
    const response = await api.patch(`/products/${id}/adjust-stock`, { adjustmentValue });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  importExcel: async (file, mode = 'upsert') => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/products/import-excel?mode=${mode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};


export default productService;
