import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, LayoutDashboard, Home, X, 
  CheckCircle2, Bell, LayoutGrid, ShoppingBag, CreditCard, UserCircle,
  Zap, Star, Filter, Calendar, ArrowRight, AlertOctagon, Activity,
  MapPin, History, Gamepad2, PlusSquare, LayoutList, CreditCard as CardIcon,
  ChevronDown, Minus, Plus, MessageCircle, MessageSquare, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_EMAIL, PRODUCTS as INITIAL_PRODUCTS, PAYMENT_DETAILS, CATEGORIES, DEFAULT_SETTINGS, DEFAULT_BANNERS } from './constants';
import { Product, Order, PaymentMethod, User, AppNotification, StoreSettings, Banner, AppUser } from './types';
import { NotificationService } from './NotificationService';
import { PolicyPage } from './PolicyPage';
import { AdminDashboard } from './AdminDashboard';
import { OrderHistory } from './OrderHistory';
import { OrderTracker } from './OrderTracker';
import { EmailService } from './EmailService';
import { StatusBadge } from './Components';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'order-history' | 'order-tracker' | 'privacy' | 'refund' | 'category-detail'>('home');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('sadik_orders');
    return stored ? JSON.parse(stored) : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('sadik_products');
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const stored = localStorage.getItem('sadik_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    const stored = localStorage.getItem('sadik_banners');
    return stored ? JSON.parse(stored) : DEFAULT_BANNERS;
  });
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    const stored = localStorage.getItem('sadik_app_users');
    return stored ? JSON.parse(stored) : [];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAdminManualOrderOpen, setIsAdminManualOrderOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderPlayerId, setOrderPlayerId] = useState('');
  const [orderTrxId, setOrderTrxId] = useState('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<PaymentMethod>('bkash');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => localStorage.setItem('sadik_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('sadik_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('sadik_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('sadik_banners', JSON.stringify(banners)), [banners]);
  useEffect(() => localStorage.setItem('sadik_app_users', JSON.stringify(appUsers)), [appUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    
    const existingUser = appUsers.find(u => u.email === loginEmail);
    if (existingUser?.isBanned) {
      alert("Your account has been restricted. Please contact support.");
      return;
    }

    if (!existingUser) {
      setAppUsers([...appUsers, { 
        email: loginEmail, 
        isAdmin: loginEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        isBanned: false,
        createdAt: Date.now(),
        totalSpent: 0
      }]);
    }

    setUser({
      email: loginEmail,
      isAdmin: loginEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    });
    setIsLoginModalOpen(false);
  };

  const confirmAndCreateOrder = async (isManualAdmin: boolean = false) => {
    if (!selectedProduct || !user) return;
    
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const normalizedTrxId = orderTrxId.trim().toUpperCase();
      
      if (!isManualAdmin && !normalizedTrxId) {
        setSubmissionError("Error: Transaction ID is required.");
        setIsSubmitting(false);
        return;
      }

      const isDuplicate = !isManualAdmin && orders.some(o => o.transactionId.toUpperCase() === normalizedTrxId);
      
      if (isDuplicate) {
        setSubmissionError("Error: This Transaction ID has already been used.");
        setIsSubmitting(false);
        return;
      }

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        playerId: orderPlayerId.trim(),
        productId: selectedProduct.id,
        productName: `${selectedProduct.name} x${quantity}`,
        price: (selectedProduct.price * quantity),
        paymentMethod: isManualAdmin ? 'bkash' : orderPaymentMethod,
        transactionId: isManualAdmin ? `ADMIN-${Date.now()}` : normalizedTrxId,
        status: isManualAdmin ? 'completed' : 'pending',
        createdAt: Date.now(),
        userEmail: isManualAdmin ? (appUsers.find(u => u.email !== ADMIN_EMAIL)?.email || ADMIN_EMAIL) : user.email
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      setOrders([newOrder, ...orders]);
      setShowConfirmation(false);
      setIsAdminManualOrderOpen(false);
      
      EmailService.sendEmail(
        newOrder.userEmail,
        `Confirmation: ${newOrder.productName}`,
        EmailService.getConfirmationTemplate(newOrder, newOrder.userEmail.split('@')[0])
      );

      setOrderPlayerId('');
      setOrderTrxId('');
      alert(`Order Successful! Your Order ID is: ${newOrder.id}`);
    } catch (error) {
      setSubmissionError("Submission Failed: A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);

    if (status === 'completed') {
      EmailService.sendEmail(
        order.userEmail,
        `Success! Digital Invoice for Order #${orderId}`,
        EmailService.getInvoiceTemplate(order)
      );
      setAppUsers(appUsers.map(u => u.email === order.userEmail ? { ...u, totalSpent: u.totalSpent + order.price } : u));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20 font-sans selection:bg-orange-500 selection:text-white">
      <div className="bg-[#1a56db] text-white py-2 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-bold text-[10px] md:text-xs uppercase tracking-widest px-4">
           <span>{settings.noticeMarquee}</span>
           <span>{settings.noticeMarquee}</span>
        </div>
        <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { display: inline-block; animation: marquee 30s linear infinite; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>

      <header className="bg-white border-b sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar w-full md:w-auto px-2">
            <button onClick={() => setCurrentPage('home')} className={`nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight ${currentPage === 'home' ? 'text-orange-500' : 'text-gray-600'}`}>
              <Home size={16} /> HOME
            </button>
            <button className="nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight text-gray-600">
              <PlusSquare size={16} /> TOP UP
            </button>
            <button className="nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight text-gray-600">
              <ShoppingBag size={16} /> SHOP
            </button>
            <button className="nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight text-gray-600">
              <Gamepad2 size={16} /> GAME
            </button>
            <button className="nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight text-gray-600">
              <CardIcon size={16} /> CARD
            </button>
            <button onClick={() => setCurrentPage('order-tracker')} className={`nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight ${currentPage === 'order-tracker' ? 'text-orange-500' : 'text-gray-600'}`}>
              <MapPin size={16} /> ORDER TRACKER
            </button>
            <button onClick={() => user ? setCurrentPage('order-history') : setIsLoginModalOpen(true)} className={`nav-link flex items-center gap-2 whitespace-nowrap font-black tracking-tight ${currentPage === 'order-history' ? 'text-orange-500' : 'text-gray-600'}`}>
              <UserCircle size={16} /> ACCOUNT
            </button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
             {user?.isAdmin && (
               <button onClick={() => setCurrentPage('admin')} className="bg-gray-900 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all shadow-xl shadow-black/10"><LayoutDashboard size={14} /> ADMIN</button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {currentPage === 'home' && (
              <div className="space-y-12">
                <div className="relative rounded-3xl overflow-hidden bg-gray-900 h-[220px] md:h-[450px] shadow-2xl group cursor-pointer">
                  {banners.length > 0 && <img src={banners[0].imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                     <div className="max-w-xl space-y-4">
                        <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">Featured Offer</span>
                        <h2 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter">Fastest <br/> Top-Up!</h2>
                     </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {CATEGORIES.map((cat, idx) => (
                    <motion.div 
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      onClick={() => { setSelectedCategory(cat); setSelectedProduct(null); setCurrentPage('category-detail'); window.scrollTo(0,0); }} 
                      className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all cursor-pointer group flex flex-col items-center text-center"
                    >
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4"><img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                      <h3 className="text-sm font-black text-gray-900 line-clamp-2 mb-2">{cat.name}</h3>
                      <span className="text-orange-500 font-black text-[11px] bg-gray-50 px-3 py-1.5 rounded-full">{cat.priceRange}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'category-detail' && selectedCategory && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="lg:col-span-5">
                  <div className="sticky top-28">
                    <motion.img 
                      layoutId={`img-${selectedCategory.id}`}
                      src={selectedCategory.image} 
                      className="w-full rounded-[2.5rem] shadow-2xl border-[8px] border-white" 
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tighter">{selectedCategory.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                      </div>
                      <span className="text-sm text-gray-400 font-bold ml-2">(6 customer reviews)</span>
                    </div>
                    
                    <div className="text-2xl font-black text-orange-600 tracking-tight py-2 border-b border-gray-100">
                      {selectedProduct ? `৳ ${selectedProduct.price}` : selectedCategory.priceRange}
                    </div>

                    <div className="space-y-3 text-sm text-gray-500 font-medium leading-relaxed py-2">
                      <p className="whitespace-pre-line">{selectedCategory.description}</p>
                      {selectedCategory.bnDescription && <p className="text-gray-800 font-bold">{selectedCategory.bnDescription}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                      {products
                        .filter(p => p.parentCategoryId === selectedCategory.id || (selectedCategory.id === 'ff-bd' && p.category === 'diamonds'))
                        .map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedProduct(p)} 
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-1 ${selectedProduct?.id === p.id ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-500/5' : 'border-gray-100 bg-white hover:border-orange-200'}`}
                        >
                          <span className="text-xs font-black text-gray-900">{p.name}</span>
                          <span className="text-xs font-bold text-orange-500">৳ {p.price}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Player ID/UID*</label>
                        <input 
                          type="text" 
                          placeholder="এখানে প্লেয়ার আইডি লিখুন" 
                          className="w-full bg-white border-2 border-gray-100 rounded-xl px-6 py-4 text-sm font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all" 
                          value={orderPlayerId} 
                          onChange={(e) => setOrderPlayerId(e.target.value)} 
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <span className="text-xs font-black text-gray-500 whitespace-nowrap">Quantity:</span>
                           <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl p-1 shrink-0">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><Minus size={16}/></button>
                              <span className="px-6 font-black text-sm">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><Plus size={16}/></button>
                           </div>
                           <button 
                             disabled={!selectedProduct}
                             className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${selectedProduct ? 'bg-[#ffccb3] text-orange-900 hover:bg-[#ffbfa1]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                           >
                             Add to basket
                           </button>
                        </div>
                        <button 
                          disabled={!settings.isStoreOpen || !selectedProduct || !orderPlayerId} 
                          onClick={() => setShowConfirmation(true)} 
                          className={`w-full flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${settings.isStoreOpen && selectedProduct && orderPlayerId ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-orange-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                          Buy now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'admin' && user?.isAdmin && (
              <AdminDashboard orders={orders} products={products} settings={settings} banners={banners} appUsers={appUsers} onUpdateStatus={updateOrderStatus} onDeleteOrder={(id) => setOrders(orders.filter(o => o.id !== id))} onUpdateProduct={(p) => setProducts(products.map(pr => pr.id === p.id ? p : pr))} onAddProduct={(p) => setProducts([p, ...products])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} onUpdateSettings={setSettings} onUpdateBanners={setBanners} onUpdateUser={(email, updates) => setAppUsers(appUsers.map(u => u.email === email ? { ...u, ...updates } : u))} onFastOrder={(p) => { setSelectedProduct(p); setOrderPlayerId(''); setOrderTrxId('M-' + Date.now().toString().slice(-6)); setIsAdminManualOrderOpen(true); }} />
            )}

            {currentPage === 'order-tracker' && (
              <OrderTracker orders={orders} />
            )}

            {currentPage === 'order-history' && user && (
              <OrderHistory orders={orders} user={user} />
            )}

            {(currentPage === 'privacy' || currentPage === 'refund') && <PolicyPage type={currentPage} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Support Hub */}
      <div className="fixed bottom-8 right-8 z-[90]">
        <AnimatePresence>
          {isSupportOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-20 right-0 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-4"
            >
              <div className="bg-orange-500 p-6 text-white">
                <h4 className="font-black text-lg tracking-tight">Need Help?</h4>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">We are online now</p>
              </div>
              <div className="p-4 space-y-3">
                <a 
                  href={`https://wa.me/${settings.supportWhatsApp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-900">WhatsApp</p>
                    <p className="text-[10px] text-gray-400 font-bold">Direct Assistance</p>
                  </div>
                </a>
                <button 
                  onClick={() => { (window as any).Tawk_API?.toggle(); setIsSupportOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-gray-900">Live Chat</p>
                    <p className="text-[10px] text-gray-400 font-bold">Talk to Agent</p>
                  </div>
                </button>
              </div>
              <div className="bg-gray-50 p-4 text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Available 8AM - 11PM</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSupportOpen(!isSupportOpen)}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-colors ${isSupportOpen ? 'bg-gray-900 text-white' : 'bg-orange-500 text-white shadow-orange-500/30'}`}
        >
          {isSupportOpen ? <X size={28} /> : (
            <div className="relative">
              <MessageCircle size={28} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedProduct && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
             <motion.div 
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-black text-gray-900 mb-2">Complete Payment</h3>
                <div className="space-y-6 mb-8">
                   <div className="grid grid-cols-3 gap-3">
                      {Object.entries(PAYMENT_DETAILS).map(([key, data]) => (
                        <button key={key} onClick={() => setOrderPaymentMethod(key as PaymentMethod)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${orderPaymentMethod === key ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black bg-orange-500`}>{key[0].toUpperCase()}</div>
                           <span className="text-[8px] font-black uppercase tracking-widest">{data.name.split(' ')[0]}</span>
                        </button>
                      ))}
                   </div>
                   <div className="bg-gray-900 p-6 rounded-2xl text-white">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Send Money to</p>
                      <p className="text-xl font-black tracking-wider text-orange-400">{PAYMENT_DETAILS[orderPaymentMethod].number}</p>
                      <p className="text-[11px] text-white/70 mt-2">"{PAYMENT_DETAILS[orderPaymentMethod].instructions}"</p>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction ID</label>
                      <input type="text" placeholder="Paste TrxID here" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:border-orange-500 outline-none uppercase" value={orderTrxId} onChange={(e) => setOrderTrxId(e.target.value)} />
                   </div>
                   <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center"><span className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Payable</span><span className="text-xl font-black text-orange-600">৳{selectedProduct.price * quantity}</span></div>
                </div>
                {submissionError && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 items-start"><AlertOctagon className="text-rose-500 shrink-0" size={20} /><p className="text-xs font-bold text-rose-700">{submissionError}</p></div>}
                <div className="flex gap-3"><button onClick={() => setShowConfirmation(false)} className="flex-1 bg-gray-100 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Cancel</button><button disabled={isSubmitting} onClick={() => confirmAndCreateOrder()} className={`flex-[1.5] py-4 rounded-xl font-black uppercase text-xs tracking-widest ${isSubmitting ? 'bg-gray-400' : 'bg-gray-900 text-white hover:bg-orange-600'}`}>{isSubmitting ? 'Verifying...' : 'Submit'}</button></div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Admin Order Modal */}
      <AnimatePresence>
        {isAdminManualOrderOpen && selectedProduct && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
             <motion.div 
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"><Zap className="text-orange-500"/> Admin Manual Delivery</h3>
                <div className="space-y-6">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pack</p><p className="text-lg font-black text-gray-900">{selectedProduct.name}</p></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Player ID</label><input type="text" placeholder="Target UID" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 text-sm font-bold focus:border-orange-500 outline-none" value={orderPlayerId} onChange={(e) => setOrderPlayerId(e.target.value)} /></div>
                   <div className="flex gap-4"><button onClick={() => setIsAdminManualOrderOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Discard</button><button onClick={() => confirmAndCreateOrder(true)} className="flex-[1.5] bg-orange-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-600">Deliver Now</button></div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
             <motion.form 
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onSubmit={handleLogin} 
                className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-500/30"><UserCircle size={40} /></div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">Member Login</h3>
                  <p className="text-[10px] text-gray-400 mb-10 font-black uppercase tracking-widest">Access your account</p>
                  <div className="space-y-6">
                    <input type="email" required placeholder="Gmail Account" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold focus:border-orange-500 outline-none" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-orange-600 transition-all">Secure Access</button>
                    <button type="button" onClick={() => setIsLoginModalOpen(false)} className="w-full text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 py-2">Return</button>
                  </div>
                </div>
             </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;