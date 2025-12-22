import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Overview from "@/pages/Dashboard/Overview";
import UsersPage from "@/pages/Dashboard/Users";
import ReportsPage from "@/pages/Dashboard/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        
        <Route path="/dashboard">
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/users">
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/reports">
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        </Route>

        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
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
