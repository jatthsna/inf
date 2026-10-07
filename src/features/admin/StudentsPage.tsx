import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UserProfile, ClassItem, AcademicYear, BillAssignment } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  UserCheck, 
  UserX, 
  Eye, 
  Phone, 
  Mail, 
  GraduationCap,
  History,
  AlertCircle,
  ShieldCheck,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface StudentsPageProps {
  activeAcademicYear: AcademicYear;
  onNavigateTab?: (tabId: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ activeAcademicYear, onNavigateTab }) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'graduated'>('all');

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classId, setClassId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Batch Import Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchClassId, setBatchClassId] = useState('');
  const [batchRawText, setBatchRawText] = useState('');
  const [batchResult, setBatchResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Delete Modal State
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Detail Modal
  const [detailStudent, setDetailStudent] = useState<UserProfile | null>(null);
  const [studentAssignments, setStudentAssignments] = useState<BillAssignment[]>([]);

  const reloadData = () => {
    setStudents(db.getStudents());
    const clList = db.getClasses();
    setClasses(clList);
    if (!batchClassId && clList.length > 0) {
      setBatchClassId(clList[0].id);
    }
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  const filteredStudents = students.filter((s) => {
    if (selectedClassFilter !== 'all' && s.class_id !== selectedClassFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.full_name.toLowerCase().includes(q);
      const matchNim = s.nim.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchEmail) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFullName('');
    setNim('');
    setEmail('');
    setPhone('');
    setClassId(classes[0]?.id || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenBatch = () => {
    setBatchClassId(classes[0]?.id || '');
    setBatchRawText('');
    setBatchResult(null);
    setIsBatchModalOpen(true);
  };

  const handleOpenEdit = (st: UserProfile) => {
    setEditingStudent(st);
    setFullName(st.full_name);
    setNim(st.nim);
    setEmail(st.email);
    setPhone(st.phone);
    setClassId(st.class_id || (classes[0]?.id || ''));
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (st: UserProfile) => {
    setDetailStudent(st);
    const asg = db.getStudentBillAssignments(st.id, activeAcademicYear.id);
    setStudentAssignments(asg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nim.trim()) {
      setError('Nama lengkap dan NIM wajib diisi.');
      return;
    }

    try {
      if (editingStudent) {
        db.updateProfile(editingStudent.id, {
          full_name: fullName.trim(),
          nim: nim.trim(),
          email: email.trim() || `${nim.trim()}@unugha.ac.id`,
          phone: phone.trim() || '-',
          class_id: classId
        }, currentUser);
        setActionMessage({ text: `Data mahasiswa ${fullName} berhasil diperbarui.`, type: 'success' });
      } else {
        db.createStudent({
          full_name: fullName.trim(),
          nim: nim.trim(),
          email: email.trim() || `${nim.trim()}@unugha.ac.id`,
          phone: phone.trim() || '-',
          class_id: classId,
          status: 'active'
        }, currentUser);
        setActionMessage({ text: `Mahasiswa ${fullName} (${nim}) berhasil ditambahkan dan otomatis dihubungkan ke tagihan aktif.`, type: 'success' });
      }

      setIsModalOpen(false);
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data mahasiswa.');
    }
  };

  const handleExecuteBatchImport = () => {
    if (!batchRawText.trim()) return;

    setIsImporting(true);
    // Parse lines: each line can be "NIM, Nama" or "NIM [TAB] Nama" or "Nama, NIM"
    const lines = batchRawText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedList: Array<{ full_name: string; nim: string; class_id?: string; phone?: string; email?: string }> = [];

    lines.forEach(line => {
      // Split by comma, tab, or semicolon
      let parts = line.split(/[,\t;]/).map(p => p.trim());
      if (parts.length === 1 && line.includes(' - ')) {
        parts = line.split(' - ').map(p => p.trim());
      }

      if (parts.length >= 2) {
        // Check if first or second is NIM (numbers)
        const isPart0Numeric = /^[0-9]+$/.test(parts[0].replace(/\s/g, ''));
        const nim = isPart0Numeric ? parts[0] : parts[1];
        const name = isPart0Numeric ? parts.slice(1).join(' ') : parts[0];

        parsedList.push({
          nim,
          full_name: name,
          class_id: batchClassId
        });
      } else if (parts.length === 1) {
        // Just name with auto-generated NIM
        parsedList.push({
          nim: '2024' + Math.floor(1000 + Math.random() * 9000),
          full_name: parts[0],
          class_id: batchClassId
        });
      }
    });

    if (parsedList.length === 0) {
      setIsImporting(false);
      return;
    }

    const res = db.batchImportStudents(parsedList, currentUser);
    setBatchResult(res);
    setIsImporting(false);
    reloadData();
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const res = db.deleteStudent(studentToDelete.id, currentUser);
    if (res.success) {
      setActionMessage({ text: res.message, type: 'success' });
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }
    setStudentToDelete(null);
    reloadData();
  };

  const toggleStudentStatus = (st: UserProfile) => {
    const nextStatus = st.status === 'active' ? 'inactive' : 'active';
    db.setStudentStatus(st.id, nextStatus, currentUser);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Manajemen Data Mahasiswa</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FMIKOM Informatika
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar mahasiswa terdaftar, data rombel kelas, import massal, dan hapus/kelola data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {students.length === 0 && (
            <button
              onClick={() => {
                db.restoreSampleStudents();
                reloadData();
                setActionMessage({ text: 'Data 10 mahasiswa UNUGHA Cilacap berhasil dipulihkan!', type: 'success' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors shadow-sm"
              title="Pulihkan data 10 mahasiswa contoh UNUGHA Cilacap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Pulihkan Data Mahasiswa</span>
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('admin-users')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-medium text-xs transition-colors shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Kelola Akun User</span>
            </button>
          )}
          <button
            onClick={handleOpenBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors shadow-sm"
            title="Import atau tempel daftar mahasiswa sekaligus tanpa mengetik satu per satu"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import / Tempel Banyak</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#111827] border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="graduated">Lulus</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredStudents.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Users}
            title={students.length === 0 ? "Belum Ada Data Mahasiswa" : "Tidak Ada Mahasiswa Ditemukan"}
            description={
              students.length === 0 
                ? "Data mahasiswa saat ini kosong. Anda dapat langsung memulihkan 10 data mahasiswa contoh bawaan UNUGHA Cilacap dengan satu klik di bawah."
                : "Coba ubah kata kunci pencarian atau filter kelas."
            }
          />
          {students.length === 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  db.restoreSampleStudents();
                  reloadData();
                  setActionMessage({ text: 'Data 10 mahasiswa UNUGHA Cilacap berhasil dipulihkan!', type: 'success' });
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Pulihkan 10 Mahasiswa UNUGHA Bawaan</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#151F32] border border-[#26354D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                <tr>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-[#1B263B]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xs shrink-0">
                          {st.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{st.full_name}</div>
                          <div className="text-[10px] text-slate-400">{st.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                      {st.nim}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                        {st.class_name || 'Informatika'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {st.phone || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={st.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(st)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                          title="Lihat Histori & Tunggakan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                          title="Edit Data Mahasiswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(st)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            st.status === 'active'
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-[#1B263B]'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-[#1B263B]'
                          }`}
                          title={st.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {st.status === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setStudentToDelete(st)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1B263B] rounded-lg transition-colors"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Import / Tambah Banyak Mahasiswa Sekaligus"
        subtitle="Tempel (paste) daftar nama & NIM banyak mahasiswa tanpa perlu input satu per satu"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2.5">
            <UploadCloud className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <div>
              <p className="font-semibold text-white mb-0.5">Format Baris Teks yang Didukung:</p>
              <p className="leading-relaxed text-blue-200/90">
                1 baris untuk 1 mahasiswa. Format: <code className="px-1.5 py-0.5 rounded bg-blue-950/80 font-mono text-cyan-300">NIM, Nama Mahasiswa</code> atau copy-paste langsung dari kolom Excel/Google Sheets. Kata sandi akun awal akan otomatis dibuat sama dengan NIM masing-masing.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Pilih Rombel / Kelas Target Mahasiswa
            </label>
            <select
              value={batchClassId}
              onChange={(e) => setBatchClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} · Angkatan {cls.batch} ({cls.major || 'Informatika'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tempel Daftar Mahasiswa (Nama & NIM)
              </label>
              <button
                type="button"
                onClick={() => {
                  setBatchRawText(
                    `20241005, Ahmad Fajar Maulana\n20241006, Siti Aminah Az-Zahra\n20241007, Danu Tri Saputra\n20241008, Lutfi Khoirul Anam\n20241009, Nurul Hidayah`
                  );
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                Isi Contoh Template (5 Mahasiswa)
              </button>
            </div>
            <textarea
              rows={8}
              value={batchRawText}
              onChange={(e) => setBatchRawText(e.target.value)}
              placeholder={`Contoh tempel (paste):\n20241011, Budi Santoso\n20241012, Siti Nurhaliza\n20241013, Ahmad Zaki\n20241014, Dewi Lestari`}
              className="w-full p-3 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Jumlah baris terdeteksi: <strong className="text-cyan-400">{batchRawText.split('\n').filter(l => l.trim()).length}</strong> baris calon mahasiswa.
            </p>
          </div>

          {batchResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              batchResult.created > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hasil Import Massal: {batchResult.created} Mahasiswa Berhasil Dibuat!</span>
              </div>
              {batchResult.skipped > 0 && (
                <p className="text-slate-400 text-[11px]">
                  {batchResult.skipped} baris dilewati (sudah terdaftar atau data tidak lengkap).
                </p>
              )}
              {batchResult.errors.length > 0 && (
                <div className="text-[11px] text-rose-400 mt-1 pl-5 list-disc">
                  {batchResult.errors.slice(0, 3).map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                  {batchResult.errors.length > 3 && (
                    <div>• ...dan {batchResult.errors.length - 3} catatan lainnya</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {batchResult ? 'Selesai / Tutup' : 'Batal'}
            </button>
            <button
              type="button"
              disabled={isImporting || !batchRawText.trim()}
              onClick={handleExecuteBatchImport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isImporting ? 'Sedang Memproses...' : 'Proses & Simpan Semua Mahasiswa'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Mahasiswa"
        message={`Apakah Anda yakin ingin menghapus data mahasiswa "${studentToDelete?.full_name}" (NIM: ${studentToDelete?.nim})? Tindakan ini akan menghapus akun login dan menonaktifkan tagihan terkait.`}
        confirmLabel="Ya, Hapus Mahasiswa"
        cancelLabel="Batal"
        variant="danger"
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
        subtitle="Mahasiswa baru otomatis akan dihubungkan dengan tagihan aktif tahun ini"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Bima"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                NIM (Nomor Induk Mahasiswa) *
              </label>
              <input
                type="text"
                placeholder="Contoh: 20241011"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kelas
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="nama@student.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp / HP
              </label>
              <input
                type="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26354D]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Detail Modal */}
      {detailStudent && (
        <Modal
          isOpen={Boolean(detailStudent)}
          onClose={() => setDetailStudent(null)}
          title={`Detail & Rekap: ${detailStudent.full_name}`}
          subtitle={`NIM ${detailStudent.nim} • ${detailStudent.class_name || 'Informatika'}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#26354D]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tagihan</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {formatCurrency(studentAssignments.reduce((s, a) => s + (a.bill?.amount || 0), 0))}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Sudah Dibayar</span>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(
                    studentAssignments
                      .filter(a => a.status === 'verified')
                      .reduce((s, a) => s + (a.bill?.amount || 0), 0)
                  )}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase font-semibold">Tunggakan</span>
                <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                  {formatCurrency(
                    studentAssignments
                      .filter(a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected')
                      .reduce((s, a) => s + (a.bill?.amount || 0), 0)
                  )}
                </p>
              </div>
            </div>

            {/* Assignments List */}
            <div className="border border-[#26354D] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B263B] text-slate-400 font-semibold border-b border-[#26354D]">
                  <tr>
                    <th className="py-2.5 px-3">Tagihan</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                    <th className="py-2.5 px-3">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26354D]/60 text-slate-300">
                  {studentAssignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-[#1B263B]/30">
                      <td className="py-2 px-3 font-semibold text-white">{asg.bill?.name}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {formatCurrency(asg.bill?.amount)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {formatDateID(asg.bill?.due_date)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={asg.status || 'unpaid'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
