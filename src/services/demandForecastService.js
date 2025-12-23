import api from './api';

const demandForecastService = {
  // Get all forecasts
  getAll: () => api.get('/DemandForecast'),

  // Get forecast by ID
  getById: (id) => api.get(`/DemandForecast/${id}`),

  // Get forecasts by product
  getByProductId: (productId) => api.get(`/DemandForecast/product/${productId}`),

  // Get forecasts by warehouse
  getByWarehouseId: (warehouseId) => api.get(`/DemandForecast/warehouse/${warehouseId}`),

  // Get latest forecast
  getLatest: (productId, warehouseId) => 
    api.get(`/DemandForecast/latest?productId=${productId}&warehouseId=${warehouseId}`),

  // Generate forecast
  generate: (data) => api.post('/DemandForecast/generate', data),

  // Update actual demand
  updateActualDemand: (id, actualDemand) => 
    api.patch(`/DemandForecast/${id}/actual-demand`, actualDemand, {
      headers: { 'Content-Type': 'application/json' }
    }),

  // Get available algorithms
  getAlgorithms: () => api.get('/DemandForecast/algorithms'),
};

export default demandForecastService;
