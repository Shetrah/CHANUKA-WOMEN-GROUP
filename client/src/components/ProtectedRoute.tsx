import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole = "admin" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // In a real app, we'd check custom claims or firestore user doc for role
  // For now, simple auth check is sufficient for the demo
  
  return <>{children}</>;
}
