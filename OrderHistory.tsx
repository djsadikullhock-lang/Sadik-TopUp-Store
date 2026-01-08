
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Clock, CreditCard, UserCircle } from 'lucide-react';
import { Order, User } from './types';
import { StatusBadge } from './Components';

interface OrderHistoryProps {
  orders: Order[];
  user: User;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, user }) => {
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => o.userEmail === user.email)
      .filter(o => statusFilter === 'all' || o.status === statusFilter);
  }, [orders, user, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter">My Activity</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">History of your top-ups</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white border border-gray-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Processing' },
              { id: 'completed', label: 'Success' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === st.id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <ShoppingBag className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No matching orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(o => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={o.id} 
              className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-8 shadow-sm hover:border-orange-200 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white bg-orange-500 shadow-lg shadow-orange-500/20">
                {o.paymentMethod[0].toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {o.id}</div>
                <div className="text-base font-black text-gray-900">{o.productName}</div>
                <div className="flex gap-4">
                  <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><UserCircle size={12}/> UID: {o.playerId}</div>
                  <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><CreditCard size={12}/> ৳{o.price}</div>
                  <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <StatusBadge status={o.status} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
