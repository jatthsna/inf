import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { HandCoins, AlertCircle, CheckCircle2, Sparkles, User, FileText, Calendar, ArrowRight } from 'lucide-react';

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

  const [studentId, setStudentId] = useState('');
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState<number>(10000);
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
      const targetBill = preselectedBillId || (activeBills[0]?.id || '');
      setStudentId(targetStudent);
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

  const handleBillChange = (newBillId: string) => {
    setBillId(newBillId);
    const selected = bills.find(b => b.id === newBillId);
    if (selected) {
      setAmount(selected.amount);
    }
  };

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
    if (amount <= 0) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? 'Pembayaran Berhasil!' : 'Catat Pembayaran Tunai (Cash Langsung)'}
      subtitle={isSuccess ? 'Data kas telah dibukukan' : 'Pembayaran tunai langsung diverifikasi sah (Lunas) dan membukukan mutasi ke saldo kas'}
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
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Kas tunai langsung berstatus resmi <strong>LUNAS (VERIFIED)</strong> dan tercatat dalam Buku Kas Umum tanpa membutuhkan unggahan bukti pembayaran.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mahasiswa Pembayar *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            >
              {students.length === 0 ? (
                <option value="">-- Belum ada mahasiswa aktif --</option>
              ) : (
                students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.nim}) · {st.class_name || 'Informatika'}
                  </option>
                ))
              )}
            </select>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nominal Diterima (Rp) *
              </label>
              <input
                type="number"
                min="1"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold tabular-nums focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

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
