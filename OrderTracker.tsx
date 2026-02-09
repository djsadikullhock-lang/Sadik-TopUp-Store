import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Package, Activity, XCircle } from 'lucide-react';
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
    if (!searchId.trim()) return;
    
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
        <div className="relative">
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
        </div>
      </form>

      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            key={searchId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {foundOrder ? (
              <div className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Package size={120} />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-50 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status Overview</p>
                    <StatusBadge status={foundOrder.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                    <p className="text-sm font-black text-gray-900">{new Date(foundOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-12 relative z-10">
                  {/* Progress Visualization */}
                  <div className="relative px-4">
                    {/* Background Line */}
                    <div className="absolute top-5 left-4 right-4 h-1 bg-gray-100 -z-10 rounded-full" />
                    
                    {/* Active Progress Line */}
                    <div 
                      className={`absolute top-5 left-4 h-1 transition-all duration-1000 -z-10 rounded-full ${foundOrder.status === 'cancelled' ? 'bg-rose-500' : 'bg-orange-500'}`} 
                      style={{ 
                        width: foundOrder.status === 'completed' ? '100%' : 
                               foundOrder.status === 'cancelled' ? '100%' :
                               foundOrder.status === 'processing' ? '50%' : '0%' 
                      }}
                    />
                    
                    <div className="flex justify-between relative">
                      {/* Step 1: Received */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors ${
                          foundOrder.status === 'cancelled' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          <Clock size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Received</span>
                      </div>

                      {/* Step 2: Processing (or Cancelled Middle State) */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors ${
                          foundOrder.status === 'cancelled' ? 'bg-rose-500 text-white' :
                          ['processing', 'completed'].includes(foundOrder.status) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'
                        }`}>
                          {foundOrder.status === 'cancelled' ? <XCircle size={16} /> : <Activity size={16} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${foundOrder.status === 'cancelled' ? 'text-rose-500' : 'text-gray-500'}`}>
                          {foundOrder.status === 'cancelled' ? 'Failed' : 'Verifying'}
                        </span>
                      </div>

                      {/* Step 3: Delivered (or Cancelled End State) */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors ${
                          foundOrder.status === 'cancelled' ? 'bg-rose-500 text-white' :
                          foundOrder.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'
                        }`}>
                          {foundOrder.status === 'cancelled' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${foundOrder.status === 'cancelled' ? 'text-rose-500' : 'text-gray-500'}`}>
                          {foundOrder.status === 'cancelled' ? 'Cancelled' : 'Delivered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {foundOrder.status === 'cancelled' && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex gap-4 items-start">
                      <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sm font-black text-rose-700 mb-1">Order Cancelled</h4>
                        <p className="text-xs text-rose-600 leading-relaxed">
                          Your order was cancelled by the administrator. This usually happens due to an invalid Transaction ID or incorrect Player ID. Please check your email for more details or contact support.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Details</p>
                      <p className="text-lg font-black text-gray-900">{foundOrder.productName}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">Amount: ৳{foundOrder.price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Account</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs font-mono font-bold text-blue-600">
                          UID: {foundOrder.playerId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-[3rem] border border-dashed border-gray-200 space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-2">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Order Not Found</h3>
                <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
                  We couldn't locate an order with that ID. Please double-check your Order ID or Transaction ID.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};