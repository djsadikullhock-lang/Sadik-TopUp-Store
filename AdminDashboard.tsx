import React, { useState } from 'react';
import { Product, Order, StoreSettings, Banner, AppUser } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle2, XCircle, Trash2, Users, 
  Image as ImageIcon, Megaphone, CheckCircle, 
  ArrowUpRight, DollarSign, Activity, Clock, Package, Search, Filter
} from 'lucide-react';
import { StatusBadge } from './Components';
import { ProductManager } from './ProductManager';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  settings: StoreSettings;
  banners: Banner[];
  appUsers: AppUser[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onUpdateBanners: (banners: Banner[]) => void;
  onUpdateUser: (email: string, updates: Partial<AppUser>) => void;
  onFastOrder: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  orders, products, settings, banners, appUsers,
  onUpdateStatus, onDeleteOrder, onUpdateProduct, onAddProduct, onDeleteProduct, 
  onUpdateSettings, onUpdateBanners, onUpdateUser, onFastOrder
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'content' | 'users'>('orders');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .filter(o => o.playerId.toLowerCase().includes(searchTerm.toLowerCase()) || o.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + curr.price, 0),
    pendingCount: orders.filter(o => o.status === 'pending').length,
    completedCount: orders.filter(o => o.status === 'completed').length,
    totalUsers: appUsers.length
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-72 shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-2">
          {[
            { id: 'orders', label: 'Order Pipeline', icon: <ArrowUpRight size={18}/> },
            { id: 'products', label: 'Inventory', icon: <Package size={18}/> },
            { id: 'content', label: 'Content', icon: <Megaphone size={18}/> },
            { id: 'users', label: 'Users', icon: <Users size={18}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="adminTabHighlight" 
                  className="absolute inset-0 bg-orange-500 rounded-2xl -z-10 shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <h3 className="flex items-center gap-2 font-black mb-6 uppercase text-[10px] tracking-widest border-b border-white/10 pb-4"><ShieldCheck size={16} className="text-orange-500" /> Protocol</h3>
          <ul className="text-[11px] space-y-5 leading-relaxed font-bold">
            <li>Never trust SMS. Verify via official app history.</li>
            <li>Cross-check Transaction IDs for duplicates.</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm"><DollarSign size={28} className="text-emerald-600"/><p className="text-2xl font-black text-gray-900">৳{stats.totalRevenue}</p></motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm"><Clock size={28} className="text-amber-600"/><p className="text-2xl font-black text-gray-900">{stats.pendingCount}</p></motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm"><Users size={28} className="text-blue-600"/><p className="text-2xl font-black text-gray-900">{stats.totalUsers}</p></motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                  <div className="relative flex-1 w-full"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input type="text" placeholder="Search orders..." className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                  <select className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-black" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                    <option value="all">Global View</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Player Info</th>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Transaction</th>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <AnimatePresence initial={false}>
                        {filteredOrders.map(o => (
                          <motion.tr 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={o.id} 
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="px-8 py-6 font-black text-blue-600">UID: {o.playerId}</td>
                            <td className="px-8 py-6">
                              <span className="font-bold text-gray-900">{o.productName}</span>
                            </td>
                            <td className="px-8 py-6 font-mono font-bold text-gray-600">{o.transactionId}</td>
                            <td className="px-8 py-6 font-black text-orange-600">৳{o.price}</td>
                            <td className="px-8 py-6"><StatusBadge status={o.status} /></td>
                            <td className="px-8 py-6 text-right space-x-2">
                              {o.status === 'pending' && <button onClick={() => onUpdateStatus(o.id, 'processing')} className="p-3 bg-blue-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all" title="Mark Processing"><Activity size={18}/></button>}
                              {o.status === 'processing' && <button onClick={() => onUpdateStatus(o.id, 'completed')} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all" title="Complete Order"><CheckCircle2 size={18}/></button>}
                              {o.status === 'pending' && <button onClick={() => onUpdateStatus(o.id, 'completed')} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all" title="Complete Immediately"><CheckCircle2 size={18}/></button>}
                              {['pending', 'processing'].includes(o.status) && (
                                <button onClick={() => onUpdateStatus(o.id, 'cancelled')} className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm hover:bg-amber-500 hover:text-white transition-all" title="Cancel Order"><XCircle size={18}/></button>
                              )}
                              <button onClick={() => onDeleteOrder(o.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Delete Order"><Trash2 size={18}/></button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  
                  {filteredOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                          <Search size={24} />
                       </div>
                       <p className="text-gray-900 font-bold text-sm">No orders found</p>
                       <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <ProductManager products={products} onUpdate={onUpdateProduct} onAdd={onAddProduct} onDelete={onDeleteProduct} onFastOrder={onFastOrder} />
            )}

            {activeTab === 'content' && (
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Notice Marquee</h4>
                  <textarea className="w-full h-32 bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-bold focus:border-orange-500 outline-none" value={settings.noticeMarquee} onChange={(e) => onUpdateSettings({ ...settings, noticeMarquee: e.target.value })} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};