import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateProofFile } from '../utils/validators';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadPaymentProof(
  file: File,
  studentNim: string,
  billId: string
): Promise<UploadResult> {
  const validation = validateProofFile(file);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${studentNim}_${billId}_${timestamp}.${fileExt}`;
  const filePath = `payment-proofs/${fileName}`;

  // If live Supabase client is available and configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local file storage:', error.message);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
        return { success: true, url: publicUrlData.publicUrl };
      }
    } catch (err: any) {
      console.warn('Failed storage request:', err);
    }
  }

  // High-fidelity fallback: Read file as Data URL so image displays perfectly in all previews & across sessions
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const resultUrl = e.target?.result as string;
      resolve({ success: true, url: resultUrl });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Gagal membaca file bukti pembayaran.' });
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadExpenseProof(
  file: File,
  expenseDescription: string
): Promise<UploadResult> {
  const validation = validateProofFile(file);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanDesc = expenseDescription.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const fileName = `expense_${cleanDesc}_${timestamp}.${fileExt}`;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('expense-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('expense-proofs')
          .getPublicUrl(fileName);
        return { success: true, url: publicUrlData.publicUrl };
      }
    } catch (err) {
      console.warn('Storage fallback:', err);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ success: true, url: e.target?.result as string });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Gagal membaca file bukti pengeluaran.' });
    };
    reader.readAsDataURL(file);
  });
}
