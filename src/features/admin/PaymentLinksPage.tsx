import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { PaymentLink } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { isValidUrl } from '../../utils/validators';
import { formatDateTimeID } from '../../utils/formatters';
import { 
  Link as LinkIcon, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export const PaymentLinksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentLink | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reloadData = () => {
    setLinks(db.getPaymentLinks());
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingLink(null);
    setName('');
    setDescription('');
    setUrl('https://lynk.id/');
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: PaymentLink) => {
    setEditingLink(link);
    setName(link.name);
    setDescription(link.description || '');
    setUrl(link.url);
    setIsActive(link.is_active);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama link pembayaran wajib diisi.');
      return;
    }

    if (!isValidUrl(url)) {
      setError('URL tidak valid. Masukkan format link lengkap (contoh: https://lynk.id/namalink).');
      return;
    }

    try {
      if (editingLink) {
        db.updatePaymentLink(editingLink.id, {
          name: name.trim(),
          description: description.trim(),
          url: url.trim(),
          is_active: isActive
        }, currentUser);
      } else {
        db.createPaymentLink({
          name: name.trim(),
          description: description.trim(),
          url: url.trim(),
          is_active: isActive
        }, currentUser);
      }

      setIsModalOpen(false);
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan payment link.');
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    db.deletePaymentLink(deleteTarget.id, currentUser);
    setDeleteTarget(null);
    reloadData();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Payment Links (Lynk.id)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola tautan pembayaran online resmi via QRIS/E-Wallet
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Link Lynk.id</span>
        </button>
      </div>

      {/* Warning if no active links */}
      {links.filter(l => l.is_active).length === 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">Belum ada Link Pembayaran Aktif</p>
            <p className="text-slate-400 mt-0.5">
              Jika link belum dikonfigurasi, sistem menampilkan pesan peringatan: "Link pembayaran belum tersedia. Silakan hubungi bendahara."
            </p>
          </div>
        </div>
      )}

      {/* Grid of Links */}
      {links.length === 0 ? (
        <EmptyState
          icon={LinkIcon}
          title="Belum Ada Payment Link"
          description="Tambahkan link Lynk.id pertama Anda untuk memudahkan mahasiswa membayar kas secara online."
          actionLabel="Tambah Link Sekarang"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              className={`rounded-2xl bg-[#151F32] border p-5 flex flex-col justify-between transition-all ${
                link.is_active
                  ? 'border-[#26354D] hover:border-cyan-500/40'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{link.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Dibuat: {formatDateTimeID(link.created_at)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      link.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {link.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {link.description || 'Link pembayaran kas via platform Lynk.id'}
                </p>

                {/* URL Display */}
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-[#26354D] flex items-center justify-between gap-2">
                  <span className="text-xs text-cyan-300 font-mono truncate select-all">
                    {link.url}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(link.id, link.url)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Salin URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Buka Link di Tab Baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-3 border-t border-[#26354D] flex items-center justify-between">
                <button
                  onClick={() =>
                    db.updatePaymentLink(link.id, { is_active: !link.is_active }, currentUser)
                  }
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {link.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                    title="Edit Link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(link)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                    title="Hapus Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink ? 'Edit Payment Link' : 'Tambah Link Lynk.id Baru'}
        subtitle="Link ini akan diarahkan saat mahasiswa mengklik Bayar Sekarang"
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
              Nama Payment Link *
            </label>
            <input
              type="text"
              placeholder="Contoh: Kas Bulanan Informatika / Iuran Makrab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL Lynk.id *
            </label>
            <input
              type="url"
              placeholder="https://lynk.id/nama-anda"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Gunakan URL valid dari akun Lynk.id atau e-wallet kelas Anda.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={2}
              placeholder="Keterangan peruntukan link..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-[#0B1120] border-[#26354D] text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
              Setel link sebagai Aktif
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
            >
              {editingLink ? 'Simpan Perubahan' : 'Tambah Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Payment Link?"
        message={`Apakah Anda yakin ingin menghapus payment link "${deleteTarget?.name}"? Tindakan ini akan dicatat dalam audit trail.`}
        variant="danger"
        confirmLabel="Hapus Link"
      />
    </div>
  );
};
