import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, IncomeTransaction } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { OTHER_INCOME_CATEGORIES } from '../../lib/constants';
import { 
  ArrowUpRight, 
  Plus, 
  DollarSign, 
  FileText, 
  Tag,
  Pencil,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface IncomePageProps {
  activeAcademicYear: AcademicYear;
}

export const IncomePage: React.FC<IncomePageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [incomes, setIncomes] = useState<IncomeTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeTransaction | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState<any>('Donasi');
  const [amount, setAmount] = useState<number>(100000);
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ sourceName: string; amount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reloadData = () => {
    setIncomes(db.getOtherIncome(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const totalOtherIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setSourceName('');
    setCategory('Donasi');
    setAmount(100000);
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsSuccess(false);
    setSuccessInfo(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IncomeTransaction) => {
    setEditingIncome(item);
    setSourceName(item.source_name);
    setCategory(item.category);
    setAmount(item.amount);
    setReceivedDate(item.received_date);
    setNotes(item.notes || '');
    setIsSuccess(false);
    setSuccessInfo(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || amount <= 0) {
      setError('Harap isi nama sumber dan nominal pemasukan.');
      return;
    }

    try {
      if (editingIncome) {
        db.updateOtherIncome(editingIncome.id, {
          source_name: sourceName.trim(),
          category,
          amount: Number(amount),
          received_date: receivedDate,
          notes: notes.trim()
        }, currentUser);
      } else {
        db.createOtherIncome({
          academic_year_id: activeAcademicYear.id,
          source_name: sourceName.trim(),
          category,
          amount: Number(amount),
          received_date: receivedDate,
          notes: notes.trim()
        }, currentUser);
      }

      setSuccessInfo({
        sourceName: sourceName.trim(),
        amount: Number(amount)
      });
      setIsSuccess(true);
      reloadData();

      // Auto close modal after 1.6s
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingIncome(null);
        setIsSuccess(false);
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pemasukan.');
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    db.deleteOtherIncome(deleteTarget.id, currentUser);
    setDeleteTarget(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Pemasukan Kas Non-Tagihan</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-bold">
              Total: {formatCurrency(totalOtherIncome)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Catat dan kelola dana masuk di luar tagihan mahasiswa seperti donasi alumni, sponsorship, atau dana usaha
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pemasukan Baru</span>
        </button>
      </div>

      {/* Content: Mobile Cards + Desktop Table */}
      {incomes.length === 0 ? (
        <EmptyState
          icon={ArrowUpRight}
          title="Belum Ada Pemasukan Lain"
          description="Pemasukan dari luar tagihan mahasiswa (seperti donasi atau sponsor) akan tercatat di sini."
          actionLabel="Catat Pemasukan"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List (tampilan HP langsung terlihat jelas tanpa scroll) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {incomes.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#151F32] border border-[#26354D] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{item.source_name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.notes || 'Tanpa keterangan'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400 block">
                      +{formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDateID(item.received_date)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#26354D]/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                  <tr>
                    <th className="py-3 px-4">Tanggal Terima</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Sumber Pemasukan</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                  {incomes.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1B263B]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDateID(item.received_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {item.source_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(item.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Edit Pemasukan"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Hapus Pemasukan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIncome(null);
          setIsSuccess(false);
        }}
        title={isSuccess ? 'Pemasukan Berhasil Dicatat!' : (editingIncome ? 'Edit Pemasukan Kas Non-Tagihan' : 'Catat Pemasukan Kas Lain')}
        subtitle={isSuccess ? 'Saldo kas program studi telah disesuaikan' : 'Dana akan langsung disesuaikan pada Saldo Kas program studi'}
        maxWidth="md"
      >
        {isSuccess && successInfo ? (
          <div className="py-6 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-3 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                <CheckCircle2 className="w-10 h-10 text-slate-950 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>Pemasukan Berhasil Disimpan!</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Data pemasukan telah tersimpan dan saldo kas otomatis bertambah.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Sumber Dana:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{successInfo.sourceName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>Nominal Pemasukan:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">+{formatCurrency(successInfo.amount)}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full animate-[progress_1.6s_ease-out_forwards]" style={{ width: '100%' }} />
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
              Sumber / Pemberi Dana *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Contoh: Donasi Alumni IF-20, Sponsor PT ABC, Dana Bazar"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kategori Pemasukan
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 appearance-none"
                >
                  {OTHER_INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal (Rp) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tanggal Penerimaan *
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Keterangan / Catatan
            </label>
            <textarea
              rows={2}
              placeholder="Rincian dana masuk..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26354D]">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingIncome(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              {editingIncome ? 'Simpan Perubahan' : 'Simpan Pemasukan'}
            </button>
          </div>
        </form>
      )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan Pemasukan?"
        message={`Apakah Anda yakin ingin menghapus pemasukan "${deleteTarget?.source_name}" sebesar ${formatCurrency(deleteTarget?.amount || 0)}? Saldo kas akan berkurang kembali secara otomatis.`}
        variant="danger"
        confirmLabel="Hapus Pemasukan"
      />
    </div>
  );
};
