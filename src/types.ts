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
  image_url: string;
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