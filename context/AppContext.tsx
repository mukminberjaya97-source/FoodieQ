import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, CartItem, User, ViewState } from '../types';
import { Storage } from '../utils/storage';
import { DEFAULT_MENU_ITEMS, SERVICE_FEE, GOOGLE_SHEET_SCRIPT_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../constants';
import toast, { Toaster } from 'react-hot-toast';

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  menuItems: MenuItem[];
  // Fix: Use React.Dispatch<React.SetStateAction<T>> to allow functional updates
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  orders: Order[];
  // Fix: Use React.Dispatch<React.SetStateAction<T>> to allow functional updates
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: () => Promise<Order | null>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState<ViewState>('login');

  // Load initial data
  useEffect(() => {
    setMenuItems(Storage.getMenuItems());
    setOrders(Storage.getOrders());
    const storedTheme = Storage.getTheme();
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save data on changes
  useEffect(() => {
    if (menuItems.length > 0) Storage.saveMenuItems(menuItems);
  }, [menuItems]);

  useEffect(() => {
    if (orders.length > 0) Storage.saveOrders(orders);
  }, [orders]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    Storage.saveTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'admin' ? 'seller' : 'customer');
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    setCurrentView('login');
    setCart([]);
    toast('Logged out successfully', { icon: '👋' });
  };

  const addToCart = (item: MenuItem) => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        toast.success(`Increased quantity of ${item.name}`);
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (): Promise<Order | null> => {
    if (!user || cart.length === 0) return null;

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const total = subtotal + SERVICE_FEE;

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customerName: user.name,
      customerPhone: user.phone || 'N/A',
      items: [...cart],
      subtotal,
      serviceFee: SERVICE_FEE,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // 1. Google Sheet Integration
    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('https')) {
      try {
        const formData = new URLSearchParams();
        formData.append('order_id', newOrder.id);
        formData.append('date', new Date(newOrder.createdAt).toLocaleString('ms-MY', { 
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        }));
        formData.append('customer_name', newOrder.customerName);
        formData.append('customer_phone', newOrder.customerPhone);
        formData.append('items', newOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', '));
        formData.append('total', newOrder.total.toFixed(2));
        formData.append('status', newOrder.status);

        console.log('Sending order to Google Sheet...');

        fetch(GOOGLE_SHEET_SCRIPT_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => console.error('Google Sheet Sync Error:', err));
      } catch (e) {
        console.error("Failed to sync to Google Sheet", e);
      }
    }

    // 2. Telegram Bot Integration
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const itemsList = newOrder.items
          .map(item => `- ${item.name} (x${item.quantity})`)
          .join('\n');
          
        const text = `🚨 *PESANAN BARU DITERIMA*\n\n` +
          `🆔 Order ID: \`${newOrder.id}\`\n` +
          `👤 Nama: ${newOrder.customerName}\n` +
          `📱 Tel: ${newOrder.customerPhone}\n\n` +
          `🛒 *Item Pesanan:*\n${itemsList}\n\n` +
          `💰 *Jumlah: RM ${newOrder.total.toFixed(2)}*\n` +
          `📅 Tarikh: ${new Date(newOrder.createdAt).toLocaleString('ms-MY')}`;

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'Markdown'
          })
        }).catch(err => console.error('Telegram Error:', err));
      } catch (e) {
        console.error("Failed to send Telegram notification", e);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, setMenuItems,
      orders, setOrders,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      theme, toggleTheme,
      currentView, setCurrentView
    }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: theme === 'dark' ? '#1e293b' : '#fff',
          color: theme === 'dark' ? '#fff' : '#0f172a',
        }
      }} />
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};