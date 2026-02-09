import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, LayoutDashboard, Home, X, 
  CheckCircle2, Bell, LayoutGrid, ShoppingBag, CreditCard, UserCircle,
  Zap, Star, Filter, Calendar, ArrowRight, AlertOctagon, Activity,
  MapPin, History, Gamepad2, PlusSquare, LayoutList, CreditCard as CardIcon,
  ChevronDown, Minus, Plus, MessageCircle, MessageSquare, Phone, Info, AlertTriangle
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
    const parsed = stored ? JSON.parse(stored) : [];
    // Ensure default products are loaded if storage is empty/cleared
    return parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
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
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

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
      setLastOrder(newOrder);
      setShowOrderSuccess(true);
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
    } else if (status === 'cancelled') {
      EmailService.sendEmail(
        order.userEmail,
        `Order Cancelled: #${orderId}`,
        EmailService.getCancellationTemplate(order)
      );
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
                        
                        <div className="w-full flex-1">
                          <button 
                            disabled={!settings.isStoreOpen || !selectedProduct || !orderPlayerId} 
                            onClick={() => {
                              if (!user) {
                                setIsLoginModalOpen(true);
                                return;
                              }
                              setShowConfirmation(true);
                            }} 
                            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${settings.isStoreOpen && selectedProduct && orderPlayerId ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-orange-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          >
                            {user ? 'Buy now' : 'Login to Buy'}
                          </button>
                          {!user && (
                            <div className="mt-2 text-center">
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center justify-center gap-1">
                                <AlertOctagon size={12} /> Login required to place order
                              </p>
                            </div>
                          )}
                        </div>
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
                    <p className="text-xs font-black text-gray-900">WhatsApp Support</p>
                    <p className="text-[10px] text-gray-400 font-bold">Average Reply: 2 mins</p>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsSupportOpen(!isSupportOpen)}
          className="bg-orange-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
             {/* Modal Content */}
             <motion.div 
               variants={modalVariants} initial="initial" animate="animate" exit="exit"
               className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
             >
                <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"><X size={20}/></button>
                
                <div className="text-center space-y-4 mb-8">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500 mb-2">
                    <UserCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Welcome Back</h3>
                  <p className="text-gray-500 text-sm font-medium">Please enter your email to continue. We use this to track your orders.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@gmail.com"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-900 focus:border-orange-500 outline-none transition-all"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl">
                    Continue
                  </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
               variants={modalVariants} initial="initial" animate="animate" exit="exit"
               className="bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowConfirmation(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"><X size={20}/></button>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Checkout</h3>
                  <p className="text-gray-400 text-sm font-bold mt-1">Complete your purchase</p>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl flex items-center justify-between border border-orange-100">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-400">Total Amount</p>
                    <p className="text-3xl font-black text-orange-600">৳{selectedProduct.price * quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-400">Package</p>
                    <p className="text-lg font-black text-gray-900">{selectedProduct.name} x{quantity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(PAYMENT_DETAILS) as PaymentMethod[]).map((method) => (
                      <button 
                        key={method}
                        onClick={() => setOrderPaymentMethod(method)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${orderPaymentMethod === method ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                      >
                         <img src={PAYMENT_DETAILS[method].logo} className="h-8 object-contain" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <img src={PAYMENT_DETAILS[orderPaymentMethod].logo} className="w-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Send Money To</p>
                        <p className="text-lg font-black text-gray-900 tracking-wider select-all">{PAYMENT_DETAILS[orderPaymentMethod].number}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                      {PAYMENT_DETAILS[orderPaymentMethod].instructions}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Transaction ID (TrxID)</label>
                   <input 
                      type="text" 
                      placeholder="e.g. 9G7F42K..."
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-900 focus:border-orange-500 outline-none transition-all uppercase placeholder:normal-case"
                      value={orderTrxId}
                      onChange={(e) => setOrderTrxId(e.target.value)}
                   />
                </div>
                
                {submissionError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                    <AlertTriangle size={18} />
                    <p className="text-xs font-bold">{submissionError}</p>
                  </div>
                )}

                <button 
                  onClick={() => confirmAndCreateOrder()} 
                  disabled={isSubmitting || !orderTrxId}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isSubmitting || !orderTrxId ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white hover:bg-orange-500'}`}
                >
                  {isSubmitting ? 'Verifying...' : 'Submit Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Manual Order Modal */}
      <AnimatePresence>
         {isAdminManualOrderOpen && selectedProduct && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
           >
             <motion.div 
               variants={modalVariants} initial="initial" animate="animate" exit="exit"
               className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative"
             >
               <button onClick={() => setIsAdminManualOrderOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"><X size={20}/></button>
               <h3 className="text-xl font-black text-gray-900 mb-6">Manual Order Entry</h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Player ID</label>
                   <input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold" value={orderPlayerId} onChange={(e) => setOrderPlayerId(e.target.value)} placeholder="UID" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Internal TrxID</label>
                   <input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-500" value={orderTrxId} readOnly />
                 </div>
                 <button onClick={() => confirmAndCreateOrder(true)} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                    Create & Complete
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Order Success Modal */}
      <AnimatePresence>
        {showOrderSuccess && lastOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
             <motion.div 
               variants={modalVariants} initial="initial" animate="animate" exit="exit"
               className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative text-center overflow-hidden"
             >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">Your order has been received successfully.</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Order ID</span>
                      <span className="font-black text-gray-900">{lastOrder.id}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Product</span>
                      <span className="font-black text-gray-900">{lastOrder.productName}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Amount</span>
                      <span className="font-black text-orange-600">৳{lastOrder.price}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Player ID</span>
                      <span className="font-black text-blue-600">{lastOrder.playerId}</span>
                   </div>
                </div>

                <div className="space-y-3">
                  <button onClick={() => { setShowOrderSuccess(false); setCurrentPage('order-tracker'); }} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl">
                    Track Order
                  </button>
                  <button onClick={() => setShowOrderSuccess(false)} className="w-full bg-transparent text-gray-400 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-all">
                    Close
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;