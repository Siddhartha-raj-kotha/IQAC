"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { t } from "@/lib/translations";
import { LogOut, LayoutDashboard, FileText, Users, Settings, ChevronRight, Menu, X } from "lucide-react";
import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/mockData";

interface NavItem {
  href: string;
  icon: ReactNode;
  labelEn: string;
  labelTe: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { href: "/faculty", icon: <LayoutDashboard size={20} />, labelEn: "Dashboard", labelTe: "డాష్బోర్డ్", roles: ["faculty"] },
  { href: "/faculty/form", icon: <FileText size={20} />, labelEn: "My Form", labelTe: "నా ఫారం", roles: ["faculty"] },
  { href: "/hod", icon: <LayoutDashboard size={20} />, labelEn: "Dashboard", labelTe: "డాష్బోర్డ్", roles: ["hod"] },
  { href: "/principal", icon: <LayoutDashboard size={20} />, labelEn: "Dashboard", labelTe: "డాష్బోర్డ్", roles: ["principal"] },
  { href: "/admin", icon: <LayoutDashboard size={20} />, labelEn: "Dashboard", labelTe: "డాష్బోర్డ్", roles: ["admin"] },
  { href: "/admin/users", icon: <Users size={20} />, labelEn: "User Management", labelTe: "వినియోగదారు నిర్వహణ", roles: ["admin"] },
  { href: "/admin/settings", icon: <Settings size={20} />, labelEn: "Settings", labelTe: "సెట్టింగులు", roles: ["admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const userNavItems = navItems.filter(n => n.roles.includes(user.role));
  const roleLabel = t(`role${user.role.charAt(0).toUpperCase() + user.role.slice(1) === "Hod" ? "HOD" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}`, lang);

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 ku-nav shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-yellow-400 flex-shrink-0">
          KU
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Kakatiya University</p>
          <p className="text-yellow-300 text-xs">IQAC Data Portal</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/60 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 font-bold text-sm flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-white/60 text-xs truncate">{roleLabel}</p>
            {user.department !== "All" && (
              <p className="text-white/50 text-xs truncate">{user.department}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {userNavItems.map(item => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          const label = lang === "en" ? item.labelEn : item.labelTe;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-yellow-400" : "text-white/50 group-hover:text-white/80"}>
                {item.icon}
              </span>
              {label}
              {isActive && <ChevronRight size={14} className="ml-auto text-yellow-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          {t("logout", lang)}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-ku-gray-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-ku-border shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-ku-navy hover:bg-gray-100">
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <p className="text-ku-navy font-semibold text-sm leading-tight">
                {lang === "en" ? "IQAC Faculty Data Collection System" : "IQAC అధ్యాపక డేటా సేకరణ వ్యవస్థ"}
              </p>
              <p className="text-gray-400 text-xs">
                {lang === "en" ? "Academic Year 2024-25 | Kakatiya University, Warangal" : "విద్యా సంవత్సరం 2024-25 | కాకతీయ విశ్వవిద్యాలయం, వరంగల్"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">{t("logout", lang)}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="ku-nav text-white/50 text-xs text-center py-3 px-4 no-print">
          © 2025 Kakatiya University, Warangal — IQAC Academic Data Collection System | AQAR 2024-25
        </footer>
      </div>
    </div>
  );
}
