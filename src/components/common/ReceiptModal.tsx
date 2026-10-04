import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Payment, Bill, UserProfile } from '../../types';
import { formatCurrency, formatDateID, formatDateTimeID } from '../../utils/formatters';
import { Printer, CheckCircle, ShieldCheck, Download, School, FileText } from 'lucide-react';
import { UnughaLogo } from './UnughaLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  bill?: Bill;
  student?: UserProfile;
}

// Convert number to Indonesian words (Terbilang)
export function angkaKeTerbilang(nilai: number): string {
  if (nilai === 0) return 'Nol Rupiah';
  
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function toWords(n: number): string {
    if (n < 12) return bilangan[n];
    if (n < 20) return toWords(n - 10) + ' Belas';
    if (n < 100) return toWords(Math.floor(n / 10)) + ' Puluh ' + toWords(n % 10);
    if (n < 200) return 'Seratus ' + toWords(n - 100);
    if (n < 1000) return toWords(Math.floor(n / 100)) + ' Ratus ' + toWords(n % 100);
    if (n < 2000) return 'Seribu ' + toWords(n - 1000);
    if (n < 1000000) return toWords(Math.floor(n / 1000)) + ' Ribu ' + toWords(n % 1000);
    if (n < 1000000000) return toWords(Math.floor(n / 1000000)) + ' Juta ' + toWords(n % 1000000);
    return toWords(Math.floor(n / 1000000000)) + ' Miliar ' + toWords(n % 1000000000);
  }

  const hasil = toWords(Math.floor(nilai)).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  bill,
  student
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const receiptNumber = `KWT-${new Date(payment.payment_date).getFullYear()}${(new Date(payment.payment_date).getMonth() + 1).toString().padStart(2, '0')}-${payment.id.slice(0, 6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kuitansi Resmi Kas Mahasiswa"
      subtitle="Bukti tanda terima pembayaran sah kas Program Studi Informatika FMIKOM UNUGHA"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Printable Receipt Paper Container */}
        <div 
          ref={receiptRef}
          className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0"
        >
          {/* Official University Letterhead (KOP SURAT) */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <UnughaLogo className="w-16 h-16" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-emerald-900 leading-snug">
                  UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI (UNUGHA) CILACAP
                </h1>
                <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-900 leading-tight">
                  Fakultas Matematika dan Ilmu Komputer (FMIKOM) · Program Studi Informatika
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Pengurus & Kas Kelas Mahasiswa Informatika UNUGHA Cilacap
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                TANDA TERIMA SAH
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">KUITANSI PEMBAYARAN</h2>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
              <p><span className="text-slate-400">No:</span> <span className="font-bold text-slate-900">{receiptNumber}</span></p>
              <p><span className="text-slate-400">Tanggal:</span> {formatDateID(payment.payment_date)}</p>
            </div>
          </div>

          {/* Receipt Body Table */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium sm:col-span-1">Telah Diterima Dari</span>
              <span className="font-bold text-slate-900 sm:col-span-2">
                {student?.full_name || 'Mahasiswa Informatika'}
                <span className="block text-xs font-normal font-mono text-slate-500 mt-0.5">
                  NIM: {student?.nim || '-'} · {student?.email || '-'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium sm:col-span-1">Untuk Pembayaran</span>
              <span className="font-semibold text-slate-800 sm:col-span-2">
                {bill?.name || 'Iuran Kas Mahasiswa Informatika'}
                {bill?.period_month && (
                  <span className="block text-xs font-normal text-slate-500">
                    Periode: Bulan ke-{bill.period_month}
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium sm:col-span-1">Metode Pembayaran</span>
              <span className="font-semibold text-slate-800 sm:col-span-2 capitalize flex items-center gap-1.5">
                <span>{payment.payment_method === 'online' ? 'Online Transfer (via Lynk.id)' : 'Tunai / Cash (Langsung ke Bendahara)'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-2 border-b border-slate-100 bg-slate-50/70 p-2.5 rounded-lg">
              <span className="text-slate-600 font-semibold sm:col-span-1 flex items-center">
                Sejumlah Uang
              </span>
              <div className="sm:col-span-2">
                <span className="text-base sm:text-lg font-extrabold text-blue-900 font-mono">
                  {formatCurrency(payment.amount)}
                </span>
                <p className="text-xs italic text-slate-600 mt-0.5">
                  Terbilang: {angkaKeTerbilang(payment.amount)}
                </p>
              </div>
            </div>

            {payment.student_note && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium sm:col-span-1">Catatan Mahasiswa</span>
                <span className="text-slate-700 sm:col-span-2 italic">
                  "{payment.student_note}"
                </span>
              </div>
            )}
          </div>

          {/* Verification & Signature Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 items-end">
            <div>
              <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">STATUS: DIVERIFIKASI LUNAS</p>
                  <p className="text-[10px] text-emerald-700">Tercatat resmi dalam Buku Kas Umum</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2">
                ID Transaksi: {payment.id}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-500">
                Diverifikasi pada {formatDateID(payment.verified_at || payment.payment_date)}
              </p>
              <div className="mt-4 mb-1">
                <p className="font-bold text-slate-900 underline decoration-slate-400 underline-offset-4">
                  Adam Satrol
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Koordinator Kelas (Korlas) Informatika</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Kuitansi ini adalah bukti pembayaran digital yang sah dan valid.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
