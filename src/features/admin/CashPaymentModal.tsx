import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { HandCoins, AlertCircle, Calendar, User, Receipt } from 'lucide-react';

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
  const students = db.getStudents().filter(s => s.status === 'active');
  const bills = db.getBills(academicYearId).filter(b => b.is_active);

  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [billId, setBillId] = useState(preselectedBillId || (bills[0]?.id || ''));
  const [amount, setAmount] = useState<number>(() => {
    const b = bills.find(item => item.id === (preselectedBillId || bills[0]?.id));
    return b ? b.amount : 10000;
  });
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Diterima langsung secara tunai oleh bendahara');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBillChange = (newBillId: string) => {
    setBillId(newBillId);
    const selected = bills.find(b => b.id === newBillId);
    if (selected) {
      setAmount(selected.amount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !billId || amount <= 0) {
      setError('Harap lengkapi semua kolom dengan benar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      db.recordCashPayment({
        billId,
        studentId,
        amount: Number(amount),
        paymentDate,
        notes,
        actorProfile: currentUser
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat pembayaran cash.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Pembayaran Tunai (Cash Langsung)"
      subtitle="Pembayaran tunai langsung diverifikasi sah (Lunas) dan membukukan mutasi ke saldo kas"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          Kas tunai langsung berstatus resmi <strong>LUNAS (VERIFIED)</strong> dan tercatat dalam Buku Kas Umum tanpa membutuhkan unggahan bukti pembayaran.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mahasiswa Pembayar
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name} ({st.nim}) · {st.class_name || 'Informatika'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tagihan Kas yang Dibayar
          </label>
          <select
            value={billId}
            onChange={(e) => handleBillChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {bills.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {formatCurrency(b.amount)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nominal Diterima (Rp)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono font-bold tabular-nums focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Diterima
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
          >
            <HandCoins className="w-4 h-4" />
            <span>Simpan Pembayaran Tunai</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
