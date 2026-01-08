
import React from 'react';
import { Clock, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { Order } from './types';

export const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const configs = {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock size={12} className="animate-pulse" />,
      label: 'Processing'
    },
    processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Activity size={12} />,
      label: 'In Review'
    },
    completed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 size={12} />,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <XCircle size={12} />,
      label: 'Cancelled'
    }
  };

  const config = configs[status];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {config.label}
    </div>
  );
};
