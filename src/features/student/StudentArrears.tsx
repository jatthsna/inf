import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear, BillAssignment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StudentPaymentModal } from './StudentPaymentModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { AlertCircle, CheckCircle, ArrowRight, Calendar } from 'lucide-react';

interface StudentArrearsProps {
  activeAcademicYear: AcademicYear;
}

export const StudentArrears: React.FC<StudentArrearsProps> = ({ activeAcademicYear }) => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<BillAssignment[]>([]);
  const [selectedForPayment, setSelectedForPayment] = useState<BillAssignment | null>(null);

  const reloadData = () => {
    setAssignments(db.getStudentBillAssignments(currentUser.id, activeAcademicYear.id));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, [currentUser.id, activeAcademicYear.id]);

  const arrearsList = assignments.filter(
    a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected'
  );

  const totalArrears = arrearsList.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white">Tunggakan Kas Mahasiswa</h2>
        <p className="text-xs text-slate-400 mt-1">
          Daftar kewajiban kas kelas yang belum dilunasi pada tahun akademik {activeAcademicYear.name}
        </p>
      </div>

      {/* Arrears Summary Strip */}
      <div className={`p-5 rounded-xl border shadow-sm ${
        totalArrears > 0
          ? 'bg-amber-500/5 border-amber-500/25 text-slate-200'
          : 'bg-emerald-500/5 border-emerald-500/25 text-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${totalArrears > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {totalArrears > 0 ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Tunggakan Kas Saat Ini
              </p>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-0.5">
                {totalArrears > 0 ? formatCurrency(totalArrears) : 'Rp0 (Seluruhnya Lunas)'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {totalArrears > 0
              ? `Terdapat ${arrearsList.length} tagihan belum diselesaikan. Pembayaran dapat dilakukan secara online via Lynk.id atau cash langsung kepada bendahara kelas.`
              : 'Seluruh tagihan periode ini telah lunas terverifikasi dan tercatat sah.'}
          </p>
        </div>
      </div>

      {/* List of Arrears */}
      {arrearsList.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Tidak Ada Tunggakan Kas"
          description="Terima kasih telah melunasi seluruh kewajiban kas tepat waktu."
        />
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rincian Item Tertunggak
          </h3>
          <div className="space-y-3">
            {arrearsList.map((asg) => {
              const { bill, status } = asg;
              if (!bill) return null;

              return (
                <div
                  key={asg.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status || 'unpaid'} size="sm" />
                      <span className="text-[11px] uppercase font-semibold text-slate-400">
                        {bill.bill_type === 'monthly' ? 'Kas Bulanan' : 'Iuran Kegiatan'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{bill.name}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batas jatuh tempo: <strong className="text-slate-200 font-medium">{formatDateID(bill.due_date)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Kewajiban</span>
                      <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedForPayment(asg)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                    >
                      <span>Lunasi via Lynk.id</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <StudentPaymentModal
        isOpen={Boolean(selectedForPayment)}
        onClose={() => setSelectedForPayment(null)}
        assignment={selectedForPayment}
        onSuccess={reloadData}
      />
    </div>
  );
};
