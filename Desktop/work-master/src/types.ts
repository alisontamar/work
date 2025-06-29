export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  mei_code1: string;
  mei_code2: string;
  barcode: string;
  color: string;
  image: string;
  cost_price: number;
  profit_bob: number;
  stock_quantity: number;
  store_id: string;
  price?: number;
  created_at: string;
  updated_at: string;
  ram?: number;
  rom?: number;
  processor?: string;
  active?: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  store_id: string;
  employee_id: string;
  quantity: number;
  total_price_bob: number;
  created_at: string;
}

export interface Transfer {
  id?: string;
  product_id: string;
  from_store_id: string;
  to_store_id: string;
  employee_id: string;
  quantity: number;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  rate: number;
  created_at: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalEmployees: number;
  totalSuppliers: number;
  recentSales: Sale[];
  recentTransfers: Transfer[];
}

export interface Order {
  id: string;
  created_at: string;
  employee_id: string;
  quantity: number;
  product_id: string;
  product_name: string;
}

export interface PurchaseOrderItem {
  product_id: string;
  product_name: string; // Añadido para el mapeo
  quantity: number;
  total_price: number;
  // Otros campos que puedas tener en tus items
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  total_amount: number;
  paid_amount: number; // Asegúrate de que existe y es un number
  balance_due: number; // Asegúrate de que existe y es un number
  status: "pendiente" | "completada" | "parcialmente pagada";
  price_unit: number; // Si price_unit está directamente en la orden
  supplier_name: string; // Nombre completo del proveedor
  items: PurchaseOrderItem[]; // Importante: Array de PurchaseOrderItem
  // Otros campos si los tienes
}

// --- NUEVA INTERFAZ PARA LOS PAGOS DE LA ORDEN DE COMPRA ---
export interface PurchaseOrderPayment {
  id: string;
  order_id: string;
  payment_date: string; // Para registrar la fecha y hora exacta del pago
  amount: number;
  payment_method: string;
  employee_id?: string; // ID del empleado que registró el pago (opcional)
}