
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Add Activity to the imports
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Package, Activity } from 'lucide-react';
import { Order } from './types';
import { StatusBadge } from './Components';

interface OrderTrackerProps {
  orders: Order[];
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orders }) => {
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => 
      o.id.toUpperCase() === searchId.trim().toUpperCase() || 
      o.transactionId.toUpperCase() === searchId.trim().toUpperCase()
    );
    setFoundOrder(order || null);
    setHasSearched(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-6">
          <MapPin size={32} />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-gray-900">Track Your Order</h2>
        <p className="text-gray-400 font-medium max-w-sm mx-auto">Enter your Order ID or Transaction ID to check the real-time status of your top-up.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          placeholder="e.g. ORD-1721532... or TrxID"
          className="w-full bg-white border-4 border-gray-100 rounded-[2rem] px-8 py-6 text-lg font-bold focus:border-orange-500 outline-none transition-all pr-24 shadow-xl shadow-gray-200/50"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-3 top-3 bottom-3 aspect-square bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg"
        >
          <Search size={24}/>
        </button>
      </form>

      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {foundOrder ? (
              <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Package size={120} />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Overview</p>
                    <StatusBadge status={foundOrder.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                    <p className="text-sm font-black text-gray-900">{new Date(foundOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Progress Line */}
                  <div className="flex justify-between relative px-2">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 -z-10" />
                    <div 
                      className="absolute top-4 left-0 h-1 bg-orange-500 transition-all duration-1000 -z-10" 
                      style={{ width: foundOrder.status === 'completed' ? '100%' : foundOrder.status === 'pending' ? '0%' : '50%' }}
                    />
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-md ${foundOrder.status !== 'cancelled' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Clock size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Received</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-md ${['processing', 'completed'].includes(foundOrder.status) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Activity size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Verifying</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-md ${foundOrder.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Delivered</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product</p>
                      <p className="text-sm font-black text-gray-900">{foundOrder.productName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Player ID</p>
                      <p className="text-sm font-black text-blue-600">{foundOrder.playerId}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Order Not Found</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">We couldn't find an order with that ID. Please check for typos and try again.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
