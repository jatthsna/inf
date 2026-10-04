import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan' | 'purple' | 'orange' | 'default';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick
}) => {
  // Map variant to clean institutional subtle accent
  const variantStyles = {
    blue: {
      accent: 'border-l-2 border-l-blue-500',
      iconBg: 'bg-blue-500/10 text-blue-400',
      valueColor: 'text-white'
    },
    emerald: {
      accent: 'border-l-2 border-l-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      valueColor: 'text-emerald-400'
    },
    amber: {
      accent: 'border-l-2 border-l-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-400',
      valueColor: 'text-amber-300'
    },
    rose: {
      accent: 'border-l-2 border-l-rose-500',
      iconBg: 'bg-rose-500/10 text-rose-400',
      valueColor: 'text-rose-400'
    },
    slate: {
      accent: 'border-l-2 border-l-slate-600',
      iconBg: 'bg-slate-800 text-slate-400',
      valueColor: 'text-slate-200'
    },
    cyan: {
      accent: 'border-l-2 border-l-blue-500',
      iconBg: 'bg-blue-500/10 text-blue-400',
      valueColor: 'text-white'
    },
    purple: {
      accent: 'border-l-2 border-l-indigo-500',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      valueColor: 'text-indigo-300'
    },
    orange: {
      accent: 'border-l-2 border-l-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-400',
      valueColor: 'text-amber-300'
    },
    default: {
      accent: 'border-l-2 border-l-slate-700',
      iconBg: 'bg-slate-800 text-slate-400',
      valueColor: 'text-white'
    }
  }[variant] || {
    accent: 'border-l-2 border-l-slate-700',
    iconBg: 'bg-slate-800 text-slate-400',
    valueColor: 'text-white'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 transition-all ${variantStyles.accent} ${
        onClick ? 'cursor-pointer hover:bg-slate-850 hover:border-slate-700 shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums ${variantStyles.valueColor}`}>
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${variantStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
