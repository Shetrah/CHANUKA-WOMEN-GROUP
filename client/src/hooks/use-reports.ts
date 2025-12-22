import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GbvReport } from "@shared/routes";
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function useReports(status?: string) {
  return useQuery({
    queryKey: [api.reports.list.path, status],
    queryFn: async () => {
      try {
        let q = query(collection(db, "gbv_reports"), orderBy("reportedAt", "desc"));
        
        if (status && status !== 'all') {
          q = query(q, where("status", "==", status));
        }

        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          reportedAt: doc.data().reportedAt?.toDate?.() || new Date(),
        })) as any[];
      } catch (error) {
        console.error("Error fetching reports:", error);
        return [];
      }
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const reportRef = doc(db, "gbv_reports", id);
      await updateDoc(reportRef, { status });
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({
        title: "Status updated",
        description: "The report status has been changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });
}
