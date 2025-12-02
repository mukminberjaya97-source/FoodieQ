
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, ShoppingBag, Utensils, LogOut, Moon, Sun, Plus, Pencil, Trash2, Check, X, Upload, TrendingUp, DollarSign, Eye, Box, Image as ImageIcon } from 'lucide-react';
import { MenuItem } from '../types';
import toast from 'react-hot-toast';

export const SellerView: React.FC = () => {
  const { orders, menuItems, saveMenuItem, deleteMenuItemItem, updateOrderStatus, theme, toggleTheme, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu'>('dashboard');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFile = (file: File) => {
    if (file) {
      if (file.size > 350 * 1024) { toast.error('Image must be < 350KB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setEditingItem(prev => prev ? ({ ...prev, image: reader.result as string }) : null);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      toast.error('Please drop a valid image file');
    }
  };

  return (
    <div className="flex min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-white/5 flex flex-col fixed h-full z-20 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-100 dark:border-white/5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">Q</div>
          <span className="font-black text-xl hidden lg:block dark:text-white">Admin<span className="text-primary">.</span></span>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 mt-4">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
            { id: 'orders', icon: <ShoppingBag size={22} />, label: 'Orders', badge: pendingOrders.length },
            { id: 'menu', icon: <Utensils size={22} />, label: 'Menu' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-center lg:justify-between px-3 lg:px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-xl shadow-orange-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-bold text-sm hidden lg:block">{item.label}</span>
              </div>
              {item.badge ? <span className="hidden lg:flex bg-white text-primary px-2 py-0.5 rounded-full text-xs font-black shadow-sm">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} <span className="hidden lg:inline">Tema</span>
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-colors">
            <LogOut size={20} /> <span className="hidden lg:inline">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
           <div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
               {activeTab === 'dashboard' ? 'Overview' : activeTab === 'orders' ? 'Pesanan' : 'Urus Menu'}
             </h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Selamat datang kembali, Admin.</p>
           </div>
           {activeTab === 'menu' && (
             <Button onClick={() => setEditingItem({})} icon={<Plus size={18} strokeWidth={3} />}>Tambah Menu</Button>
           )}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pesanan Baru', val: pendingOrders.length, color: 'bg-orange-500', icon: <ShoppingBag /> },
                { label: 'Selesai', val: completedOrders.length, color: 'bg-emerald-500', icon: <Check /> },
                { label: 'Hasil Jualan', val: `RM ${totalRevenue.toFixed(2)}`, color: 'bg-violet-500', icon: <DollarSign /> },
              ].map((stat, i) => (
                <div key={i} className="glass-card bg-white/80 dark:bg-dark-surface rounded-[2rem] p-6 relative overflow-hidden group border border-white/20 dark:border-white/5 shadow-xl">
                   <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color} rounded-bl-3xl`}>
                      {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 80 })}
                   </div>
                   <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-${stat.color.replace('bg-','')}500/30`}>
                      {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24, strokeWidth: 2.5 })}
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1 uppercase tracking-wide">{stat.label}</p>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stat.val}</h3>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="glass-card bg-white dark:bg-dark-surface p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-lg">
              <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2"><TrendingUp size={20} className="text-primary"/> Trend Jualan</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} fontWeight={600} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontWeight={600} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#241B18', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="sales" fill="#FF5430" radius={[8, 8, 8, 8]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid gap-4 animate-slide-up">
            {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
              <div key={order.id} className="bg-white dark:bg-dark-surface p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5 hover:shadow-xl dark:hover:shadow-none transition-shadow flex flex-col md:flex-row gap-6 justify-between items-center group">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md font-bold">#{order.id.slice(-6)}</span>
                    <span className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h3 className="font-bold text-lg dark:text-white mb-1">{order.customerName}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jumlah</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white">RM {order.total.toFixed(2)}</p>
                   </div>
                   
                   {order.status === 'pending' ? (
                     <div className="flex gap-2">
                       <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"><X size={20} strokeWidth={3}/></button>
                       <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95"><Check size={20} strokeWidth={3}/></button>
                     </div>
                   ) : (
                     <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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
              <div key={item.id} className="bg-white dark:bg-dark-surface rounded-[2rem] p-4 border border-slate-100 dark:border-white/5 hover:border-primary/50 transition-colors group relative shadow-sm hover:shadow-xl dark:hover:shadow-none">
                <div className="h-40 bg-cream dark:bg-white/5 rounded-[1.5rem] mb-4 flex items-center justify-center overflow-hidden">
                   {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                      <img src={item.image} alt={item.name} className="h-32 object-contain group-hover:scale-110 transition-transform drop-shadow-lg" />
                    ) : (
                      <span className="text-6xl filter drop-shadow-md">{item.image}</span>
                    )}
                </div>
                <h3 className="font-bold dark:text-white truncate text-lg">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-4 font-medium">{item.category}</p>
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white text-lg">RM {item.price.toFixed(2)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingItem(item)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"><Pencil size={18}/></button>
                    <button onClick={() => handleDeleteMenu(item.id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-dark-surface rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl animate-scale-in border border-white/20 relative my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black dark:text-white">
                  {editingItem.id ? 'Edit Menu' : 'Tambah Menu Baru'}
                </h3>
                <button onClick={() => setEditingItem(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSaveMenu} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Left Column: Form Fields */}
                 <div className="space-y-4">
                    <Input label="Nama Menu" required value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Harga (RM)" type="number" step="0.01" value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
                      <Input label="Kategori" value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Kalori (kcal)" type="number" value={editingItem.calories || ''} onChange={e => setEditingItem({ ...editingItem, calories: parseFloat(e.target.value) })} />
                      <div className="flex flex-col">
                        <label className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Diet</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-dark-surface dark:text-white border-slate-200 dark:border-slate-700 focus:border-primary outline-none"
                          value={editingItem.dietary || 'Tidak Vegetarian'}
                          onChange={e => setEditingItem({...editingItem, dietary: e.target.value as any})}
                        >
                          <option value="Tidak Vegetarian">Tidak Vegetarian</option>
                          <option value="Vegetarian">Vegetarian</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Deskripsi</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-dark-surface dark:text-white border-slate-200 dark:border-slate-700 focus:border-primary outline-none resize-none h-24"
                        value={editingItem.description || ''}
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        placeholder="Contoh: Nasi lemak harum..."
                      ></textarea>
                    </div>
                 </div>

                 {/* Right Column: specialized AR Upload & Preview */}
                 <div className="space-y-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                         <Box size={16} /> 3D Image & AR Preview
                      </label>
                      
                      {/* Drag & Drop Zone */}
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative group h-32 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                          isDragging 
                            ? 'border-primary bg-primary/5 scale-[1.02]' 
                            : 'border-slate-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                         <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                         <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors">
                            <Upload size={32} className="mb-2" />
                            <p className="text-sm font-bold">Drop realistic 3D image here</p>
                            <p className="text-xs opacity-70">or click to upload (PNG/WebP transparent)</p>
                         </div>
                      </div>
                    </div>

                    {/* LIVE AR PREVIEW STAGE */}
                    <div className="relative w-full aspect-square rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden shadow-inner border border-slate-800">
                       <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-bold flex items-center gap-2">
                          <Eye size={12} /> AR Customer View
                       </div>
                       
                       {/* Grid Background */}
                       <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '40px 40px'}}></div>
                       
                       {/* Spotlight */}
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/20 to-transparent opacity-50 blur-2xl pointer-events-none"></div>

                       {/* The 3D Item */}
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="relative animate-float transition-all duration-500">
                             {(editingItem.image && (editingItem.image.startsWith('http') || editingItem.image.startsWith('data:'))) ? (
                                <img src={editingItem.image} className="max-w-[180px] max-h-[180px] object-contain drop-shadow-2xl animate-wiggle-slow" alt="Preview" />
                             ) : (
                                <span className="text-8xl filter drop-shadow-2xl animate-wiggle-slow">{editingItem.image || '❓'}</span>
                             )}
                             
                             {/* Dynamic Shadow */}
                             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/40 blur-xl rounded-[100%] animate-shadow-pulse"></div>
                          </div>
                       </div>
                       
                       {/* Manual Text Input Fallback */}
                       <div className="absolute bottom-4 left-4 right-4">
                          <div className="relative">
                            <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Paste URL or Emoji manually..." 
                              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md text-white placeholder-white/30 rounded-xl text-xs border border-white/10 focus:border-primary outline-none"
                              value={editingItem.image || ''}
                              onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                            />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="col-span-1 md:col-span-2 flex gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <Button type="button" variant="ghost" onClick={() => setEditingItem(null)} className="flex-1">Batal</Button>
                    <Button type="submit" isLoading={isSaving} className="flex-1 shadow-lg shadow-primary/30">Simpan Menu</Button>
                 </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
