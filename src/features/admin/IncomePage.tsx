import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, IncomeTransaction } from '../../types';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { OTHER_INCOME_CATEGORIES } from '../../lib/constants';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag 
} from 'lucide-react';

interface IncomePageProps {
  activeAcademicYear: AcademicYear;
}

export const IncomePage: React.FC<IncomePageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [incomes, setIncomes] = useState<IncomeTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState<any>('Donasi');
  const [amount, setAmount] = useState<number>(100000);
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reloadData = () => {
    setIncomes(db.getOtherIncome(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const totalOtherIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || amount <= 0) {
      setError('Harap isi nama sumber dan nominal pemasukan.');
      return;
    }

    try {
      db.createOtherIncome({
        academic_year_id: activeAcademicYear.id,
        source_name: sourceName.trim(),
        category,
        amount: Number(amount),
        received_date: receivedDate,
        notes: notes.trim()
      }, currentUser);

      setIsModalOpen(false);
      setSourceName('');
      setAmount(100000);
      setNotes('');
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat pemasukan.');
    }
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
            Catat dana masuk di luar tagihan mahasiswa seperti donasi alumni, sponsorship, atau dana usaha
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pemasukan Baru</span>
        </button>
      </div>

      {/* Table */}
      {incomes.length === 0 ? (
        <EmptyState
          icon={ArrowUpRight}
          title="Belum Ada Pemasukan Lain"
          description="Pemasukan dari luar tagihan mahasiswa (seperti donasi atau sponsor) akan tercatat di sini."
          actionLabel="Catat Pemasukan"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                <tr>
                  <th className="py-3 px-4">Tanggal Terima</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Sumber Pemasukan</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Pemasukan Kas Lain"
        subtitle="Dana akan langsung ditambahkan ke Saldo Kas program studi"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Sumber Pemasukan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Donasi Alumni 2020 / Sponsor Hackathon"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {OTHER_INCOME_CATEGORIES.map((cat) => (
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
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tanggal Penerimaan
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
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              Simpan Pemasukan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
