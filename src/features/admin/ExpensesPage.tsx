import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, Expense, ExpenseCategory } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { uploadExpenseProof } from '../../services/storage';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { 
  TrendingDown, 
  Plus, 
  Trash2, 
  Upload, 
  Eye, 
  Calendar, 
  Tag, 
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ExpensesPageProps {
  activeAcademicYear: AcademicYear;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [previewProof, setPreviewProof] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Kegiatan');
  const [amount, setAmount] = useState<number>(50000);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ description: string; amount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reloadData = () => {
    setExpenses(db.getExpenses(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setDescription('');
    setCategory('Kegiatan');
    setAmount(50000);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSelectedFile(null);
    setIsSuccess(false);
    setSuccessInfo(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) {
      setError('Deskripsi dan nominal pengeluaran wajib diisi.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let proofUrl: string | undefined = undefined;
      if (selectedFile) {
        const uploadRes = await uploadExpenseProof(selectedFile, description);
        if (uploadRes.success) {
          proofUrl = uploadRes.url;
        }
      }

      db.createExpense({
        academic_year_id: activeAcademicYear.id,
        description: description.trim(),
        category,
        amount: Number(amount),
        expense_date: expenseDate,
        proof_url: proofUrl,
        notes: notes.trim()
      }, currentUser);

      setSuccessInfo({
        description: description.trim(),
        amount: Number(amount)
      });
      setIsSuccess(true);
      reloadData();

      // Auto close after 1.6s
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengeluaran.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    db.deleteExpense(deleteTarget.id, currentUser);
    setDeleteTarget(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Pencatatan Pengeluaran Kas</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-bold">
              Total: {formatCurrency(totalExpense)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Setiap pengeluaran kas resmi akan langsung memotong saldo kas tahun akademik {activeAcademicYear.name}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(167,139,250,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pengeluaran</span>
        </button>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="Belum Ada Pengeluaran"
          description="Catat pengeluaran kegiatan kelas, perlengkapan, konsumsi, atau administrasi di sini."
          actionLabel="Catat Pengeluaran Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Struk / Nota</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1B263B]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateID(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-400">{exp.notes || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {exp.proof_url ? (
                        <button
                          onClick={() => setPreviewProof(exp.proof_url || null)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0B1120] text-cyan-400 hover:text-white border border-[#26354D] text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Nota</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTarget(exp)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsSuccess(false);
        }}
        title={isSuccess ? 'Pengeluaran Berhasil Dicatat!' : 'Catat Pengeluaran Kas'}
        subtitle={isSuccess ? 'Saldo kas riil telah terpotong secara otomatis' : 'Nominal akan mengurangi saldo kas riil secara otomatis'}
        maxWidth="md"
      >
        {isSuccess && successInfo ? (
          <div className="py-6 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-3 rounded-full bg-purple-500/20 animate-ping opacity-75" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>Pengeluaran Berhasil Dibukukan!</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Pengeluaran telah tercatat dan saldo kas otomatis berkurang.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Keperluan:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{successInfo.description}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>Nominal Pengeluaran:</span>
                <span className="text-rose-400 font-mono font-bold text-sm">-{formatCurrency(successInfo.amount)}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-[progress_1.6s_ease-out_forwards]" style={{ width: '100%' }} />
              </div>
              <span className="text-[11px] text-slate-500">Menutup otomatis...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deskripsi Pengeluaran *
            </label>
            <input
              type="text"
              placeholder="Contoh: Snack Rapat Panitia / Pembelian Banner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Upload Nota */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Bukti Nota / Struk (Opsional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan / Keterangan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan untuk transparansi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26354D]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-[0_0_15px_rgba(167,139,250,0.3)]"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Simpan Pengeluaran</span>
            </button>
          </div>
        </form>
      )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan Pengeluaran?"
        message={`Apakah Anda yakin ingin menghapus pengeluaran "${deleteTarget?.description}" sebesar ${formatCurrency(deleteTarget?.amount || 0)}? Saldo kas akan bertambah kembali secara otomatis.`}
        variant="danger"
        confirmLabel="Hapus Pengeluaran"
      />

      {/* Proof Preview Modal */}
      {previewProof && (
        <Modal
          isOpen={Boolean(previewProof)}
          onClose={() => setPreviewProof(null)}
          title="Bukti Nota / Struk Pengeluaran"
          maxWidth="lg"
        >
          <div className="p-2 bg-[#0B1120] rounded-xl flex items-center justify-center">
            <img src={previewProof} alt="Nota" className="max-h-96 w-auto object-contain rounded" />
          </div>
        </Modal>
      )}
    </div>
  );
};
