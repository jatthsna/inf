import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AuditLog } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTimeID } from '../../utils/formatters';
import { ScrollText, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const reloadData = () => {
    setLogs(db.getAuditLogs());
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && !log.action.includes(actionFilter)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = log.description.toLowerCase().includes(q);
      const matchUser = log.user_name?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      if (!matchDesc && !matchUser && !matchAction) return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('RECEIVE_CASH') || action.includes('VERIFY')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {action}
        </span>
      );
    }
    if (action.includes('REJECT') || action.includes('DELETE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" /> Append-Only Log
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">Audit Trail & Riwayat Aktivitas</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log permanen sistem mencatat setiap transaksi keuangan, verifikasi bukti, dan perubahan data penting
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas atau pelaku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#151F32] border border-[#26354D] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#26354D]">
        {[
          { id: 'all', label: 'Semua Aktivitas' },
          { id: 'PAYMENT', label: 'Pembayaran & Cash' },
          { id: 'BILL', label: 'Tagihan' },
          { id: 'EXPENSE', label: 'Pengeluaran' },
          { id: 'ACADEMIC_YEAR', label: 'Tahun Akademik' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActionFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              actionFilter === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#151F32]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Tidak Ada Log Aktivitas"
          description="Belum ada riwayat aktivitas yang sesuai dengan filter pencarian."
        />
      ) : (
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Pelaku Aktivitas</th>
                  <th className="py-3 px-4">Aksi Sistem</th>
                  <th className="py-3 px-4">Deskripsi Aktivitas</th>
                  <th className="py-3 px-4">Entitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1B263B]/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateTimeID(log.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.user_name || 'System Admin'}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{log.user_role || 'admin'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.entity_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
