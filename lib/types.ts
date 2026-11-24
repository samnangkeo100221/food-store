export interface FoodItem {
  id: string;
  name: string;
  category: string;
  initialLetter: string; // អក្សរដំបូង
  image: string; // Data URL or URL
  costPrice: number; // ថ្លៃដើម
  sellingPrice: number; // ថ្លៃលក់
  createdAt: number;
  available?: boolean;
}

export interface OrderItem {
  itemId: string;
  name: string;
  category: string;
  initialLetter: string;
  image: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  note?: string;
}

export interface SaleReceipt {
  id: string;
  invoiceNo: string;
  timestamp: number;
  tableNo: string;
  items: OrderItem[];
  totalAmount: number; // សរុបបុង (ថ្លៃលក់)
  totalCost: number; // សរុបថ្លៃដើម
  totalProfit: number; // សរុបចំណេញ
  cashReceived: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'khqr' | 'card';
  notes?: string;
}

export type ViewMode = 'pos' | 'food' | 'reports';

export type CatalogLayout = 'grid' | 'list';

export interface FilterState {
  category: string;
  initialLetter: string;
  searchQuery: string;
}
