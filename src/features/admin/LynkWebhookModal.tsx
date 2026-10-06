import React, { useState } from 'react';
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
  ExternalLink, 
  AlertCircle, 
  Code, 
  Zap,
  Info
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

  const [activeTab, setActiveTab] = useState<'simulator' | 'json' | 'guide'>('simulator');
  
  // Simulator State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedBillId, setSelectedBillId] = useState(bills[0]?.id || '');
  const [testAmount, setTestAmount] = useState<number | ''>(bills[0]?.amount || 10000);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Raw JSON State
  const defaultSampleJson = JSON.stringify({
    event: "transaction.success",
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

  const handleRunSimulator = () => {
    const student = students.find(s => s.id === selectedStudentId);
    const bill = bills.find(b => b.id === selectedBillId);
    if (!student || !bill) {
      setResultMessage({ ok: false, text: 'Pilih mahasiswa dan tagihan yang valid.' });
      return;
    }

    const payload = {
      event: "transaction.success",
      data: {
        transaction_id: `LNK-${Date.now().toString().slice(-6)}`,
        amount: Number(testAmount) || bill.amount,
        customer_name: student.full_name,
        customer_email: student.email,
        customer_phone: student.phone,
        product_name: bill.name,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integrasi & Webhook Lynk.id"
      subtitle="Verifikasi otomatis pembayaran kas mahasiswa secara real-time via Webhook Lynk.id"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('simulator'); setResultMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulasi Webhook</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('json'); setResultMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Paste JSON Payload</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('guide'); setResultMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Panduan Lynk.id</span>
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

        {/* TAB 1: SIMULATOR */}
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

        {/* TAB 2: RAW JSON */}
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

        {/* TAB 3: PANDUAN PENGGUNAAN */}
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
                  <strong className="text-white">Lynk.id Mengirim Notifikasi Webhook:</strong> Server Lynk.id mengirimkan data transaksi (nama mahasiswa, nominal, status PAID).
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
                Karena website dideploy secara statis via GitHub Pages, untuk webhook 24/7 otomatis tanpa klik, Anda dapat menggunakan webhook relay gratis (seperti <b>Supabase Edge Functions</b> atau <b>Pipedream/Webhook.site</b>) yang terhubung langsung ke database Supabase kelas kita.
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
