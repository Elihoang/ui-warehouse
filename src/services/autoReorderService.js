import api from './api';

const autoReorderService = {
  // Get all settings
  getAll: () => api.get('/AutoReorderSettings'),

  // Get setting by ID
  getById: (id) => api.get(`/AutoReorderSettings/${id}`),

  // Get by product and warehouse
  getByProductAndWarehouse: (productId, warehouseId) => 
    api.get(`/AutoReorderSettings/product-warehouse?productId=${productId}&warehouseId=${warehouseId}`),

  // Get enabled settings
  getEnabled: () => api.get('/AutoReorderSettings/enabled'),

  // Get by warehouse
  getByWarehouseId: (warehouseId) => api.get(`/AutoReorderSettings/warehouse/${warehouseId}`),

  // Check reorder needs
  checkReorderNeeds: () => api.get('/AutoReorderSettings/check-reorder-needs'),

  // Create setting
  create: (data) => api.post('/AutoReorderSettings', data),

  // Update setting
  update: (id, data) => api.patch(`/AutoReorderSettings/${id}`, data),

  // Delete setting
  delete: (id) => api.delete(`/AutoReorderSettings/${id}`),

  // Suggest settings
  suggest: (productId, warehouseId, lookbackDays = 90) => 
    api.post(`/AutoReorderSettings/suggest?productId=${productId}&warehouseId=${warehouseId}&lookbackDays=${lookbackDays}`),

  // Get formulas
  getFormulas: () => api.get('/AutoReorderSettings/formulas'),
};

export default autoReorderService;
