import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, ShoppingBag, Utensils, LogOut, Moon, Sun, Plus, Pencil, Trash2, Check, X, Image as ImageIcon, Upload } from 'lucide-react';
import { MenuItem } from '../types';
import toast from 'react-hot-toast';

export const SellerView: React.FC = () => {
  const { orders, menuItems, saveMenuItem, deleteMenuItemItem, updateOrderStatus, theme, toggleTheme, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu'>('dashboard');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Chart Data
  const salesData = orders.reduce((acc: any[], order) => {
    if (order.status !== 'completed') return acc;
    const date = new Date(order.createdAt).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.sales += order.total;
    } else {
      acc.push({ date, sales: order.total });
    }
    return acc;
  }, []).slice(-7);

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);

    let itemToSave: MenuItem;

    if (editingItem.id) {
      // Edit
      itemToSave = { ...editingItem } as MenuItem;
    } else {
      // Add
      itemToSave = {
        ...editingItem,
        id: `custom_${Date.now()}`, // Simple ID generation
        available: true,
        rating: 5.0
      } as MenuItem;
    }

    await saveMenuItem(itemToSave);
    setIsSaving(false);
    setEditingItem(null);
    toast.success('Menu saved to Database');
  };

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItemItem(id);
      toast.success('Item deleted');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 350KB to safely store in Text Column
      if (file.size > 350 * 1024) {
        toast.error('File terlalu besar! Sila guna gambar < 350KB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem(prev => prev ? ({ ...prev, image: reader.result as string }) : null);
        toast.success('Gambar berjaya dimuat naik');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-surface border-r dark:border-slate-800 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b dark:border-slate-800">
          <h1 className="text-xl font-black text-primary truncate">FoodieQ By CheGu Faira <span className="text-slate-400 text-sm font-normal block">Admin</span></h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: pendingOrders.length },
            { id: 'menu', icon: <Utensils size={20} />, label: 'Menu Management' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-orange-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">{item.icon} {item.label}</div>
              {item.badge ? <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} Theme
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-black dark:text-white">Dashboard Overview</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-3xl">
                <p className="text-orange-800 dark:text-orange-300 font-bold mb-2">Pending Orders</p>
                <p className="text-4xl font-black text-orange-900 dark:text-orange-100">{pendingOrders.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-3xl">
                <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-2">Completed Orders</p>
                <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{completedOrders.length}</p>
              </div>
              <div className="bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/20 dark:to-violet-800/20 p-6 rounded-3xl">
                <p className="text-violet-800 dark:text-violet-300 font-bold mb-2">Total Revenue</p>
                <p className="text-4xl font-black text-violet-900 dark:text-violet-100">RM {totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Revenue Analytics</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="sales" fill="#ff6b35" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black mb-8 dark:text-white">Order Management</h2>
            <div className="space-y-4">
              {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                <div key={order.id} className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-slate-400 text-sm">#{order.id.slice(-6)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="font-bold text-lg dark:text-white">{order.customerName} <span className="text-slate-400 font-normal text-sm">({order.customerPhone})</span></h3>
                    <div className="mt-2 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-600 dark:text-slate-300">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-2xl font-black text-primary">RM {order.total.toFixed(2)}</p>
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="danger" className="py-2 px-4 text-sm" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</Button>
                        <Button className="py-2 px-4 text-sm bg-green-500 hover:bg-green-600" onClick={() => updateOrderStatus(order.id, 'completed')}>Complete</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black dark:text-white">Menu Items</h2>
              <Button onClick={() => setEditingItem({})} icon={<Plus />}>Add New Item</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm relative group overflow-hidden">
                  <div className="text-center mb-4">
                    <div className="h-40 w-full flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-8xl select-none">{item.image}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg dark:text-white truncate">{item.name}</h3>
                    <p className="text-slate-500 text-sm">{item.category}</p>
                  </div>
                  <div className="flex justify-between items-center border-t dark:border-slate-700 pt-4 mt-4">
                    <span className="font-bold text-primary">RM {item.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingItem(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDeleteMenu(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {!item.available && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">Unavailable</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Menu Editing */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black mb-6 dark:text-white">{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
              <form onSubmit={handleSaveMenu} className="space-y-4">
                <Input label="Name" required value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price" type="number" step="0.01" required value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
                  <Input label="Category" required value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Menu Image (3D / Realistic)
                  </label>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input 
                        placeholder="https://... or 🍔"
                        value={editingItem.image || ''} 
                        onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} 
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label 
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl cursor-pointer font-bold text-sm transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <Upload size={18} /> Upload
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Info: Sila muat naik gambar &lt; 350KB (PNG Transparan) untuk mengelakkan aplikasi menjadi berat.
                  </p>

                  {(editingItem.image && (editingItem.image.startsWith('http') || editingItem.image.startsWith('data:'))) && (
                    <div className="relative group w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <div className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{
                          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                      ></div>
                      <img src={editingItem.image} alt="Preview" className="h-full object-contain relative z-10 animate-float" />
                      <button 
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, image: '' })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <Input label="Calories" type="number" required value={editingItem.calories || ''} onChange={e => setEditingItem({ ...editingItem, calories: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-primary" 
                    rows={3}
                    required
                    value={editingItem.description || ''}
                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditingItem(null)}>Cancel</Button>
                  <Button type="submit" isLoading={isSaving} className="flex-1">Save Item</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};