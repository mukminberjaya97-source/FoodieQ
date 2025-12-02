import { MenuItem, Order, User } from '../types';
import { DEFAULT_MENU_ITEMS } from '../constants';

const KEYS = {
  MENU: 'foodieq_menu',
  ORDERS: 'foodieq_orders',
  THEME: 'foodieq_theme',
  USER: 'foodieq_user'
};

export const Storage = {
  getMenuItems: (): MenuItem[] => {
    const stored = localStorage.getItem(KEYS.MENU);
    if (!stored) return DEFAULT_MENU_ITEMS;
    return JSON.parse(stored);
  },

  saveMenuItems: (items: MenuItem[]) => {
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  },

  getOrders: (): Order[] => {
    const stored = localStorage.getItem(KEYS.ORDERS);
    if (!stored) return [];
    return JSON.parse(stored);
  },

  saveOrders: (orders: Order[]) => {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  saveTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(KEYS.THEME, theme);
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  saveUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  }
};