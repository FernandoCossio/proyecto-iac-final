import { Server, Database, Users, HardDrive, ShieldCheck, Check } from "lucide-react";

export default function PlanesCatalogPage() {
  const plans = [
    {
      id: "basico",
      name: "Básico",
      subtitle: "Para instituciones pequeñas",
      description: "Ideal para institutos o carreras con matrícula acotada y requerimientos estándar de asistencia diaria.",
      students: "Hasta 100 estudiantes",
      dbSize: "10 GB EBS gp3 / Managed Disk",
      awsSku: "t3.micro (2 vCPUs, 1.0 GiB RAM)",
      azureSku: "Standard_B1s (1 vCPU, 1.0 GiB RAM)",
      backup: "Respaldo semanal programado",
      recommended: false,
    },
    {
      id: "estandar",
      name: "Estándar",
      subtitle: "Para instituciones en crecimiento",
      description: "Balance óptimo entre costo y desempeño para facultades completas con alta concurrencia concurrente.",
      students: "Hasta 1,000 estudiantes",
      dbSize: "20 - 50 GB EBS gp3",
      awsSku: "t3.small (2 vCPUs, 2.0 GiB RAM)",
      azureSku: "Standard_B2s_v2 (2 vCPUs, 4.0 GiB RAM)",
      backup: "Respaldo diario automático",
      recommended: true,
    },
    {
      id: "avanzado",
      name: "Avanzado",
      subtitle: "Para alta demanda",
      description: "Máximo rendimiento y cómputo para universidades multicampus y consultas masivas simultáneas.",
      students: "Hasta 5,000 estudiantes",
      dbSize: "30 - 200 GB EBS gp3",
      awsSku: "c7i-flex.large (2 vCPUs, 4.0 GiB RAM)",
      azureSku: "Standard_B4s_v2 (4 vCPUs, 16.0 GiB RAM)",
      backup: "Respaldo diario + política de retención",
      recommended: false,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-16 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Catálogo Fijo de Planes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Especificaciones de hardware, cuotas y tipos de instancia homologados para AWS y Azure.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
              p.recommended
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200"
            }`}
          >
            {p.recommended && (
              <span className="absolute -top-3 right-6 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Más Utilizado
              </span>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{p.name}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">{p.subtitle}</p>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">{p.description}</p>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-brand-600 shrink-0" />
                  <span className="font-semibold">{p.students}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <HardDrive className="h-4 w-4 text-brand-600 shrink-0" />
                  <span>{p.dbSize}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Server className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">AWS: <span className="font-mono font-normal">{p.awsSku}</span></p>
                    <p className="font-bold text-slate-800">Azure: <span className="font-mono font-normal">{p.azureSku}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{p.backup}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700 bg-emerald-50/70 p-2.5 rounded-lg">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>3 VMs dedicadas por tenant (Frontend, Backend, PostgreSQL)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
