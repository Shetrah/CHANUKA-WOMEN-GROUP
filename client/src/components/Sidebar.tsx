import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/users", icon: Users, label: "User Management" },
    { href: "/dashboard/reports", icon: FileText, label: "GBV Reports" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white hidden md:flex flex-col shadow-2xl">
      
      {/* -------- HEADER -------- */}
      <div className="flex items-center gap-4 px-6 py-8 border-b border-white/10">
        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shadow-lg">
          <img
            src="/logo.png"
            alt="Chanuka Deaf Women Group"
            className="w-9 h-9 object-contain"
          />
        </div>

        <div className="leading-tight">
          <h1 className="font-display font-bold text-lg tracking-tight text-white">
            Chanuka Deaf
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Women Group • Admin
          </p>
        </div>
      </div>

      {/* -------- NAVIGATION -------- */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group overflow-hidden",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {/* Hover glow */}
              <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <Icon
                className={cn(
                  "w-5 h-5 relative z-10 transition-transform duration-300",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white group-hover:scale-110"
                )}
              />

              <span className="relative z-10">{link.label}</span>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* -------- FOOTER -------- */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
