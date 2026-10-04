import React from 'react';
import { db } from '../../services/db';
import { AcademicYear } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV, printFinancialReport } from '../../utils/export';
import { MONTH_NAMES_ID, ACADEMIC_MONTH_ORDER } from '../../lib/constants';
import { CalendarRange, FileSpreadsheet, Printer, HandCoins, CreditCard, Wallet } from 'lucide-react';

interface YearlyRecapPageProps {
  activeAcademicYear: AcademicYear;
}

export const YearlyRecapPage: React.FC<YearlyRecapPageProps> = ({ activeAcademicYear }) => {
  const summary = db.getFinancialSummary(activeAcademicYear.id);
  const bills = db.getBills(activeAcademicYear.id);
  const payments = db.getPayments(activeAcademicYear.id);
  const expenses = db.getExpenses(activeAcademicYear.id);
  const otherIncome = db.getOtherIncome(activeAcademicYear.id);
  const studentsCount = db.getStudents().filter(s => s.status === 'active').length;

  let cumulativeBalance = summary.initial_balance;

  // Build row data for 12 months (September to August)
  const monthlyRows = ACADEMIC_MONTH_ORDER.map((monthIndex) => {
    const monthName = MONTH_NAMES_ID[monthIndex];
    const targetMonthNum = monthIndex + 1;

    // Bills for month
    const mBills = bills.filter(b => b.period_month === targetMonthNum);
    const mBilledAmount = mBills.reduce((s, b) => s + (b.amount * studentsCount), 0);

    // Verified payments
    const mPayments = payments.filter(p => {
      const pMonth = new Date(p.payment_date).getMonth();
      return pMonth === monthIndex && p.status === 'verified';
    });

    const mCash = mPayments.filter(p => p.payment_method === 'cash').reduce((s, p) => s + p.amount, 0);
    const mOnline = mPayments.filter(p => p.payment_method === 'online').reduce((s, p) => s + p.amount, 0);

    // Other income in this month
    const mOther = otherIncome
      .filter(i => new Date(i.received_date).getMonth() === monthIndex)
      .reduce((s, i) => s + i.amount, 0);

    const mIncome = mCash + mOnline + mOther;

    // Expenses in this month
    const mExpenses = expenses
      .filter(e => new Date(e.expense_date).getMonth() === monthIndex)
      .reduce((s, e) => s + e.amount, 0);

    // Arrears
    const mArrears = Math.max(0, mBilledAmount - (mCash + mOnline));

    cumulativeBalance += (mIncome - mExpenses);

    return {
      monthName,
      monthIndex,
      tagihan: mBilledAmount,
      pemasukan: mIncome,
      pengeluaran: mExpenses,
      saldo: cumulativeBalance,
      tunggakan: mArrears,
      pembayaranCount: mPayments.length,
      cash: mCash,
      online: mOnline
    };
  });

  const totalBilled = monthlyRows.reduce((s, r) => s + r.tagihan, 0);
  const totalIncome = monthlyRows.reduce((s, r) => s + r.pemasukan, 0);
  const totalExpense = monthlyRows.reduce((s, r) => s + r.pengeluaran, 0);
  const totalArrears = monthlyRows.reduce((s, r) => s + r.tunggakan, 0);

  const handleExportCSV = () => {
    const headers = [
      'Bulan',
      'Tagihan (IDR)',
      'Pemasukan (IDR)',
      'Pengeluaran (IDR)',
      'Saldo Kumulatif (IDR)',
      'Tunggakan (IDR)',
      'Jumlah Transaksi'
    ];
    const rows = monthlyRows.map((r) => [
      r.monthName,
      r.tagihan,
      r.pemasukan,
      r.pengeluaran,
      r.saldo,
      r.tunggakan,
      r.pembayaranCount
    ]);
    exportToCSV(`Rekap_12_Bulan_${activeAcademicYear.name.replace('/', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Rekapitulasi 12 Bulan Akademik</h2>
            <span className="text-xs text-cyan-400 font-mono font-semibold">
              Tahun {activeAcademicYear.name} (Sept - Agust)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tabel kumulatif kas 1 tahun penuh tanpa kehilangan histori dan terisolasi dari tahun lainnya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151F32] hover:bg-[#1B263B] border border-[#26354D] rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => printFinancialReport(`Rekap 12 Bulan ${activeAcademicYear.name}`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151F32] hover:bg-[#1B263B] border border-[#26354D] rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Payment Method Split Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#151F32] border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Pembayaran Cash</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {formatCurrency(summary.total_cash_income)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Diterima langsung oleh bendahara</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#151F32] border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Pembayaran Online (Lynk.id)</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {formatCurrency(summary.total_online_income)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Transfer QRIS & E-Wallet terverifikasi</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#151F32] border border-[#26354D]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Saldo Akhir Kumulatif</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            {formatCurrency(summary.current_balance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Saldo Awal ({formatCurrency(summary.initial_balance)}) + Pemasukan - Pengeluaran
          </p>
        </div>
      </div>

      {/* 12-Month Detailed Table */}
      <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
        <div className="p-4 border-b border-[#26354D] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Tabel Rekapitulasi Siklus 12 Bulan (September s/d Agustus)
          </h3>
          <span className="text-xs font-mono text-slate-400">Saldo Awal: {formatCurrency(summary.initial_balance)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
              <tr>
                <th className="py-3 px-4">Bulan</th>
                <th className="py-3 px-4 text-right">Tagihan</th>
                <th className="py-3 px-4 text-right">Pemasukan</th>
                <th className="py-3 px-4 text-right">Pengeluaran</th>
                <th className="py-3 px-4 text-right">Saldo Kumulatif</th>
                <th className="py-3 px-4 text-right">Tunggakan</th>
                <th className="py-3 px-4 text-center">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
              {monthlyRows.map((r) => (
                <tr key={r.monthName} className="hover:bg-[#1B263B]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{r.monthName}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {r.tagihan > 0 ? formatCurrency(r.tagihan) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                    {r.pemasukan > 0 ? `+${formatCurrency(r.pemasukan)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-rose-400">
                    {r.pengeluaran > 0 ? `-${formatCurrency(r.pengeluaran)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-cyan-300">
                    {formatCurrency(r.saldo)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {r.tunggakan > 0 ? formatCurrency(r.tunggakan) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {r.pembayaranCount > 0 ? `${r.pembayaranCount} Trx` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#1B263B] font-bold text-white border-t border-[#26354D]">
              <tr>
                <td className="py-3 px-4 uppercase text-slate-400">TOTAL 1 TAHUN</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(totalBilled)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">+{formatCurrency(totalIncome)}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-400">-{formatCurrency(totalExpense)}</td>
                <td className="py-3 px-4 text-right font-mono text-cyan-300 text-sm">
                  {formatCurrency(summary.current_balance)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-amber-400">{formatCurrency(totalArrears)}</td>
                <td className="py-3 px-4 text-center font-mono">{summary.verified_payments_count} Trx</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
