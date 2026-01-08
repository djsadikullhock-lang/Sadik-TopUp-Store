
import React from 'react';
import { ShieldCheck, RefreshCcw, AlertTriangle, Scale } from 'lucide-react';

export const PolicyPage: React.FC<{ type: 'privacy' | 'refund' }> = ({ type }) => {
  if (type === 'privacy') {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <ShieldCheck className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <section className="space-y-4 text-gray-600 leading-relaxed">
          <p>At Sadik Top-Up Store, we prioritize your data security. This policy outlines how we handle your information.</p>
          <h2 className="text-lg font-bold text-gray-800">1. Data Collection</h2>
          <p>We collect your **Player ID**, **Transaction ID**, and **Email Address**. This data is used exclusively for verifying payments and delivering game currency.</p>
          <h2 className="text-lg font-bold text-gray-800">2. Data Security</h2>
          <p>All sensitive transaction data is handled directly by the Administrator (sdsadikullhock@gmail.com). We do not share your Player ID or payment details with third parties.</p>
          <h2 className="text-lg font-bold text-gray-800">3. Retention</h2>
          <p>Records are kept for 30 days for support purposes and then archived securely.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <RefreshCcw className="text-orange-600" size={32} />
        <h1 className="text-2xl font-bold">Refund Policy</h1>
      </div>
      <section className="space-y-4 text-gray-600 leading-relaxed">
        <div className="bg-orange-50 p-4 border-l-4 border-orange-500 rounded flex gap-3">
          <AlertTriangle className="text-orange-600 shrink-0" size={24} />
          <p className="text-sm font-medium">Please read carefully before making a purchase.</p>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800">1. User Error</h2>
        <p>No refunds or re-deliveries will be issued if you provide an **incorrect Player ID**. Once diamonds are sent to an ID, they cannot be retracted.</p>
        
        <h2 className="text-lg font-bold text-gray-800">2. Processing Time</h2>
        <p>Standard delivery takes **5-30 minutes**. If your order is delayed beyond 2 hours, please contact our 24/7 support.</p>
        
        <h2 className="text-lg font-bold text-gray-800">3. Scam Prevention</h2>
        <p className="text-red-600 font-bold underline">Providing fake, used, or duplicate Transaction IDs will result in an immediate order cancellation and a permanent ban from our store.</p>
        
        <h2 className="text-lg font-bold text-gray-800">4. Finality</h2>
        <p>All successful top-ups are final. Refunds are only issued if the service is unavailable or the admin fails to deliver within 24 hours.</p>
      </section>
    </div>
  );
};
