import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  AlertTriangle,
  Minus,
} from 'lucide-react';

export type BadgeStatusType =
  | 'PRESENTE'
  | 'RETARDO'
  | 'FALTA'
  | 'JUSTIFICADO'
  | 'REGULAR'
  | 'EN_RIESGO'
  | 'REPROBADO';

export interface StatusBadgeProps {
  status: BadgeStatusType | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  PRESENTE: {
    label: 'Presente',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-800',
    icon: CheckCircle2,
  },
  RETARDO: {
    label: 'Retardo',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    icon: Clock,
  },
  FALTA: {
    label: 'Falta',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-800',
    icon: XCircle,
  },
  JUSTIFICADO: {
    label: 'Justificado',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-800',
    icon: FileCheck2,
  },
  REGULAR: {
    label: 'Regular (>=80%)',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-800',
    icon: CheckCircle2,
  },
  EN_RIESGO: {
    label: 'En Riesgo (70-79%)',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    icon: AlertTriangle,
  },
  REPROBADO: {
    label: 'Reprobado (<70%)',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-800',
    icon: XCircle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const normalizedKey = status.toUpperCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status,
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-700',
    icon: Minus,
  };

  const IconComponent = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-md transition-colors select-none ${
        config.bgClass
      } ${config.borderClass} ${config.textClass} ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      {showIcon && (
        <IconComponent
          className={`shrink-0 ${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
