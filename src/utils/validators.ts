export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidLynkUrl(urlString: string): boolean {
  if (!isValidUrl(urlString)) return false;
  try {
    const url = new URL(urlString);
    return url.hostname.includes('lynk.id');
  } catch {
    return false;
  }
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateProofFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'Silakan pilih file bukti pembayaran.' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Format file tidak didukung. Harap upload format JPG, PNG, WEBP, atau PDF.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Ukuran file terlalu besar. Maksimal ukuran bukti adalah 5MB.'
    };
  }

  return { isValid: true };
}
