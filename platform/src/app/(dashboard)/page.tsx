"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Power,
  Server,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
} from "lucide-react";

interface TenantSummary {
  id: string;
  name: string;
  planId: string;
  cloudProvider: string;
  status: string;
  frontendPublicIp: string | null;
  createdAt: string;
}

export default function DashboardHomePage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenants")
      .then((res) => res.json())
      .then((data) => {
        if (data.tenants) setTenants(data.tenants);
      })
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenants.filter((t) => t.status === "SUSPENDED").length;

  return (
    <div className="mx-auto max-w-7xl pb-16 space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0b192c] via-[#132845] to-[#1d4ed8] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Shield className="h-3.5 w-3.5 text-blue-300" />
              <span>Plano de Control Centralizado • Diplomado DevSecOps</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Tenant Control Center
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              Plataforma de orquestación multi-motor de Infraestructura como Código (Terraform, OpenTofu, CloudFormation, Pulumi), aprovisionamiento automatizado con Ansible y control de ciclo de vida con $0 costo residual.
            </p>
          </div>
          <Link
            href="/tenants/crear"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-brand-700 shadow-md transition hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Crear nuevo tenant
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tenants */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Instituciones
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{totalTenants}</p>
          <p className="mt-1 text-xs text-slate-400">Tenants registrados en la plataforma</p>
        </div>

        {/* Active Tenants */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tenants Activos
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{activeTenants}</p>
          <p className="mt-1 text-xs text-slate-400">En ejecución y respondiendo en HTTP 200</p>
        </div>

        {/* Suspended Tenants */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tenants Suspendidos
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Power className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">{suspendedTenants}</p>
          <p className="mt-1 text-xs text-slate-400">VMs apagadas ($0 costo de cómputo)</p>
        </div>

        {/* Hardware Tiers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Arquitectura Dedicada
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Server className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-600">3 VMs</p>
          <p className="mt-1 text-xs text-slate-400">Frontend, Backend y PostgreSQL por tenant</p>
        </div>
      </div>

      {/* Recent Tenants Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Instituciones Recientes
            </h2>
            <p className="text-xs text-slate-500">
              Últimos entornos desplegados y su estado actual
            </p>
          </div>
          <Link
            href="/tenants"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Ver todos los tenants
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {loading ? (
            <p className="py-6 text-center text-xs text-slate-400">Cargando...</p>
          ) : tenants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <Layers className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-slate-600 font-medium">Aún no hay instituciones creadas.</p>
              <Link
                href="/tenants/crear"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Crear el primer tenant
              </Link>
            </div>
          ) : (
            tenants.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 text-xs">
                    {t.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{t.id}.escuelas.app</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold uppercase text-slate-500 text-[11px]">{t.cloudProvider}</span>
                  <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{t.planId}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      t.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : t.status === "SUSPENDED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {t.status}
                  </span>
                  <Link
                    href={`/tenants/${t.id}/consola`}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                    title="Ver consola"
                  >
                    <Terminal className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
