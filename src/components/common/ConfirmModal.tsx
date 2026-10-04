import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  loading = false
}) => {
  const variantMap = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      btnColor: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(251,113,133,0.3)]'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]'
    },
    primary: {
      icon: Info,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      btnColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]'
    }
  };

  const current = variantMap[variant];
  const Icon = current.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${current.iconColor} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
      </div>

      <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-[#26354D]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1B263B] rounded-lg transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${current.btnColor} ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Memproses...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
