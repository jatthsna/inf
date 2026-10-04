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
  Trash2
} from 'lucide-react';

interface PaymentsPageProps {
  activeAcademicYear: AcademicYear;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'online' | 'cash'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedProofPayment, setSelectedProofPayment] = useState<Payment | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<Payment | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<Payment | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('Bukti transfer tidak valid atau nominal tidak sesuai.');

  const reloadData = () => {
    setPayments(db.getPayments(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const handleDeletePayment = () => {
    if (!deletePaymentTarget) return;
    db.deletePayment(deletePaymentTarget.id, currentUser);
    setDeletePaymentTarget(null);
    reloadData();
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
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

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Verifikasi & Mutasi Pembayaran Kas</h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {pendingCount} Menunggu Verifikasi
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pemeriksaan bukti transfer Lynk.id dan mutasi kas tunai langsung ke bendahara
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari mahasiswa, NIM, atau tagihan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: `Menunggu (${pendingCount})` },
            { id: 'verified', label: 'Diverifikasi Lunas' },
            { id: 'rejected', label: 'Ditolak' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-xs font-medium">Metode:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Metode</option>
            <option value="online">Online (Lynk.id)</option>
            <option value="cash">Tunai (Cash)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Tidak Ada Catatan Pembayaran"
          description="Tidak ditemukan riwayat transaksi pembayaran yang cocok dengan filter atau kata kunci."
        />
      ) : (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Mahasiswa</th>
                  <th className="py-3 px-4 font-semibold">Tagihan Kas</th>
                  <th className="py-3 px-4 text-right font-semibold">Nominal</th>
                  <th className="py-3 px-4 font-semibold">Metode</th>
                  <th className="py-3 px-4 font-semibold">Bukti</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredPayments.map((p) => {
                  const isPending = p.status === 'pending';
                  const isVerified = p.status === 'verified';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-850 transition-colors ${
                        isPending ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
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
                        {p.proof_url ? (
                          <button
                            onClick={() => setSelectedProofPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-blue-400 border border-slate-700 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
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

                          <button
                            onClick={() => setDeletePaymentTarget(p)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Proof Inspection Modal */}
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
              <span className="text-slate-400">Nominal Tagihan Kas:</span>
              <span className="font-bold text-white font-mono tabular-nums text-sm">
                {formatCurrency(selectedProofPayment.amount)}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center min-h-[240px]">
              {selectedProofPayment.proof_url?.startsWith('data:image') ||
              selectedProofPayment.proof_url?.includes('unsplash') ||
              selectedProofPayment.proof_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={selectedProofPayment.proof_url}
                  alt="Bukti Transfer"
                  className="max-h-80 w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <FileText className="w-10 h-10 text-blue-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">File Dokumen Bukti (PDF)</p>
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
                  Verifikasi Lunas
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Verification Modal */}
      {verifyingPayment && (
        <Modal
          isOpen={Boolean(verifyingPayment)}
          onClose={() => setVerifyingPayment(null)}
          title="Konfirmasi Verifikasi Pembayaran"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Mahasiswa:</span>
                <span className="font-semibold text-white">{verifyingPayment.student?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal:</span>
                <span className="font-bold text-white font-mono tabular-nums">
                  {formatCurrency(verifyingPayment.amount)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Catatan Verifikasi Bendahara (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Mutasi rekening telah cocok dan valid"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingPayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              >
                Konfirmasi Lunas
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Payment Modal */}
      {rejectingPayment && (
        <Modal
          isOpen={Boolean(rejectingPayment)}
          onClose={() => setRejectingPayment(null)}
          title="Tolak Bukti Pembayaran"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alasan Penolakan (Akan Ditampilkan ke Mahasiswa)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Nominal transfer kurang, atau bukti buram..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              >
                Konfirmasi Penolakan
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
          bill={selectedReceiptPayment.bill}
          student={selectedReceiptPayment.student}
        />
      )}

      {/* Delete Payment Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletePaymentTarget)}
        onClose={() => setDeletePaymentTarget(null)}
        onConfirm={handleDeletePayment}
        title="Hapus Transaksi Pembayaran?"
        message={`Apakah Anda yakin ingin menghapus data pembayaran ${deletePaymentTarget?.student?.full_name || 'mahasiswa'} (${formatCurrency(deletePaymentTarget?.amount || 0)})? Status tagihan kas akan kembali menjadi Belum Lunas.`}
        variant="danger"
        confirmLabel="Hapus Transaksi"
      />
    </div>
  );
};
