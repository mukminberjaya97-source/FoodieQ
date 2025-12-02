import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { ADMIN_CREDENTIALS } from '../constants';
import { Utensils, ShieldCheck, User as UserIcon, ArrowLeft } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [mode, setMode] = useState<'selection' | 'admin' | 'customer'>('selection');
  
  // Form States
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === ADMIN_CREDENTIALS.username && adminPass === ADMIN_CREDENTIALS.password) {
      login({ name: 'Admin', role: 'admin' });
    } else {
      alert('Invalid admin credentials');
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (custName && custPhone) {
      login({ name: custName, phone: custPhone, role: 'customer' });
    }
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-[#f5576c] flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 w-full max-w-lg shadow-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-orange-100 rounded-full">
              <Utensils size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">FoodieQ By CheGu Faira</h1>
          <p className="text-slate-500 mb-10 text-lg">Order first, skip the wait.</p>

          <div className="space-y-4">
            <Button 
              className="w-full text-lg py-5" 
              onClick={() => setMode('customer')}
              icon={<UserIcon />}
            >
              Login as Customer
            </Button>
            <Button 
              variant="secondary" 
              className="w-full text-lg py-5" 
              onClick={() => setMode('admin')}
              icon={<ShieldCheck />}
            >
              Admin Access
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-400">
            Demo: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 animate-scale-in ${mode === 'admin' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-cyan-500 to-blue-600'}`}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 w-full max-w-lg shadow-2xl">
        <button 
          onClick={() => setMode('selection')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h2 className="text-3xl font-black mb-8 dark:text-white flex items-center gap-3">
          {mode === 'admin' ? <ShieldCheck className="text-purple-500" /> : <UserIcon className="text-cyan-500" />}
          {mode === 'admin' ? 'Admin Login' : 'Customer Login'}
        </h2>

        {mode === 'admin' ? (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <Input label="Username" placeholder="admin" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
            <Button type="submit" className="w-full py-4 text-lg bg-slate-800 hover:bg-slate-900 text-white">Access Dashboard</Button>
          </form>
        ) : (
          <form onSubmit={handleCustomerLogin} className="space-y-6">
            <Input label="Your Name" placeholder="Ahmad bin Ali" required value={custName} onChange={e => setCustName(e.target.value)} />
            <Input label="Phone Number" placeholder="012-345-6789" type="tel" required value={custPhone} onChange={e => setCustPhone(e.target.value)} />
            <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600">Start Ordering</Button>
          </form>
        )}
      </div>
    </div>
  );
};