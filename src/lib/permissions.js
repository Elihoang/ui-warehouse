export const ROLES = {
  STAFF: 'Staff',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
};

export const permissions = {
  // Categories
  canViewCategories: (role) => true,
  canAddCategory: (role) => ['Manager', 'Admin'].includes(role),
  canEditCategory: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteCategory: (role) => role === 'Admin',

  // Suppliers
  canViewSuppliers: (role) => true,
  canAddSupplier: (role) => ['Manager', 'Admin'].includes(role),
  canEditSupplier: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteSupplier: (role) => role === 'Admin',

  // Products
  canViewProducts: (role) => true,
  canAddProduct: (role) => ['Manager', 'Admin'].includes(role),
  canEditProduct: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteProduct: (role) => ['Manager', 'Admin'].includes(role),

  // Warehouses
  canViewWarehouses: (role) => true,
  canAddWarehouse: (role) => ['Manager', 'Admin'].includes(role),
  canEditWarehouse: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteWarehouse: (role) => role === 'Admin',

  // Stock
  canViewStock: (role) => true,
  canUpdateStock: (role) => ['Manager', 'Admin'].includes(role),

  // Imports
  canCreateImport: (role) => true,
  canViewOwnImports: (role) => true,
  canViewAllImports: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteImport: (role) => ['Manager', 'Admin'].includes(role),
  canExportImportPDF: (role) => ['Manager', 'Admin'].includes(role),

  // Exports
  canCreateExport: (role) => true,
  canViewOwnExports: (role) => true,
  canViewAllExports: (role) => ['Manager', 'Admin'].includes(role),
  canDeleteExport: (role) => ['Manager', 'Admin'].includes(role),
  canExportExportPDF: (role) => ['Manager', 'Admin'].includes(role),

  // Users
  canViewUsers: (role) => ['Manager', 'Admin'].includes(role),
  canAddUser: (role) => role === 'Admin',
  canEditUser: (role) => role === 'Admin',
  canDeleteUser: (role) => role === 'Admin',
  canChangeRole: (role) => role === 'Admin',
};