export const APP_NAME = "KAS INFORMATIKA";
export const APP_SUBTITLE = "Financial Management System";
export const DEFAULT_LYNK_URL = "https://lynk.id/kas-informatika";

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

// Academic Year Cycle: September (month index 8) to August (month index 7)
export const ACADEMIC_MONTH_ORDER = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];

export const EXPENSE_CATEGORIES = [
  "Kegiatan",
  "Konsumsi",
  "Perlengkapan",
  "Transportasi",
  "Administrasi",
  "Dokumentasi",
  "Lainnya"
] as const;

export const OTHER_INCOME_CATEGORIES = [
  "Donasi",
  "Sponsorship",
  "Dana Usaha",
  "Pengembalian",
  "Lainnya"
] as const;

export const BILL_TYPES = [
  { value: "monthly", label: "Kas Bulanan" },
  { value: "event", label: "Iuran Kegiatan" },
  { value: "activity", label: "Iuran Acara" },
  { value: "fine", label: "Denda Keterlambatan" },
  { value: "other", label: "Tagihan Lainnya" }
] as const;
