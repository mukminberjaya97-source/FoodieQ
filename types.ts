export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  dietary: 'Vegetarian' | 'Tidak Vegetarian';
  available: boolean;
  calories: number;
  description: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface User {
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
}

export type ViewState = 'login' | 'customer' | 'seller' | 'my-orders';
export type AdminTab = 'dashboard' | 'orders' | 'menu';
