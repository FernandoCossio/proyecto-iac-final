"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Layers,
  Settings,
  LogOut,
  Send,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navItemsPlatform = [
    { name: "Inicio", href: "/", icon: Home },
    {
      name: "Tenants",
      href: "/tenants",
      icon: Users,
      active: pathname.startsWith("/tenants"),
    },
    {
      name: "Planes",
      href: "/planes",
      icon: Layers,
      active: pathname.startsWith("/planes"),
    },
  ];

  const navItemsAdmin = [
    {
      name: "Configuración",
      href: "/configuracion",
      icon: Settings,
      active: pathname.startsWith("/configuracion"),
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b192c] text-slate-300 shadow-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 shadow-sm shadow-brand-500/50">
            <Send className="h-5 w-5 rotate-45 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight tracking-tight text-white">
              Tenant
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Control Center
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* PLATAFORMA */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Plataforma
          </p>
          <div className="mt-2 space-y-1">
            {navItemsPlatform.map((item) => {
              const isActive =
                item.active !== undefined
                  ? item.active
                  : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-0 h-5 w-1 rounded-l-full bg-white/80" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ADMINISTRACIÓN */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Administración
          </p>
          <div className="mt-2 space-y-1">
            {navItemsAdmin.map((item) => {
              const isActive = item.active;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer matching Carlos U. */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white ring-2 ring-brand-500/30">
              CU
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Carlos U.</span>
              <span className="text-xs text-slate-400">Administrador</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
