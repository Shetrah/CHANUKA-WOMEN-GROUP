import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  if (location === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 transition-all">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <span className="font-display font-bold text-lg">SafeHaven</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
              <Sidebar /> {/* Reusing Sidebar content inside Sheet */}
            </SheetContent>
          </Sheet>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
