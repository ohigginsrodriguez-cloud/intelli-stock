"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  PackageSearch,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badgeKey: "" },
  { href: "/dashboard/productos", label: "Productos", icon: Package, badgeKey: "" },
  { href: "/dashboard/ventas", label: "Ventas", icon: ShoppingCart, badgeKey: "" },
  { href: "/dashboard/compras", label: "Compras", icon: Truck, badgeKey: "" },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: Users, badgeKey: "" },
  { href: "/dashboard/alertas", label: "Alertas", icon: Bell, badgeKey: "alertas" },
  { href: "/dashboard/reportes", label: "Reportes", icon: TrendingUp, badgeKey: "" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [pendingAlerts, setPendingAlerts] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const nombre = localStorage.getItem("user_name");
    if (nombre) setUserName(nombre);

    api.get("/alerts/pending-count/").then((r) => {
      setPendingAlerts(r.data.alertas_pendientes + r.data.recomendaciones_pendientes);
    }).catch(() => {});
  }, [router, pathname]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-surface">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">IntelliStock</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const showBadge = item.badgeKey === "alertas" && pendingAlerts > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {pendingAlerts > 9 ? "9+" : pendingAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted hover:bg-gray-100 hover:text-danger transition-colors">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm font-medium text-muted">{userName || "Usuario"}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
