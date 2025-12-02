import { MenuItem, Order } from '../types';
import { DEFAULT_MENU_ITEMS } from '../constants';

const KEYS = {
  MENU: 'foodieq_menu',
  ORDERS: 'foodieq_orders',
  THEME: 'foodieq_theme'
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
  }
};
