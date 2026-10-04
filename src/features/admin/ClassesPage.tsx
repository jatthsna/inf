import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Building2, Plus, Users, Calendar, Trash2, CheckCircle2 } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('2024');
  const [major, setMajor] = useState('Informatika');
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  const reloadData = () => {
    setClasses(db.getClasses());
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  const handleOpenAdd = () => {
    setName('');
    setBatch(new Date().getFullYear().toString());
    setMajor('Informatika');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kelas wajib diisi.');
      return;
    }

    try {
      db.createClass({
        name: name.trim(),
        batch: batch.trim(),
        major: major.trim() || 'Informatika',
        is_active: true
      }, currentUser);

      setIsModalOpen(false);
      setActionMessage({ text: `Kelas "${name}" berhasil ditambahkan.`, type: 'success' });
      reloadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan kelas.');
    }
  };

  const handleConfirmDelete = () => {
    if (!classToDelete) return;
    const res = db.deleteClass(classToDelete.id, currentUser);
    if (res.success) {
      setActionMessage({ text: res.message, type: 'success' });
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }
    setClassToDelete(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Rombel Kelas</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FMIKOM Informatika
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelompokkan mahasiswa Informatika UNUGHA ke dalam rombel kelas dan angkatan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

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
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="rounded-2xl bg-[#151F32] border border-[#26354D] hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Aktif
                  </span>
                  <button
                    onClick={() => setClassToDelete(cls)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Rombel Kelas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">{cls.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{cls.major || 'Informatika'}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-[#26354D]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Angkatan {cls.batch}
                </span>
                <span className="flex items-center gap-1 font-semibold text-cyan-400 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  {cls.student_count || 0} Mahasiswa
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kelas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Kelas Baru"
        subtitle="Buat kelompok kelas untuk pengelompokan tagihan kas Program Studi Informatika"
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
              Nama Kelas *
            </label>
            <input
              type="text"
              placeholder="Contoh: IF-2024-C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Angkatan *
              </label>
              <input
                type="text"
                placeholder="2024"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Program Studi
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-[#26354D] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
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
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        onClose={() => setClassToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Rombel Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas "${classToDelete?.name}"? Kelas hanya dapat dihapus bila tidak ada mahasiswa yang sedang terdaftar di dalamnya.`}
        confirmLabel="Ya, Hapus Kelas"
        cancelLabel="Batal"
        variant="danger"
      />
    </div>
  );
};
