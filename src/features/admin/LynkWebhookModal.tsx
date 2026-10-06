import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { 
  Webhook, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  AlertCircle, 
  Code, 
  Zap,
  Info,
  ShieldCheck,
  Server
} from 'lucide-react';

interface LynkWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LynkWebhookModal: React.FC<LynkWebhookModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const students = db.getStudents().filter(s => s.status === 'active');
  const activeYear = db.getActiveAcademicYear();
  const bills = db.getBills(activeYear.id).filter(b => b.is_active);

  const [settings, setSettings] = useState(() => db.getSettings());
  const [merchantKey, setMerchantKey] = useState(settings.lynk_merchant_key || '');
  const [showKey, setShowKey] = useState(false);
  const [keySavedNotice, setKeySavedNotice] = useState(false);

  const [activeTab, setActiveTab] = useState<'config' | 'simulator' | 'json' | 'guide'>('config');
  
  // Simulator State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedBillId, setSelectedBillId] = useState(bills[0]?.id || '');
  const [testAmount, setTestAmount] = useState<number | ''>(bills[0]?.amount || 10000);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Raw JSON State
  const defaultSampleJson = JSON.stringify({
    event: "transaction.success",
    merchant_key: settings.lynk_merchant_key || "YOUR_MERCHANT_KEY_HERE",
    data: {
      transaction_id: `LNK-${Date.now().toString().slice(-6)}`,
      amount: bills[0]?.amount || 10000,
      customer_name: students[0]?.full_name || "Adam Satrol",
      customer_email: students[0]?.email || "adam@unugha.ac.id",
      product_name: bills[0]?.name || "KAS OKTOBER",
      status: "PAID",
      paid_at: new Date().toISOString()
    }
  }, null, 2);

  const [jsonPayload, setJsonPayload] = useState(defaultSampleJson);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cur = db.getSettings();
      setSettings(cur);
      setMerchantKey(cur.lynk_merchant_key || '');
    }
  }, [isOpen]);

  const handleSaveMerchantKey = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      lynk_merchant_key: merchantKey.trim()
    }, currentUser);

    setSettings(db.getSettings());
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 3000);
  };

  const handleCopyWebhookUrl = () => {
    const url = "https://xolgtadrooyrbcgytneo.supabase.co/functions/v1/lynk-webhook";
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRunSimulator = () => {
    const student = students.find(s => s.id === selectedStudentId);
    const bill = bills.find(b => b.id === selectedBillId);
    if (!student || !bill) {
      setResultMessage({ ok: false, text: 'Pilih mahasiswa dan tagihan yang valid.' });
      return;
    }

    const payload = {
      event: "transaction.success",
      merchant_key: merchantKey.trim() || undefined,
      data: {
        transaction_id: `LNK-${Date.now().toString().slice(-6)}`,
        amount: Number(testAmount) || bill.amount,
        customer_name: student.full_name,
        customer_email: student.email,
        customer_phone: student.phone,
        product_name: bill.name,
        merchant_key: merchantKey.trim() || undefined,
        status: "PAID",
        paid_at: new Date().toISOString()
      }
    };

    executeWebhook(payload);
  };

  const handleRunJson = () => {
    try {
      const parsed = JSON.parse(jsonPayload);
      executeWebhook(parsed);
    } catch (e: any) {
      setResultMessage({ ok: false, text: 'Format JSON tidak valid: ' + e.message });
    }
  };

  const executeWebhook = (payload: any) => {
    setIsProcessing(true);
    setResultMessage(null);

    try {
      const res = db.processLynkWebhook(payload, currentUser);
      setResultMessage({ ok: res.success, text: res.message });
      if (res.success && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setResultMessage({ ok: false, text: err.message || 'Gagal memproses webhook.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const webhookEndpoint = "https://xolgtadrooyrbcgytneo.supabase.co/functions/v1/lynk-webhook";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integrasi & Webhook Lynk.id"
      subtitle="Otomatisasi verifikasi pembayaran kas mahasiswa secara real-time via Webhook Lynk.id"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('config'); setResultMessage(null); }}
            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="truncate">Merchant Key & URL</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('simulator'); setResultMessage(null); }}
            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Simulasi</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('json'); setResultMessage(null); }}
            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="truncate">Paste JSON</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('guide'); setResultMessage(null); }}
            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="truncate">Panduan</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {resultMessage && (
          <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
            resultMessage.ok
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
          }`}>
            {resultMessage.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{resultMessage.ok ? 'Sukses Memproses Webhook' : 'Gagal Memproses'}</p>
              <p className="leading-relaxed">{resultMessage.text}</p>
            </div>
          </div>
        )}

        {/* TAB 1: MERCHANT KEY & URL SETTINGS */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Answer to user's question directly */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Di Mana Menaruh "Merchant Key" Lynk.id Ini?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong>Merchant Key</strong> adalah kunci rahasia keamanan yang diberikan oleh Lynk.id agar website Anda dapat memastikan bahwa sinyal webhook yang masuk 100% sah dan resmi dari server Lynk.id (bukan manipulasi pihak lain).
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                <li><strong>Taruh di Form Ini (Bawah):</strong> Masukkan Merchant Key di kolom input di bawah lalu klik <strong>"Simpan Merchant Key"</strong>.</li>
                <li><strong>Taruh di Akun Lynk.id:</strong> Di Lynk.id Anda, Merchant Key ini berada di menu <em>Settings &gt; Integrasi / Webhook</em>.</li>
              </ul>
            </div>

            {/* Merchant Key Input Form */}
            <form onSubmit={handleSaveMerchantKey} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lynk.id Merchant Key / Secret Token</span>
                </label>
                {settings.lynk_merchant_key ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                    <Check className="w-3 h-3" />
                    <span>Key Terpasang Aktif</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-medium">Belum Diatur (Opsional)</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="Contoh: mk_live_xxxxxxxxxxxxxxxxxxxxxx"
                  value={merchantKey}
                  onChange={(e) => setMerchantKey(e.target.value)}
                  className="w-full pl-3.5 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
                  title={showKey ? "Sembunyikan" : "Tampilkan"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {keySavedNotice ? (
                    <span className="text-emerald-400 font-bold">✓ Merchant Key berhasil disimpan ke database!</span>
                  ) : (
                    'Klik simpan setelah mengisi key'
                  )}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Simpan Merchant Key
                </button>
              </div>
            </form>

            {/* Webhook Endpoint Display */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>URL Webhook untuk Ditempel di Lynk.id</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Salin URL ini dan tempelkan ke kolom <b>Webhook URL</b> di pengaturan Lynk.id:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookEndpoint}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhookUrl}
                  className="flex items-center gap-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Uji Coba Otomatisasi Webhook</span>
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Fitur ini mensimulasikan notifikasi HTTP POST yang dikirimkan oleh server Lynk.id saat mahasiswa berhasil menyelesaikan pembayaran online (QRIS/Transfer).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Mahasiswa Pembayar
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.nim})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Tagihan Kas
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => {
                    setSelectedBillId(e.target.value);
                    const b = bills.find(item => item.id === e.target.value);
                    if (b) setTestAmount(b.amount);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {bills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {formatCurrency(b.amount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nominal Pembayaran (Rp)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                placeholder="Masukkan nominal..."
                value={testAmount}
                onFocus={(e) => {
                  if (testAmount === 0) setTestAmount('');
                  e.target.select();
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setTestAmount('');
                  else {
                    const num = parseInt(val, 10);
                    setTestAmount(isNaN(num) ? '' : num);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunSimulator}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isProcessing ? 'Memproses Webhook...' : 'Kirim Simulasi Webhook Lynk.id'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: RAW JSON */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Payload JSON Webhook dari Lynk.id
              </label>
              <button
                type="button"
                onClick={() => setJsonPayload(defaultSampleJson)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Reset Contoh JSON
              </button>
            </div>

            <textarea
              rows={9}
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
              placeholder="Paste JSON Webhook di sini..."
            />

            <button
              type="button"
              onClick={handleRunJson}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses Webhook...' : 'Proses JSON Webhook Sekarang'}</span>
            </button>
          </div>
        )}

        {/* TAB 4: PANDUAN PENGGUNAAN */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Cara Kerja Webhook Lynk.id di Kas Kelas</span>
              </h4>
              <ol className="list-decimal pl-4 space-y-2 text-slate-400 leading-relaxed text-[11px]">
                <li>
                  <strong className="text-white">Mahasiswa Membayar di Lynk.id:</strong> Mahasiswa membuka link Lynk.id kelas Anda dan membayar via QRIS (GoPay/OVO/Dana/BCA/dll).
                </li>
                <li>
                  <strong className="text-white">Lynk.id Mengirim Notifikasi Webhook:</strong> Server Lynk.id mengirimkan data transaksi bersama <b>Merchant Key</b> untuk validasi keamanan.
                </li>
                <li>
                  <strong className="text-white">Pencocokan Cerdas Otomatis:</strong> Sistem kas mencocokkan nama mahasiswa dan tagihan yang sesuai.
                </li>
                <li>
                  <strong className="text-white">Status Lunas Instan:</strong> Tagihan mahasiswa langsung berubah menjadi <span className="text-emerald-400 font-bold">LUNAS</span> tanpa perlu menunggu bendahara memverifikasi manual!
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-semibold text-white">Integrasi Webhook di Dashboard Lynk.id:</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Di Lynk.id Anda, buka <b>Settings &gt; Integrasi / Webhook</b>. Masukkan URL: <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">https://xolgtadrooyrbcgytneo.supabase.co/functions/v1/lynk-webhook</code> dan salin Merchant Key yang tertera ke tab <b>Merchant Key &amp; URL</b> di modal ini.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
