import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { UserProfile, Bill, BillAssignment, Payment, ClassItem } from '../../types';
import { formatCurrency, formatDateID } from '../../utils/formatters';
import { UnughaLogo } from '../../components/common/UnughaLogo';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import {
  CreditCard,
  HandCoins,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Upload,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Lock,
  Calendar,
  QrCode,
  ChevronRight,
  Info
} from 'lucide-react';

interface StudentQuickPayPortalProps {
  onOpenAdminLogin: () => void;
}

export const StudentQuickPayPortal: React.FC<StudentQuickPayPortalProps> = ({ onOpenAdminLogin }) => {
  const activeYear = db.getActiveAcademicYear();
  const settings = db.getSettings();

  // Navigation tab (Bayar Kas, Kwitansi, BKU)
  const [activeTab, setActiveTab] = useState<'pay' | 'history' | 'transparency'>('pay');

  // Master Data
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Selection states
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');

  // New Student on-the-fly form
  const [isNewStudentMode, setIsNewStudentMode] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newNim, setNewNim] = useState<string>('');
  const [newClassId, setNewClassId] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');

  // Proof & Notes state
  const [proofFile, setProofFile] = useState<string>('');
  const [proofReference, setProofReference] = useState<string>('');
  const [studentNote, setStudentNote] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Receipt Modal state
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptBill, setReceiptBill] = useState<Bill | undefined>(undefined);
  const [receiptStudent, setReceiptStudent] = useState<UserProfile | undefined>(undefined);

  // Load Data
  const reloadData = () => {
    setClasses(db.getClasses());
    setStudents(db.getStudents());
    setBills(db.getBills(activeYear.id).filter(b => b.is_active));
  };

  useEffect(() => {
    reloadData();
    return db.subscribe(reloadData);
  }, []);

  // Auto-dismiss notification alerts after 4-5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (classes.length > 0 && !newClassId) {
      setNewClassId(classes[0].id);
    }
  }, [classes]);

  // Selected student object
  const currentStudent = students.find(s => s.id === selectedStudentId);

  // Get student's bills
  const studentAssignments: BillAssignment[] = selectedStudentId
    ? db.getStudentBillAssignments(selectedStudentId, activeYear.id)
    : [];

  const unpaidAssignments = studentAssignments.filter(
    a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected'
  );

  // Auto-select first unpaid bill or fallback to first active bill
  useEffect(() => {
    if (unpaidAssignments.length > 0) {
      if (!selectedBillId || !unpaidAssignments.some(a => a.bill_id === selectedBillId)) {
        setSelectedBillId(unpaidAssignments[0].bill_id);
      }
    } else if (bills.length > 0 && !selectedBillId) {
      setSelectedBillId(bills[0].id);
    }
  }, [selectedStudentId, unpaidAssignments]);

  const currentBill = bills.find(b => b.id === selectedBillId);

  // Handle proof upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran berkas maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Lynk.id link to clipboard
  const handleCopyLink = () => {
    const targetUrl = currentBill?.payment_link_url || 'https://lynk.id/kas-informatika';
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit Quick Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    let effectiveStudentId = selectedStudentId;

    if (isNewStudentMode) {
      if (!newFullName.trim() || !newNim.trim()) {
        setErrorMessage('Nama lengkap dan NIM wajib diisi.');
        return;
      }
      const existing = students.find(s => s.nim.trim().toLowerCase() === newNim.trim().toLowerCase());
      if (existing) {
        effectiveStudentId = existing.id;
      } else {
        const targetClass = classes.find(c => c.id === newClassId) || classes[0];
        const res = db.registerStudent({
          full_name: newFullName.trim(),
          nim: newNim.trim(),
          class_id: targetClass?.id,
          phone: newPhone.trim() || '-',
          email: `${newNim.trim().toLowerCase()}@unugha.ac.id`,
          password: newNim.trim()
        });
        if (!res.success || !res.user) {
          setErrorMessage(res.message);
          return;
        }
        effectiveStudentId = res.user.id;
        setSelectedStudentId(res.user.id);
        setIsNewStudentMode(false);
      }
    }

    if (!effectiveStudentId) {
      setErrorMessage('Pilih nama atau ketik NIM mahasiswa yang membayar.');
      return;
    }

    if (!selectedBillId || !currentBill) {
      setErrorMessage('Pilih tagihan kas yang hendak dibayarkan.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        if (paymentMethod === 'online') {
          const proof = proofFile || proofReference.trim() || 'Pembayaran melalui Lynk.id';
          const newPay = db.submitOnlinePayment({
            billId: currentBill.id,
            studentId: effectiveStudentId,
            amount: currentBill.amount,
            proofUrl: proof,
            studentNote: studentNote.trim() || `Bukti bayar Lynk.id: ${proofReference || 'Terkonfirmasi'}`
          });

          if (newPay.status === 'verified') {
            setSuccessMessage(
              `Alhamdulillah! Pembayaran Lynk.id untuk "${currentBill.name}" (${formatCurrency(currentBill.amount)}) BERHASIL & OTOMATIS LUNAS! Kuitansi sah siap dicetak.`
            );
          } else {
            setSuccessMessage(
              `Konfirmasi bayar Lynk.id untuk "${currentBill.name}" (${formatCurrency(currentBill.amount)}) berhasil dicatat.`
            );
          }
        } else {
          db.submitCashPaymentReport({
            billId: currentBill.id,
            studentId: effectiveStudentId,
            amount: currentBill.amount,
            studentNote: studentNote.trim() || 'Konfirmasi pembayaran tunai langsung ke Bendahara'
          });

          setSuccessMessage(
            `Konfirmasi setor tunai untuk "${currentBill.name}" (${formatCurrency(currentBill.amount)}) berhasil dibuat! Silakan serahkan uang tunai fisik ke Bendahara Kas.`
          );
        }

        setProofFile('');
        setProofReference('');
        setStudentNote('');
        reloadData();
      } catch (err: any) {
        setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pembayaran.');
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleOpenReceipt = (payment: Payment) => {
    const bill = bills.find(b => b.id === payment.bill_id);
    const student = students.find(s => s.id === payment.student_id);
    setReceiptPayment(payment);
    setReceiptBill(bill);
    setReceiptStudent(student);
  };

  // Filter students based on search query
  const filteredStudents = students.filter(
    s =>
      s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (s.class_name && s.class_name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );

  const summary = db.getFinancialSummary(activeYear.id);
  const verifiedPayments = db.getPayments(activeYear.id).filter(p => p.status === 'verified').slice(0, 10);
  const expenseList = db.getExpenses(activeYear.id).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-28 sm:pb-24">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      {/* Subtle ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-emerald-600/15 via-emerald-800/5 to-transparent blur-3xl pointer-events-none" />

      {/* Compact Institutional Top Header (Optimized for Mobile) */}
      <header className="sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <UnughaLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                  KAS INFORMATIKA
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 hidden xs:inline">
                  UNUGHA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate leading-none mt-0.5">
                FMIKOM · Prodi S1 Informatika
              </p>
            </div>
          </div>

          {/* Pengurus Login Trigger */}
          <button
            onClick={onOpenAdminLogin}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] sm:text-xs font-semibold transition-all active:scale-95 shrink-0 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pengurus</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Mobile-Friendly Title Banner */}
        <div className="space-y-1 pb-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-emerald-400 font-semibold tracking-wide">
            <span>TAHUN AKADEMIK {activeYear.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeTab === 'pay' && 'Bayar Kas Mahasiswa'}
            {activeTab === 'history' && 'Kwitansi & Status Tagihan'}
            {activeTab === 'transparency' && 'Buku Kas Umum (BKU)'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {activeTab === 'pay' && 'Pilih nama Anda, tentukan tagihan, lalu bayar instan via Lynk.id (QRIS) atau setor tunai.'}
            {activeTab === 'history' && 'Cek status verifikasi pembayaran kas Anda dan unduh kuitansi resmi bertanda tangan.'}
            {activeTab === 'transparency' && 'Transparansi saldo kas kasir, total iuran masuk, dan rincian pengeluaran riil mahasiswa.'}
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {successMessage && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start justify-between gap-3 shadow-md animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-white">Berhasil Dikirim</p>
                <p className="text-emerald-300/90 leading-relaxed">{successMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
            >
              Tutup
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-md animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-white">Perhatian</p>
                <p className="text-rose-300/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: BAYAR KAS (MOBILE-OPTIMIZED STREAMLINED CHECKOUT) */}
        {/* ======================================================== */}
        {activeTab === 'pay' && (
          <form onSubmit={handleSubmitPayment} className="space-y-4 sm:space-y-5">
            {/* Step 1: Identitas Mahasiswa */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">Identitas Mahasiswa</h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewStudentMode(!isNewStudentMode);
                    setSelectedStudentId('');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] sm:text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
                >
                  {isNewStudentMode ? '← Pilih dari Daftar' : '+ Nama belum ada?'}
                </button>
              </div>

              {!isNewStudentMode ? (
                <div className="space-y-3">
                  {/* Search input with comfortable mobile height */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIM Anda..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 h-11 bg-[#090D16] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Student Select dropdown */}
                  <div>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        setSuccessMessage(null);
                      }}
                      className="w-full px-3 h-11 bg-[#090D16] border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="">-- Pilih Nama Mahasiswa --</option>
                      {filteredStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.full_name} · NIM {st.nim} ({st.class_name || 'Informatika'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Student Active Card */}
                  {currentStudent && (
                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {currentStudent.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs sm:text-sm truncate">
                            {currentStudent.full_name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                            NIM {currentStudent.nim} · {currentStudent.class_name || 'Informatika'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className={`text-[11px] font-bold font-mono ${unpaidAssignments.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {unpaidAssignments.length > 0 ? `${unpaidAssignments.length} Tagihan` : 'Lunas ✓'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* New Student Quick Input */
                <div className="space-y-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <p className="text-[11px] text-emerald-300 font-medium">
                    Lengkapi data identitas Anda untuk pencatatan pembayaran:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bima Sakti"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        className="w-full px-3 h-10 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        NIM *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 20241001"
                        value={newNim}
                        onChange={(e) => setNewNim(e.target.value)}
                        className="w-full px-3 h-10 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Kelas
                      </label>
                      <select
                        value={newClassId}
                        onChange={(e) => setNewClassId(e.target.value)}
                        className="w-full px-3 h-10 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} (Angkatan {cls.batch})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        WhatsApp (Opsional)
                      </label>
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 h-10 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pilih Tagihan Kas */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">Pilih Tagihan Kas</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bills.length} Tagihan Tersedia
                </span>
              </div>

              {bills.length === 0 ? (
                <div className="py-6 px-4 text-center text-xs bg-[#090D16] rounded-xl border border-dashed border-slate-800 space-y-1">
                  <p className="font-semibold text-slate-300">Belum Ada Tagihan Kas Aktif</p>
                  <p className="text-[11px] text-slate-500">
                    Pengurus belum menerbitkan tagihan kas. Tagihan baru akan otomatis tampil di sini saat dibuat oleh bendahara.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {bills.map((bill) => {
                    const assignment = studentAssignments.find(a => a.bill_id === bill.id);
                    const isPaid = assignment?.status === 'verified';
                    const isPending = assignment?.status === 'pending';
                    const isSelected = selectedBillId === bill.id;

                    return (
                      <button
                        key={bill.id}
                        type="button"
                        onClick={() => setSelectedBillId(bill.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/60 shadow-sm'
                            : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-white truncate">
                              {bill.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Jatuh tempo: {formatDateID(bill.due_date)}
                            </div>
                          </div>

                          {isPaid ? (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                              <Check className="w-3 h-3" />
                              Lunas
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] text-amber-400 font-semibold shrink-0">
                              Menunggu
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-semibold shrink-0">
                              Belum Bayar
                            </span>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Nominal:</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {formatCurrency(bill.amount)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Metode Pembayaran (Hanya 2 Opsi yang Jelas & Tidak Monoton) */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">Pilih Cara Bayar</h3>
                </div>
                <span className="text-[10px] text-slate-400">Online QRIS / Tunai</span>
              </div>

              {/* 2 Choice Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Lynk.id */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'online'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/60 shadow-sm'
                      : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                        QRIS / E-Wallet
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">Bayar via Lynk.id</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      QRIS semua bank, GoPay, DANA, OVO, ShopeePay & transfer otomatis.
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-emerald-400">
                    <span>{paymentMethod === 'online' ? '● Dipilih' : 'Pilih Lynk.id'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Option 2: Tunai / Cash */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/60 shadow-sm'
                      : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <HandCoins className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                        Uang Tunai
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">Setor Tunai (Cash)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Serahkan uang tunai fisik langsung ke Bendahara Kas di kampus.
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-emerald-400">
                    <span>{paymentMethod === 'cash' ? '● Dipilih' : 'Pilih Tunai'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Sub-form Lynk.id vs Cash */}
              {paymentMethod === 'online' ? (
                <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
                  {currentBill?.payment_link_url ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Tautan Pembayaran Online / Lynk.id:
                        </span>
                        <p className="font-mono text-xs text-emerald-400 truncate font-semibold">
                          {currentBill.payment_link_url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                        </button>

                        <a
                          href={currentBill.payment_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Buka Link Pembayaran</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Tagihan ini tidak ditautkan ke link online. Pembayaran dilakukan secara tunai langsung ke Bendahara Kelas atau transfer rekening.</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Unggah Bukti Screenshot Lynk.id (Opsional)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span className="truncate">{proofFile ? 'Foto Dipilih ✓' : 'Pilih Screenshot (JPG/PNG)'}</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                        {proofFile && (
                          <button
                            type="button"
                            onClick={() => setProofFile('')}
                            className="text-xs text-rose-400 hover:underline px-2"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nomor Referensi / Atas Nama Pengirim (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: INV-LYNK-0924 atau an. Daffa"
                        value={proofReference}
                        onChange={(e) => setProofReference(e.target.value)}
                        className="w-full px-3 h-10 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Cash Sub-Form */
                <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 leading-relaxed space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">Petunjuk Setor Tunai Fisik:</p>
                      <span className="text-[10px] text-emerald-400 font-mono">Uang Pas</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Serahkan uang pas sejumlah{' '}
                      <strong className="text-white font-mono font-bold">
                        {formatCurrency(currentBill?.amount || 10000)}
                      </strong>{' '}
                      langsung ke Bendahara Kas:{' '}
                      <span className="font-semibold text-emerald-300">{settings.contact_person_name}</span>.
                    </p>
                    {settings.contact_person_phone && (
                      <div className="pt-1">
                        <a
                          href={`https://wa.me/${settings.contact_person_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${settings.contact_person_name}, saya ingin konfirmasi setor tunai kas sebesar ${formatCurrency(currentBill?.amount || 10000)} untuk ${currentBill?.name || 'Kas'}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-semibold transition-colors border border-emerald-500/30"
                        >
                          <span>Hubungi WhatsApp Bendahara ({settings.contact_person_phone}) ↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Catatan Tambahan untuk Bendahara (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Diserahkan saat matkul Pemrograman"
                      value={studentNote}
                      onChange={(e) => setStudentNote(e.target.value)}
                      className="w-full px-3 h-10 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Ringkasan Slip Kas & Tombol Bayar (Thumb-Friendly on Mobile) */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between border-b border-dashed border-slate-700/80 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    TOTAL TAGIHAN
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(currentBill?.amount || 0)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-300 font-semibold block truncate">
                    {currentBill?.name || 'Pilih Tagihan'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {paymentMethod === 'online' ? 'via Lynk.id' : 'Setor Tunai'}
                  </span>
                </div>
              </div>

              {/* Big Action Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!selectedStudentId && !isNewStudentMode)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Merekam Pembayaran...</span>
                  </>
                ) : paymentMethod === 'online' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kirim Konfirmasi Bayar Lynk.id</span>
                  </>
                ) : (
                  <>
                    <HandCoins className="w-4 h-4" />
                    <span>Konfirmasi Setor Tunai Sekarang</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tercatat resmi di Buku Kas Umum (BKU) FMIKOM UNUGHA</span>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KWITANSI & STATUS TAGIHAN (MOBILE CARD LIST VIEW) */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
              <div className="border-b border-slate-800/80 pb-2.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">Pilih Mahasiswa untuk Cek Kwitansi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lihat riwayat pembayaran lunas dan cetak kwitansi resmi bertanda tangan
                </p>
              </div>

              <div>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 h-11 bg-[#090D16] border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Pilih Nama Mahasiswa --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} · NIM {st.nim} ({st.class_name || 'Informatika'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentId && (
                <div className="pt-2 space-y-3">
                  {/* Mobile-Friendly Card List (No Awkward Horizontal Table Scrolling on Phone) */}
                  <div className="space-y-2.5">
                    {studentAssignments.map((asg) => {
                      const isPaid = asg.status === 'verified';
                      const isPending = asg.status === 'pending';

                      return (
                        <div
                          key={asg.id}
                          className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white text-xs sm:text-sm truncate">
                                {asg.bill?.name}
                              </span>
                              <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm shrink-0">
                                {formatCurrency(asg.bill?.amount)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>Jatuh Tempo: {formatDateID(asg.bill?.due_date)}</span>
                              <span>·</span>
                              {isPaid ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  Lunas
                                </span>
                              ) : isPending ? (
                                <span className="text-amber-400 font-semibold">
                                  Menunggu Verifikasi
                                </span>
                              ) : (
                                <span className="text-rose-400 font-semibold">
                                  Belum Dibayar
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 flex items-center justify-end">
                            {isPaid && asg.latest_payment ? (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(asg.latest_payment!)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Lihat Kwitansi Resmi</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBillId(asg.bill_id);
                                  setActiveTab('pay');
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition-colors"
                              >
                                <span>Bayar Kas Ini</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BKU (TRANSPARANSI BUKU KAS UMUM) */}
        {/* ======================================================== */}
        {activeTab === 'transparency' && (
          <div className="space-y-4">
            {/* 3 Metric Cards for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Saldo Kas Kasir Saat Ini</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums">
                  {formatCurrency(summary.current_balance)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Saldo Awal: {formatCurrency(summary.initial_balance)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Total Pemasukan Kas</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 tabular-nums">
                  {formatCurrency(summary.total_verified_income)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Dari iuran sah mahasiswa
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Total Pengeluaran Riil</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 tabular-nums">
                  {formatCurrency(summary.total_expenses)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Untuk kegiatan mahasiswa & prodi
                </div>
              </div>
            </div>

            {/* Income & Expense Feed for Mobile */}
            <div className="space-y-3">
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pemasukan Terakhir</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">10 Mutasi</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {verifiedPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {p.student?.full_name || 'Mahasiswa'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {p.bill?.name} · {formatDateID(p.payment_date)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 pl-2 tabular-nums">
                        +{formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pengeluaran Riil Kas</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">10 Mutasi</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {expenseList.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {exp.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {exp.category} · {formatDateID(exp.expense_date)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-rose-400 shrink-0 pl-2 tabular-nums">
                        -{formatCurrency(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MOBILE-FIRST FIXED BOTTOM NAVIGATION BAR                 */}
      {/* (Tombol Bayar Kas, Kwitansi, dan BKU ditaruh di bawah)    */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around gap-2">
          {/* Tab 1: Bayar Kas */}
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'pay'
                ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {activeTab === 'pay' && (
              <span className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] tracking-tight">Bayar Kas</span>
          </button>

          {/* Tab 2: Kwitansi */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'history'
                ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {activeTab === 'history' && (
              <span className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] tracking-tight">Kwitansi</span>
          </button>

          {/* Tab 3: BKU */}
          <button
            type="button"
            onClick={() => setActiveTab('transparency')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'transparency'
                ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {activeTab === 'transparency' && (
              <span className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] tracking-tight">BKU</span>
          </button>
        </div>
      </nav>

      {/* Printable Receipt Modal */}
      {receiptPayment && (
        <ReceiptModal
          isOpen={Boolean(receiptPayment)}
          onClose={() => setReceiptPayment(null)}
          payment={receiptPayment}
          bill={receiptBill}
          student={receiptStudent}
        />
      )}
    </div>
  );
};
