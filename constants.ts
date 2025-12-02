import { MenuItem } from './types';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Nasi Goreng Special', category: 'Hidangan Utama', price: 12, rating: 4.8, image: '🍛', dietary: 'Tidak Vegetarian', available: true, calories: 450, description: 'Nasi goreng istimewa dengan ayam, telur, dan sayuran segar' },
  { id: 'm2', name: 'Mee Ayam Premium', category: 'Hidangan Utama', price: 10, rating: 4.7, image: '🍜', dietary: 'Tidak Vegetarian', available: true, calories: 380, description: 'Mi lembut dengan ayam panggang dan sup berempah' },
  { id: 'm3', name: 'Satay Ayam', category: 'Hidangan Utama', price: 15, rating: 4.9, image: '🍢', dietary: 'Tidak Vegetarian', available: true, calories: 320, description: '10 cucuk satay ayam dengan kuah kacang dan nasi impit' },
  { id: 'm4', name: 'Gado-Gado', category: 'Salad', price: 8, rating: 4.6, image: '🥗', dietary: 'Vegetarian', available: true, calories: 250, description: 'Salad sayuran Indonesia dengan kuah kacang creamy' },
  { id: 'm5', name: 'Bakso Jumbo', category: 'Sup', price: 11, rating: 4.8, image: '🍲', dietary: 'Tidak Vegetarian', available: true, calories: 420, description: 'Bebola daging jumbo dalam sup panas dengan mi kuning' },
  { id: 'm6', name: 'Es Teler', category: 'Minuman', price: 6, rating: 4.5, image: '🥤', dietary: 'Vegetarian', available: true, calories: 180, description: 'Minuman sejuk dengan buah-buahan segar dan santan' }
];

export const SERVICE_FEE = 2;

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Nombor telefon admin untuk WhatsApp (Format: 601xxxxxxxx)
export const ADMIN_PHONE = '601161042940';

// ------------------------------------------------------------------
// PENTING: Masukkan URL Web App Google Apps Script anda di bawah ini
// ------------------------------------------------------------------
export const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGxT66xXu_BTYmieu4gjXyVjEqYeSgZPxDwLNK_1l3WqcBjIVUxvxQD0SVZtZemDwL/exec";

// ------------------------------------------------------------------
// TELEGRAM CONFIGURATION
// ------------------------------------------------------------------
export const TELEGRAM_BOT_TOKEN = ""; // Contoh: 7033766890:AAH...
export const TELEGRAM_CHAT_ID = "";   // Contoh: 123456789