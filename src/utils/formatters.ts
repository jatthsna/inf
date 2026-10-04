import { MONTH_NAMES_ID } from '../lib/constants';

/**
 * Format number as Indonesian Rupiah (IDR)
 * e.g., 10000 -> "Rp10.000"
 */
export function formatCurrency(amount: number = 0): string {
  const rounded = Math.round(amount);
  return `Rp${rounded.toLocaleString('id-ID')}`;
}

/**
 * Format ISO date string into Indonesian standard format
 * e.g., "2026-09-28" -> "28 September 2026"
 */
export function formatDateID(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const day = d.getDate();
    const month = MONTH_NAMES_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format datetime including hours and minutes
 * e.g., "28 September 2026, 14:30 WIB"
 */
export function formatDateTimeID(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const day = d.getDate();
    const month = MONTH_NAMES_ID[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Month index (0-11) to name
 */
export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES_ID[monthIndex] || `Bulan ${monthIndex + 1}`;
}
