import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, FileText, LogOut, Users2 } from "lucide-react";
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform hidden md:flex flex-col">
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/10">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Users2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight">Chanuka Deaf Women Group</h1>
          <p className="text-xs text-slate-400 font-medium">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
