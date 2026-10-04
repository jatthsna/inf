import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AppSettings } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { UnughaLogo } from '../../components/common/UnughaLogo';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  checkSupabaseConnection, 
  isSupabaseConfigured 
} from '../../lib/supabase';
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
  Download,
  Database,
  Cloud,
  RefreshCw,
  AlertCircle,
  HelpCircle,
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

  // Multi-device Backup & Restore State
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cloud Database Sync State (Supabase)
  const initialCreds = getSupabaseCredentials();
  const [cloudUrl, setCloudUrl] = useState(initialCreds.url);
  const [cloudKey, setCloudKey] = useState(initialCreds.key);
  const [isCloudActive, setIsCloudActive] = useState(() => isSupabaseConfigured());
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [manualSyncMessage, setManualSyncMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleManualUpload = async () => {
    setIsManualSyncing(true);
    setManualSyncMessage(null);
    try {
      const res = await db.syncUpToCloud();
      setManualSyncMessage({ ok: res.success, text: res.message });
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleManualDownload = async () => {
    setIsManualSyncing(true);
    setManualSyncMessage(null);
    try {
      const res = await db.syncDownFromCloud();
      setManualSyncMessage({ ok: res.success, text: res.message });
      if (res.success) {
        const cur = db.getSettings();
        setSettings(cur);
        setDepartmentName(cur.department_name);
        setClassName(cur.class_name);
        setDefaultAmount(cur.default_monthly_amount);
        setContactName(cur.contact_person_name);
        setContactPhone(cur.contact_person_phone);
        setDefaultLynkUrl(cur.lynk_default_url);
        setAppLogoUrl(cur.app_logo_url || '');
      }
    } finally {
      setIsManualSyncing(false);
    }
  };

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
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran berkas logo maksimal 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        // Optimize and resize image using canvas to ensure crispness without memory bloat
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 256;
            let w = img.width;
            let h = img.height;
            if (w > h) {
              if (w > MAX_DIM) {
                h = Math.round((h * MAX_DIM) / w);
                w = MAX_DIM;
              }
            } else {
              if (h > MAX_DIM) {
                w = Math.round((w * MAX_DIM) / h);
                h = MAX_DIM;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);
              const optimizedDataUrl = canvas.toDataURL('image/png');
              setAppLogoUrl(optimizedDataUrl);
            } else {
              setAppLogoUrl(rawResult);
            }
          } catch {
            setAppLogoUrl(rawResult);
          }
        };
        img.src = rawResult;
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

  const handleDownloadBackup = () => {
    try {
      const json = db.exportDatabaseJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `Cadangan_Kas_Informatika_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice({
        type: 'success',
        message: 'Berkas cadangan berhasil diunduh! Anda bisa membagikan berkas ini ke WhatsApp/HP lalu pulihkan di perangkat tersebut.'
      });
      setTimeout(() => setBackupNotice(null), 8000);
    } catch {
      setBackupNotice({ type: 'error', message: 'Gagal membuat berkas cadangan.' });
    }
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = db.importDatabaseJSON(content, currentUser);
      if (res.success) {
        setBackupNotice({ type: 'success', message: `${res.message} Halaman akan diperbarui otomatis.` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setBackupNotice({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTestAndSaveCloud = async () => {
    if (!cloudUrl.trim() || !cloudKey.trim()) {
      setCloudTestResult({ ok: false, message: 'Harap isi URL Proyek dan Public Anon Key Supabase.' });
      return;
    }
    setIsTestingCloud(true);
    setCloudTestResult(null);
    try {
      saveSupabaseCredentials(cloudUrl, cloudKey);
      const res = await checkSupabaseConnection();
      setCloudTestResult(res);
      setIsCloudActive(isSupabaseConfigured() && res.ok);
    } catch (err: any) {
      setCloudTestResult({ ok: false, message: err?.message || 'Gagal menghubungi server Supabase.' });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleDisconnectCloud = () => {
    clearSupabaseCredentials();
    setCloudUrl('');
    setCloudKey('');
    setIsCloudActive(false);
    setCloudTestResult({ ok: true, message: 'Koneksi Cloud dinonaktifkan. Data beralih ke penyimpanan lokal browser.' });
    setTimeout(() => setCloudTestResult(null), 4000);
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
              Format disarankan: PNG transparan, SVG, atau WebP (rasio 1:1). Anda dapat mengunggah file langsung di atas atau meletakkan file di folder <code>public/logo.png</code>.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-medium">Pilihan Cepat File Lokal:</span>
              <button
                type="button"
                onClick={() => setAppLogoUrl('logo.png')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 border border-slate-700 font-mono transition-colors"
              >
                logo.png
              </button>
              <button
                type="button"
                onClick={() => setAppLogoUrl('logo.svg')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 border border-slate-700 font-mono transition-colors"
              >
                logo.svg
              </button>
              <button
                type="button"
                onClick={() => setAppLogoUrl('favicon.svg')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 border border-slate-700 font-mono transition-colors"
              >
                favicon.svg
              </button>
            </div>
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

      {/* Multi-Device Data Sync (Backup & Restore) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Sinkronisasi Antar-Perangkat (Backup & Pindah Device)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono normal-case">
                Solusi Cepat Instan
              </span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Karena website berjalan di GitHub Pages, secara default data kas tersimpan di memori browser lokal masing-masing perangkat. Gunakan fitur ini untuk memindahkan seluruh data dari laptop ke HP (atau sebaliknya) dalam 2 detik.
            </p>
          </div>
        </div>

        {backupNotice && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            backupNotice.type === 'success' 
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
          }`}>
            {backupNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{backupNotice.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Download Backup */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-200 block">1. Dari Perangkat Asal (Laptop):</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Unduh seluruh data transaksi, mahasiswa, kas, dan logo menjadi 1 file cadangan.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Cadangan Data (.JSON)</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-200 block">2. Di Perangkat Baru (HP/Komputer):</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kirim file JSON ke HP (via WA/Telegram), lalu unggah file tersebut di HP Anda.
            </p>
            <label className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer border border-slate-700 transition-colors shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan Data dari Berkas (.JSON)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Cloud Database (Supabase) - Automatic Realtime Multi-Device */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Database Cloud Supabase (Otomatis Real-Time Semua HP & Laptop)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingin semua perangkat (HP mahasiswa, laptop bendahara, HP admin) otomatis melihat data yang sama secara langsung tanpa harus kirim file cadangan? Hubungkan ke Supabase (Database Cloud Gratis).
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
            isCloudActive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isCloudActive ? '● Cloud Aktif' : '○ Mode Lokal Browser'}
          </span>
        </div>

        {cloudTestResult && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            cloudTestResult.ok 
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
          }`}>
            {cloudTestResult.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{cloudTestResult.message}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzprojectid.supabase.co"
              value={cloudUrl}
              onChange={(e) => setCloudUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={cloudKey}
              onChange={(e) => setCloudKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isTestingCloud}
              onClick={handleTestAndSaveCloud}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
              <span>{isTestingCloud ? 'Menguji Koneksi...' : 'Uji & Simpan Koneksi Cloud'}</span>
            </button>

            {isCloudActive && (
              <button
                type="button"
                onClick={handleDisconnectCloud}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Putuskan Koneksi Cloud
              </button>
            )}
          </div>

          {isCloudActive && (
            <div className="w-full pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Sinkronisasi Antar-Perangkat (Laptop ⇄ HP):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isManualSyncing}
                  onClick={handleManualUpload}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isManualSyncing ? 'Memproses...' : 'Unggah Data Laptop ke Cloud Supabase'}</span>
                </button>

                <button
                  type="button"
                  disabled={isManualSyncing}
                  onClick={handleManualDownload}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isManualSyncing ? 'Memproses...' : 'Tarik Data Terbaru dari Cloud Supabase'}</span>
                </button>
              </div>

              {manualSyncMessage && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  manualSyncMessage.ok 
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {manualSyncMessage.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{manualSyncMessage.text}</span>
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block">Panduan Cepat Koneksi Supabase Gratis:</span>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
              <li>Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a> dan buat proyek baru (Gratis).</li>
              <li>Buka <strong>Project Settings ➔ API</strong>, salin <strong>Project URL</strong> & <strong>anon public key</strong> ke form di atas.</li>
              <li>Buka menu <strong>SQL Editor</strong> di Supabase dan jalankan isi file <code>supabase/schema.sql</code> yang sudah ada di proyek Anda.</li>
            </ol>
          </div>
        </div>
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
