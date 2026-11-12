import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: {
    valueColor: 'text-slate-900',
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    borderAccent: '',
  },
  success: {
    valueColor: 'text-emerald-800',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    borderAccent: 'border-l-4 border-l-emerald-500',
  },
  warning: {
    valueColor: 'text-amber-800',
    iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
    borderAccent: 'border-l-4 border-l-amber-500',
  },
  danger: {
    valueColor: 'text-rose-800',
    iconBg: 'bg-rose-50 text-rose-700 border-rose-100',
    borderAccent: 'border-l-4 border-l-rose-500',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all ${
        styles.borderAccent
      } ${
        onClick
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm'
          : ''
      } ${className}`}
    >
      {/* Encabezado: Título en mayúsculas + Icono */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${styles.iconBg}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Cifra Principal Monoespaciada Tabular */}
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${styles.valueColor}`}
        >
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold font-mono tabular-nums ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {/* Descripción o pie informativo */}
      {description && (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed truncate">
          {description}
        </p>
      )}
    </div>
  );
};
