import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicYear } from '../../types';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { 
  Calendar, 
  Menu, 
  ChevronDown, 
  GraduationCap, 
  Check, 
  LogOut, 
  KeyRound, 
  User, 
  Shield, 
  BadgeCheck,
  ExternalLink
} from 'lucide-react';
import { UnughaLogo } from './UnughaLogo';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeAcademicYear: AcademicYear;
  onSelectAcademicYear: (yearId: string) => void;
  onViewStudentPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeAcademicYear,
  onSelectAcademicYear,
  onViewStudentPortal
}) => {
  const { currentUser, role, logout } = useAuth();
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const academicYears = db.getAcademicYears();

  const getRoleLabel = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'Admin Prodi';
      case 'treasurer':
        return 'Bendahara Kas';
      default:
        return 'Mahasiswa';
    }
  };

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'treasurer':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Zone 1: Mobile Toggle & Brand / Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors border border-slate-800"
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Clean Brand & Year */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UnughaLogo className="w-8 h-8 drop-shadow" />
                <div>
                  <span className="text-sm font-bold tracking-tight text-white block leading-tight flex items-center gap-1.5">
                    <span>KAS INFORMATIKA</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">UNUGHA</span>
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block leading-none">
                    FMIKOM Informatika
                  </span>
                </div>
              </div>

              <span className="text-slate-700 hidden sm:inline" aria-hidden="true">/</span>

              {/* Academic Year Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-200 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>TA {activeAcademicYear?.name || '2026/2027'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showYearDropdown && (
                  <div className="absolute left-0 mt-1.5 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Pilih Tahun Akademik
                    </div>
                    {academicYears.map((year) => (
                      <button
                        key={year.id}
                        onClick={() => {
                          onSelectAcademicYear(year.id);
                          setShowYearDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 text-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={year.id === activeAcademicYear.id ? 'text-blue-400 font-semibold' : ''}>
                            {year.name}
                          </span>
                          {year.is_active && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Aktif
                            </span>
                          )}
                          {year.is_archived && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                              Arsip
                            </span>
                          )}
                        </div>
                        {year.id === activeAcademicYear.id && (
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Contextual Subtitle (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Buku Kas Digital</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Semester Berjalan</span>
          </div>

          {/* Zone 3: Notification & Account */}
          <div className="flex items-center gap-2">
            {/* View Student Portal Shortcut */}
            {onViewStudentPortal && (
              <button
                onClick={onViewStudentPortal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-medium transition-colors"
                title="Buka Portal Pembayaran Mahasiswa"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Portal Mahasiswa</span>
              </button>
            )}

            {/* Notification Bell */}
            <NotificationCenter />

            {/* User Profile & Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
              >
                <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                  {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Akun'}
                </span>
                <span className={`text-[10px] font-medium border px-1.5 py-0.2 rounded hidden sm:inline ${getRoleBadgeColor(role)}`}>
                  {getRoleLabel(role)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50">
                  {/* Account Summary Header */}
                  <div className="px-4 py-3 border-b border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIM: {currentUser.nim}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded shrink-0 ${getRoleBadgeColor(role)}`}>
                        {getRoleLabel(role)}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{currentUser.class_name || 'Informatika'}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                        <BadgeCheck className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ganti Kata Sandi / PIN</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
