
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
  deleteOrder: (id: string) => Promise<void>;
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
  isLoading: boolean;
  seedDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(Storage.getUser());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const storedUser = Storage.getUser();
    if (storedUser) {
      return storedUser.role === 'admin' ? 'seller' : 'customer';
    }
    return 'login';
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTheme = Storage.getTheme();
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Helper to map Order DB Row to App Type
  const mapOrderRow = (r: any): Order => ({
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    subtotal: r.subtotal,
    serviceFee: r.service_fee,
    total: r.total,
    status: r.status,
    createdAt: r.created_at
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      const { data: menuData } = await supabase.from('menu_items').select('*');
      // DO NOT fallback to default if empty, let the admin seed it.
      if (menuData) setMenuItems(menuData as MenuItem[]);

      const { data: orderData } = await supabase.from('orders').select('*');
      if (orderData) {
        setOrders(orderData.map(mapOrderRow));
      }
      
      setIsLoading(false);
    };

    fetchInitialData();

    const subscription = supabase.channel('foodieq-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMenuItems(prev => [...prev, payload.new as MenuItem]);
        } else if (payload.eventType === 'UPDATE') {
          setMenuItems(prev => prev.map(item => item.id === payload.new.id ? payload.new as MenuItem : item));
        } else if (payload.eventType === 'DELETE') {
          setMenuItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [mapOrderRow(payload.new), ...prev]);
          toast('Pesanan Baru Masuk! 🔔', { icon: '🍔' });
        } 
        else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrderRow(payload.new) : o));
          if (payload.new.status === 'completed') toast.success(`Order ${payload.new.id} siap!`);
        }
        else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const saveMenuItem = async (item: MenuItem) => {
    setMenuItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? item : i);
      return [...prev, item];
    });

    const { error } = await supabase.from('menu_items').upsert(item);
    if (error) {
      console.error('Error saving menu item:', error);
      toast.error('Gagal simpan ke database');
    }
  };

  const deleteMenuItemItem = async (id: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) toast.error('Gagal padam menu');
  };

  const updateOrderStatus = async (id: string, status: 'completed' | 'cancelled') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const deleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await supabase.from('orders').delete().eq('id', id);
    toast.success('Rekod pesanan dipadam');
  };

  const seedDatabase = async () => {
    const { error } = await supabase.from('menu_items').insert(DEFAULT_MENU_ITEMS);
    if (error) toast.error('Gagal memuatkan default menu: ' + error.message);
    else toast.success('Default menu dimuatkan!');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    Storage.saveTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const login = (userData: User) => {
    setUser(userData);
    Storage.saveUser(userData);
    setCurrentView(userData.role === 'admin' ? 'seller' : 'customer');
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    Storage.saveUser(null);
    setCurrentView('login');
    setCart([]);
    toast('Logged out successfully', { icon: '👋' });
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        toast.success(`Updated ${item.name}`);
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`Added ${item.name}`);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  
  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (): Promise<Order | null> => {
    if (!user || cart.length === 0) return null;

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const total = subtotal + SERVICE_FEE;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName: user.name,
      customerPhone: user.phone || 'N/A',
      items: [...cart],
      subtotal,
      serviceFee: SERVICE_FEE,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const dbOrder = {
      id: newOrder.id,
      customer_name: newOrder.customerName,
      customer_phone: newOrder.customerPhone,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      service_fee: newOrder.serviceFee,
      total: newOrder.total,
      status: newOrder.status,
      created_at: newOrder.createdAt
    };

    // 1. Save to Database
    const { error } = await supabase.from('orders').insert(dbOrder);
    
    if (error) {
      console.error('Supabase Error:', error);
      toast.error(`Ralat Database: ${error.message}`);
      return null;
    }

    // 2. Third Party Integrations (Fire & Forget)
    // Wrap in try-catch blocks individually so one failure doesn't stop the flow
    
    // Google Sheets
    if (GOOGLE_SHEET_SCRIPT_URL && GOOGLE_SHEET_SCRIPT_URL.startsWith('https')) {
      try {
        const params = new URLSearchParams();
        params.append('order_id', newOrder.id);
        params.append('date', new Date(newOrder.createdAt).toLocaleString('ms-MY'));
        params.append('customer_name', newOrder.customerName);
        params.append('customer_phone', newOrder.customerPhone);
        params.append('items', newOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', '));
        params.append('total', newOrder.total.toFixed(2));
        params.append('status', newOrder.status);

        fetch(GOOGLE_SHEET_SCRIPT_URL, {
          method: 'POST',
          body: params,
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(e => console.warn('Google Sheet Sync Failed (Network)', e));
      } catch (e) { console.warn('Google Sheet Config Error', e); }
    }

    // Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const itemsList = newOrder.items.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
        const text = `🚨 *PESANAN BARU*\n🆔 \`${newOrder.id}\`\n👤 ${newOrder.customerName}\n📞 ${newOrder.customerPhone}\n\n🛒 *Item:*\n${itemsList}\n\n💰 *Total: RM ${newOrder.total.toFixed(2)}*`;

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
        }).catch(e => console.warn('Telegram Sync Failed', e));
      } catch (e) { console.warn('Telegram Config Error', e); }
    }

    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, setMenuItems, saveMenuItem, deleteMenuItemItem,
      orders, setOrders, updateOrderStatus, deleteOrder,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      theme, toggleTheme,
      currentView, setCurrentView,
      isLoading, seedDatabase
    }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }
      }} />
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
