import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AcademicYear, FinancialSummary, Expense } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingDown, 
  Calendar 
} from 'lucide-react';

interface StudentTransparencyProps {
  activeAcademicYear: AcademicYear;
}

export const StudentTransparency: React.FC<StudentTransparencyProps> = ({ activeAcademicYear }) => {
  const [summary, setSummary] = useState<FinancialSummary>(() =>
    db.getFinancialSummary(activeAcademicYear.id)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    db.getExpenses(activeAcademicYear.id)
  );

  const reloadData = () => {
    setSummary(db.getFinancialSummary(activeAcademicYear.id));
    setExpenses(db.getExpenses(activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Akuntabilitas Terbuka
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">Tahun Akademik {activeAcademicYear.name}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Buku Kas Terbuka Mahasiswa
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Laporan transparansi saldo kas, pemasukan terverifikasi, dan perincian pengeluaran riil Program Studi Informatika FMIKOM UNUGHA Cilacap
        </p>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Saldo Kas Kasir Saat Ini"
          value={formatCurrency(summary.current_balance)}
          subtitle={`Saldo Awal Periode: ${formatCurrency(summary.initial_balance)}`}
          variant="emerald"
        />

        <StatCard
          title="Total Pemasukan Kas"
          value={formatCurrency(summary.total_verified_income)}
          subtitle={`Cash Tunai: ${formatCurrency(summary.total_cash_income)} · Lynk.id: ${formatCurrency(summary.total_online_income)}`}
          variant="blue"
        />

        <StatCard
          title="Total Pengeluaran Kas"
          value={formatCurrency(summary.total_expenses)}
          subtitle={`${expenses.length} transaksi pengeluaran resmi tercatat`}
          variant="slate"
        />
      </div>

      {/* Public Expense Records */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-white text-sm">Buku Pengeluaran Kas Resmi (BKU)</h3>
            <p className="text-slate-400 text-xs mt-0.5">Setiap pengeluaran dicatat dengan tanggal, bukti kuitansi, dan peruntukannya</p>
          </div>
          <span className="text-slate-400 font-medium text-xs bg-slate-800 px-2.5 py-1 rounded-md">
            {expenses.length} Transaksi
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada pengeluaran kas yang tercatat pada tahun akademik ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi Pengeluaran</th>
                  <th className="py-3 px-4 font-semibold">Keperluan / Catatan</th>
                  <th className="py-3 px-4 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateID(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-400">{exp.notes || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 tabular-nums whitespace-nowrap">
                      -{formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
