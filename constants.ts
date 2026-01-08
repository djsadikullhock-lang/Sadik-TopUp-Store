
import { Product, Banner, StoreSettings } from './types';

export const ADMIN_EMAIL = 'sdsadikullhock@gmail.com';

export const DEFAULT_SETTINGS: StoreSettings = {
  noticeMarquee: 'সার্ভিস চালু: সকাল ৮ টা থেকে রাত ১১ টা পর্যন্ত। যে কোনো সমস্যায় হোয়াটসঅ্যাপে যোগাযোগ করুন।',
  isStoreOpen: true,
  supportWhatsApp: '8801401788594'
};

export const DEFAULT_BANNERS: Banner[] = [
  { 
    id: 'b1', 
    imageUrl: 'https://media.discordapp.net/attachments/1090433299447435345/1155160877864996914/Free_Fire.jpg' 
  }
];

export const CATEGORIES = [
  { 
    id: 'ff-bd', 
    name: 'Free Fire Diamond Top Up BD', 
    image: 'https://media.discordapp.net/attachments/1090433299447435345/1155160877864996914/Free_Fire.jpg',
    priceRange: '৳ 20 – ৳ 7,600',
    description: 'Free Fire Diamond Top Up Bangladesh Server only.'
  },
  { 
    id: 'ff-evo', 
    name: 'Free Fire Evo Access BD', 
    image: 'https://media.discordapp.net/attachments/1090433299447435345/1155160878179557457/Weekly.jpg',
    priceRange: '৳ 65 – ৳ 285',
    description: 'Free Fire Evo Access Pass buy in Bangladesh using bKash, Nagad, and Rocket.',
    bnDescription: 'ফ্রি ফায়ার ইভো এক্সেস শুধুমাত্র মাত্র বাংলাদেশ সার্ভার এর জন্য'
  },
  { 
    id: 'ff-weekly', 
    name: 'Free Fire Weekly Membership BD', 
    image: 'https://media.discordapp.net/attachments/1090433299447435345/1155160878179557457/Weekly.jpg',
    priceRange: '৳ 38 – ৳ 153'
  },
  { 
    id: 'ff-lvlup', 
    name: 'Free Fire Level Up Pass BD', 
    image: 'https://media.discordapp.net/attachments/1090433299447435345/1155160878431223908/LevelUp.jpg',
    priceRange: '৳ 35 – ৳ 360'
  }
];

export const PRODUCTS: Product[] = [
  // Diamond Packs
  { id: 'ff-25', name: '25 Diamonds', amount: 25, price: 20, image: '', category: 'diamonds' },
  { id: 'ff-50', name: '50 Diamonds', amount: 50, price: 35, image: '', category: 'diamonds' },
  { id: 'ff-100', name: '100 Diamonds', amount: 100, price: 70, image: '', category: 'diamonds' },
  { id: 'ff-115', name: '115 Diamonds', amount: 115, price: 76, image: '', category: 'diamonds' },
  { id: 'ff-200', name: '200 Diamonds', amount: 200, price: 140, image: '', category: 'diamonds' },
  { id: 'ff-505', name: '505 Diamonds', amount: 505, price: 325, image: '', category: 'diamonds' },
  { id: 'ff-10120', name: '10120 Diamonds', amount: 10120, price: 6080, image: '', category: 'diamonds' },
  
  // Evo Access
  { id: 'evo-3d', name: '3 Days', amount: 1, price: 65, image: '', category: 'membership', parentCategoryId: 'ff-evo' },
  { id: 'evo-7d', name: '7 Days', amount: 1, price: 95, image: '', category: 'membership', parentCategoryId: 'ff-evo' },
  { id: 'evo-30d', name: '30 Days', amount: 1, price: 285, image: '', category: 'membership', parentCategoryId: 'ff-evo' },
  
  // Other Memberships
  { id: 'weekly-mem', name: 'Weekly Membership', amount: 1, price: 153, image: '', category: 'membership', parentCategoryId: 'ff-weekly' },
  { id: 'monthly-mem', name: 'Monthly Membership', amount: 1, price: 760, image: '', category: 'membership' },
  { id: 'lvl-6', name: 'Level Up - 6 Level', amount: 1, price: 35, image: '', category: 'membership', parentCategoryId: 'ff-lvlup' },
  { id: 'lvl-all', name: 'Level Up All Package', amount: 1, price: 360, image: '', category: 'membership', parentCategoryId: 'ff-lvlup' },
];

export const PAYMENT_DETAILS = {
  bkash: {
    name: 'bKash (Personal)',
    number: '01401788594',
    instructions: 'Go to your bKash app, select "Send Money", enter our number, and pay the exact amount. Then copy the Transaction ID.'
  },
  nagad: {
    name: 'Nagad (Personal)',
    number: '01401788594',
    instructions: 'Use Nagad "Send Money" to our number. Enter amount and PIN. Paste the Transaction ID here after successful payment.'
  },
  rocket: {
    name: 'Rocket (Personal)',
    number: '01401788594',
    instructions: 'Send money to our Rocket number. Keep the 10-digit Transaction ID ready to submit.'
  }
};
