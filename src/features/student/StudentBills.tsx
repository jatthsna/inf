import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { BillAssignment, AcademicYear, BillAssignmentStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StudentPaymentModal } from './StudentPaymentModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { Receipt, Search, Calendar, ArrowRight, Printer, CheckCircle2 } from 'lucide-react';

interface StudentBillsProps {
  activeAcademicYear: AcademicYear;
}

export const StudentBills: React.FC<StudentBillsProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<BillAssignment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | BillAssignmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForPayment, setSelectedForPayment] = useState<BillAssignment | null>(null);
  const [selectedForReceipt, setSelectedForReceipt] = useState<BillAssignment | null>(null);

  const reloadData = () => {
    setAssignments(db.getStudentBillAssignments(currentUser.id, activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [currentUser.id, activeAcademicYear.id]);

  const filteredAssignments = assignments.filter((asg) => {
    const status = asg.status || 'unpaid';
    if (selectedFilter !== 'all' && status !== selectedFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = asg.bill?.name.toLowerCase().includes(q);
      const descMatch = asg.bill?.description?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'Semua Tagihan' },
    { id: 'unpaid', label: 'Belum Bayar' },
    { id: 'pending', label: 'Menunggu Verifikasi' },
    { id: 'verified', label: 'Lunas' },
    { id: 'rejected', label: 'Ditolak' },
    { id: 'overdue', label: 'Terlambat' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Daftar Tagihan Kas Mahasiswa</h2>
          <p className="text-xs text-slate-400 mt-1">
            Kewajiban kas bulanan dan iuran kegiatan semester berjalan Program Studi Informatika FMIKOM UNUGHA
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tagihan atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedFilter === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak Ada Tagihan"
          description={
            searchQuery || selectedFilter !== 'all'
              ? 'Tidak ada data tagihan yang sesuai dengan pencarian atau filter yang dipilih.'
              : 'Belum ada tagihan yang diterbitkan pada tahun akademik ini.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const { bill, status } = asg;
            if (!bill) return null;

            const isVerified = status === 'verified';
            const isPending = status === 'pending';
            const isRejected = status === 'rejected';

            return (
              <div
                key={asg.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {bill.bill_type === 'monthly' ? 'Kas Bulanan' : 'Iuran Kegiatan'}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <StatusBadge status={status || 'unpaid'} size="sm" />
                    {bill.period_month && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400 font-mono">Bulan ke-{bill.period_month}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white truncate">{bill.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{bill.description || '-'}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Jatuh tempo: <strong className="text-slate-200 font-semibold">{formatDateID(bill.due_date)}</strong>
                    </span>
                  </div>

                  {isRejected && asg.latest_payment?.admin_note && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 mt-2">
                      <span className="font-semibold text-rose-200">Catatan Bendahara:</span> {asg.latest_payment.admin_note}
                    </div>
                  )}

                  {isVerified && asg.latest_payment && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Lunas via {asg.latest_payment.payment_method === 'cash' ? 'Tunai kepada Bendahara' : 'Online Lynk.id'} ({formatDateID(asg.latest_payment.payment_date)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Nominal Tagihan</span>
                    <span className="text-lg font-bold text-white font-mono tabular-nums">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <button
                        onClick={() => setSelectedForReceipt(asg)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedForPayment(asg)}
                        disabled={isPending}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
                          isPending
                            ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <span>{isPending ? 'Dalam Proses Verifikasi' : isRejected ? 'Unggah Ulang Bukti' : 'Bayar via Lynk.id'}</span>
                        {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Flow Modal */}
      <StudentPaymentModal
        isOpen={Boolean(selectedForPayment)}
        onClose={() => setSelectedForPayment(null)}
        assignment={selectedForPayment}
        onSuccess={reloadData}
      />

      {/* Official Academic Receipt Modal */}
      {selectedForReceipt && selectedForReceipt.latest_payment && (
        <ReceiptModal
          isOpen={Boolean(selectedForReceipt)}
          onClose={() => setSelectedForReceipt(null)}
          payment={selectedForReceipt.latest_payment}
          bill={selectedForReceipt.bill}
          student={currentUser}
        />
      )}
    </div>
  );
};
