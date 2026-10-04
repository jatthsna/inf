import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { BillAssignment, AcademicYear } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StudentPaymentModal } from './StudentPaymentModal';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  Receipt, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  History,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface StudentDashboardProps {
  activeAcademicYear: AcademicYear;
  onNavigateTab: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeAcademicYear,
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<BillAssignment[]>([]);
  const [selectedForPayment, setSelectedForPayment] = useState<BillAssignment | null>(null);

  const reloadData = () => {
    setAssignments(db.getStudentBillAssignments(currentUser.id, activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [currentUser.id, activeAcademicYear.id]);

  const verifiedAssignments = assignments.filter(a => a.status === 'verified');
  const unpaidAssignments = assignments.filter(a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected');
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  const totalBilledAmount = assignments.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);
  const totalPaidAmount = verifiedAssignments.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);
  const totalArrearsAmount = unpaidAssignments.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);

  const actionableBills = assignments.filter(a => a.status !== 'verified');

  return (
    <div className="space-y-6">
      {/* Top Header Banner: Professional Academic Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Ikhtisar Kas Mahasiswa
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="text-slate-200 font-semibold">{currentUser.full_name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono">NIM {currentUser.nim}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{currentUser.class_name || 'Informatika'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-blue-400 font-medium">Tahun Akademik {activeAcademicYear.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('student-transparency')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Buku Kas Terbuka</span>
          </button>
          <button
            onClick={() => onNavigateTab('student-rekap')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Rekap Riwayat</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Kewajiban Kas"
          value={formatCurrency(totalBilledAmount)}
          subtitle={`${assignments.length} tagihan terbit tahun akademik ini`}
          variant="slate"
        />

        <StatCard
          title="Sudah Dibayar (Lunas)"
          value={formatCurrency(totalPaidAmount)}
          subtitle={`${verifiedAssignments.length} tagihan telah diverifikasi sah`}
          variant="emerald"
        />

        <StatCard
          title="Menunggu Verifikasi"
          value={`${pendingAssignments.length} Transaksi`}
          subtitle="Bukti pembayaran dalam antrean bendahara"
          variant="amber"
        />

        <StatCard
          title="Tunggakan Belum Bayar"
          value={formatCurrency(totalArrearsAmount)}
          subtitle={`${unpaidAssignments.length} tagihan belum diselesaikan`}
          variant={totalArrearsAmount > 0 ? 'rose' : 'slate'}
        />
      </div>

      {/* Active Bills / Actionable Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-white">
              Tagihan Kas yang Perlu Diselesaikan
            </h3>
            {actionableBills.length > 0 && (
              <span className="text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {actionableBills.length} Belum Lunas
              </span>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('student-bills')}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Lihat Semua Tagihan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {actionableBills.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Semua Kewajiban Kas Lunas</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ada tagihan tertunggak pada tahun akademik {activeAcademicYear.name}. Terima kasih atas partisipasi aktif Anda dalam kas kelas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionableBills.map((asg) => {
              const { bill, status } = asg;
              if (!bill) return null;

              const isPending = status === 'pending';
              const isRejected = status === 'rejected';

              return (
                <div
                  key={asg.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {bill.bill_type === 'monthly' ? 'Kas Bulanan' : 'Iuran Kegiatan'}
                      </span>
                      <StatusBadge status={status || 'unpaid'} size="sm" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">
                        {bill.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {bill.description || 'Kewajiban kas mahasiswa program studi'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <div className="text-xl font-bold text-white font-mono tabular-nums">
                        {formatCurrency(bill.amount)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Jatuh tempo: <span className="text-slate-300 font-medium">{formatDateID(bill.due_date)}</span>
                      </div>
                    </div>

                    {isRejected && asg.latest_payment?.admin_note && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
                        <span className="font-semibold block text-rose-200">Catatan Bendahara:</span>
                        {asg.latest_payment.admin_note}
                      </div>
                    )}

                    {isPending && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        Bukti pembayaran telah dikirim. Menunggu verifikasi mutasi oleh bendahara kelas.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedForPayment(asg)}
                      disabled={isPending}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                        isPending
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <span>
                        {isPending
                          ? 'Dalam Verifikasi'
                          : isRejected
                          ? 'Unggah Ulang Bukti'
                          : 'Bayar via Lynk.id'}
                      </span>
                      {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Flow Modal */}
      <StudentPaymentModal
        isOpen={Boolean(selectedForPayment)}
        onClose={() => setSelectedForPayment(null)}
        assignment={selectedForPayment}
        onSuccess={reloadData}
      />
    </div>
  );
};
