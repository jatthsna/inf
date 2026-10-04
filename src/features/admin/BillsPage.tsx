import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, Bill, BillType, ClassItem, PaymentLink, UserProfile } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  Users, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock, 
  Layers,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { BILL_TYPES, MONTH_NAMES_ID } from '../../lib/constants';

interface BillsPageProps {
  activeAcademicYear: AcademicYear;
}

export const BillsPage: React.FC<BillsPageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);

  // Search & Type Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | BillType>('all');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [billName, setBillName] = useState('');
  const [description, setDescription] = useState('');
  const [billType, setBillType] = useState<BillType>('monthly');
  const [amount, setAmount] = useState<number>(10000);
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [paymentLinkId, setPaymentLinkId] = useState<string>('');
  const [targetType, setTargetType] = useState<'all' | 'class' | 'specific'>('all');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Delete State
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const reloadData = () => {
    setBills(db.getBills(activeAcademicYear.id));
    setClasses(db.getClasses());
    setPaymentLinks(db.getActivePaymentLinks());
    setStudents(db.getStudents().filter(s => s.status === 'active'));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const handleOpenCreate = () => {
    const activeLinks = db.getActivePaymentLinks();
    setBillName('');
    setDescription('');
    setBillType('monthly');
    setAmount(db.getSettings().default_monthly_amount || 10000);
    setPeriodMonth(new Date().getMonth() + 1);
    setDueDate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    });
    setPaymentLinkId(activeLinks[0]?.id || '');
    setTargetType('all');
    setTargetClassId(classes[0]?.id || '');
    setSelectedStudentIds([]);
    setError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName.trim()) {
      setError('Nama tagihan wajib diisi.');
      return;
    }
    if (amount <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }

    try {
      db.createBill(
        {
          academic_year_id: activeAcademicYear.id,
          name: billName.trim(),
          description: description.trim(),
          bill_type: billType,
          amount: Number(amount),
          period_month: billType === 'monthly' ? periodMonth : undefined,
          period_year: periodYear,
          due_date: dueDate,
          payment_link_id: paymentLinkId || undefined,
          target_type: targetType,
          target_class_id: targetType === 'class' ? targetClassId : undefined
        },
        selectedStudentIds,
        currentUser
      );

      setIsCreateOpen(false);
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tagihan baru.');
    }
  };

  const handleConfirmDelete = () => {
    if (!billToDelete) return;
    setIsDeleting(true);

    try {
      const name = billToDelete.name;
      db.deleteBill(billToDelete.id, currentUser);
      setBillToDelete(null);
      setDeleteSuccessMessage(`Tagihan "${name}" berhasil dihapus dari sistem.`);
      setTimeout(() => setDeleteSuccessMessage(null), 4000);
      reloadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tagihan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBills = bills.filter((b) => {
    if (typeFilter !== 'all' && b.bill_type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchDesc = b.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Kelola Tagihan Kas Mahasiswa</h2>
          <p className="text-xs text-slate-400 mt-1">
            Terbitkan, atur distribusi ke mahasiswa, atau hapus tagihan kas pada tahun akademik {activeAcademicYear.name}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Baru</span>
        </button>
      </div>

      {/* Success Notification */}
      {deleteSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Tagihan' },
            { id: 'monthly', label: 'Kas Bulanan' },
            { id: 'event', label: 'Iuran Kegiatan' },
            { id: 'penalty', label: 'Denda / Lainnya' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tagihan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Grid of Bills */}
      {filteredBills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak Ada Tagihan"
          description={
            searchQuery || typeFilter !== 'all'
              ? 'Tidak ada data tagihan yang sesuai dengan pencarian atau filter.'
              : 'Belum ada tagihan kas yang diterbitkan pada tahun akademik ini.'
          }
          actionLabel="Buat Tagihan Baru"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => {
            // Calculate stats for this bill
            const allPayments = db.getPayments(activeAcademicYear.id).filter(p => p.bill_id === bill.id);
            const verifiedPayments = allPayments.filter(p => p.status === 'verified');
            const collectedAmount = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

            // Calculate total target students
            let targetCount = students.length;
            if (bill.target_type === 'class' && bill.target_class_id) {
              targetCount = students.filter(s => s.class_id === bill.target_class_id).length;
            }

            const percentLunas = targetCount > 0 ? Math.min(100, Math.round((verifiedPayments.length / targetCount) * 100)) : 0;

            return (
              <div
                key={bill.id}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all shadow-sm group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Badge, Due Date & Delete Action Button */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {BILL_TYPES.find(t => t.value === bill.bill_type)?.label || bill.bill_type}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        Tempo: <span className="text-slate-300 font-medium">{formatDateID(bill.due_date)}</span>
                      </span>
                      <button
                        onClick={() => setBillToDelete(bill)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Tagihan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {bill.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {bill.description || 'Kewajiban kas mahasiswa'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <div className="text-xl font-bold text-white font-mono tabular-nums">
                      {formatCurrency(bill.amount)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Target:{' '}
                        <strong className="text-slate-300 font-medium">
                          {bill.target_type === 'all'
                            ? 'Semua Mahasiswa'
                            : bill.target_type === 'class'
                            ? 'Satu Kelas'
                            : 'Mahasiswa Tertentu'}
                        </strong>
                        {' '}({targetCount} Mahasiswa)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                      <span>Terkumpul: <strong className="text-white">{formatCurrency(collectedAmount)}</strong></span>
                      <span className="text-emerald-400 font-semibold">{verifiedPayments.length} / {targetCount} ({percentLunas}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${percentLunas}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Lynk.id & Action Button */}
                <div className="pt-3.5 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Lynk.id Aktif</span>
                  </span>

                  <button
                    onClick={() => setBillToDelete(bill)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {billToDelete && (
        <ConfirmModal
          isOpen={Boolean(billToDelete)}
          onClose={() => setBillToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Hapus Tagihan Kas?"
          message={`Apakah Anda yakin ingin menghapus tagihan "${billToDelete.name}" (${formatCurrency(billToDelete.amount)})? Seluruh catatan distribusi penugasan mahasiswa dan riwayat pembayaran terkait pada tagihan ini akan dihapus dari sistem.`}
          variant="danger"
          confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus Tagihan'}
          loading={isDeleting}
        />
      )}

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Tagihan Kas Baru"
        subtitle="Tagihan akan didistribusikan ke mahasiswa dan terhubung dengan Lynk.id"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Tagihan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Kas Desember 2026 / Iuran Seminar"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Jenis Tagihan
              </label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value as BillType)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {BILL_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal Tagihan (Rp) *
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Jatuh Tempo *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {billType === 'monthly' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Periode Bulan Kas
              </label>
              <select
                value={periodMonth}
                onChange={(e) => setPeriodMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {MONTH_NAMES_ID.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    Bulan ke-{idx + 1} ({name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Link Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              Tautkan ke Lynk.id Payment Link
            </label>
            <select
              value={paymentLinkId}
              onChange={(e) => setPaymentLinkId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {paymentLinks.map((link) => (
                <option key={link.id} value={link.id}>
                  {link.name} ({link.url})
                </option>
              ))}
            </select>
          </div>

          {/* Target Distribution */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Target Penerima Tagihan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Semua Mahasiswa' },
                { id: 'class', label: 'Satu Kelas Saja' },
                { id: 'specific', label: 'Pilih Mahasiswa' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setTargetType(opt.id as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    targetType === opt.id
                      ? 'bg-blue-600 text-white font-semibold border-blue-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {targetType === 'class' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pilih Kelas Target
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.student_count || 0} mahasiswa)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deskripsi / Keterangan Tagihan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan peruntukan kas ini..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              Terbitkan Tagihan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
