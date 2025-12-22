import { useDashboardStats } from "@/hooks/use-stats";
import { StatsCard } from "@/components/StatsCard";
import { Users, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Overview() {
  const { data: stats, isLoading } = useDashboardStats();

  // Mock chart data - in real app, aggregate from Firestore
  const chartData = [
    { name: 'Mon', reports: 4 },
    { name: 'Tue', reports: 3 },
    { name: 'Wed', reports: 7 },
    { name: 'Thu', reports: 2 },
    { name: 'Fri', reports: 5 },
    { name: 'Sat', reports: 1 },
    { name: 'Sun', reports: 2 },
  ];

  if (isLoading) {
    return <div className="p-8">Loading dashboard statistics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="secondary"
        />
        <StatsCard
          title="Pending Reports"
          value={stats?.pendingReports || 0}
          icon={AlertCircle}
          color="destructive"
          trend="+2 new today"
        />
        <StatsCard
          title="Resolved Cases"
          value={stats?.resolvedReports || 0}
          icon={CheckCircle2}
          color="accent"
        />
        <StatsCard
          title="Total Reports"
          value={(stats?.pendingReports || 0) + (stats?.resolvedReports || 0)}
          icon={FileText}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="dashboard-card min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Weekly Report Activity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="reports" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--primary)' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions could go here */}
        <div className="dashboard-card">
          <h3 className="text-lg font-bold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700">Database Connection Active</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-medium text-sm text-slate-900">Latest System Update</h4>
              <p className="text-xs text-slate-500 mt-1">Admin dashboard v1.0.2 deployed successfully.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
