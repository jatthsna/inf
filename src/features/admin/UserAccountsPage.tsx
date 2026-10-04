import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UserProfile, UserRole, UserStatus, ClassItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Key, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Briefcase, 
  Shield, 
  RefreshCw,
  Phone,
  Mail,
  Building2,
  AlertCircle
} from 'lucide-react';

export const UserAccountsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  // Success / Alert message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newNim, setNewNim] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newClassId, setNewClassId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editNim, setEditNim] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editClassId, setEditClassId] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');

  // Reset Password Modal State
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Delete User Confirm State
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const loadData = () => {
    setProfiles(db.getProfiles());
    setClasses(db.getClasses());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtered List
  const filteredUsers = profiles.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.full_name.toLowerCase().includes(q);
      const matchNim = user.nim.toLowerCase().includes(q);
      const matchEmail = (user.email || '').toLowerCase().includes(q);
      const matchPhone = (user.phone || '').toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // KPI Statistics
  const totalCount = profiles.length;
  const adminCount = profiles.filter(p => p.role === 'admin').length;
  const treasurerCount = profiles.filter(p => p.role === 'treasurer').length;
  const studentCount = profiles.filter(p => p.role === 'student').length;
  const activeCount = profiles.filter(p => p.status === 'active').length;
  const inactiveCount = profiles.filter(p => p.status === 'inactive').length;

  // Open Create Modal
  const handleOpenCreate = () => {
    setNewFullName('');
    setNewNim('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('student');
    setNewClassId(classes[0]?.id || '');
    setNewPassword('');
    setNewStatus('active');
    setFormError(null);
    setIsCreateOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newNim.trim()) {
      setFormError('Nama lengkap dan NIM/Username login wajib diisi.');
      return;
    }

    // Check duplicate NIM
    const duplicate = profiles.find(p => p.nim.toLowerCase() === newNim.trim().toLowerCase());
    if (duplicate) {
      setFormError(`NIM atau username "${newNim}" sudah digunakan oleh ${duplicate.full_name}.`);
      return;
    }

    const cls = classes.find(c => c.id === newClassId);

    const created = db.createUserAccount({
      full_name: newFullName.trim(),
      nim: newNim.trim(),
      email: newEmail.trim() || `${newNim.trim().toLowerCase()}@informatika.ac.id`,
      phone: newPhone.trim() || '-',
      role: newRole,
      class_id: newRole === 'student' ? newClassId : undefined,
      class_name: newRole === 'student' ? (cls ? cls.name : undefined) : undefined,
      password: newPassword.trim() || undefined,
      status: newStatus
    }, currentUser);

    setIsCreateOpen(false);
    showToast('success', `Akun pengguna ${created.full_name} (${created.role.toUpperCase()}) berhasil dibuat.`);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditNim(user.nim);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditClassId(user.class_id || (classes[0]?.id || ''));
    setEditStatus(user.status);
    setFormError(null);
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName.trim() || !editNim.trim()) {
      setFormError('Nama lengkap dan NIM/Username wajib diisi.');
      return;
    }

    // Check duplicate NIM if changed
    const duplicate = profiles.find(p => p.id !== editingUser.id && p.nim.toLowerCase() === editNim.trim().toLowerCase());
    if (duplicate) {
      setFormError(`NIM atau username "${editNim}" sudah digunakan oleh ${duplicate.full_name}.`);
      return;
    }

    const cls = classes.find(c => c.id === editClassId);

    db.updateProfile(editingUser.id, {
      full_name: editFullName.trim(),
      nim: editNim.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      role: editRole,
      class_id: editRole === 'student' ? editClassId : undefined,
      class_name: editRole === 'student' ? (cls ? cls.name : undefined) : undefined,
      status: editStatus
    }, currentUser);

    setEditingUser(null);
    showToast('success', `Data akun ${editFullName} berhasil diperbarui.`);
  };

  // Open Reset Password Modal
  const handleOpenReset = (user: UserProfile) => {
    setResettingUser(user);
    setAdminNewPassword('');
    setShowPasswordText(false);
    setResetError(null);
  };

  // Submit Reset Password
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (!adminNewPassword.trim() || adminNewPassword.trim().length < 4) {
      setResetError('Kata sandi baru minimal harus 4 karakter.');
      return;
    }

    const res = db.adminResetPassword(resettingUser.id, adminNewPassword.trim(), currentUser);
    if (res.success) {
      setResettingUser(null);
      showToast('success', res.message);
    } else {
      setResetError(res.message);
    }
  };

  // Fill Default Password in Reset Modal
  const handleFillDefaultPassword = () => {
    if (!resettingUser) return;
    const defaultVal =
      resettingUser.role === 'admin'
        ? 'admin123'
        : resettingUser.role === 'treasurer'
        ? 'bendahara123'
        : resettingUser.nim;
    setAdminNewPassword(defaultVal);
  };

  // Toggle User Status (Lock / Unlock)
  const handleToggleStatus = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showToast('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
      return;
    }
    const newStat: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    db.setUserStatus(user.id, newStat, currentUser);
    showToast(
      'success',
      `Akun ${user.full_name} berhasil ${newStat === 'active' ? 'diaktifkan' : 'dinonaktifkan (dikunci)'}.`
    );
  };

  // Delete User Submit
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = db.deleteUserAccount(deletingUser.id, currentUser);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
    setDeletingUser(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3" />
            Administrator
          </span>
        );
      case 'treasurer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Briefcase className="w-3 h-3" />
            Bendahara Kas
          </span>
        );
      case 'student':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <GraduationCap className="w-3 h-3" />
            Mahasiswa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Pengaturan Akun User & Hak Akses
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen akun pengguna sistem kas: Administrator, Bendahara, dan Mahasiswa. Atur peran, reset password, dan status akun.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all shadow-md ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Akun</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{totalCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pengguna terdaftar</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pengurus Kas</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{adminCount + treasurerCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{adminCount} Admin &bull; {treasurerCount} Bendahara</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mahasiswa</span>
            <GraduationCap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{studentCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Wajib iuran kas</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status Akun</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{activeCount} <span className="text-xs font-normal text-slate-400">Aktif</span></div>
          <p className="text-[10px] text-slate-400 mt-0.5">{inactiveCount} akun terkunci/nonaktif</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pengguna, NIM/username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 border border-slate-800 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Semua Role</option>
              <option value="admin" className="bg-slate-900">Administrator</option>
              <option value="treasurer" className="bg-slate-900">Bendahara</option>
              <option value="student" className="bg-slate-900">Mahasiswa</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 border border-slate-800 rounded-lg">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Semua Status</option>
              <option value="active" className="bg-slate-900">Aktif</option>
              <option value="inactive" className="bg-slate-900">Nonaktif / Terkunci</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Identitas Akun</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">NIM / Login ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Peran (Role)</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Kelas / Divisi</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Kontak WhatsApp</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ditemukan data akun pengguna yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : user.role === 'treasurer'
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              {user.full_name}
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-normal">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span>{user.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIM / Login ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        {user.nim}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4 text-slate-300">
                        {user.role === 'student' ? (
                          <span className="font-mono text-xs">{user.class_name || '-'}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pengurus Prodi</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {user.phone && user.phone !== '-' ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Lock className="w-3 h-3" />
                            Terkunci
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleOpenReset(user)}
                            title="Reset Kata Sandi Akun"
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User Button */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit Data & Hak Akses"
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Tidak dapat mengunci akun sendiri'
                                : user.status === 'active'
                                ? 'Kunci / Nonaktifkan Akun'
                                : 'Buka Kunci / Aktifkan Akun'
                            }
                            className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : user.status === 'active'
                                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
                            className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Tambah Akun Pengguna Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Akun Pengguna Baru"
        subtitle="Buat akun untuk Administrator, Bendahara Kas, atau Mahasiswa."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hak Akses (Role) <span className="text-rose-400">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="student">Mahasiswa (Akses Portal Siswa & Tagihan Kas)</option>
                <option value="treasurer">Bendahara Kas (Kelola Pembayaran, Verifikasi, Kas Tunai)</option>
                <option value="admin">Administrator (Akses Penuh Semua Pengaturan Sistem)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Contoh: Muhammad Rizky"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIM / Username Login <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={newNim}
                onChange={(e) => setNewNim(e.target.value)}
                placeholder={newRole === 'admin' ? 'Contoh: ADM2024' : newRole === 'treasurer' ? 'Contoh: BND2024' : 'Contoh: 20241010'}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@informatika.ac.id"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {newRole === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelas / Rombel
                </label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.major})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Akun Awal
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Aktif (Dapat langsung login)</option>
                <option value="inactive">Terkunci / Nonaktif</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi Awal (Password)
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={
                  newRole === 'admin'
                    ? 'Default: admin123 (jika dikosongkan)'
                    : newRole === 'treasurer'
                    ? 'Default: bendahara123 (jika dikosongkan)'
                    : 'Default: sama dengan NIM mahasiswa'
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Jika dikosongkan, sistem secara otomatis memberi sandi standar sesuai role (Admin: admin123, Bendahara: bendahara123, Mahasiswa: NIM).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Simpan & Buat Akun
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Akun Pengguna & Hak Akses */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Data & Hak Akses Pengguna"
        subtitle={`Perbarui data akun untuk ${editingUser?.full_name}`}
        maxWidth="lg"
      >
        {editingUser && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peran / Hak Akses (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="student">Mahasiswa</option>
                  <option value="treasurer">Bendahara Kas</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Mengubah role menjadi Bendahara atau Admin akan memberi hak verifikasi transaksi kas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NIM / Login ID
                </label>
                <input
                  type="text"
                  value={editNim}
                  onChange={(e) => setEditNim(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {editRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas / Rombel
                  </label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Akun
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Terkunci / Nonaktif</option>
                  <option value="graduated">Lulus (Arsip)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 3: Reset Password Akun Pengguna */}
      <Modal
        isOpen={!!resettingUser}
        onClose={() => setResettingUser(null)}
        title="Reset Kata Sandi Akun"
        subtitle={`Atur ulang password login untuk ${resettingUser?.full_name} (${resettingUser?.nim})`}
        maxWidth="md"
      >
        {resettingUser && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {resetError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Pengguna Terpilih:</div>
              <div className="text-xs font-bold text-white">{resettingUser.full_name}</div>
              <div className="text-[11px] font-mono text-blue-400">
                Login ID: {resettingUser.nim} &bull; Role: {resettingUser.role.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Kata Sandi Baru <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDefaultPassword}
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Gunakan Sandi Bawaan Role
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru (minimal 4 karakter)"
                  required
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Pengguna dapat langsung masuk dengan sandi baru ini setelah disimpan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
              >
                Terapkan Kata Sandi Baru
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 4: Konfirmasi Hapus Akun */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun ${deletingUser?.full_name} (${deletingUser?.nim})? Tindakan ini akan menghapus akses login pengguna dan dicatat dalam audit log.`}
        variant="danger"
        confirmLabel="Ya, Hapus Akun"
      />
    </div>
  );
};
