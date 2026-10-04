import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, FinancialSummary } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CashPaymentModal } from './CashPaymentModal';
import { formatCurrency } from '../../utils/formatters';
import { 
  Users, 
  Wallet, 
  ArrowUpRight, 
  TrendingDown, 
  AlertCircle, 
  Clock, 
  HandCoins, 
  CreditCard,
  Plus,
  CalendarRange
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { MonthlyIncomeComparisonChart } from './MonthlyIncomeComparisonChart';

interface AdminDashboardProps {
  activeAcademicYear: AcademicYear;
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeAcademicYear,
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary>(() =>
    db.getFinancialSummary(activeAcademicYear.id)
  );
  const [studentsCount, setStudentsCount] = useState<number>(() => db.getStudents().length);
  const [showCashModal, setShowCashModal] = useState(false);

  const reloadData = () => {
    setSummary(db.getFinancialSummary(activeAcademicYear.id));
    setStudentsCount(db.getStudents().length);
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  // Payment Method Breakdown with grounded, non-AI palette
  const paymentMethodData = [
    { name: 'Tunai / Cash', value: summary.total_cash_income, color: '#059669' },
    { name: 'Online (Lynk.id)', value: summary.total_online_income, color: '#2563EB' },
    { name: 'Pemasukan Lain', value: summary.total_other_income, color: '#D97706' }
  ].filter(d => d.value > 0);

  const expenses = db.getExpenses(activeAcademicYear.id);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Dashboard Pengelolaan Kas
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Prodi Informatika · FMIKOM UNUGHA</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-blue-400 font-medium">Tahun Akademik {activeAcademicYear.name}</span>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCashModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <HandCoins className="w-4 h-4" />
            <span>Catat Kas Tunai</span>
          </button>

          <button
            onClick={() => onNavigateTab('admin-payments')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Verifikasi ({summary.pending_payments_count})</span>
          </button>

          <button
            onClick={() => onNavigateTab('admin-bills')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Buat Tagihan</span>
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mahasiswa"
          value={`${studentsCount} Orang`}
          subtitle="Informatika UNUGHA"
          variant="slate"
          onClick={() => onNavigateTab('admin-students')}
        />

        <StatCard
          title="Saldo Kas Saat Ini"
          value={formatCurrency(summary.current_balance)}
          subtitle={`Saldo Awal: ${formatCurrency(summary.initial_balance)}`}
          variant="emerald"
        />

        <StatCard
          title="Total Pemasukan Kas"
          value={formatCurrency(summary.total_verified_income)}
          subtitle="Tercatat sah dalam Buku Kas Umum"
          variant="blue"
        />

        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(summary.total_expenses)}
          subtitle={`${expenses.length} mutasi pengeluaran resmi`}
          variant="slate"
          onClick={() => onNavigateTab('admin-expenses')}
        />

        <StatCard
          title="Total Tunggakan"
          value={formatCurrency(summary.total_arrears_amount)}
          subtitle="Kewajiban mahasiswa belum bayar"
          variant={summary.total_arrears_amount > 0 ? 'rose' : 'slate'}
          onClick={() => onNavigateTab('admin-arrears')}
        />

        <StatCard
          title="Antrean Verifikasi"
          value={`${summary.pending_payments_count} Transaksi`}
          subtitle="Bukti Lynk.id menunggu pencocokan"
          variant={summary.pending_payments_count > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigateTab('admin-payments')}
        />

        <StatCard
          title="Pemasukan Tunai / Cash"
          value={formatCurrency(summary.total_cash_income)}
          subtitle="Diterima langsung oleh bendahara"
          variant="emerald"
          onClick={() => onNavigateTab('admin-payments')}
        />

        <StatCard
          title="Pemasukan Online (Lynk.id)"
          value={formatCurrency(summary.total_online_income)}
          subtitle="QRIS & transfer bank terverifikasi"
          variant="blue"
          onClick={() => onNavigateTab('admin-payments')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Bar Chart Perbandingan Pemasukan Kas Bulanan */}
        <div className="lg:col-span-2">
          <MonthlyIncomeComparisonChart
            academicYearId={activeAcademicYear.id}
            academicYearName={activeAcademicYear.name}
          />
        </div>

        {/* Chart 2: Komposisi Pemasukan */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Metode Pembayaran Kas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Perbandingan Tunai vs Online Lynk.id</p>
          </div>

          <div className="h-52 w-full my-2">
            {paymentMethodData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data pemasukan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{
                      backgroundColor: '#0B1120',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white tabular-nums">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Standalone Cash Payment Modal */}
      <CashPaymentModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        academicYearId={activeAcademicYear.id}
        onSuccess={reloadData}
      />
    </div>
  );
};
