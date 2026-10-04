import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Archive, 
  AlertTriangle, 
  Edit3, 
  Wallet,
  Clock
} from 'lucide-react';

interface AcademicYearsPageProps {
  activeAcademicYear: AcademicYear;
  onSelectYear: (yearId: string) => void;
}

export const AcademicYearsPage: React.FC<AcademicYearsPageProps> = ({
  activeAcademicYear,
  onSelectYear
}) => {
  const { currentUser } = useAuth();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [selectedYearForBalance, setSelectedYearForBalance] = useState<AcademicYear | null>(null);
  const [activateTarget, setActivateTarget] = useState<AcademicYear | null>(null);

  // Form State
  const [yearName, setYearName] = useState('2027/2028');
  const [startDate, setStartDate] = useState('2027-09-01');
  const [endDate, setEndDate] = useState('2028-08-31');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reloadData = () => {
    setAcademicYears(db.getAcademicYears());
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  const handleOpenCreate = () => {
    setYearName('2027/2028');
    setStartDate('2027-09-01');
    setEndDate('2028-08-31');
    // Default initial balance could be the current balance of the active year!
    const curSummary = db.getFinancialSummary(activeAcademicYear.id);
    setInitialBalance(Math.max(0, curSummary.current_balance));
    setNotes('Tahun akademik kepengurusan berikutnya');
    setError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim()) {
      setError('Nama tahun akademik wajib diisi (contoh: 2027/2028).');
      return;
    }

    try {
      const newYear = db.createAcademicYear({
        name: yearName.trim(),
        start_date: startDate,
        end_date: endDate,
        initial_balance: Number(initialBalance) || 0,
        is_active: false, // create as draft/pending until activated
        notes: notes.trim()
      }, currentUser);

      setIsCreateOpen(false);
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tahun akademik baru.');
    }
  };

  const handleConfirmActivate = () => {
    if (!activateTarget) return;
    db.setActiveAcademicYear(activateTarget.id, currentUser);
    onSelectYear(activateTarget.id);
    setActivateTarget(null);
    reloadData();
  };

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearForBalance) return;

    db.updateInitialBalance(selectedYearForBalance.id, Number(initialBalance), currentUser);
    setIsEditBalanceOpen(false);
    setSelectedYearForBalance(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Manajemen Tahun Akademik</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem isolasi keuangan tahunan: data arsip tetap utuh dan tidak bercampur dengan tahun berjalan
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tahun Akademik Baru</span>
        </button>
      </div>

      {/* Grid of Academic Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academicYears.map((year) => {
          const summary = db.getFinancialSummary(year.id);
          const isCurrentActive = year.is_active;

          return (
            <div
              key={year.id}
              className={`rounded-2xl bg-[#151F32] border p-6 flex flex-col justify-between transition-all ${
                isCurrentActive
                  ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] ring-1 ring-cyan-500/20'
                  : 'border-[#26354D] hover:border-slate-600'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        isCurrentActive
                          ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <span>Tahun {year.name}</span>
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Aktif Berjalan
                          </span>
                        )}
                        {year.is_archived && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                            Arsip
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateID(year.start_date)} — {formatDateID(year.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {year.notes || 'Tidak ada catatan khusus.'}
                </p>

                {/* Financial Snapshot */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#26354D]">
                  <div className="p-3 rounded-xl bg-[#0B1120] border border-[#26354D]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Saldo Awal</span>
                      <button
                        onClick={() => {
                          setSelectedYearForBalance(year);
                          setInitialBalance(year.initial_balance);
                          setIsEditBalanceOpen(true);
                        }}
                        className="text-cyan-400 hover:text-cyan-300"
                        title="Ubah Saldo Awal"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(year.initial_balance)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B1120] border border-cyan-500/20">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">
                      Saldo Kas
                    </span>
                    <p className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {formatCurrency(summary.current_balance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-[#26354D] flex items-center justify-between">
                <button
                  onClick={() => onSelectYear(year.id)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Buka Data Tahun Ini →
                </button>

                {!isCurrentActive && (
                  <button
                    onClick={() => setActivateTarget(year)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Aktifkan Tahun Ini
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Year Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Tahun Akademik Baru"
        subtitle="Memungkinkan kelanjutan kas ke tahun berikutnya tanpa kehilangan histori lama"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Tahun Akademik *
            </label>
            <input
              type="text"
              placeholder="Contoh: 2027/2028"
              value={yearName}
              onChange={(e) => setYearName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Saldo Awal Tahun Baru (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Dapat diisi dari sisa saldo kas tahun sebelumnya yang dialihkan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan Periode
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26354D]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              Simpan Tahun Akademik
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Initial Balance Modal */}
      {selectedYearForBalance && (
        <Modal
          isOpen={isEditBalanceOpen}
          onClose={() => setIsEditBalanceOpen(false)}
          title={`Ubah Saldo Awal: Tahun ${selectedYearForBalance.name}`}
          subtitle="Perubahan saldo awal wajib dan akan otomatis dicatat pada audit log sistem"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateBalance} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal Saldo Awal (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={initialBalance}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26354D]">
              <button
                type="button"
                onClick={() => setIsEditBalanceOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all"
              >
                Simpan Saldo Awal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Activation Modal */}
      <ConfirmModal
        isOpen={Boolean(activateTarget)}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleConfirmActivate}
        title="Aktifkan Tahun Akademik Baru?"
        message={`Apakah Anda yakin ingin mengaktifkan tahun ${activateTarget?.name}? Tahun sebelumnya akan otomatis diarsipkan tanpa menghapus histori transaksi.`}
        variant="primary"
        confirmLabel="Ya, Aktifkan Tahun Ini"
      />
    </div>
  );
};
