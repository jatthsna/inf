import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Bill, BillAssignment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { uploadPaymentProof } from '../../services/storage';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  ExternalLink, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Loader2 
} from 'lucide-react';

interface StudentPaymentModalProps {
  assignment: BillAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StudentPaymentModal: React.FC<StudentPaymentModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'confirm' | 'upload' | 'success'>('confirm');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!assignment || !assignment.bill) return null;
  const { bill } = assignment;

  const paymentLinkUrl = bill.payment_link_url || db.getSettings().lynk_default_url;

  const handleOpenLynk = () => {
    if (!paymentLinkUrl) {
      setErrorMessage('Link pembayaran belum dikonfigurasi oleh bendahara.');
      return;
    }
    window.open(paymentLinkUrl, '_blank', 'noopener,noreferrer');
    setStep('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Harap lampirkan bukti pembayaran yang sah.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const uploadRes = await uploadPaymentProof(selectedFile, currentUser.nim, bill.id);
      if (!uploadRes.success || !uploadRes.url) {
        setErrorMessage(uploadRes.error || 'Gagal mengunggah bukti pembayaran.');
        setIsSubmitting(false);
        return;
      }

      db.submitOnlinePayment({
        billId: bill.id,
        studentId: currentUser.id,
        amount: bill.amount,
        proofUrl: uploadRes.url,
        studentNote: studentNote || 'Pembayaran via Lynk.id'
      });

      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setSelectedFile(null);
    setPreviewUrl(null);
    setStudentNote('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Pembayaran Kas: ${bill.name}`}
      subtitle="Instruksi Pembayaran via Lynk.id & Verifikasi Mutasi Kas"
      maxWidth="lg"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Confirmation & Lynk.id Redirect */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Nama Tagihan</span>
              <span className="font-semibold text-white">{bill.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Jatuh Tempo</span>
              <span className="text-slate-200 font-mono">{formatDateID(bill.due_date)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-300">Nominal yang Harus Dibayar</span>
              <span className="text-lg font-bold text-blue-400 font-mono tabular-nums">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white">Alur Pembayaran Kas:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>Klik tombol <span className="text-white font-medium">Lanjutkan ke Lynk.id</span> di bawah.</li>
              <li>Selesaikan pembayaran melalui QRIS, transfer bank, atau e-wallet di halaman Lynk.id.</li>
              <li>Simpan bukti transfer atau tangkapan layar pembayaran berhasil.</li>
              <li>Kembali ke sistem ini dan unggah bukti transaksi Anda.</li>
            </ol>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Status tagihan menjadi LUNAS setelah diverifikasi oleh bendahara kelas.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleOpenLynk}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <span>Lanjutkan ke Lynk.id</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Proof */}
      {step === 'upload' && (
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <p className="font-semibold text-white mb-0.5">Sudah menyelesaikan pembayaran di Lynk.id?</p>
            <p className="text-slate-400 text-xs">
              Lampirkan file bukti agar bendahara kelas dapat mencocokkan mutasi kas Anda.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Unggah Bukti Pembayaran (JPG, PNG, WEBP, PDF · Maksimal 5MB)
            </label>
            <div className="relative border border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-5 text-center bg-slate-900/60 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview Bukti"
                      className="mx-auto max-h-40 rounded-lg object-contain border border-slate-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-blue-400 py-4">
                      <FileText className="w-8 h-8" />
                    </div>
                  )}
                  <p className="text-xs font-medium text-white truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Klik untuk mengganti
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-200 font-medium">
                    Pilih atau seret file bukti transfer ke sini
                  </p>
                  <p className="text-[11px] text-slate-400">Mendukung format gambar (JPG/PNG) & dokumen PDF</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Transfer QRIS atas nama Bima Sakti"
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Kembali
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm ${
                  isSubmitting || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Bukti Pembayaran</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Success Screen */}
      {step === 'success' && (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Bukti Pembayaran Terkirim</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Status transaksi Anda saat ini adalah <span className="font-semibold text-amber-300">Menunggu Verifikasi</span>. Bendahara kas akan memverifikasi mutasi dan kuitansi resmi akan diterbitkan setelah diverifikasi.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
