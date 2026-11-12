'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Users, Calendar, ShieldCheck } from 'lucide-react';

export interface ModuleImportStepperProps {
  currentStep: 1 | 2 | 3;
}

interface StepDef {
  number: 1 | 2 | 3;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepDef[] = [
  {
    number: 1,
    label: 'Nómina',
    description: 'Estudiantes (.xlsx)',
    href: '/admin/modulo/importar',
    icon: Users,
  },
  {
    number: 2,
    label: 'Fechas',
    description: 'Calendario y Horarios',
    href: '/admin/modulo/importar/fechas',
    icon: Calendar,
  },
  {
    number: 3,
    label: 'Activación',
    description: 'Revisión y Publicación',
    href: '/admin/modulo/preview',
    icon: ShieldCheck,
  },
];

export const ModuleImportStepper: React.FC<ModuleImportStepperProps> = ({
  currentStep,
}) => {
  return (
    <nav
      aria-label="Progreso del Asistente de Carga"
      className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs mb-6"
    >
      <ol className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isPending = step.number > currentStep;
          const Icon = step.icon;

          const content = (
            <div className="flex items-center gap-2.5 sm:gap-3 text-left">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-xs font-bold leading-tight truncate ${
                    isCurrent
                      ? 'text-indigo-600'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </div>
                <div className="hidden md:block text-[10px] text-slate-400 leading-tight truncate font-medium">
                  {step.description}
                </div>
              </div>
            </div>
          );

          return (
            <React.Fragment key={step.number}>
              <li className="flex-1">
                {isCompleted ? (
                  <Link
                    href={step.href}
                    className="group block p-1.5 -m-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="p-1.5 -m-1.5">{content}</div>
                )}
              </li>

              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`hidden sm:block flex-1 max-w-16 h-0.5 rounded-full transition-colors ${
                    step.number < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
