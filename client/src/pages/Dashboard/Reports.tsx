import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, ExternalLink, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Utility function to combine classNames
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const formatDate = (date) => {
  if (!date) return "Unknown Date";
  const d = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateLong = (date) => {
  if (!date) return "Unknown Date";
  const d = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface Report {
  id: string;
  category: string;
  type: string;
  description: string;
  location: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: any;
  submittedAt: string;
  reportNumber: string;
  userEmail: string;
  userId: string;
  area: string;
  title: string;
  evidenceUrl: string | null;
  lastUpdated?: string;
}

// Firebase utilities - Import from your firebase.ts file
let firebaseUtils = {
  db: null as any,
  initialized: false
};

const initializeFirebase = async () => {
  if (firebaseUtils.initialized) return true;
  
  try {
    // Import from your firebase.ts configuration file
    const { db } = await import('@/lib/firebase');
    firebaseUtils.db = db;
    firebaseUtils.initialized = true;
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
};

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const initialized = await initializeFirebase();
        
        if (initialized && firebaseUtils.db) {
          const { collection, query, where, onSnapshot } = await import('firebase/firestore');
          
          // Build query based on filter
          let q;
          if (statusFilter === "all") {
            q = query(collection(firebaseUtils.db, "reports"));
          } else {
            q = query(
              collection(firebaseUtils.db, "reports"),
              where("status", "==", statusFilter)
            );
          }

          // Set up real-time listener
          const unsubscribe = onSnapshot(
            q,
            (snapshot: any) => {
              const reportsData = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
              }));
              setReports(reportsData as Report[]);
              setIsLoading(false);
            },
            (error: any) => {
              console.error("Error fetching reports:", error);
              setIsLoading(false);
            }
          );

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error setting up Firebase:", error);
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [statusFilter]);

  return (
    <div className="space-y-8 p-6 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">GBV Reports</h1>
          <p className="text-slate-500 mt-1">Review and manage reported incidents.</p>
        </div>
        
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading reports...</div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reports found</h3>
            <p className="text-slate-500">There are no reports matching the selected filter.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localReport, setLocalReport] = useState(report);

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    reviewed: "bg-blue-100 text-blue-700 border-blue-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
  };

  const statusIcons = {
    pending: AlertTriangle,
    reviewed: Clock,
    resolved: CheckCircle,
  };

  const StatusIcon = statusIcons[localReport.status] || AlertTriangle;

  const handleStatusChange = async (newStatus: "pending" | "reviewed" | "resolved") => {
    setIsUpdating(true);
    try {
      const { updateDoc, doc, Timestamp } = await import('firebase/firestore');
      
      const reportRef = doc(firebaseUtils.db, "reports", localReport.id);
      await updateDoc(reportRef, {
        status: newStatus,
        lastUpdated: Timestamp.now()
      });
      
      // Update local state
      setLocalReport({ ...localReport, status: newStatus });
      
      console.log(`Report ${localReport.id} status updated to ${newStatus} in Firebase`);
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Error updating report. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-6 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: Status & Meta */}
        <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
          <Badge className={cn("w-fit px-3 py-1 flex items-center gap-2", statusColors[localReport.status])}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{localReport.status}</span>
          </Badge>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(localReport.createdAt || localReport.submittedAt)}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {localReport.location || "No location provided"}
          </div>
        </div>

        {/* Center: Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">{localReport.category || localReport.type}</span> Incident
            </h3>
          </div>
          <p className="text-slate-600 leading-relaxed line-clamp-2">
            {localReport.description || localReport.title}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="lg:w-40 flex-shrink-0 flex flex-col justify-center items-end gap-3">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">View Details</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <span>Report #{localReport.reportNumber || localReport.id.substring(0, 6)}</span>
                  <Badge className={cn("ml-2", statusColors[localReport.status])}>
                    {localReport.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Reported on {formatDateLong(localReport.createdAt || localReport.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Type/Category</span>
                    <span className="font-medium text-slate-900">{localReport.category || localReport.type || "N/A"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Location</span>
                    <span className="font-medium text-slate-900">{localReport.location || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase">Description</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                    {localReport.description || localReport.title || "No description provided"}
                  </div>
                </div>

                {localReport.evidenceUrl && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase">Evidence</h4>
                    <a 
                      href={localReport.evidenceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Attached Evidence
                    </a>
                  </div>
                )}

                {localReport.userEmail && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <span className="block font-bold mb-1">Submitted by</span>
                    {localReport.userEmail}
                  </div>
                )}
              </div>

              <DialogFooter className="sm:justify-between items-center gap-4 border-t pt-4">
                <div className="text-xs text-slate-400">
                  ID: {localReport.id}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {localReport.status !== 'resolved' && (
                    <Button 
                      variant="outline"
                      className="flex-1 sm:flex-none border-green-600 text-green-700 hover:bg-green-50"
                      onClick={() => handleStatusChange("resolved")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Mark as Resolved"}
                    </Button>
                  )}
                  {localReport.status === 'pending' && (
                    <Button 
                      className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleStatusChange("reviewed")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Mark as Reviewed"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {localReport.status === "pending" && (
            <Button 
              size="sm" 
              className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
              onClick={() => handleStatusChange("reviewed")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Mark Reviewed"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}