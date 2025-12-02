
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { CartDrawer } from '../components/CartDrawer';
import { AROverlay } from '../components/AROverlay';
import { ShoppingCart, Search, Menu, Sun, Moon, LogOut, ClipboardList, CheckCircle, Download, Send, Star, Flame, ChevronRight } from 'lucide-react';
import { MenuItem, Order } from '../types';
import { jsPDF } from "jspdf";
import { ADMIN_PHONE } from '../constants';
import toast from 'react-hot-toast';

export const CustomerView: React.FC = () => {
  const { user, menuItems, cart, addToCart, removeFromCart, updateCartQuantity, placeOrder, theme, toggleTheme, logout, setCurrentView } = useApp();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [arItem, setArItem] = useState<MenuItem | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [greeting, setGreeting] = useState('Welcome');

  // Time based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 18) setGreeting('Selamat Petang');
    else setGreeting('Selamat Malam');
  }, []);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    setIsOrdering(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const order = await placeOrder();
    setIsOrdering(false);
    
    if (order) {
      setIsCartOpen(false);
      setSuccessOrder(order);
      toast.success('Pesanan Berjaya!');
    } else {
      toast.error('Gagal membuat pesanan.');
    }
  };

  const generateReceipt = () => {
    if (!successOrder) return;
    const doc = new jsPDF();
    const order = successOrder;
    let y = 20;

    doc.setFontSize(20);
    doc.setTextColor(255, 84, 48); // Foodie Orange
    doc.text("FoodieQ By CheGu Faira", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Resit Rasmi", 105, y, { align: "center" });
    doc.text(`ID: ${order.id}`, 105, y + 5, { align: "center" });
    
    // ... Simplified receipt logic ...
    doc.save(`Resit-${order.id}.pdf`);
  };

  const sendWhatsApp = () => {
    if (!successOrder) return;
    const itemsList = successOrder.items.map(item => `• ${item.name} (x${item.quantity})`).join('%0A');
    const message = `*Pesanan Baru FoodieQ*%0A%0A*ID:* ${successOrder.id}%0A*Nama:* ${successOrder.customerName}%0A%0A*Senarai Item:*%0A${itemsList}%0A%0A*Jumlah:* RM ${successOrder.total.toFixed(2)}`;
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg pb-24 md:pb-0 transition-colors duration-500">
      
      {/* Modern Glass Header */}
      <header className="sticky top-0 z-40 glass border-b-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-primary to-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/30 transform rotate-3">
               Q
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{greeting},</p>
               <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</h1>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-orange-100 dark:hover:bg-white/10 text-slate-600 dark:text-secondary transition-colors">
              {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-full hover:bg-orange-100 dark:hover:bg-white/10 lg:hidden">
              <Menu size={20} className="dark:text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        
        {/* APPETIZING HERO BANNER */}
        <div className="relative w-full rounded-[2rem] overflow-hidden mb-8 shadow-2xl shadow-orange-500/20 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF5430] via-[#FF7D54] to-[#FF4757] animate-pulse-slow"></div>
          
          {/* Decorative Circles */}
          <div className="absolute top-[-50%] left-[-20%] w-full h-full border-[20px] border-white/10 rounded-full"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-full h-full border-[40px] border-white/10 rounded-full"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-10 text-white h-full min-h-[220px]">
            <div className="md:w-1/2 mb-6 md:mb-0 z-10">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/30 text-yellow-100">
                🔥 Hot & Fresh
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-sm">
                Lapar? <br/>
                <span className="text-yellow-200">Jom Makan!</span>
              </h2>
              <p className="text-white/90 font-medium text-sm md:text-base mb-6 max-w-xs">
                Nikmati hidangan kegemaran anda yang disediakan dengan penuh kasih sayang.
              </p>
            </div>
            
            {/* 3D Floating Food Illustration */}
            <div className="absolute right-[-20px] bottom-[-30px] md:right-10 md:bottom-[-40px] transform md:rotate-[-10deg] transition-transform duration-700 group-hover:scale-105 group-hover:rotate-0 select-none pointer-events-none">
               <span className="text-[160px] md:text-[220px] drop-shadow-2xl filter brightness-110">🍔</span>
               <span className="absolute top-0 right-[-40px] text-[80px] animate-bounce delay-700 drop-shadow-lg">🍟</span>
               <span className="absolute bottom-[20px] left-[-40px] text-[80px] animate-pulse delay-1000 drop-shadow-lg">🥤</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group z-20">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={20} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Cari nasi goreng, mee..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-dark-surface border-2 border-slate-100 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-0 focus:border-primary transition-all dark:text-white font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform border ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-105 border-primary' 
                  : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="group bg-white dark:bg-dark-surface rounded-[2rem] p-4 hover:shadow-[0_20px_50px_-12px_rgba(254,84,48,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer border border-slate-100 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/50 relative flex flex-col"
              onClick={() => setArItem(item)}
            >
              {/* Image Section - Pops out on hover */}
              <div className="h-48 w-full flex items-center justify-center mb-4 relative bg-cream dark:bg-[#1A1513] rounded-[1.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 transition-transform duration-500 transform group-hover:scale-110 group-hover:-translate-y-2">
                   {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                      <img src={item.image} alt={item.name} className="h-40 w-full object-contain drop-shadow-2xl" />
                    ) : (
                      <span className="text-[100px] drop-shadow-xl filter brightness-110">{item.image}</span>
                    )}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 border border-white/20">
                   <Star size={12} className="text-yellow-500" fill="currentColor" />
                   <span className="text-slate-800 dark:text-white">{item.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="px-1 flex-1 flex flex-col">
                <div className="mb-auto">
                   <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-primary">{item.category}</p>
                      {item.calories && (
                         <div className="flex items-center gap-1 text-[10px] text-slate-400">
                           <Flame size={10} strokeWidth={2.5} /> {item.calories}
                         </div>
                      )}
                   </div>
                   <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-2 line-clamp-2">{item.name}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                     <span className="text-xs text-slate-400 font-medium line-through">RM {(item.price * 1.2).toFixed(2)}</span>
                     <span className="text-xl font-black text-slate-900 dark:text-white">
                        <span className="text-sm font-bold text-primary align-top mr-0.5">RM</span>
                        {item.price.toFixed(2)}
                     </span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    disabled={!item.available}
                    className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-primary dark:group-hover:bg-primary group-hover:text-white dark:group-hover:text-white"
                  >
                    <ShoppingCart size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-28"></div> {/* Spacer for FAB */}
      </main>

      {/* Floating Action Button (Cart) - Appetizing Style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
        <button 
          onClick={() => setIsCartOpen(true)}
          className={`w-full glass bg-slate-900/95 dark:bg-primary/95 backdrop-blur-xl text-white p-2 pr-4 rounded-[1.5rem] flex items-center justify-between shadow-2xl shadow-slate-900/30 border border-white/10 transition-transform ${cartItemCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} duration-500`}
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-slate-900">
                  {cartItemCount}
                </span>
             </div>
             <div className="text-left">
                <p className="text-xs text-white/70 font-medium">Total (termasuk caj)</p>
                <p className="font-bold text-lg leading-none">RM {cart.reduce((s,i) => s + (i.price * i.quantity), 2).toFixed(2)}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 font-bold bg-white text-slate-900 px-4 py-2 rounded-xl text-sm hover:bg-orange-50 transition-colors">
             Lihat Troli <ChevronRight size={16} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* Sidebars and Modals */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-surface z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-slate-100 dark:border-white/5`}>
         <div className="p-8">
           <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner ring-4 ring-white dark:ring-white/5">👤</div>
           <h3 className="font-bold text-2xl dark:text-white leading-tight">{user?.name}</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">{user?.phone}</p>
           
           <nav className="space-y-2">
             <button onClick={() => { setCurrentView('my-orders'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-orange-50 dark:bg-white/5 text-primary dark:text-white font-bold hover:bg-orange-100 dark:hover:bg-white/10 transition-colors">
               <ClipboardList size={22} /> Pesanan Saya
             </button>
             <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold mt-4 transition-colors">
               <LogOut size={22} /> Log Keluar
             </button>
           </nav>
         </div>
         <div className="absolute top-0 right-0 p-4" onClick={() => setIsSidebarOpen(false)}></div>
      </aside>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        isLoading={isOrdering}
      />

      {arItem && <AROverlay item={arItem} onClose={() => setArItem(null)} onAddToCart={addToCart} />}

      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
          <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 w-full max-w-sm text-center relative overflow-hidden animate-scale-in shadow-2xl border border-white/20">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-orange-500"></div>
            
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 animate-bounce">
              <CheckCircle size={48} className="text-green-500" strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-black dark:text-white mb-2 tracking-tight">Terima Kasih!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Pesanan anda sedang disediakan dengan penuh kasih sayang.</p>
            
            <div className="space-y-3">
              <Button onClick={generateReceipt} className="w-full py-4 text-base rounded-2xl shadow-lg shadow-orange-500/20" icon={<Download size={20} />}>Muat Turun Resit</Button>
              <Button onClick={sendWhatsApp} variant="secondary" className="w-full py-4 text-base rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 dark:bg-[#25D366]/5 dark:border-[#25D366]/30" icon={<Send size={20} />}>Hantar Pesanan WhatsApp</Button>
              <button onClick={() => setSuccessOrder(null)} className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for FAB
function ChevronRight({ size, strokeWidth = 2 }: { size: number; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
