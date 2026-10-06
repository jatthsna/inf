import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { HandCoins, AlertCircle, CheckCircle2, Sparkles, User, FileText, Calendar, ArrowRight, Search, Check } from 'lucide-react';

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicYearId: string;
  onSuccess?: () => void;
  preselectedStudentId?: string;
  preselectedBillId?: string;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  onClose,
  academicYearId,
  onSuccess,
  preselectedStudentId,
  preselectedBillId
}) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState(() => db.getStudents().filter(s => s.status === 'active'));
  const [bills, setBills] = useState(() => db.getBills(academicYearId).filter(b => b.is_active));

  const [studentSearch, setStudentSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState<number | ''>(10000);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Diterima langsung secara tunai oleh bendahara');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ studentName: string; billName: string; amount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync data every time the modal opens
  useEffect(() => {
    if (isOpen) {
      const activeStudents = db.getStudents().filter(s => s.status === 'active');
      const activeBills = db.getBills(academicYearId).filter(b => b.is_active);
      setStudents(activeStudents);
      setBills(activeBills);

      const targetStudent = preselectedStudentId || (activeStudents[0]?.id || '');
      setStudentId(targetStudent);
      setStudentSearch('');

      // Auto pick first unpaid bill for target student if possible
      let targetBill = preselectedBillId;
      if (!targetBill && targetStudent) {
        const studentAssignments = db.getStudentBillAssignments(targetStudent, academicYearId);
        const unpaid = studentAssignments.find(a => a.status === 'unpaid' || a.status === 'overdue');
        if (unpaid) {
          targetBill = unpaid.bill_id;
        }
      }
      if (!targetBill) {
        targetBill = activeBills[0]?.id || '';
      }
      setBillId(targetBill);

      const selBill = activeBills.find(b => b.id === targetBill);
      if (selBill) {
        setAmount(selBill.amount);
      }

      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('Diterima langsung secara tunai oleh bendahara');
      setIsSuccess(false);
      setSuccessInfo(null);
      setError(null);
    }
  }, [isOpen, academicYearId, preselectedStudentId, preselectedBillId]);

  // When student changes, auto-recommend their unpaid bill
  const handleStudentSelect = (newStudentId: string) => {
    setStudentId(newStudentId);
    if (!newStudentId) return;

    const studentAssignments = db.getStudentBillAssignments(newStudentId, academicYearId);
    const unpaid = studentAssignments.find(a => a.status === 'unpaid' || a.status === 'overdue');
    if (unpaid) {
      setBillId(unpaid.bill_id);
      const selBill = bills.find(b => b.id === unpaid.bill_id);
      if (selBill) {
        setAmount(selBill.amount);
      }
    }
  };

  const handleBillChange = (newBillId: string) => {
    setBillId(newBillId);
    const selected = bills.find(b => b.id === newBillId);
    if (selected) {
      setAmount(selected.amount);
    }
  };

  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Pilih mahasiswa pembayar terlebih dahulu.');
      return;
    }
    if (!billId) {
      setError('Pilih tagihan kas yang dibayar.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Nominal pembayaran harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedStudent = students.find(s => s.id === studentId);
      const selectedBill = bills.find(b => b.id === billId);

      db.recordCashPayment({
        billId,
        studentId,
        amount: Number(amount),
        paymentDate,
        notes: notes.trim(),
        actorProfile: currentUser
      });

      // Show success animation
      setSuccessInfo({
        studentName: selectedStudent?.full_name || 'Mahasiswa',
        billName: selectedBill?.name || 'Tagihan Kas',
        amount: Number(amount)
      });
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess();
      }

      // Auto close after 1.6s
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat pembayaran cash.');
      setIsSubmitting(false);
    }
  };

  const currentSelectedBill = bills.find(b => b.id === billId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? 'Pembayaran Berhasil!' : 'Catat Pembayaran Tunai (Cash Langsung)'}
      subtitle={isSuccess ? 'Data kas telah dibukukan' : 'Khusus pengurus untuk mencatat uang tunai yang diterima langsung dari mahasiswa'}
      maxWidth="md"
    >
      {isSuccess && successInfo ? (
        /* SUCCESS ANIMATION VIEW */
        <div className="py-6 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative inline-flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>Kas Berhasil Dicatat!</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Status tagihan otomatis <span className="text-emerald-400 font-semibold">LUNAS</span> dan saldo kas bertambah.
            </p>
          </div>

          {/* Details Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-left space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Mahasiswa:</span>
              <span className="text-white font-semibold truncate max-w-[200px]">{successInfo.studentName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Tagihan:</span>
              <span className="text-cyan-400 font-medium truncate max-w-[200px]">{successInfo.billName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
              <span>Nominal Kas:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">+{formatCurrency(successInfo.amount)}</span>
            </div>
          </div>

          {/* Progress bar countdown auto close */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-[progress_1.6s_ease-out_forwards]" style={{ width: '100%' }} />
            </div>
            <span className="text-[11px] text-slate-500">Menutup otomatis...</span>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {bills.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
              <p className="font-semibold">⚠️ Belum Ada Tagihan Kas Aktif</p>
              <p className="text-slate-400">
                Silakan buat tagihan kas terlebih dahulu di menu <b>Tagihan Kas</b> agar pembayaran tunai dapat ditautkan.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
              <span>⚡ Pembayaran tunai langsung diverifikasi sah <strong>LUNAS</strong>.</span>
              <span className="text-[10px] text-slate-400">Bisa dibatalkan jika salah catat</span>
            </div>
          )}

          {/* Mahasiswa Selector with fast search */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mahasiswa Pembayar *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {students.length} Mahasiswa Aktif
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik nama atau NIM untuk filter cepat..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            >
              {filteredStudents.length === 0 ? (
                <option value="">-- Mahasiswa tidak ditemukan --</option>
              ) : (
                filteredStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.nim}) · {st.class_name || 'Informatika'}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Tagihan Kas Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tagihan Kas yang Dibayar *
            </label>
            <select
              value={billId}
              onChange={(e) => handleBillChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            >
              {bills.length === 0 ? (
                <option value="">-- Tidak ada tagihan kas --</option>
              ) : (
                bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {formatCurrency(b.amount)}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Nominal with Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nominal Diterima (Rp) *
              </label>
              {currentSelectedBill && (
                <button
                  type="button"
                  onClick={() => setAmount(currentSelectedBill.amount)}
                  className="text-[11px] text-cyan-400 hover:underline font-medium"
                >
                  Set Pas ({formatCurrency(currentSelectedBill.amount)})
                </button>
              )}
            </div>

            <input
              type="number"
              min="1"
              step="500"
              placeholder="Masukkan nominal..."
              value={amount}
              onFocus={(e) => {
                if (amount === 0) setAmount('');
                e.target.select();
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAmount('');
                } else {
                  const num = parseInt(val, 10);
                  setAmount(isNaN(num) ? '' : num);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold tabular-nums focus:outline-none focus:border-cyan-500"
              required
            />

            {/* Quick Nominal Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500">Pilihan Cepat:</span>
              {currentSelectedBill && (
                <button
                  type="button"
                  onClick={() => setAmount(currentSelectedBill.amount)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition-all ${
                    amount === currentSelectedBill.amount
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Pas: {formatCurrency(currentSelectedBill.amount)}
                </button>
              )}
              {[10000, 20000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition-all ${
                    amount === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Diterima *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Bendahara
              </label>
              <input
                type="text"
                placeholder="Keterangan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || bills.length === 0 || students.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HandCoins className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran Tunai'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
