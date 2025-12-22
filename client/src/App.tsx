import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Overview from "@/pages/Dashboard/Overview";
import UsersPage from "@/pages/Dashboard/Users";
import ReportsPage from "@/pages/Dashboard/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Redirect to login if not authenticated and not already on login page
  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }

  // Redirect to dashboard if authenticated and on login page
  if (user && location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Overview />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/users">
        {() => (
          <ProtectedRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/reports">
        {() => (
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
