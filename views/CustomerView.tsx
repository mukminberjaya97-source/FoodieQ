import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { CartDrawer } from '../components/CartDrawer';
import { AROverlay } from '../components/AROverlay';
import { ShoppingCart, Search, Menu, Sun, Moon, LogOut, ClipboardList, Eye, CheckCircle, Download, Send } from 'lucide-react';
import { MenuItem, Order } from '../types';
import { jsPDF } from "jspdf";
import { ADMIN_PHONE } from '../constants';
import toast from 'react-hot-toast';

export const CustomerView: React.FC = () => {
  const { user, menuItems, cart, addToCart, removeFromCart, updateCartQuantity, placeOrder, theme, toggleTheme, logout, setCurrentView } = useApp();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [arItem, setArItem] = useState<MenuItem | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    setIsOrdering(true);
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const order = await placeOrder();
    setIsOrdering(false);
    
    if (order) {
      setIsCartOpen(false);
      setSuccessOrder(order);
      // Optional: Auto trigger WhatsApp or Notification here if allowed
      toast.success('Pesanan Berjaya! Sila muat turun resit.');
    } else {
      toast.error('Gagal membuat pesanan. Sila cuba lagi.');
    }
  };

  const generateReceipt = () => {
    if (!successOrder) return;
    
    const doc = new jsPDF();
    const order = successOrder;
    const lineHeight = 10;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(255, 107, 53); // Primary Color
    doc.text("FoodieQ By CheGu Faira", 105, y, { align: "center" });
    y += lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Resit Pesanan Rasmi", 105, y, { align: "center" });
    y += lineHeight * 2;

    // Order Details
    doc.setFontSize(10);
    doc.text(`No. Order: ${order.id}`, 20, y);
    doc.text(`Tarikh: ${new Date(order.createdAt).toLocaleString('ms-MY')}`, 130, y);
    y += lineHeight;
    doc.text(`Pelanggan: ${order.customerName}`, 20, y);
    doc.text(`No. Tel: ${order.customerPhone}`, 130, y);
    y += lineHeight * 1.5;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y - 5, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Item", 25, y);
    doc.text("Kuantiti", 120, y);
    doc.text("Harga (RM)", 160, y);
    y += lineHeight * 1.5;

    // Items
    doc.setFont("helvetica", "normal");
    order.items.forEach(item => {
      const title = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      doc.text(title, 25, y);
      doc.text(item.quantity.toString(), 125, y, { align: 'center' });
      doc.text((item.price * item.quantity).toFixed(2), 180, y, { align: 'right' });
      y += lineHeight;
    });

    y += 5;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += lineHeight;

    // Totals
    doc.text("Subtotal:", 140, y);
    doc.text(order.subtotal.toFixed(2), 180, y, { align: 'right' });
    y += lineHeight;
    
    doc.text("Caj Perkhidmatan:", 140, y);
    doc.text(order.serviceFee.toFixed(2), 180, y, { align: 'right' });
    y += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 107, 53);
    doc.text("JUMLAH:", 140, y + 2);
    doc.text(`RM ${order.total.toFixed(2)}`, 180, y + 2, { align: 'right' });

    // Footer
    y += lineHeight * 4;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    doc.text("Terima kasih kerana memesan dengan FoodieQ By CheGu Faira!", 105, y, { align: "center" });
    doc.text("Simpan resit ini untuk rujukan.", 105, y + 6, { align: "center" });

    doc.save(`Resit-FoodieQ-${order.id}.pdf`);
    toast.success("Resit berjaya dimuat turun!");
  };

  const sendWhatsApp = () => {
    if (!successOrder) return;
    
    const itemsList = successOrder.items
      .map(item => `• ${item.name} (x${item.quantity}) - RM${(item.price * item.quantity).toFixed(2)}`)
      .join('%0A');

    const message = `*Pesanan Baru FoodieQ By CheGu Faira!* 🍽️%0A%0A` +
      `*ID Order:* ${successOrder.id}%0A` +
      `*Nama:* ${successOrder.customerName}%0A` +
      `*No. Tel:* ${successOrder.customerPhone}%0A` +
      `*Masa:* ${new Date(successOrder.createdAt).toLocaleString('ms-MY')}%0A%0A` +
      `*Senarai Pesanan:*%0A${itemsList}%0A%0A` +
      `*Jumlah Besar: RM ${successOrder.total.toFixed(2)}*%0A%0A` +
      `Sila proses pesanan ini secepat mungkin. Terima kasih!`;

    const url = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
    window.open(url, '_blank');
    toast.success("Membuka WhatsApp...");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden">
              <Menu size={24} className="dark:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">FoodieQ By CheGu Faira</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Order fresh, eat fresh.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-primary to-[#f5576c] text-white shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-transform"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-surface z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
        <div className="p-6 border-b dark:border-slate-700">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-bold dark:text-white">{user?.name}</h3>
          <p className="text-sm text-slate-500">{user?.phone}</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => { setCurrentView('my-orders'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            <ClipboardList size={20} /> My Orders
          </button>
        </nav>
        <div className="p-4 border-t dark:border-slate-700">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search menu..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white dark:bg-dark-surface shadow-sm focus:ring-2 focus:ring-primary dark:text-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No items found</h3>
            <p className="text-slate-500">Try searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="group bg-white dark:bg-dark-surface rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col"
                onClick={() => setArItem(item)}
              >
                {!item.available && (
                  <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold z-20">
                    Out of Stock
                  </div>
                )}
                
                <div className="text-center mb-6 relative z-10 flex-1 flex flex-col items-center justify-center min-h-[160px]">
                  <div className="relative w-full h-40 flex items-center justify-center">
                    {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-8xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg select-none">
                        {item.image}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-0 left-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm z-20">
                    ⭐ {item.rating}
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl font-bold dark:text-white mb-1 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate">{item.category}</p>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 min-h-[2.5em]">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-black text-primary">RM {item.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setArItem(item); }}
                        className="p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        disabled={!item.available}
                        className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        isLoading={isOrdering}
      />

      {/* AR Overlay */}
      {arItem && (
        <AROverlay 
          item={arItem} 
          onClose={() => setArItem(null)} 
          onAddToCart={addToCart} 
        />
      )}

      {/* Success Modal */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            
            <h2 className="text-2xl font-black dark:text-white mb-2">Pesanan Berjaya!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Terima kasih, {successOrder.customerName}. Pesanan anda sedang diproses.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left">
              <div className="flex justify-between text-sm mb-2 dark:text-slate-300">
                <span>Order ID:</span>
                <span className="font-mono font-bold">{successOrder.id}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 dark:text-slate-300">
                <span>Jumlah Item:</span>
                <span className="font-bold">{successOrder.items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-primary border-t dark:border-slate-700 pt-2 mt-2">
                <span>Total:</span>
                <span>RM {successOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={generateReceipt} className="w-full bg-slate-800 hover:bg-slate-900" icon={<Download size={18} />}>
                Muat Turun Resit (PDF)
              </Button>
              
              <Button onClick={sendWhatsApp} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-green-500/20" icon={<Send size={18} />}>
                Hantar Pesanan WhatsApp
              </Button>

              <button 
                onClick={() => setSuccessOrder(null)}
                className="w-full py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
              >
                Tutup & Kembali ke Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};