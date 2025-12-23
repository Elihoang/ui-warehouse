import api from './api';

const productBatchService = {
  // Get all batches
  getAll: () => api.get('/ProductBatch'),

  // Get batch by ID
  getById: (id) => api.get(`/ProductBatch/${id}`),

  // Get batch by batch number
  getByBatchNumber: (batchNumber) => api.get(`/ProductBatch/batch-number/${batchNumber}`),

  // Get batches by product
  getByProductId: (productId) => api.get(`/ProductBatch/product/${productId}`),

  // Get batches by warehouse
  getByWarehouseId: (warehouseId) => api.get(`/ProductBatch/warehouse/${warehouseId}`),

  // Get expiring batches
  getExpiring: (daysUntilExpiry = 30) => 
    api.get(`/ProductBatch/expiring?daysUntilExpiry=${daysUntilExpiry}`),

  // Get batches by status
  getByStatus: (status) => api.get(`/ProductBatch/status/${status}`),

  // Get FIFO batches
  getFIFO: (productId, warehouseId) => 
    api.get(`/ProductBatch/fifo?productId=${productId}&warehouseId=${warehouseId}`),

  // Create new batch
  create: (data) => api.post('/ProductBatch', data),

  // Update batch
  update: (id, data) => api.patch(`/ProductBatch/${id}`, data),

  // Delete batch
  delete: (id) => api.delete(`/ProductBatch/${id}`),

  // Update expired batches
  updateExpired: () => api.post('/ProductBatch/update-expired'),
};

export default productBatchService;
