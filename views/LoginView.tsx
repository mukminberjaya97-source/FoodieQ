
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { ADMIN_CREDENTIALS } from '../constants';
import { Utensils, ShieldCheck, User as UserIcon, ArrowLeft, ChefHat } from 'lucide-react';

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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#FFF8F0] dark:bg-[#0B1120]">
      {/* Appetizing Warm Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob dark:opacity-20 dark:bg-orange-900"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 dark:opacity-20 dark:bg-yellow-900"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 dark:opacity-20 dark:bg-red-900"></div>

      <div className="relative z-10 w-full max-w-md">
        {mode === 'selection' ? (
          <div className="glass rounded-[2.5rem] p-8 md:p-12 text-center animate-scale-in border border-white/60 shadow-2xl shadow-orange-500/10">
            <div className="mb-8 flex justify-center">
              <div className="w-28 h-28 bg-gradient-to-tr from-[#ff6b35] to-[#ff9f43] rounded-[2rem] flex items-center justify-center shadow-xl shadow-orange-500/30 transform rotate-6 hover:rotate-12 transition-transform duration-500">
                <ChefHat size={56} className="text-white drop-shadow-md" />
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight leading-none">
              Foodie<span className="text-[#ff6b35]">Q</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-12 font-bold tracking-wide uppercase text-xs">By CheGu Faira</p>

            <div className="space-y-4">
              <button 
                onClick={() => setMode('customer')}
                className="w-full group relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-white p-5 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <UserIcon className="text-white dark:text-slate-900" size={24} />
                  <span className="font-bold text-lg text-white dark:text-slate-900">Pelanggan</span>
                </div>
              </button>

              <button 
                onClick={() => setMode('admin')}
                className="w-full group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 p-5 transition-all hover:bg-white dark:hover:bg-slate-800"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <ShieldCheck className="text-slate-600 dark:text-slate-300" size={24} />
                  <span className="font-bold text-lg text-slate-600 dark:text-slate-300">Admin</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-[2.5rem] p-8 md:p-12 animate-fade-in border border-white/60 shadow-2xl">
            <button 
              onClick={() => setMode('selection')}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#ff6b35] mb-8 transition-colors"
            >
              <ArrowLeft size={20} /> Kembali
            </button>

            <div className="text-left mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {mode === 'admin' ? 'Akses Admin' : 'Selamat Datang!'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {mode === 'admin' ? 'Log masuk untuk menguruskan kedai.' : 'Masukkan butiran untuk mula memesan.'}
              </p>
            </div>

            {mode === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <Input 
                  label="Username" 
                  placeholder="admin" 
                  className="bg-white/50 dark:bg-slate-900/50"
                  value={adminUser} 
                  onChange={e => setAdminUser(e.target.value)} 
                />
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••" 
                  className="bg-white/50 dark:bg-slate-900/50"
                  value={adminPass} 
                  onChange={e => setAdminPass(e.target.value)} 
                />
                <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-orange-500/30 rounded-2xl">
                  Log Masuk
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCustomerLogin} className="space-y-5">
                <Input 
                  label="Nama Anda" 
                  placeholder="Contoh: Ahmad Ali" 
                  required 
                  className="bg-white/50 dark:bg-slate-900/50"
                  value={custName} 
                  onChange={e => setCustName(e.target.value)} 
                />
                <Input 
                  label="Nombor Telefon" 
                  placeholder="012-345-6789" 
                  type="tel" 
                  required 
                  className="bg-white/50 dark:bg-slate-900/50"
                  value={custPhone} 
                  onChange={e => setCustPhone(e.target.value)} 
                />
                <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-orange-500/30 rounded-2xl">
                  Mula Pesan Makan 🍔
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
