import React from 'react';
import { MenuItem } from '../types';
import { Button } from './ui/Button';
import { X, Star, Flame } from 'lucide-react';

interface AROverlayProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const AROverlay: React.FC<AROverlayProps> = ({ item, onClose, onAddToCart }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-950 animate-fade-in flex flex-col items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* 3D Item (Emoji or Image) */}
      <div className="relative z-10 animate-float flex justify-center items-center drop-shadow-2xl select-none">
        {(item.image.startsWith('http') || item.image.startsWith('data:')) ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="max-h-[50vh] max-w-[90vw] object-contain"
          />
        ) : (
          <div className="text-[180px] md:text-[220px]">{item.image}</div>
        )}
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-8 md:bottom-auto md:top-8 md:left-8 w-[90%] md:w-80 bg-black/60 backdrop-blur-xl border border-purple-500/30 p-6 rounded-3xl text-white z-20 animate-scale-in">
        <h3 className="text-2xl font-black mb-2">{item.name}</h3>
        <p className="text-xl font-bold text-[#ff6b35] mb-3">RM {item.price.toFixed(2)}</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
            <Flame size={14} /> {item.calories} cal
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold">
            <Star size={14} fill="currentColor" /> {item.rating}
          </span>
        </div>

        <Button 
          variant="primary" 
          className="w-full"
          onClick={() => {
            onAddToCart(item);
            onClose();
          }}
        >
          🛒 Add to Cart
        </Button>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/40 hover:scale-110 transition-all z-30 backdrop-blur-sm"
      >
        <X size={24} />
      </button>
    </div>
  );
};