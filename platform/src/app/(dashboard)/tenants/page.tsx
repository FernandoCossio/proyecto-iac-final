"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
  Terminal,
  Power,
  RotateCw,
  Trash2,
  AlertTriangle,
  Server,
  Cloud,
  CheckCircle2,
  Loader2,
  Database,
  Download,
} from "lucide-react";

interface TenantItem {
  id: string;
  name: string;
  adminEmail: string;
  cloudProvider: string;
  region: string;
  environment: string;
  planId: string;
  iacEngine: string;
  status: string;
  frontendPublicIp: string | null;
  createdAt: string;
}

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cloudFilter, setCloudFilter] = useState("ALL");

  // Destructive delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantItem | null>(null);
  const [confirmSlugInput, setConfirmSlugInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Suspend/Resume loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Backup modal state
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupTenant, setBackupTenant] = useState<TenantItem | null>(null);
  const [backupsList, setBackupsList] = useState<{ filename: string; sizeFormatted: string; createdAt: string }[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const fetchBackups = async (tenantId: string) => {
    try {
      setBackupLoading(true);
      const res = await fetch(`/api/tenants/${tenantId}/backups`);
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data.backups || []);
      }
    } catch (err) {
      console.error("Error fetching backups:", err);
    } finally {
      setBackupLoading(false);
    }
  };

  const openBackupModal = (tenant: TenantItem) => {
    setBackupTenant(tenant);
    setBackupModalOpen(true);
    fetchBackups(tenant.id);
  };

  const handleCreateBackup = async () => {
    if (!backupTenant) return;
    try {
      setCreatingBackup(true);
      const res = await fetch(`/api/tenants/${backupTenant.id}/backups`, { method: "POST" });
      if (res.ok) {
        await fetchBackups(backupTenant.id);
      } else {
        const err = await res.json();
        alert(err.error || "Error generando respaldo");
      }
    } catch (err) {
      console.error("Error creating backup:", err);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!backupTenant || !confirm(`¿Eliminar el respaldo '${filename}'?`)) return;
    try {
      await fetch(`/api/tenants/${backupTenant.id}/backups/${filename}`, { method: "DELETE" });
      await fetchBackups(backupTenant.id);
    } catch (err) {
      console.error("Error deleting backup:", err);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/tenants");
      const data = await res.json();
      if (data.tenants) setTenants(data.tenants);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    const interval = setInterval(fetchTenants, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSuspend = async (id: string) => {
    if (!confirm(`¿Suspender el tenant '${id}'? Las 3 VMs se detendrán reduciendo el costo de cómputo a $0/h.`)) return;
    setActionLoadingId(id);
    try {
      await fetch(`/api/tenants/${id}/suspend`, { method: "POST" });
      await fetchTenants();
    } catch (err) {
      console.error("Error suspendiendo tenant:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionLoadingId(id);
    try {
      await fetch(`/api/tenants/${id}/resume`, { method: "POST" });
      await fetchTenants();
    } catch (err) {
      console.error("Error reanudando tenant:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDeleteModal = (tenant: TenantItem) => {
    setTenantToDelete(tenant);
    setConfirmSlugInput("");
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!tenantToDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/tenants/${tenantToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      await fetchTenants();
    } catch (err) {
      console.error("Error eliminando tenant:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesCloud = cloudFilter === "ALL" || t.cloudProvider === cloudFilter;
    return matchesSearch && matchesStatus && matchesCloud;
  });

  return (
    <div className="mx-auto max-w-7xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tenants Administrados
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona las instituciones educativas desplegadas, sus entornos y su ciclo de vida.
          </p>
        </div>
        <Link
          href="/tenants/crear"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-500"
        >
          <Plus className="h-4 w-4" />
          Crear tenant
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o identificador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="CREATING">Aprovisionando</option>
            <option value="SUSPENDED">Suspendido ($0 cómputo)</option>
            <option value="FAILED">Fallido</option>
            <option value="TERMINATED">Terminado</option>
          </select>

          <select
            value={cloudFilter}
            onChange={(e) => setCloudFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="ALL">Todas las nubes</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Institución / Slug</th>
                <th className="px-6 py-3.5">Plan / Motor</th>
                <th className="px-6 py-3.5">Nube / Región</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Acceso Web</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-600" />
                    <p className="mt-2 text-xs">Cargando catálogo de tenants...</p>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Server className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-medium text-slate-600">No se encontraron tenants registrados</p>
                    <p className="text-[11px] text-slate-400">Haz clic en &apos;Crear tenant&apos; para desplegar una nueva institución.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isActionLoading = actionLoadingId === tenant.id;

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/60 transition">
                      {/* Name & Slug */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{tenant.name}</span>
                          <span className="font-mono text-[11px] text-brand-600">{tenant.id}.escuelas.app</span>
                        </div>
                      </td>

                      {/* Plan & Engine */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold capitalize text-slate-700">
                            {tenant.planId}
                          </span>
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-blue-700">
                            {tenant.iacEngine}
                          </span>
                        </div>
                      </td>

                      {/* Cloud & Region */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Cloud className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800 uppercase">{tenant.cloudProvider}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({tenant.region})</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            tenant.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : tenant.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : tenant.status === "SUSPENDED"
                              ? "bg-amber-100 text-amber-800"
                              : tenant.status === "TERMINATED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-100 text-blue-800 animate-pulse"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              tenant.status === "ACTIVE"
                                ? "bg-emerald-600"
                                : tenant.status === "FAILED"
                                ? "bg-red-600"
                                : tenant.status === "SUSPENDED"
                                ? "bg-amber-600"
                                : tenant.status === "TERMINATED"
                                ? "bg-slate-400"
                                : "bg-blue-600"
                            }`}
                          />
                          {tenant.status}
                        </span>
                      </td>

                      {/* Web URL */}
                      <td className="px-6 py-4">
                        {tenant.frontendPublicIp && tenant.status === "ACTIVE" ? (
                          <a
                            href={`http://${tenant.frontendPublicIp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            <span>{tenant.frontendPublicIp}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">No disponible</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Console button */}
                          <Link
                            href={`/tenants/${tenant.id}/consola`}
                            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-brand-500 hover:text-brand-600"
                            title="Ver consola en vivo"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                          </Link>

                          {/* Manage Backups button */}
                          {tenant.status !== "TERMINATED" && (
                            <button
                              onClick={() => openBackupModal(tenant)}
                              className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100"
                              title="Gestionar respaldos de base de datos"
                            >
                              <Database className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Suspend Button */}
                          {tenant.status === "ACTIVE" && (
                            <button
                              onClick={() => handleSuspend(tenant.id)}
                              disabled={isActionLoading}
                              className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100"
                              title="Suspender ($0 costo de cómputo)"
                            >
                              {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                            </button>
                          )}

                          {/* Resume Button */}
                          {tenant.status === "SUSPENDED" && (
                            <button
                              onClick={() => handleResume(tenant.id)}
                              disabled={isActionLoading}
                              className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                              title="Reanudar tenant"
                            >
                              {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                            </button>
                          )}

                          {/* Destroy Button */}
                          {tenant.status !== "TERMINATED" && (
                            <button
                              onClick={() => openDeleteModal(tenant)}
                              className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                              title="Eliminar y destruir infraestructura"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Destructive Deletion Confirmation Modal (RF-18) */}
      {deleteModalOpen && tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Confirmar eliminación destructiva?
                </h3>
                <p className="text-xs text-red-600 font-semibold">
                  Esta acción es irreversible y ejecutará `destroy` en la nube.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-red-50 p-3.5 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-red-900">Recursos que serán destruidos permanentemente:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>3 Servidores virtuales (Frontend, Backend, PostgreSQL).</li>
                <li>Red VPC/VNet, subredes aisladas y grupos de seguridad.</li>
                <li>Volúmenes de disco EBS / Managed Disks y base de datos completa.</li>
              </ul>
              <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                ✔ Resultado garantizado: Cero costo residual ($0) en la cuenta cloud.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700">
                Escribe el slug del tenant <span className="font-mono font-bold text-red-600">{tenantToDelete.id}</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmSlugInput}
                onChange={(e) => setConfirmSlugInput(e.target.value)}
                placeholder={tenantToDelete.id}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmSlugInput !== tenantToDelete.id || deleting}
                onClick={executeDelete}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-500/20 hover:bg-red-500 disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Destruyendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Destruir Infraestructura ($0 Residual)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Management Modal */}
      {backupModalOpen && backupTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Respaldos de Base de Datos</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Tenant: <span className="font-bold text-slate-700">{backupTenant.name}</span> ({backupTenant.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Acción Generar Respaldo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Generar Copia de Seguridad Inmediata</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Extrae dump PostgreSQL en caliente y lo comprime en formato .sql.gz.
                </p>
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup || backupTenant.status !== "ACTIVE"}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {creatingBackup ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Respaldando...
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    Crear Respaldo Manual
                  </>
                )}
              </button>
            </div>

            {/* Política de Retención Info */}
            <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Política de retención:</span>
              <span className="text-slate-500">Se conservan automáticamente los <strong>7 respaldos</strong> más recientes por tenant.</span>
            </div>

            {/* Lista de Respaldos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historial de Copias Disponibles:</h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {backupLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Cargando respaldos...
                  </div>
                ) : backupsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No se han generado respaldos para este tenant todavía.
                  </div>
                ) : (
                  backupsList.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition text-xs">
                      <div className="space-y-0.5">
                        <p className="font-mono font-medium text-slate-800">{b.filename}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(b.createdAt).toLocaleString()} · <span className="font-semibold text-slate-600">{b.sizeFormatted}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/tenants/${backupTenant.id}/backups/${b.filename}`}
                          download={b.filename}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
                        >
                          <Download className="h-3 w-3 text-slate-500" />
                          Descargar
                        </a>
                        <button
                          onClick={() => handleDeleteBackup(b.filename)}
                          className="rounded border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
                          title="Eliminar este respaldo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBackupModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
