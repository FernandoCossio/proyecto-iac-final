"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // Generar breadcrumbs dinámicos
  const getBreadcrumbs = () => {
    if (pathname === "/") return "Plataforma / Inicio";
    if (pathname === "/tenants") return "Plataforma / Tenants";
    if (pathname === "/tenants/crear") return "Tenants / Crear tenant";
    if (pathname.includes("/consola")) return "Tenants / Consola de despliegue en vivo";
    if (pathname.startsWith("/tenants/")) return "Tenants / Detalle";
    if (pathname === "/planes") return "Plataforma / Planes";
    if (pathname === "/monitoreo") return "Plataforma / Monitoreo & Observabilidad";
    if (pathname === "/seguridad") return "Plataforma / Seguridad & Scanners";
    if (pathname === "/auditoria") return "Administración / Bitácora de Auditoría";
    if (pathname === "/configuracion") return "Administración / Configuración";
    return "Tenant Control Center";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      {/* Breadcrumb path */}
      <div className="flex items-center text-xs font-medium text-slate-500">
        <span>{getBreadcrumbs()}</span>
      </div>

      {/* Top right quick actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/tenants/crear"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
          title="Crear nuevo tenant"
        >
          <Plus className="h-4 w-4" />
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
          AD
        </div>
      </div>
    </header>
  );
}
