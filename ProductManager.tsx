import React, { useState } from 'react';
import { Product } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, Image as ImageIcon, Sparkles, DollarSign, Package, Zap, LayoutGrid, Gem, Crown } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  onUpdate: (product: Product) => void;
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
  onFastOrder: (product: Product) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, onUpdate, onAdd, onDelete, onFastOrder }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'diamonds' | 'membership'>('all');

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <Package size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tighter">Inventory Control</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage Diamond Packs & Memberships</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-100 mr-2 relative">
            {[
              { id: 'all', label: 'All', icon: <LayoutGrid size={14}/> },
              { id: 'diamonds', label: 'Diamonds', icon: <Gem size={14}/> },
              { id: 'membership', label: 'Members', icon: <Crown size={14}/> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative z-10 ${
                  filter === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {filter === tab.id && (
                  <motion.div 
                    layoutId="filterActive" 
                    className="absolute inset-0 bg-white shadow-sm ring-1 ring-gray-200 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => onAdd({ 
              id: `PROD-${Date.now()}`, 
              name: 'New Premium Pack', 
              amount: 100, 
              price: 70, 
              image: '', 
              category: filter === 'all' ? 'diamonds' : filter 
            })}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 flex-1 lg:flex-none justify-center"
          >
            <Plus size={18}/> New SKU
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="md:col-span-2 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-gray-400 gap-4"
            >
              <Package size={48} className="opacity-20" />
              <p className="font-black uppercase tracking-widest text-[10px]">No products found in this category</p>
            </motion.div>
          ) : (
            filteredProducts.map(p => (
              <motion.div 
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 group hover:border-orange-500/40 transition-all relative overflow-hidden ${editingId === p.id ? 'ring-2 ring-orange-500' : ''}`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full transition-all group-hover:bg-orange-50" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-300 overflow-hidden border-2 border-dashed border-gray-100 group-hover:border-orange-200 transition-all">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name}/> : <ImageIcon size={32}/>}
                  </div>
                  <div className="flex-1">
                    {editingId === p.id ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Product Name</p>
                          <input 
                            className="w-full text-sm font-black bg-gray-50 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all"
                            defaultValue={p.name}
                            onChange={(e) => onUpdate({ ...p, name: e.target.value })}
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Price (৳)</p>
                            <input 
                              type="number"
                              className="w-full text-sm font-black text-orange-600 bg-gray-50 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all"
                              defaultValue={p.price}
                              onChange={(e) => onUpdate({ ...p, price: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Type</p>
                            <select 
                              className="w-full text-xs font-black bg-gray-50 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none"
                              value={p.category}
                              onChange={(e) => onUpdate({ ...p, category: e.target.value as any })}
                            >
                              <option value="diamonds">Diamonds</option>
                              <option value="membership">Member</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border ${
                             p.category === 'diamonds' 
                              ? 'bg-blue-50 text-blue-600 border-blue-100' 
                              : 'bg-purple-50 text-purple-600 border-purple-100'
                           }`}>
                             {p.category}
                           </span>
                           <span className="text-[10px] text-gray-300 font-bold">SKU: {p.id.split('-')[0]}</span>
                        </div>
                        <p className="font-black text-gray-900 text-lg tracking-tight line-clamp-1">{p.name}</p>
                        <p className="text-orange-500 font-black text-2xl tracking-tighter">৳{p.price}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 relative z-10">
                  <div className="flex items-center gap-2">
                     <button 
                      onClick={() => onFastOrder(p)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                     >
                       <Zap size={14} fill="currentColor"/> Fast Fill
                     </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${editingId === p.id ? 'bg-gray-900 text-white shadow-xl shadow-black/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white'}`}
                    >
                      {editingId === p.id ? <><Save size={16}/> Save Changes</> : <><Edit3 size={16}/> Edit</>}
                    </button>
                    <button 
                      onClick={() => { if(confirm('Purge this product?')) onDelete(p.id) }}
                      className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};