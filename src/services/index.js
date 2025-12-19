import api from './api';

// Category Service
export const categoryService = {
  getAll: () => api.get('/category'),
  getById: (id) => api.get(`/category/${id}`),
  create: (data) => api.post('/category', data),
  update: (id, data) => api.patch(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
};

// Supplier Service
export const supplierService = {
  getAll: () => api.get('/supplier'),
  getById: (id) => api.get(`/supplier/${id}`),
  create: (data) => api.post('/supplier', data),
  update: (id, data) => api.patch(`/supplier/${id}`, data),
  delete: (id) => api.delete(`/supplier/${id}`),
};

// Product Service
export const productService = {
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product', data),
  update: (id, data) => api.patch(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
};

// Warehouse Service
export const warehouseService = {
  getAll: () => api.get('/warehouse'),
  getById: (id) => api.get(`/warehouse/${id}`),
  create: (data) => api.post('/warehouse', data),
  update: (id, data) => api.patch(`/warehouse/${id}`, data),
  delete: (id) => api.delete(`/warehouse/${id}`),
};

// User Service
export const userService = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  create: (data) => api.post('/user', data),
  update: (id, data) => api.patch(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
};

// Stock Service
export const stockService = {
  getAll: () => api.get('/stock'),
  getByWarehouseAndProduct: (warehouseId, productId) => 
    api.get(`/stock/${warehouseId}/${productId}`),
  upsert: (data) => api.post('/stock', data),
  updateQuantity: (data) => api.patch('/stock', data),
  delete: (warehouseId, productId) => 
    api.delete(`/stock/${warehouseId}/${productId}`),
};

// Import Receipt Service
export const importService = {
  getAll: () => api.get('/import'),
  getById: (id) => api.get(`/import/${id}`),
  create: (data) => api.post('/import', data),
  delete: (id) => api.delete(`/import/${id}`),
  exportPdf: (id) => api.get(`/import/${id}/export-pdf`, { responseType: 'blob' }),
  exportExcel: (id) => api.get(`/import/${id}/export-excel`, { responseType: 'blob' }),
  importFromExcel: (file, warehouseId, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('warehouseId', warehouseId);
    formData.append('userId', userId);
    return api.post('/import/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Export Receipt Service
export const exportService = {
  getAll: () => api.get('/export'),
  getById: (id) => api.get(`/export/${id}`),
  create: (data) => api.post('/export', data),
  delete: (id) => api.delete(`/export/${id}`),
  exportPdf: (id) => api.get(`/export/${id}/export-pdf`, { responseType: 'blob' }),
  exportExcel: (id) => api.get(`/export/${id}/export-excel`, { responseType: 'blob' }),
  importFromExcel: (file, warehouseId, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('warehouseId', warehouseId);
    formData.append('userId', userId);
    return api.post('/export/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};