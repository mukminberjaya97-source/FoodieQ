import React from 'react';
import { CartItem } from '../types';
import { Button } from './ui/Button';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { SERVICE_FEE } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onCheckout,
  isLoading = false
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (items.length > 0 ? SERVICE_FEE : 0);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-dark-bg shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-primary" /> Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <ShoppingCart size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some delicious food!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-dark-surface rounded-2xl animate-scale-in items-center">
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
                   {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl select-none">{item.image}</span>
                    )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold dark:text-white mb-1">{item.name}</h4>
                  <p className="text-primary font-bold text-sm mb-2">RM {item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-1 border dark:border-slate-700">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <Minus size={14} className="dark:text-white" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <Plus size={14} className="dark:text-white" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-dark-surface/50">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold">RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Service Fee</span>
                <span className="font-bold">RM {SERVICE_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white pt-4 border-t dark:border-slate-700">
                <span>Total</span>
                <span className="text-primary">RM {total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={onCheckout} 
              isLoading={isLoading}
              className="w-full text-lg py-4"
            >
              Checkout Now
            </Button>
          </div>
        )}
      </div>
    </>
  );
};