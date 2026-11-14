import { Shield, Key, Terminal, Cloud, CheckCircle2, Server } from "lucide-react";

export default function ConfiguracionPage() {
  const tools = [
    { name: "Terraform CLI", version: "v1.14.7", status: "Instalado y Operativo", icon: Terminal },
    { name: "OpenTofu CLI", version: "v1.9.0", status: "Instalado y Operativo", icon: Terminal },
    { name: "AWS CLI", version: "v2.22.13", status: "Perfil 'companero-iac' activo", icon: Cloud },
    { name: "Azure CLI", version: "az 2.67+", status: "Sesión CLI integrada", icon: Cloud },
    { name: "Docker Daemon", version: "v28.0.4", status: "Motor activo para Ansible Runner", icon: Server },
  ];

  return (
    <div className="mx-auto max-w-5xl pb-16 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configuración del Plano de Control
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Estado del entorno anfitrión, credenciales heredadas y herramientas de aprovisionamiento.
        </p>
      </div>

      {/* Cloud Environment Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Cloud className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Credenciales y Perfiles Cloud</h2>
            <p className="text-xs text-slate-500">Heredadas de forma segura desde las variables y sesión local del host</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-4">
            <span className="font-bold text-slate-500">Amazon Web Services (AWS)</span>
            <p className="mt-1 text-sm font-mono font-bold text-slate-900">Perfil: companero-iac</p>
            <p className="text-slate-500 font-mono mt-0.5">Región predeterminada: us-east-1</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Conectado sin restricciones de despliegue</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <span className="font-bold text-slate-500">Microsoft Azure</span>
            <p className="mt-1 text-sm font-mono font-bold text-slate-900">Sesión: Azure CLI (az login)</p>
            <p className="text-slate-500 font-mono mt-0.5">Región recomendada: spaincentral</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Autenticación por token CLI activa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Shield className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Seguridad y Sanitización</h2>
            <p className="text-xs text-slate-500">Políticas de enmascaramiento de secretos y tokens</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <Key className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Enmascaramiento en Vivo (LogSanitizer)</p>
              <p className="text-slate-500">
                Toda salida de terminal producida por Terraform, Cloud-Init o Ansible pasa por un filtro de expresiones regulares antes de emitirse por SSE o guardarse en SQLite.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Cookies HttpOnly y SameSite=Strict</p>
              <p className="text-slate-500">
                La sesión del operador se almacena criptográficamente en cookies inaccesibles por JavaScript para prevenir ataques XSS y CSRF.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolchain Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Terminal className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Estado de Herramientas del Orquestador</h2>
            <p className="text-xs text-slate-500">Binarios de línea de comandos detectados en el sistema</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {tools.map((t) => (
            <div key={t.name} className="flex items-center justify-between py-3 text-xs">
              <div className="flex items-center gap-3">
                <t.icon className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-800">{t.name}</span>
                <span className="font-mono text-slate-400">{t.version}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
