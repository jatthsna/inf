import React, { useState, useMemo } from 'react';
import { db } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  HandCoins,
  Target,
  ArrowUpDown,
  Calendar,
  Layers,
  Info
} from 'lucide-react';

interface MonthlyIncomeComparisonChartProps {
  academicYearId: string;
  academicYearName: string;
}

type ChartMode = 'methods' | 'target' | 'cashflow';

export const MonthlyIncomeComparisonChart: React.FC<MonthlyIncomeComparisonChartProps> = ({
  academicYearId,
  academicYearName
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('methods');

  // Grounded, high-trust banking & institutional colors (NO AI-slop / chas AI neon)
  const COLORS = {
    cash: '#059669',     // Deep Emerald / UNUGHA Green
    online: '#2563EB',   // Deep Cobalt Navy
    target: '#64748B',   // Muted Slate Steel
    expense: '#DC2626',  // Deep Brick Crimson
    grid: '#1E293B'      // Subtle Hairline Divider
  };

  // Compute real monthly aggregation from database
  const chartData = useMemo(() => {
    const payments = db.getPayments(academicYearId).filter(p => p.status === 'verified');
    const bills = db.getBills(academicYearId);
    const expenses = db.getExpenses(academicYearId);
    const students = db.getStudents();
    const studentsCount = students.length || 1;

    // Academic calendar: Sep (9) to Aug (8)
    const academicMonths = [
      { key: 'Sep', monthNum: 9, year: 2026, fullName: 'September 2026' },
      { key: 'Okt', monthNum: 10, year: 2026, fullName: 'Oktober 2026' },
      { key: 'Nov', monthNum: 11, year: 2026, fullName: 'November 2026' },
      { key: 'Des', monthNum: 12, year: 2026, fullName: 'Desember 2026' },
      { key: 'Jan', monthNum: 1, year: 2027, fullName: 'Januari 2027' },
      { key: 'Feb', monthNum: 2, year: 2027, fullName: 'Februari 2027' },
      { key: 'Mar', monthNum: 3, year: 2027, fullName: 'Maret 2027' },
      { key: 'Apr', monthNum: 4, year: 2027, fullName: 'April 2027' },
      { key: 'Mei', monthNum: 5, year: 2027, fullName: 'Mei 2027' },
      { key: 'Jun', monthNum: 6, year: 2027, fullName: 'Juni 2027' },
      { key: 'Jul', monthNum: 7, year: 2027, fullName: 'Juli 2027' },
      { key: 'Agu', monthNum: 8, year: 2027, fullName: 'Agustus 2027' }
    ];

    return academicMonths.map(m => {
      // Find payments mapped to this period month or payment date
      const monthPayments = payments.filter(p => {
        if (p.bill?.period_month !== undefined) {
          return p.bill.period_month === m.monthNum;
        }
        const d = new Date(p.payment_date);
        return d.getMonth() + 1 === m.monthNum;
      });

      const cashIncome = monthPayments
        .filter(p => p.payment_method === 'cash')
        .reduce((sum, p) => sum + p.amount, 0);

      const onlineIncome = monthPayments
        .filter(p => p.payment_method === 'online')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalIncome = cashIncome + onlineIncome;

      // Target bills active for this month
      const monthBills = bills.filter(b => b.period_month === m.monthNum);
      const targetAmount = monthBills.length > 0
        ? monthBills.reduce((sum, b) => sum + (b.amount * studentsCount), 0)
        : (m.monthNum >= 9 || m.monthNum <= 1 ? studentsCount * 10000 : 0);

      // Expenses in this month
      const monthExpenses = expenses
        .filter(e => {
          const d = new Date(e.expense_date);
          return d.getMonth() + 1 === m.monthNum;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const achievementPct = targetAmount > 0
        ? Math.min(100, Math.round((totalIncome / targetAmount) * 100))
        : 0;

      return {
        month: m.key,
        fullName: m.fullName,
        'Kas Tunai (Cash)': cashIncome,
        'Kas Online (Lynk.id)': onlineIncome,
        'Total Pemasukan': totalIncome,
        'Target Kas': targetAmount,
        'Pengeluaran Riil': monthExpenses,
        achievementPct
      };
    });
  }, [academicYearId]);

  // Overall totals for KPI chips
  const totalCash = chartData.reduce((acc, d) => acc + d['Kas Tunai (Cash)'], 0);
  const totalOnline = chartData.reduce((acc, d) => acc + d['Kas Online (Lynk.id)'], 0);
  const totalAllIncome = totalCash + totalOnline;
  const cashPct = totalAllIncome > 0 ? Math.round((totalCash / totalAllIncome) * 100) : 0;
  const onlinePct = totalAllIncome > 0 ? Math.round((totalOnline / totalAllIncome) * 100) : 0;

  // Highest month
  const highestMonth = [...chartData].sort((a, b) => b['Total Pemasukan'] - a['Total Pemasukan'])[0];

  // Custom accessible Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = chartData.find(d => d.month === label);

      return (
        <div className="bg-[#0B1120] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[200px]">
          <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="font-bold text-white text-xs">{dataItem?.fullName || label}</span>
            {dataItem && dataItem['Target Kas'] > 0 && (
              <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                {dataItem.achievementPct}% Target
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-mono">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300 font-sans text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-semibold text-white">
                  {formatCurrency(Number(entry.value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Header & Mode Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Grafik Perbandingan Pemasukan Kas Bulanan
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 font-mono hidden sm:inline">
              TA {academicYearName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis tren penerimaan kas per bulan berdasarkan metode pembayaran & target capaian
          </p>
        </div>

        {/* 3 Mode Switchers (Zero-Pill Clean Segmented Control) */}
        <div className="flex items-center p-1 bg-[#090D16] border border-slate-800 rounded-xl self-start sm:self-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setChartMode('methods')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartMode === 'methods'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Tunai vs Lynk.id</span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('target')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartMode === 'target'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Realisasi vs Target</span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('cashflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartMode === 'cashflow'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pemasukan vs Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* KPI Chips Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Total Pemasukan:</span>
          <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(totalAllIncome)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Setor Tunai (Cash):</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              {formatCurrency(totalCash)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({cashPct}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Online (Lynk.id):</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-mono text-blue-400 tabular-nums">
              {formatCurrency(totalOnline)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({onlinePct}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Bulan Tertinggi:</span>
          <span className="text-sm font-bold text-white">
            {highestMonth && highestMonth['Total Pemasukan'] > 0
              ? `${highestMonth.fullName.split(' ')[0]} (${formatCurrency(highestMonth['Total Pemasukan'])})`
              : '-'}
          </span>
        </div>
      </div>

      {/* Main Recharts BarChart Container */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `Rp${(val / 1000).toLocaleString('id-ID')}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="square"
              iconSize={9}
            />

            {/* Mode 1: Tunai vs Lynk.id Online */}
            {chartMode === 'methods' && (
              <>
                <Bar
                  dataKey="Kas Tunai (Cash)"
                  fill={COLORS.cash}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Kas Online (Lynk.id)"
                  fill={COLORS.online}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </>
            )}

            {/* Mode 2: Realisasi Pemasukan vs Target */}
            {chartMode === 'target' && (
              <>
                <Bar
                  dataKey="Total Pemasukan"
                  fill={COLORS.cash}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Target Kas"
                  fill={COLORS.target}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </>
            )}

            {/* Mode 3: Pemasukan vs Pengeluaran */}
            {chartMode === 'cashflow' && (
              <>
                <Bar
                  dataKey="Total Pemasukan"
                  fill={COLORS.cash}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Pengeluaran Riil"
                  fill={COLORS.expense}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Informative Legend Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {chartMode === 'methods' && 'Membandingkan proporsi kas tunai yang diserahkan ke bendahara vs transfer Lynk.id (QRIS).'}
            {chartMode === 'target' && 'Membandingkan realisasi iuran yang terverifikasi terhadap target potensi kas seluruh mahasiswa.'}
            {chartMode === 'cashflow' && 'Membandingkan total arus kas masuk dengan beban pengeluaran riil setiap bulannya.'}
          </span>
        </div>

        <span className="font-mono text-slate-500">
          Diperbarui secara real-time
        </span>
      </div>
    </div>
  );
};
