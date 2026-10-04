import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, BillAssignment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { exportToCSV, printFinancialReport } from '../../utils/export';
import { FileSpreadsheet, Printer } from 'lucide-react';

interface StudentRekapProps {
  activeAcademicYear: AcademicYear;
}

export const StudentRekap: React.FC<StudentRekapProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<BillAssignment[]>([]);
  const [selectedForReceipt, setSelectedForReceipt] = useState<BillAssignment | null>(null);

  const reloadData = () => {
    setAssignments(db.getStudentBillAssignments(currentUser.id, activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [currentUser.id, activeAcademicYear.id]);

  const verified = assignments.filter(a => a.status === 'verified');
  const unpaid = assignments.filter(a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected');

  const totalObligation = assignments.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);
  const totalPaid = verified.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);
  const totalArrears = unpaid.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);

  const handleExportCSV = () => {
    const headers = ['No', 'Nama Tagihan', 'Jenis', 'Nominal', 'Jatuh Tempo', 'Status', 'Tanggal Bayar', 'Metode'];
    const rows = assignments.map((asg, idx) => [
      idx + 1,
      asg.bill?.name || '-',
      asg.bill?.bill_type || '-',
      asg.bill?.amount || 0,
      asg.bill?.due_date || '-',
      asg.status || 'unpaid',
      asg.latest_payment?.payment_date || '-',
      asg.latest_payment?.payment_method || '-'
    ]);
    exportToCSV(`Rekap_Kas_${currentUser.nim}_${activeAcademicYear.name.replace('/', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Rekapitulasi Riwayat Kas Mahasiswa</h2>
          <p className="text-xs text-slate-400 mt-1">
            Buku catatan pribadi: {currentUser.full_name} (NIM: {currentUser.nim}) · Tahun Akademik {activeAcademicYear.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => printFinancialReport(`Rekap Kas ${currentUser.full_name}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* 6 Key Indicators: High Density Ledger Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">Total Kewajiban</span>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-1">{formatCurrency(totalObligation)}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-emerald-400 block tracking-wider">Total Dibayar</span>
          <div className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-1">{formatCurrency(totalPaid)}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-amber-400 block tracking-wider">Total Tunggakan</span>
          <div className="text-base font-bold text-amber-400 font-mono tabular-nums mt-1">{formatCurrency(totalArrears)}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">Jumlah Tagihan</span>
          <div className="text-base font-bold text-white font-mono tabular-nums mt-1">{assignments.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-emerald-400 block tracking-wider">Jumlah Lunas</span>
          <div className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-1">{verified.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-semibold text-rose-400 block tracking-wider">Belum Lunas</span>
          <div className="text-base font-bold text-rose-400 font-mono tabular-nums mt-1">{unpaid.length}</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Rincian Pembayaran Kas Mahasiswa</span>
          <span className="text-slate-400 font-mono">Tahun Akademik {activeAcademicYear.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Tagihan</th>
                <th className="py-3 px-4 font-semibold">Jenis</th>
                <th className="py-3 px-4 text-right font-semibold">Nominal</th>
                <th className="py-3 px-4 font-semibold">Jatuh Tempo</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Tanggal Bayar</th>
                <th className="py-3 px-4 font-semibold">Metode</th>
                <th className="py-3 px-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{asg.bill?.name}</td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-mono text-slate-400">
                    {asg.bill?.bill_type === 'monthly' ? 'Kas Bulanan' : 'Iuran Kegiatan'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(asg.bill?.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {formatDateID(asg.bill?.due_date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={asg.status || 'unpaid'} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {asg.latest_payment?.status === 'verified'
                      ? formatDateID(asg.latest_payment.payment_date)
                      : '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    {asg.latest_payment?.status === 'verified' ? (
                      <span className="capitalize font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {asg.latest_payment.payment_method === 'cash' ? 'Tunai' : 'Lynk.id'}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {asg.latest_payment?.status === 'verified' ? (
                      <button
                        onClick={() => setSelectedForReceipt(asg)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md transition-colors"
                      >
                        Kuitansi
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedForReceipt && selectedForReceipt.latest_payment && (
        <ReceiptModal
          isOpen={Boolean(selectedForReceipt)}
          onClose={() => setSelectedForReceipt(null)}
          payment={selectedForReceipt.latest_payment}
          bill={selectedForReceipt.bill}
          student={currentUser}
        />
      )}
    </div>
  );
};
