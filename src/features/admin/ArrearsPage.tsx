import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AcademicYear, ClassItem } from '../../types';
import { CashPaymentModal } from './CashPaymentModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { exportToCSV, printFinancialReport } from '../../utils/export';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  HandCoins, 
  FileSpreadsheet, 
  Printer, 
  ArrowUpDown,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ArrearsPageProps {
  activeAcademicYear: AcademicYear;
}

export const ArrearsPage: React.FC<ArrearsPageProps> = ({ activeAcademicYear }) => {
  const [arrearsData, setArrearsData] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [filterOnlyArrears, setFilterOnlyArrears] = useState(true);

  // Quick Cash recording modal
  const [quickCashStudentId, setQuickCashStudentId] = useState<string | null>(null);

  const reloadData = () => {
    setArrearsData(db.getStudentArrearsList(activeAcademicYear.id));
    setClasses(db.getClasses());
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [activeAcademicYear.id]);

  const filteredList = arrearsData.filter((item) => {
    if (filterOnlyArrears && item.total_arrears <= 0) return false;
    if (selectedClassFilter !== 'all' && item.student.class_id !== selectedClassFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.student.full_name.toLowerCase().includes(q);
      const matchNim = item.student.nim.toLowerCase().includes(q);
      if (!matchName && !matchNim) return false;
    }
    return true;
  });

  const totalClassArrears = filteredList.reduce((sum, item) => sum + item.total_arrears, 0);

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Mahasiswa',
      'NIM',
      'Kelas',
      'Jumlah Tagihan',
      'Tagihan Belum Lunas',
      'Total Tunggakan',
      'Tagihan Tertua',
      'Jatuh Tempo'
    ];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item.student.full_name,
      item.student.nim,
      item.class_name || '-',
      item.total_bills_count,
      item.unpaid_bills_count,
      item.total_arrears,
      item.oldest_bill_name,
      item.oldest_due_date
    ]);
    exportToCSV(`Laporan_Tunggakan_${activeAcademicYear.name.replace('/', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Daftar Tunggakan Mahasiswa</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-bold">
              Total: {formatCurrency(totalClassArrears)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring kewajiban kas mahasiswa yang belum terselesaikan periode {activeAcademicYear.name}
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
            onClick={() => printFinancialReport('Laporan Tunggakan Kas Informatika')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151F32] hover:bg-[#1B263B] border border-[#26354D] rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#151F32] border border-[#26354D]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau NIM mahasiswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFilterOnlyArrears(!filterOnlyArrears)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              filterOnlyArrears
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-[#0B1120] text-slate-400 border-[#26354D]'
            }`}
          >
            {filterOnlyArrears ? 'Hanya Yang Tertunggak' : 'Semua Mahasiswa'}
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Tidak Ada Tunggakan"
          description="Semua mahasiswa telah melunasi kewajiban kas atau tidak ada data yang cocok dengan filter."
        />
      ) : (
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                <tr>
                  <th className="py-3 px-4">Nama Mahasiswa</th>
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-center">Jml Tagihan</th>
                  <th className="py-3 px-4 text-right">Total Tunggakan</th>
                  <th className="py-3 px-4">Tagihan Tertua</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-center">Bayar Cash Langsung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                {filteredList.map((item) => {
                  const hasArrears = item.total_arrears > 0;

                  return (
                    <tr
                      key={item.student.id}
                      className={`hover:bg-[#1B263B]/40 transition-colors ${
                        hasArrears ? 'hover:border-l-2 hover:border-amber-400' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-white">
                        {item.student.full_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300">
                        {item.student.nim}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          {item.class_name || 'Informatika'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={hasArrears ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {item.unpaid_bills_count} / {item.total_bills_count}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={hasArrears ? 'text-amber-400' : 'text-emerald-400'}>
                          {formatCurrency(item.total_arrears)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {item.oldest_bill_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {item.oldest_due_date !== '-' ? formatDateID(item.oldest_due_date) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {hasArrears ? (
                          <button
                            onClick={() => setQuickCashStudentId(item.student.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                          >
                            <HandCoins className="w-3.5 h-3.5" />
                            <span>Catat Cash</span>
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold">LUNAS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Cash Modal */}
      {quickCashStudentId && (
        <CashPaymentModal
          isOpen={Boolean(quickCashStudentId)}
          onClose={() => setQuickCashStudentId(null)}
          academicYearId={activeAcademicYear.id}
          preselectedStudentId={quickCashStudentId}
          onSuccess={reloadData}
        />
      )}
    </div>
  );
};
