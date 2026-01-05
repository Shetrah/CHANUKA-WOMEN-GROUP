import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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

type Stats = {
  totalUsers: number;
  pendingReports: number;
  resolvedReports: number;
  totalReports: number;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Overview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalReports: 0,
  });

  const [chartData, setChartData] = useState<
    { name: string; reports: number }[]
  >(days.map(day => ({ name: day, reports: 0 })));

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /* ---------- ACTIVE USERS ---------- */
    const unsubscribeUsers = onSnapshot(
      query(
        collection(db, "approved_users"),
        where("isActive", "==", true)
      ),
      snapshot => {
        setStats(prev => ({
          ...prev,
          totalUsers: snapshot.size,
        }));
      }
    );

    /* ---------- REPORT STATS ---------- */
    const unsubscribeReports = onSnapshot(
      collection(db, "reports"),
      snapshot => {
        let pending = 0;
        let resolved = 0;
        let total = snapshot.size;

        const counts: Record<string, number> = {
          Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
        };

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        snapshot.forEach(doc => {
          const data = doc.data();

          /* ✅ STATUS FIX */
          if (data.status === "Pending") pending++;
          if (data.status === "Resolved") resolved++;

          /* ✅ DATE FIX */
          let createdAt: Date | null = null;

          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate();
          } else if (typeof data.submittedAt === "string") {
            createdAt = new Date(data.submittedAt);
          }

          if (createdAt && createdAt >= startOfWeek) {
            const day = days[createdAt.getDay()];
            counts[day]++;
          }
        });

        setStats(prev => ({
          ...prev,
          pendingReports: pending,
          resolvedReports: resolved,
          totalReports: total,
        }));

        setChartData(
          days.map(day => ({
            name: day,
            reports: counts[day],
          }))
        );

        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
    };
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading dashboard statistics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatsCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={AlertCircle}
          color="destructive"
        />
        <StatsCard
          title="Resolved Cases"
          value={stats.resolvedReports}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Total Reports"
          value={stats.totalReports}
          icon={FileText}
        />
      </div>

      <div className="dashboard-card min-h-[400px]">
        <h3 className="text-lg font-bold mb-6">
          Weekly Report Activity
        </h3>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="reports" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill="var(--primary)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
