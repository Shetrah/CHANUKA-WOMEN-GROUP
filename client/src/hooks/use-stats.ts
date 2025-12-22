import { useQuery } from "@tanstack/react-query";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const usersColl = collection(db, "approved_users");
        const reportsColl = collection(db, "gbv_reports");

        // Use Promise.all for parallel fetching
        const [
          totalUsersSnap,
          pendingReportsSnap,
          resolvedReportsSnap
        ] = await Promise.all([
          getCountFromServer(usersColl),
          getCountFromServer(query(reportsColl, where("status", "==", "pending"))),
          getCountFromServer(query(reportsColl, where("status", "==", "resolved")))
        ]);

        return {
          totalUsers: totalUsersSnap.data().count,
          pendingReports: pendingReportsSnap.data().count,
          resolvedReports: resolvedReportsSnap.data().count,
        };
      } catch (error) {
        console.error("Failed to fetch stats", error);
        // Return dummy data if Firebase fails (e.g. no config)
        return {
          totalUsers: 0,
          pendingReports: 0,
          resolvedReports: 0,
        };
      }
    }
  });
}
