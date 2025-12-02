import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const { user, orders, setCurrentView } = useApp();
  
  const myOrders = orders.filter(o => 
    o.customerName === user?.name && o.customerPhone === user?.phone
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => setCurrentView('customer')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>

        <h1 className="text-3xl font-black mb-8 dark:text-white">My Orders</h1>

        {myOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-6">Start ordering delicious food!</p>
            <Button onClick={() => setCurrentView('customer')}>Go to Menu</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-mono text-xs text-slate-400">#{order.id}</span>
                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status === 'pending' && <Clock size={14} />}
                    {order.status === 'completed' && <CheckCircle size={14} />}
                    {order.status === 'cancelled' && <XCircle size={14} />}
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div className="border-t border-b dark:border-slate-700 py-4 my-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm dark:text-slate-300">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">RM {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Total Paid</span>
                  <span className="text-xl font-black text-primary">RM {order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
