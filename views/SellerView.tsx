
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, ShoppingBag, Utensils, LogOut, Moon, Sun, Plus, Pencil, Trash2, Check, X, Upload, ChevronRight, TrendingUp, Users, DollarSign } from 'lucide-react';
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

  const salesData = orders.reduce((acc: any[], order) => {
    if (order.status !== 'completed') return acc;
    const date = new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short' });
    const existing = acc.find(d => d.date === date);
    if (existing) existing.sales += order.total;
    else acc.push({ date, sales: order.total });
    return acc;
  }, []).slice(-7);

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    let itemToSave: MenuItem = editingItem.id 
      ? { ...editingItem } as MenuItem 
      : { ...editingItem, id: `custom_${Date.now()}`, available: true, rating: 5.0 } as MenuItem;
    
    await saveMenuItem(itemToSave);
    setIsSaving(false);
    setEditingItem(null);
    toast.success('Menu saved successfully');
  };

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Delete this item?')) {
      await deleteMenuItemItem(id);
      toast.success('Item deleted');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 350 * 1024) { toast.error('Image must be < 350KB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setEditingItem(prev => prev ? ({ ...prev, image: reader.result as string }) : null);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b dark:border-slate-800">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">Q</div>
          <span className="font-black text-xl hidden lg:block dark:text-white">Admin</span>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 mt-4">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: pendingOrders.length },
            { id: 'menu', icon: <Utensils size={20} />, label: 'Menu' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-center lg:justify-between px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium hidden lg:block">{item.label}</span>
              </div>
              {item.badge ? <span className="hidden lg:flex bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{item.badge}</span> : null}
              
              {/* Tooltip for collapsed sidebar */}
              <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} <span className="hidden lg:inline">Theme</span>
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <LogOut size={20} /> <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
           <div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
               {activeTab === 'dashboard' ? 'Overview' : activeTab === 'orders' ? 'Orders' : 'Menu Management'}
             </h1>
             <p className="text-slate-500 text-sm">Welcome back, Admin.</p>
           </div>
           {activeTab === 'menu' && (
             <Button onClick={() => setEditingItem({})} icon={<Plus size={18} />}>New Item</Button>
           )}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pending Orders', val: pendingOrders.length, color: 'bg-orange-500', icon: <ShoppingBag /> },
                { label: 'Completed', val: completedOrders.length, color: 'bg-emerald-500', icon: <Check /> },
                { label: 'Revenue', val: `RM ${totalRevenue.toFixed(2)}`, color: 'bg-violet-500', icon: <DollarSign /> },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
                   <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color} rounded-bl-3xl`}>
                      {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 64 })}
                   </div>
                   <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {stat.icon}
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</h3>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2"><TrendingUp size={20} className="text-primary"/> Sales Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="sales" fill="#ff6b35" radius={[6, 6, 6, 6]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid gap-4 animate-slide-up">
            {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">#{order.id.slice(-6)}</span>
                    <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h3 className="font-bold text-lg dark:text-white mb-1">{order.customerName}</h3>
                  <div className="text-sm text-slate-500">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                     <p className="text-xs text-slate-400 font-medium uppercase">Total</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white">RM {order.total.toFixed(2)}</p>
                   </div>
                   
                   {order.status === 'pending' ? (
                     <div className="flex gap-2">
                       <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><X size={20}/></button>
                       <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all"><Check size={20}/></button>
                     </div>
                   ) : (
                     <span className={`px-4 py-2 rounded-xl text-sm font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {order.status}
                     </span>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group relative">
                <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                   {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                      <img src={item.image} alt={item.name} className="h-32 object-contain group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-6xl">{item.image}</span>
                    )}
                </div>
                <h3 className="font-bold dark:text-white truncate">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{item.category}</p>
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white">RM {item.price.toFixed(2)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingItem(item)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 hover:text-primary"><Pencil size={16}/></button>
                    <button onClick={() => handleDeleteMenu(item.id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 hover:bg-red-100"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-scale-in">
              <h3 className="text-2xl font-black mb-6 dark:text-white">Product Details</h3>
              <form onSubmit={handleSaveMenu} className="space-y-4">
                 <Input label="Name" required value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                 <div className="grid grid-cols-2 gap-4">
                   <Input label="Price (RM)" type="number" step="0.01" value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
                   <Input label="Category" value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} />
                 </div>
                 
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                          {editingItem.image ? (
                             (editingItem.image.startsWith('http') || editingItem.image.startsWith('data:')) ? 
                             <img src={editingItem.image} className="w-full h-full object-cover" /> : <span className="text-2xl">{editingItem.image}</span>
                          ) : <Upload size={20} className="text-slate-400" />}
                       </div>
                       <div className="flex-1">
                          <label className="block text-sm font-bold mb-1 dark:text-white">Product Image</label>
                          <div className="flex gap-2">
                             <label className="cursor-pointer text-xs bg-slate-900 text-white px-3 py-2 rounded-lg font-bold">
                                Upload Photo
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                             </label>
                             <input type="text" placeholder="Or paste URL/Emoji" className="flex-1 text-xs bg-transparent border-b border-slate-300 focus:outline-none" value={editingItem.image || ''} onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setEditingItem(null)} className="flex-1">Cancel</Button>
                    <Button type="submit" isLoading={isSaving} className="flex-1">Save Changes</Button>
                 </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
