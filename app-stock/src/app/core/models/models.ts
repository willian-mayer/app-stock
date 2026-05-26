export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: Category;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface DashboardStats {
  summary: {
    totalProducts: number;
    totalCategories: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
  };
  stockByCategory: {
    _id: string;
    categoryName: string;
    categoryColor: string;
    totalStock: number;
    totalProducts: number;
    totalValue: number;
  }[];
  recentProducts: Product[];
}
