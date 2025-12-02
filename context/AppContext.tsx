import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, CartItem, User, ViewState } from '../types';
import { Storage } from '../utils/storage';
import { supabase } from '../utils/supabaseClient';
import { DEFAULT_MENU_ITEMS, SERVICE_FEE, GOOGLE_SHEET_SCRIPT_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../constants';
import toast, { Toaster } from 'react-hot-toast';

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  saveMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItemItem: (id: string) => Promise<void>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrderStatus: (id: string, status: 'completed' | 'cancelled') => Promise<void>;
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

  // Load Theme
  useEffect(() => {
    const storedTheme = Storage.getTheme();
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // --------------------------------------------------------------
  // SUPABASE REAL-TIME DATA FETCHING & SUBSCRIPTION
  // --------------------------------------------------------------
  useEffect(() => {
    // 1. Fetch Initial Menu
    const fetchMenu = async () => {
      const { data, error } = await supabase.from('menu_items').select('*');
      if (error) console.error('Error fetching menu:', error);
      else {
        // If DB is empty, use default and insert them (optional, logic omitted for safety)
        if (data && data.length > 0) {
          setMenuItems(data as MenuItem[]);
        } else {
          setMenuItems(DEFAULT_MENU_ITEMS); // Fallback if DB empty
        }
      }
    };

    // 2. Fetch Initial Orders
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) console.error('Error fetching orders:', error);
      else if (data) setOrders(data as Order[]);
    };

    fetchMenu();
    fetchOrders();

    // 3. Real-time Subscriptions
    const menuChannel = supabase.channel('menu-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMenuItems(prev => [...prev, payload.new as MenuItem]);
        } else if (payload.eventType === 'UPDATE') {
          setMenuItems(prev => prev.map(item => item.id === payload.new.id ? payload.new as MenuItem : item));
        } else if (payload.eventType === 'DELETE') {
          setMenuItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    const orderChannel = supabase.channel('order-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
          toast('Pesanan Baru Masuk!', { icon: '🔔' });
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(menuChannel);
      supabase.removeChannel(orderChannel);
    };
  }, []);

  // --------------------------------------------------------------
  // DATA OPERATIONS
  // --------------------------------------------------------------

  const saveMenuItem = async (item: MenuItem) => {
    // Upsert (Insert or Update based on ID)
    const { error } = await supabase.from('menu_items').upsert(item);
    if (error) {
      console.error('Error saving menu item:', error);
      toast.error('Gagal simpan menu ke database');
    }
  };

  const deleteMenuItemItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
       console.error('Error deleting item:', error);
       toast.error('Gagal padam menu');
    }
  };

  const updateOrderStatus = async (id: string, status: 'completed' | 'cancelled') => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      toast.error('Gagal kemaskini status');
    } else {
      toast.success(`Order marked as ${status}`);
    }
  };

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

    // 1. Save to Supabase
    const { error } = await supabase.from('orders').insert(newOrder);
    if (error) {
      console.error('Supabase Error:', error);
      toast.error('Gagal menghantar pesanan ke database.');
      return null;
    }

    // 2. Google Sheet Integration (Fire and forget)
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

        fetch(GOOGLE_SHEET_SCRIPT_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => console.error('Google Sheet Sync Error:', err));
      } catch (e) { console.error(e); }
    }

    // 3. Telegram Bot Integration
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
      } catch (e) { console.error(e); }
    }

    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, setMenuItems, saveMenuItem, deleteMenuItemItem,
      orders, setOrders, updateOrderStatus,
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