
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

export interface Product {
  id: string;
  name: string;
  amount: number;
  price: number;
  image: string;
  category: 'diamonds' | 'membership';
  parentCategoryId?: string; // Links product to a visual category like ff-evo
}

export interface Order {
  id: string;
  playerId: string;
  productId: string;
  productName: string;
  price: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: number;
  userEmail: string;
}

export interface AppUser {
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: number;
  totalSpent: number;
}

export interface User {
  email: string;
  isAdmin: boolean;
}

export interface AppNotification {
  id: string;
  userEmail: string;
  message: string;
  timestamp: number;
  read: boolean;
  orderId: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
}

export interface StoreSettings {
  noticeMarquee: string;
  isStoreOpen: boolean;
  supportWhatsApp: string;
}
