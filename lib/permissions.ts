export type UserRole = 'admin' | 'manager' | 'employee'

export interface Permissions {
  // Dashboard
  canViewDashboard: boolean
  
  // POS
  canUsePOS: boolean
  
  // Products
  canViewProducts: boolean
  canCreateProducts: boolean
  canEditProducts: boolean
  canDeleteProducts: boolean
  
  // Inventory
  canViewInventory: boolean
  canManageInventory: boolean
  
  // Sales
  canViewSales: boolean
  canCreateSales: boolean
  canViewSaleDetails: boolean
  
  // Purchases
  canViewPurchases: boolean
  canCreatePurchases: boolean
  canViewPurchaseDetails: boolean
  
  // Suppliers
  canViewSuppliers: boolean
  canCreateSuppliers: boolean
  canEditSuppliers: boolean
  canDeleteSuppliers: boolean
  
  // Customers
  canViewCustomers: boolean
  canCreateCustomers: boolean
  canEditCustomers: boolean
  canDeleteCustomers: boolean
  
  // Reports
  canViewReports: boolean
  
  // CRM
  canViewCRM: boolean
  
  // Staff
  canViewStaff: boolean
  canCreateStaff: boolean
  canEditStaff: boolean
  canDeleteStaff: boolean
  
  // WooCommerce
  canManageWooCommerce: boolean
  
  // Settings
  canManageSettings: boolean
}

export function getPermissions(role: UserRole): Permissions {
  switch (role) {
    case 'admin':
      return {
        canViewDashboard: true,
        canUsePOS: true,
        canViewProducts: true,
        canCreateProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,
        canViewInventory: true,
        canManageInventory: true,
        canViewSales: true,
        canCreateSales: true,
        canViewSaleDetails: true,
        canViewPurchases: true,
        canCreatePurchases: true,
        canViewPurchaseDetails: true,
        canViewSuppliers: true,
        canCreateSuppliers: true,
        canEditSuppliers: true,
        canDeleteSuppliers: true,
        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: true,
        canDeleteCustomers: true,
        canViewReports: true,
        canViewCRM: true,
        canViewStaff: true,
        canCreateStaff: true,
        canEditStaff: true,
        canDeleteStaff: true,
        canManageWooCommerce: true,
        canManageSettings: true,
      }
    
    case 'manager':
      return {
        canViewDashboard: true,
        canUsePOS: true,
        canViewProducts: true,
        canCreateProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,
        canViewInventory: true,
        canManageInventory: true,
        canViewSales: true,
        canCreateSales: true,
        canViewSaleDetails: true,
        canViewPurchases: true,
        canCreatePurchases: true,
        canViewPurchaseDetails: true,
        canViewSuppliers: true,
        canCreateSuppliers: true,
        canEditSuppliers: true,
        canDeleteSuppliers: true,
        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: true,
        canDeleteCustomers: true,
        canViewReports: true,
        canViewCRM: true,
        canViewStaff: false,
        canCreateStaff: false,
        canEditStaff: false,
        canDeleteStaff: false,
        canManageWooCommerce: true,
        canManageSettings: false,
      }
    
    case 'employee':
      return {
        canViewDashboard: true,
        canUsePOS: true,
        canViewProducts: true,
        canCreateProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
        canViewInventory: true,
        canManageInventory: false,
        canViewSales: true,
        canCreateSales: true,
        canViewSaleDetails: true,
        canViewPurchases: false,
        canCreatePurchases: false,
        canViewPurchaseDetails: false,
        canViewSuppliers: false,
        canCreateSuppliers: false,
        canEditSuppliers: false,
        canDeleteSuppliers: false,
        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: false,
        canDeleteCustomers: false,
        canViewReports: false,
        canViewCRM: false,
        canViewStaff: false,
        canCreateStaff: false,
        canEditStaff: false,
        canDeleteStaff: false,
        canManageWooCommerce: false,
        canManageSettings: false,
      }
    
    default:
      // Sin permisos por defecto
      return {
        canViewDashboard: false,
        canUsePOS: false,
        canViewProducts: false,
        canCreateProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
        canViewInventory: false,
        canManageInventory: false,
        canViewSales: false,
        canCreateSales: false,
        canViewSaleDetails: false,
        canViewPurchases: false,
        canCreatePurchases: false,
        canViewPurchaseDetails: false,
        canViewSuppliers: false,
        canCreateSuppliers: false,
        canEditSuppliers: false,
        canDeleteSuppliers: false,
        canViewCustomers: false,
        canCreateCustomers: false,
        canEditCustomers: false,
        canDeleteCustomers: false,
        canViewReports: false,
        canViewCRM: false,
        canViewStaff: false,
        canCreateStaff: false,
        canEditStaff: false,
        canDeleteStaff: false,
        canManageWooCommerce: false,
        canManageSettings: false,
      }
  }
}

export function hasPermission(role: UserRole, permission: keyof Permissions): boolean {
  const permissions = getPermissions(role)
  return permissions[permission]
}

