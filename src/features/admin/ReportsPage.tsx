import React, { useState } from 'react';
import { db } from '../../services/db';
import { AcademicYear } from '../../types';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { exportToCSV, printFinancialReport } from '../../utils/export';
import { 
  FileSpreadsheet, 
  Printer, 
  School, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { UnughaLogo } from '../../components/common/UnughaLogo';

interface ReportsPageProps {
  activeAcademicYear: AcademicYear;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ activeAcademicYear }) => {
  const settings = db.getSettings();
  const summary = db.getFinancialSummary(activeAcademicYear.id);
  const expenses = db.getExpenses(activeAcademicYear.id);
  const arrears = db.getStudentArrearsList(activeAcademicYear.id);
  const students = db.getStudents();

  const handlePrint = () => {
    window.print();
  };

  const handleExportFullCSV = () => {
    const headers = ['Bagian', 'Item / Keterangan', 'Nominal (IDR) / Catatan'];
    const rows = [
      ['Identitas', 'Program Studi', settings.department_name],
      ['Identitas', 'Tahun Akademik', activeAcademicYear.name],
      ['Ringkasan Keuangan', 'Saldo Awal Tahun', summary.initial_balance],
      ['Ringkasan Keuangan', 'Total Pemasukan Kas', summary.total_verified_income],
      ['Ringkasan Keuangan', 'Pemasukan Cash (Tunai)', summary.total_cash_income],
      ['Ringkasan Keuangan', 'Pemasukan Online (Lynk.id)', summary.total_online_income],
      ['Ringkasan Keuangan', 'Pemasukan Non-Tagihan', summary.total_other_income],
      ['Ringkasan Keuangan', 'Total Pengeluaran Kas', summary.total_expenses],
      ['Ringkasan Keuangan', 'Saldo Akhir Kas', summary.current_balance],
      ['Ringkasan Keuangan', 'Total Kewajiban Tagihan', summary.total_bills_amount],
      ['Ringkasan Keuangan', 'Total Tunggakan Kas', summary.total_arrears_amount],
      ['Mahasiswa', 'Jumlah Mahasiswa Terdaftar', students.length],
      ['Pengeluaran', 'Jumlah Transaksi Keluar', expenses.length]
    ];
    exportToCSV(`Laporan_Kas_Informatika_${activeAcademicYear.name.replace('/', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Laporan Resmi Keuangan Kas Mahasiswa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Buku Kas Umum (BKU) dan dokumen pertanggungjawaban Program Studi Informatika FMIKOM UNUGHA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 sm:p-10 text-slate-200 space-y-8 shadow-sm print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
        {/* Official Campus Letterhead (KOP SURAT RESMI) */}
        <div className="pb-6 border-b-2 border-slate-800 print:border-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <UnughaLogo className="w-16 h-16" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-sm sm:text-lg font-black text-emerald-950 uppercase tracking-wide leading-snug print:text-emerald-900">
                UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI (UNUGHA) CILACAP
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                Fakultas Matematika dan Ilmu Komputer (FMIKOM) · Program Studi Informatika
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Pengurus & Kas Kelas Mahasiswa Informatika UNUGHA Cilacap
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 print:text-slate-600">
            <p className="font-semibold text-slate-300 print:text-slate-800">
              LAPORAN BUKU KAS UMUM (BKU) TAHUN AKADEMIK {activeAcademicYear.name}
            </p>
            <p className="font-mono text-[11px]">
              Tanggal Cetak: {formatDateID(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* 1. Ringkasan Eksekutif */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5 print:text-black">
            1. Ringkasan Saldo & Arus Kas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Saldo Awal</span>
              <div className="text-base font-bold text-white font-mono mt-1 print:text-black">
                {formatCurrency(summary.initial_balance)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 print:text-slate-600">Total Pemasukan</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-1 print:text-black">
                +{formatCurrency(summary.total_verified_income)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-rose-400 print:text-slate-600">Total Pengeluaran</span>
              <div className="text-base font-bold text-rose-400 font-mono mt-1 print:text-black">
                -{formatCurrency(summary.total_expenses)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/30 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-blue-400 print:text-slate-600">Saldo Akhir</span>
              <div className="text-base font-bold text-blue-400 font-mono mt-1 print:text-black">
                {formatCurrency(summary.current_balance)}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Rekapitulasi Metode Pembayaran */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5 print:text-black">
            2. Rekapitulasi Metode Penerimaan Kas
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800 print:border-slate-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-300 font-semibold print:bg-slate-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Metode Pembayaran</th>
                  <th className="py-2.5 px-3 font-semibold">Keterangan</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Nominal Terverifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white print:text-black">Tunai / Cash Langsung</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">Diserahkan langsung kepada bendahara kelas</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                    {formatCurrency(summary.total_cash_income)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white print:text-black">Online via Lynk.id</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">QRIS & transfer bank dengan bukti terverifikasi</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                    {formatCurrency(summary.total_online_income)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white print:text-black">Pemasukan Non-Tagihan</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">Sponsorship, donasi alumni, atau sisa dana kegiatan</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                    {formatCurrency(summary.total_other_income)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-950 font-bold text-white print:bg-slate-100 print:text-black border-t border-slate-800 print:border-slate-300">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 uppercase">Total Pemasukan Kas Bersih</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-black">
                    {formatCurrency(summary.total_verified_income)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 3. Daftar Pengeluaran Riil */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5 print:text-black">
            3. Rincian Pengeluaran Kas (BKU)
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800 print:border-slate-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-300 font-semibold print:bg-slate-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori</th>
                  <th className="py-2.5 px-3 font-semibold">Deskripsi Pengeluaran</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Belum ada transaksi pengeluaran.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-400 print:text-slate-600">{formatDateID(exp.expense_date)}</td>
                      <td className="py-2.5 px-3">{exp.category}</td>
                      <td className="py-2.5 px-3 font-semibold text-white print:text-black">{exp.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400 print:text-black">
                        -{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-950 font-bold text-white print:bg-slate-100 print:text-black border-t border-slate-800 print:border-slate-300">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 uppercase">Total Pengeluaran Kas</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-black">
                    -{formatCurrency(summary.total_expenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Rekap Tunggakan Mahasiswa */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5 print:text-black">
            4. Ringkasan Tunggakan
          </h3>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center print:border-slate-300 print:bg-slate-50">
            <div>
              <p className="font-semibold text-white print:text-black">
                Total Tunggakan: <span className="font-mono text-amber-400 print:text-black">{formatCurrency(summary.total_arrears_amount)}</span>
              </p>
              <p className="text-slate-400 print:text-slate-600 text-xs mt-1">
                Dari {students.length} mahasiswa terdaftar, terdapat {arrears.filter(a => a.total_arrears > 0).length} mahasiswa memiliki kewajiban belum lunas.
              </p>
            </div>
          </div>
        </div>

        {/* Lembar Tanda Tangan Pengesahan (Standard Indonesian University Form) */}
        <div className="pt-8 border-t border-slate-800 print:border-slate-300">
          <div className="grid grid-cols-2 text-center text-xs">
            <div className="space-y-16">
              <p className="text-slate-400 print:text-slate-700">
                Mengetahui,<br />
                <strong className="text-white print:text-black">Koordinator Kelas (Korlas)</strong>
              </p>
              <div>
                <p className="font-bold text-white underline print:text-black">
                  {settings.korlas_name || 'Adam Satrol'}
                </p>
                <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                  Koordinator Kelas Informatika
                </p>
              </div>
            </div>

            <div className="space-y-16">
              <p className="text-slate-400 print:text-slate-700">
                Disusun Oleh,<br />
                <strong className="text-white print:text-black">Bendahara Kas Kelas</strong>
              </p>
              <div>
                <p className="font-bold text-white underline print:text-black">
                  {settings.contact_person_name || 'Bendahara Kelas'}
                </p>
                <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                  Pengurus Kas Kelas Informatika
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
