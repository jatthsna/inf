import React from 'react';
import { BillAssignmentStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: BillAssignmentStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const baseClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] tracking-wide font-medium rounded-md' 
    : 'px-2.5 py-0.5 text-[11px] tracking-wide font-medium rounded-md';

  switch (normalized) {
    case 'verified':
    case 'lunas':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Lunas</span>
        </span>
      );

    case 'pending':
    case 'menunggu verifikasi':
    case 'menunggu':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span>Menunggu Verifikasi</span>
        </span>
      );

    case 'unpaid':
    case 'belum bayar':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>Belum Bayar</span>
        </span>
      );

    case 'rejected':
    case 'ditolak':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span>Ditolak</span>
        </span>
      );

    case 'overdue':
    case 'terlambat':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span>Terlambat</span>
        </span>
      );

    case 'active':
    case 'aktif':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 ${baseClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <span>Aktif</span>
        </span>
      );

    case 'inactive':
    case 'nonaktif':
      return (
        <span className={`inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 ${baseClasses}`}>
          <span>Nonaktif</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center bg-slate-800 text-slate-300 border border-slate-700 ${baseClasses}`}>
          {status}
        </span>
      );
  }
};
