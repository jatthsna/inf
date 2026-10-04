import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AcademicYear } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency, formatDateID, getMonthName } from '../../utils/formatters';
import { exportToCSV, printFinancialReport } from '../../utils/export';
import { MONTH_NAMES_ID, ACADEMIC_MONTH_ORDER } from '../../lib/constants';
import { 
  CalendarDays, 
  FileSpreadsheet, 
  Printer, 
  Wallet, 
  ArrowUpRight, 
  TrendingDown, 
  AlertCircle,
  HandCoins,
  CreditCard,
  Receipt
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface MonthlyRecapPageProps {
  activeAcademicYear: AcademicYear;
}

export const MonthlyRecapPage: React.FC<MonthlyRecapPageProps> = ({ activeAcademicYear }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // September default (month 8, 0-indexed)

  // Get data for selected month
  const bills = db.getBills(activeAcademicYear.id);
  const payments = db.getPayments(activeAcademicYear.id);
  const expenses = db.getExpenses(activeAcademicYear.id);
  const otherIncome = db.getOtherIncome(activeAcademicYear.id);

  // Month filters
  // Bills assigned with period_month = selectedMonthIndex + 1
  const targetMonthNum = selectedMonthIndex + 1;

  const monthBills = bills.filter(b => b.period_month === targetMonthNum);
  const monthBillIds = new Set(monthBills.map(b => b.id));

  // Payments for these bills (or payments made in this month)
  const monthPayments = payments.filter(p => {
    if (monthBillIds.has(p.bill_id)) return true;
    const pMonth = new Date(p.payment_date).getMonth();
    return pMonth === selectedMonthIndex;
  });

  const verifiedPayments = monthPayments.filter(p => p.status === 'verified');
  const cashPayments = verifiedPayments.filter(p => p.payment_method === 'cash');
  const onlinePayments = verifiedPayments.filter(p => p.payment_method === 'online');

  const cashIncome = cashPayments.reduce((s, p) => s + p.amount, 0);
  const onlineIncome = onlinePayments.reduce((s, p) => s + p.amount, 0);

  // Other income in this month
  const monthOtherIncome = otherIncome.filter(i => new Date(i.received_date).getMonth() === selectedMonthIndex);
  const otherIncomeTotal = monthOtherIncome.reduce((s, i) => s + i.amount, 0);

  const totalMonthIncome = cashIncome + onlineIncome + otherIncomeTotal;

  // Expenses in this month
  const monthExpenses = expenses.filter(e => new Date(e.expense_date).getMonth() === selectedMonthIndex);
  const totalMonthExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Net saldo month
  const netMonthBalance = totalMonthIncome - totalMonthExpense;

  // Bills obligation in month
  const studentsCount = db.getStudents().filter(s => s.status === 'active').length;
  const totalMonthBilledAmount = monthBills.reduce((s, b) => s + (b.amount * studentsCount), 0);
  const totalMonthPaidAmount = cashIncome + onlineIncome;
  const totalMonthArrears = Math.max(0, totalMonthBilledAmount - totalMonthPaidAmount);

  // Chart Data: Breakdown
  const chartData = [
    {
      kategori: MONTH_NAMES_ID[selectedMonthIndex],
      Pemasukan: totalMonthIncome,
      Pengeluaran: totalMonthExpense
    }
  ];

  const handleExportCSV = () => {
    const monthName = MONTH_NAMES_ID[selectedMonthIndex];
    const headers = ['Indikator', 'Nilai (IDR)'];
    const rows = [
      ['Tahun Akademik', activeAcademicYear.name],
      ['Bulan', monthName],
      ['Total Tagihan Diterbitkan', totalMonthBilledAmount],
      ['Total Pembayaran Diterima (Lunas)', totalMonthPaidAmount],
      ['Total Tunggakan Bulan Ini', totalMonthArrears],
      ['Pembayaran Cash (Tunai)', cashIncome],
      ['Pembayaran Online (Lynk.id)', onlineIncome],
      ['Pemasukan Lain', otherIncomeTotal],
      ['Total Pemasukan Bulan Ini', totalMonthIncome],
      ['Total Pengeluaran Bulan Ini', totalMonthExpense],
      ['Surplus / Defisit Bulan Ini', netMonthBalance]
    ];
    exportToCSV(`Rekap_Bulanan_${monthName}_${activeAcademicYear.name.replace('/', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Rekapitulasi Kas Bulanan</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis detail pemasukan cash/online, tagihan, dan pengeluaran per bulan pada tahun {activeAcademicYear.name}
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
            onClick={() => printFinancialReport(`Rekap Bulanan ${MONTH_NAMES_ID[selectedMonthIndex]}`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151F32] hover:bg-[#1B263B] border border-[#26354D] rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Month Selector Pills (In Academic Order: Sept to August) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#26354D]">
        {ACADEMIC_MONTH_ORDER.map((monthIdx) => (
          <button
            key={monthIdx}
            onClick={() => setSelectedMonthIndex(monthIdx)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMonthIndex === monthIdx
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : 'bg-[#151F32] text-slate-400 hover:text-white hover:bg-[#1B263B] border border-[#26354D]'
            }`}
          >
            {MONTH_NAMES_ID[monthIdx]}
          </button>
        ))}
      </div>

      {/* 9 Metrics requested in prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Tagihan Diterbitkan"
          value={formatCurrency(totalMonthBilledAmount)}
          subtitle={`${monthBills.length} tagihan bulan ${MONTH_NAMES_ID[selectedMonthIndex]}`}
          icon={Receipt}
          variant="blue"
        />

        <StatCard
          title="Total Dibayar (Lunas)"
          value={formatCurrency(totalMonthPaidAmount)}
          subtitle={`${verifiedPayments.length} transaksi pembayaran lunas`}
          icon={ArrowUpRight}
          variant="emerald"
        />

        <StatCard
          title="Total Tunggakan Bulan Ini"
          value={formatCurrency(totalMonthArrears)}
          subtitle="Kewajiban belum terselesaikan"
          icon={AlertCircle}
          variant={totalMonthArrears > 0 ? 'orange' : 'cyan'}
        />

        <StatCard
          title="Pembayaran Cash (Tunai)"
          value={formatCurrency(cashIncome)}
          subtitle={`${cashPayments.length} transaksi cash`}
          icon={HandCoins}
          variant="emerald"
        />

        <StatCard
          title="Pembayaran Online (Lynk.id)"
          value={formatCurrency(onlineIncome)}
          subtitle={`${onlinePayments.length} transaksi QRIS Lynk.id`}
          icon={CreditCard}
          variant="cyan"
        />

        <StatCard
          title="Total Pemasukan Kas"
          value={formatCurrency(totalMonthIncome)}
          subtitle={`Termasuk pemasukan lain: ${formatCurrency(otherIncomeTotal)}`}
          icon={ArrowUpRight}
          variant="emerald"
        />

        <StatCard
          title="Total Pengeluaran Bulan Ini"
          value={formatCurrency(totalMonthExpense)}
          subtitle={`${monthExpenses.length} pengeluaran riil`}
          icon={TrendingDown}
          variant="purple"
        />

        <StatCard
          title="Surplus / Defisit Bulan Ini"
          value={formatCurrency(netMonthBalance)}
          subtitle="Pemasukan dikurangi Pengeluaran"
          icon={Wallet}
          variant={netMonthBalance >= 0 ? 'cyan' : 'orange'}
        />

        <StatCard
          title="Belum Bayar (Nominal)"
          value={formatCurrency(totalMonthArrears)}
          subtitle={`Sisa kewajiban mahasiswa`}
          icon={AlertCircle}
          variant="orange"
        />
      </div>

      {/* Chart & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] p-5">
          <h3 className="text-sm font-bold text-white mb-1">
            Komparasi Pemasukan vs Pengeluaran ({MONTH_NAMES_ID[selectedMonthIndex]})
          </h3>
          <p className="text-xs text-slate-400 mb-4">Grafik perbandingan riil kas</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="kategori" stroke="#94A3B8" fontSize={12} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B263B',
                    borderColor: '#26354D',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC'
                  }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Legend />
                <Bar dataKey="Pemasukan" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#A78BFA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses list in this month */}
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Rincian Pengeluaran Bulan {MONTH_NAMES_ID[selectedMonthIndex]}
            </h3>
            <p className="text-xs text-slate-400 mb-3">Daftar transaksi keluar pada bulan ini</p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {monthExpenses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada pengeluaran pada bulan ini.
                </div>
              ) : (
                monthExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-[#0B1120] border border-[#26354D] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{exp.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatDateID(exp.expense_date)} • {exp.category}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-rose-400 text-xs">
                      -{formatCurrency(exp.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#26354D] flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Pengeluaran Bulan Ini:</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              -{formatCurrency(totalMonthExpense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
