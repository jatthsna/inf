import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, Payment, PaymentStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID, formatDateTimeID } from '../../utils/formatters';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  ExternalLink,
  FileText,
  Printer,
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileQuestion,
  Sparkles,
  Users,
  HandCoins,
  Pencil,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface PaymentsPageProps {
  activeAcademicYear: AcademicYear;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'online' | 'cash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByBill, setGroupByBill] = useState(false);

  // Modals state
  const [selectedProofPayment, setSelectedProofPayment] = useState<Payment | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<Payment | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  
  // Salah Catat / Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<Payment | null>(null);
  const [correctionMode, setCorrectionMode] = useState<'cancel' | 'edit'>('cancel');
  const [editAmount, setEditAmount] = useState<number | ''>(10000);
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>(null);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('Bukti transfer tidak valid atau nominal tidak sesuai.');

  const reloadData = () => {
    setPayments(db.getPayments(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  // Open correction modal
  const handleOpenCorrection = (p: Payment) => {
    setCorrectionTarget(p);
    setCorrectionMode('cancel');
    setEditAmount(p.amount);
    setEditDate(p.payment_date || new Date().toISOString().split('T')[0]);
    setEditNote(p.admin_note || '');
    setCorrectionError(null);
    setCorrectionSuccess(null);
  };

  // Submit correction (either cancel/delete or update details)
  const handleExecuteCorrection = () => {
    if (!correctionTarget) return;
    setIsSubmittingCorrection(true);
    setCorrectionError(null);

    try {
      if (correctionMode === 'cancel') {
        const res = db.deletePayment(correctionTarget.id, currentUser);
        if (!res.success) {
          throw new Error(res.message);
        }
        setCorrectionSuccess(`Pembayaran kas Rp${correctionTarget.amount.toLocaleString('id-ID')} atas nama ${correctionTarget.student?.full_name || 'Mahasiswa'} berhasil dibatalkan dan dihapus.`);
      } else {
        if (!editAmount || Number(editAmount) <= 0) {
          throw new Error('Nominal koreksi harus lebih dari 0.');
        }
        const res = db.updatePayment(correctionTarget.id, {
          amount: Number(editAmount),
          payment_date: editDate,
          admin_note: editNote.trim() || undefined
        }, currentUser);
        if (!res.success) {
          throw new Error(res.message);
        }
        setCorrectionSuccess(`Data pembayaran berhasil diperbarui menjadi Rp${Number(editAmount).toLocaleString('id-ID')}.`);
      }

      reloadData();

      // Auto close after 1.6s
      setTimeout(() => {
        setCorrectionTarget(null);
        setCorrectionSuccess(null);
        setIsSubmittingCorrection(false);
      }, 1600);
    } catch (err: any) {
      setCorrectionError(err.message || 'Gagal memproses koreksi pembayaran.');
      setIsSubmittingCorrection(false);
    }
  };

  const handleVerify = () => {
    if (!verifyingPayment) return;
    db.verifyPayment(verifyingPayment.id, adminNote || 'Pembayaran diverifikasi valid', currentUser);
    setVerifyingPayment(null);
    setAdminNote('');
    reloadData();
  };

  const handleReject = () => {
    if (!rejectingPayment) return;
    db.rejectPayment(rejectingPayment.id, rejectReason, currentUser);
    setRejectingPayment(null);
    setRejectReason('Bukti transfer tidak valid atau nominal tidak sesuai.');
    reloadData();
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'verified' && p.status !== 'verified') return false;
    if (activeTab === 'pending' && p.status !== 'pending') return false;
    if (activeTab === 'rejected' && p.status !== 'rejected') return false;

    if (methodFilter !== 'all' && p.payment_method !== methodFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = p.student?.full_name.toLowerCase() || '';
      const nim = p.student?.nim.toLowerCase() || '';
      const billName = p.bill?.name.toLowerCase() || '';
      if (!studentName.includes(q) && !nim.includes(q) && !billName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');
  const totalVerifiedAmount = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Group by bill if selected
  const billsGroupMap = filteredPayments.reduce((acc, p) => {
    const key = p.bill?.name || 'Tagihan Lainnya';
    if (!acc[key]) {
      acc[key] = {
        billName: key,
        billId: p.bill_id,
        items: [],
        totalAmount: 0
      };
    }
    acc[key].items.push(p);
    acc[key].totalAmount += p.amount;
    return acc;
  }, {} as Record<string, { billName: string; billId: string; items: Payment[]; totalAmount: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Verifikasi & Mutasi Pembayaran Kas</h2>
            {pendingPayments.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-bold animate-pulse">
                {pendingPayments.length} Menunggu Verifikasi
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau orang yang sudah membayar, verifikasi bukti transfer, dan koreksi jika ada salah catat kas tunai
          </p>
        </div>

        {/* Total verified banner */}
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HandCoins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Kas Lunas</span>
            <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(totalVerifiedAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Tab Navigation: Pengelompokan Data */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Semua Transaksi</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30 font-mono">
              {payments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verified')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'verified'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah Membayar (Lunas)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30 font-mono font-bold text-emerald-200">
              {verifiedPayments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Perlu Verifikasi</span>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-mono font-bold">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30 font-mono">
              {rejectedPayments.length}
            </span>
          </button>
        </div>

        {/* View mode toggle: Group by Tagihan vs Flat List */}
        <button
          onClick={() => setGroupByBill(!groupByBill)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            groupByBill 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{groupByBill ? 'Mode: Dikelompokkan per Tagihan' : 'Kelompokkan per Tagihan'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#151F32] border border-[#26354D]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama mahasiswa, NIM, atau nama tagihan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Hanya Tunai (Cash)</option>
            <option value="online">Hanya Lynk.id (Online)</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={
            activeTab === 'verified' 
              ? 'Belum Ada Mahasiswa yang Membayar' 
              : activeTab === 'pending' 
                ? 'Tidak Ada Pembayaran Menunggu Verifikasi'
                : 'Tidak Ada Transaksi Pembayaran'
          }
          description="Gunakan tombol 'Catat Kas Tunai' untuk membukukan pembayaran tunai mahasiswa secara langsung."
        />
      ) : groupByBill ? (
        /* ================= GROUPED BY BILL VIEW ================= */
        <div className="space-y-5">
          {Object.values(billsGroupMap).map((group) => (
            <div key={group.billName} className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    #
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{group.billName}</h3>
                    <p className="text-xs text-slate-400">
                      {group.items.length} orang tercatat · {group.items.filter(i => i.status === 'verified').length} Lunas
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Terkumpul</span>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {formatCurrency(group.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Responsive Cards / List for Group */}
              <div className="divide-y divide-slate-800/60">
                {group.items.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                        {p.student?.full_name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{p.student?.full_name || 'Mahasiswa'}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({p.student?.nim || '-'})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{formatDateID(p.payment_date)}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.payment_method === 'cash'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {p.payment_method === 'cash' ? 'Tunai' : 'Lynk.id'}
                          </span>
                          <StatusBadge status={p.status} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-mono font-bold text-white tabular-nums">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Bukti button */}
                        <button
                          onClick={() => setSelectedProofPayment(p)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Kuitansi button */}
                        {p.status === 'verified' && (
                          <button
                            onClick={() => setSelectedReceiptPayment(p)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                            title="Cetak Kuitansi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Salah Catat / Batalkan button */}
                        <button
                          onClick={() => handleOpenCorrection(p)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                          title="Salah catat? Klik untuk batalkan atau koreksi"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Salah Catat?</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= FLAT TABLE VIEW ================= */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Mahasiswa</th>
                  <th className="py-3.5 px-4">Tagihan Kas</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4">Metode</th>
                  <th className="py-3.5 px-4">Bukti Bayar</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi & Koreksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredPayments.map((p) => {
                  const isPending = p.status === 'pending';
                  const isVerified = p.status === 'verified';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        {formatDateID(p.payment_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.student?.full_name || 'Mahasiswa'}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.student?.nim} · {p.student?.class_name || 'Informatika'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{p.bill?.name || 'Tagihan Kas'}</div>
                        {p.student_note && (
                          <div className="text-[11px] text-slate-400 italic truncate max-w-[200px] mt-0.5">
                            "{p.student_note}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          p.payment_method === 'cash'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {p.payment_method === 'cash' ? 'Tunai' : 'Lynk.id'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.payment_method === 'cash' ? (
                          <button
                            onClick={() => setSelectedProofPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-800 text-[11px] text-emerald-400 border border-emerald-500/20 transition-colors"
                          >
                            <HandCoins className="w-3 h-3" />
                            <span>Setor Tunai</span>
                          </button>
                        ) : p.proof_url ? (
                          <button
                            onClick={() => setSelectedProofPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-400 border border-slate-700 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedProofPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px]"
                          >
                            <FileQuestion className="w-3 h-3" />
                            <span>Tidak Ada Bukti</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => {
                                  setVerifyingPayment(p);
                                  setAdminNote('Pembayaran diverifikasi valid');
                                }}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                                title="Verifikasi Sah"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verifikasi</span>
                              </button>
                              <button
                                onClick={() => setRejectingPayment(p)}
                                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 font-medium text-xs transition-colors"
                                title="Tolak Bukti"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : isVerified ? (
                            <button
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Kuitansi</span>
                            </button>
                          ) : (
                            <span className="text-xs text-rose-400 font-medium">Ditolak</span>
                          )}

                          {/* Salah Catat / Batalkan Button */}
                          <button
                            onClick={() => handleOpenCorrection(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                            title="Salah catat? Klik untuk batalkan atau ubah"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Salah Catat?</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= PROOF INSPECTION MODAL ================= */}
      {selectedProofPayment && (
        <Modal
          isOpen={Boolean(selectedProofPayment)}
          onClose={() => setSelectedProofPayment(null)}
          title="Bukti Transfer Pembayaran"
          subtitle={`${selectedProofPayment.student?.full_name} (${selectedProofPayment.student?.nim}) · ${selectedProofPayment.bill?.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Nominal Pembayaran Kas:</span>
              <span className="font-bold text-white font-mono tabular-nums text-sm">
                {formatCurrency(selectedProofPayment.amount)}
              </span>
            </div>

            {/* Check if proof exists */}
            {!selectedProofPayment.proof_url || selectedProofPayment.payment_method === 'cash' || !selectedProofPayment.proof_url.trim() ? (
              <div className="p-8 text-center space-y-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FileQuestion className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Bukti Transfer Tidak Ditemukan / Tidak Diunggah</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {selectedProofPayment.payment_method === 'cash'
                      ? 'Pembayaran ini disetorkan secara tunai langsung kepada bendahara kelas, sehingga sah tercatat tanpa unggahan bukti transfer digital.'
                      : 'Mahasiswa tidak melampirkan berkas foto atau gambar bukti transfer saat melakukan pelaporan via portal.'}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status: {selectedProofPayment.status === 'verified' ? 'LUNAS TERVERIFIKASI' : selectedProofPayment.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center min-h-[240px]">
                {selectedProofPayment.proof_url.startsWith('data:image') ||
                selectedProofPayment.proof_url.includes('unsplash') ||
                selectedProofPayment.proof_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                  <img
                    src={selectedProofPayment.proof_url}
                    alt="Bukti Transfer"
                    className="max-h-80 w-auto object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <FileText className="w-10 h-10 text-blue-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">File Dokumen Bukti (PDF / Format Lain)</p>
                    <a
                      href={selectedProofPayment.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold hover:bg-slate-700 transition-colors"
                    >
                      <span>Buka File Dokumen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {selectedProofPayment.student_note && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-0.5">Catatan Mahasiswa:</span>
                "{selectedProofPayment.student_note}"
              </div>
            )}

            {selectedProofPayment.status === 'pending' && (
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    const target = selectedProofPayment;
                    setSelectedProofPayment(null);
                    setRejectingPayment(target);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-rose-400 hover:bg-slate-700 transition-colors"
                >
                  Tolak Bukti
                </button>
                <button
                  onClick={() => {
                    const target = selectedProofPayment;
                    setSelectedProofPayment(null);
                    setVerifyingPayment(target);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                >
                  Verifikasi Sah LUNAS
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ================= SALAH CATAT / KOREKSI MODAL ================= */}
      {correctionTarget && (
        <Modal
          isOpen={Boolean(correctionTarget)}
          onClose={() => {
            if (!isSubmittingCorrection) {
              setCorrectionTarget(null);
              setCorrectionSuccess(null);
            }
          }}
          title={correctionSuccess ? 'Koreksi Berhasil!' : 'Koreksi / Batalkan Pembayaran (Salah Catat)'}
          subtitle={correctionSuccess ? 'Data kas berhasil disesuaikan' : `Perbaiki kesalahan pencatatan transaksi untuk ${correctionTarget.student?.full_name || 'Mahasiswa'}`}
          maxWidth="md"
        >
          {correctionSuccess ? (
            /* Celebratory Success View */
            <div className="py-6 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>Koreksi Selesai!</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-300">{correctionSuccess}</p>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-emerald-500 rounded-full animate-[progress_1.6s_ease-out_forwards]" style={{ width: '100%' }} />
              </div>
              <span className="text-[11px] text-slate-500 block">Menutup otomatis...</span>
            </div>
          ) : (
            /* Options & Form View */
            <div className="space-y-4">
              {correctionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{correctionError}</span>
                </div>
              )}

              {/* Transaction Preview Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mahasiswa:</span>
                  <span className="font-semibold text-white">{correctionTarget.student?.full_name} ({correctionTarget.student?.nim})</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tagihan:</span>
                  <span className="font-semibold text-cyan-400">{correctionTarget.bill?.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Nominal Terdaftar:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(correctionTarget.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Metode / Tanggal:</span>
                  <span className="text-slate-300 capitalize">{correctionTarget.payment_method} · {formatDateID(correctionTarget.payment_date)}</span>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCorrectionMode('cancel')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    correctionMode === 'cancel'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Batalkan & Hapus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionMode('edit')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    correctionMode === 'edit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Koreksi Nominal</span>
                </button>
              </div>

              {correctionMode === 'cancel' ? (
                /* Cancel Mode Warning */
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Konfirmasi Pembatalan Salah Catat</span>
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Jika transaksi ini dibatalkan, status tagihan mahasiswa akan <strong>kembali BELUM LUNAS</strong> dan saldo kas kas akan otomatis berkurang sesuai nominal yang dibatalkan.
                  </p>
                </div>
              ) : (
                /* Edit Mode Form */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Koreksi Nominal Pembayaran (Rp) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="500"
                      placeholder="Masukkan nominal..."
                      value={editAmount}
                      onFocus={(e) => {
                        if (editAmount === 0) setEditAmount('');
                        e.target.select();
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setEditAmount('');
                        } else {
                          const num = parseInt(val, 10);
                          setEditAmount(isNaN(num) ? '' : num);
                        }
                      }}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tanggal Diterima *
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alasan / Catatan Koreksi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Koreksi salah ketik nominal oleh bendahara..."
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  disabled={isSubmittingCorrection}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCorrection}
                  disabled={isSubmittingCorrection}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm ${
                    correctionMode === 'cancel'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {isSubmittingCorrection ? (
                    <span>Memproses...</span>
                  ) : correctionMode === 'cancel' ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Batalkan Pembayaran</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Verification Modal */}
      {verifyingPayment && (
        <Modal
          isOpen={Boolean(verifyingPayment)}
          onClose={() => setVerifyingPayment(null)}
          title="Verifikasi Pembayaran Kas"
          subtitle={`Tagihan: ${verifyingPayment.bill?.name} · ${verifyingPayment.student?.full_name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(verifyingPayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode:</span>
                <span className="text-white capitalize">{verifyingPayment.payment_method}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Verifikasi Bendahara (Opsional)
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Bukti transfer valid & dana masuk rekening"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setVerifyingPayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleVerify}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sahkan LUNAS</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectingPayment && (
        <Modal
          isOpen={Boolean(rejectingPayment)}
          onClose={() => setRejectingPayment(null)}
          title="Tolak Bukti Pembayaran"
          subtitle={`Tagihan: ${rejectingPayment.bill?.name} · ${rejectingPayment.student?.full_name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alasan Penolakan (Akan dikirimkan ke mahasiswa)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Pembayaran</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {selectedReceiptPayment && (
        <ReceiptModal
          isOpen={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          payment={selectedReceiptPayment}
        />
      )}
    </div>
  );
};
