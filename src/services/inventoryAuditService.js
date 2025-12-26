import api from './api';

const inventoryAuditService = {
  // Get all audits
  getAll: () => api.get('/InventoryAudit'),

  // Get audit by ID
  getById: (id) => api.get(`/InventoryAudit/${id}`),

  // Get audit with details
  getWithDetails: (id) => api.get(`/InventoryAudit/${id}/details`),

  // Get audits by warehouse
  getByWarehouseId: (warehouseId) => api.get(`/InventoryAudit/warehouse/${warehouseId}`),

  // Get audits by status
  getByStatus: (status) => api.get(`/InventoryAudit/status/${status}`),

  // Get details with variance
  getDetailsWithVariance: (id) => api.get(`/InventoryAudit/${id}/variance`),

  // Create new audit
  create: (data) => api.post('/InventoryAudit', data),

  // Generate details from stock
  generateDetails: (id, warehouseId) => 
    api.post(`/InventoryAudit/${id}/generate-details?warehouseId=${warehouseId}`),

  // Add detail
  addDetail: (id, data) => api.post(`/InventoryAudit/${id}/details`, data),

  // Complete audit
  complete: (id, updateStock = true) => 
    api.post(`/InventoryAudit/${id}/complete?updateStock=${updateStock}`),

  // Cancel audit
  cancel: (id) => api.post(`/InventoryAudit/${id}/cancel`),

  // Export PDF
  exportPDF: (id) => api.get(`/InventoryAudit/${id}/export-html`, {
    responseType: 'blob', // Quan trọng: để nhận binary data
  }),
};

export default inventoryAuditService;
