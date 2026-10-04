import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AppSettings } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { UnughaLogo } from '../../components/common/UnughaLogo';
import { 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Phone, 
  User, 
  Building2, 
  DollarSign, 
  Link as LinkIcon,
  ShieldCheck,
  ArrowRight,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface SettingsPageProps {
  onNavigateTab?: (tabId: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() => db.getSettings());
  const [departmentName, setDepartmentName] = useState(settings.department_name);
  const [className, setClassName] = useState(settings.class_name);
  const [defaultAmount, setDefaultAmount] = useState(settings.default_monthly_amount);
  const [contactName, setContactName] = useState(settings.contact_person_name);
  const [contactPhone, setContactPhone] = useState(settings.contact_person_phone);
  const [defaultLynkUrl, setDefaultLynkUrl] = useState(settings.lynk_default_url);
  const [appLogoUrl, setAppLogoUrl] = useState(settings.app_logo_url || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const cur = db.getSettings();
    setSettings(cur);
    setDepartmentName(cur.department_name);
    setClassName(cur.class_name);
    setDefaultAmount(cur.default_monthly_amount);
    setContactName(cur.contact_person_name);
    setContactPhone(cur.contact_person_phone);
    setDefaultLynkUrl(cur.lynk_default_url);
    setAppLogoUrl(cur.app_logo_url || '');
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran berkas logo maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      department_name: departmentName.trim(),
      class_name: className.trim(),
      default_monthly_amount: Number(defaultAmount),
      contact_person_name: contactName.trim(),
      contact_person_phone: contactPhone.trim(),
      lynk_default_url: defaultLynkUrl.trim(),
      app_logo_url: appLogoUrl.trim() || undefined
    }, currentUser);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    db.resetToDefaultSeed();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white">Pengaturan Kas Mahasiswa</h2>
        <p className="text-xs text-slate-400 mt-1">
          Konfigurasi identitas program studi, nominal standar iuran kas bulanan, dan parameter tautan Lynk.id
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan kas berhasil disimpan ke database sistem.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          Identitas Program Studi & Kelas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Program Studi
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Angkatan / Rombel
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
          Nominal & Lynk.id Standar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Iuran Bulanan (Rp)
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default URL Pembayaran Lynk.id
            </label>
            <input
              type="url"
              value={defaultLynkUrl}
              onChange={(e) => setDefaultLynkUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
          Kustomisasi Logo Aplikasi
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo Preview */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-2 shrink-0">
                <UnughaLogo className="w-12 h-12" src={appLogoUrl || undefined} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Pratinjau Logo Saat Ini</span>
                <span className="text-[11px] text-slate-400 block">
                  {appLogoUrl ? 'Menggunakan logo kustom pilihan Anda' : 'Menggunakan logo resmi UNUGHA'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File Logo Baru</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {appLogoUrl && (
                <button
                  type="button"
                  onClick={() => setAppLogoUrl('')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Reset ke Logo Bawaan
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Atau masukkan URL Gambar Logo (Opsional):
            </label>
            <input
              type="text"
              placeholder="https://unugha.ac.id/logo.png atau /logo.png"
              value={appLogoUrl}
              onChange={(e) => setAppLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Format disarankan: PNG transparan, SVG, atau WebP (rasio 1:1, minimal 200x200 px). Anda juga dapat meletakkan file logo langsung di folder <code>/public/logo.png</code>.
            </p>
          </div>
        </div>

        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
          Kontak Penanggung Jawab / Bendahara
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Bendahara / Kontak
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nomor WhatsApp Bendahara
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* User Accounts Management Quick Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Pengaturan Akun User & Hak Akses
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola kredensial akun Administrator, Bendahara Kas, dan Mahasiswa, ubah peran (role), reset password, serta atur status aktif/kunci akun.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('admin-users')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            <span>Buka Pengaturan Akun</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Danger Zone: Reset to seed */}
      <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2.5 shadow-sm">
        <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
          Reset Data Simulasi Kas
        </h4>
        <p className="text-xs text-slate-400">
          Mengembalikan seluruh data transaksi ke kondisi bawaan awal tahun akademik 2026/2027 lengkap.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Seed Bawaan</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset ke Data Bawaan?"
        message="Seluruh mutasi dan data transaksi akan dikembalikan ke kondisi awal tahun akademik 2026/2027 lengkap."
        variant="danger"
        confirmLabel="Ya, Reset Data"
      />
    </div>
  );
};
