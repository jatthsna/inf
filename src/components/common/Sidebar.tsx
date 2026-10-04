import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  History,
  AlertCircle,
  Users,
  Building2,
  Link as LinkIcon,
  HandCoins,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
  CalendarDays,
  CalendarRange,
  ScrollText,
  Calendar,
  Settings,
  Eye,
  X,
  ShieldCheck,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { UnughaLogo } from './UnughaLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { role, isAdmin, isTreasurer, logout } = useAuth();

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Ikhtisar Kas', icon: LayoutDashboard },
    { id: 'student-bills', label: 'Tagihan & Pembayaran', icon: Receipt },
    { id: 'student-rekap', label: 'Rekap Riwayat Saya', icon: History },
    { id: 'student-arrears', label: 'Tunggakan Kas', icon: AlertCircle },
    { id: 'student-transparency', label: 'Buku Kas Terbuka', icon: Eye }
  ];

  const adminCoreItems = [
    { id: 'admin-dashboard', label: 'Dashboard Keuangan', icon: LayoutDashboard },
    { id: 'admin-payments', label: 'Verifikasi Lynk.id', icon: CreditCard },
    { id: 'admin-cash', label: 'Catat Kas Tunai', icon: HandCoins },
    { id: 'admin-bills', label: 'Manajemen Tagihan', icon: Receipt },
    { id: 'admin-payment-links', label: 'Link Lynk.id', icon: LinkIcon }
  ];

  const adminFinancialItems = [
    { id: 'admin-arrears', label: 'Daftar Tunggakan', icon: AlertCircle },
    { id: 'admin-income', label: 'Pemasukan Non-Tagihan', icon: ArrowUpRight },
    { id: 'admin-expenses', label: 'Pengeluaran Kas', icon: TrendingDown },
    { id: 'admin-monthly-recap', label: 'Rekap Bulanan', icon: CalendarDays },
    { id: 'admin-yearly-recap', label: 'Rekap 12 Bulan', icon: CalendarRange },
    { id: 'admin-reports', label: 'Laporan Resmi & Cetak', icon: FileSpreadsheet }
  ];

  const adminMasterItems = [
    { id: 'admin-users', label: 'Pengaturan Akun User', icon: ShieldCheck },
    { id: 'admin-students', label: 'Data Mahasiswa', icon: Users },
    { id: 'admin-classes', label: 'Rombel Kelas', icon: Building2 },
    { id: 'admin-academic-years', label: 'Tahun Akademik', icon: Calendar },
    { id: 'admin-audit', label: 'Audit Trail (Log)', icon: ScrollText },
    { id: 'admin-settings', label: 'Pengaturan Kas', icon: Settings }
  ];

  const renderNavGroup = (title: string, items: typeof studentNavItems) => (
    <div className="mb-5">
      <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 font-semibold border-l-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-blue-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UnughaLogo className="w-8 h-8 drop-shadow" />
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>KAS INFORMATIKA</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                FMIKOM UNUGHA Cilacap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderNavGroup('Portal Mahasiswa', studentNavItems)}

          {(isAdmin || isTreasurer) && (
            <>
              {renderNavGroup('Administrasi Kas', adminCoreItems)}
              {renderNavGroup('Laporan & Ledger', adminFinancialItems)}
              {renderNavGroup('Data Master', adminMasterItems)}
            </>
          )}
        </div>

        {/* Minimal Footer with Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun (Logout)</span>
          </button>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="truncate">Sistem Terintegrasi</span>
            <span className="font-mono text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Aktif
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
