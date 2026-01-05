import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  MapPin,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

/* ---------------- UTIL ---------------- */

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

type DateInput = Date | string | Timestamp | null | undefined;

const formatDate = (date: DateInput): string => {
  if (!date) return "Unknown Date";

  const d =
    date instanceof Date
      ? date
      : typeof date === "string"
      ? new Date(date)
      : date instanceof Timestamp
      ? date.toDate()
      : new Date(date);

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateLong = (date: DateInput): string => {
  if (!date) return "Unknown Date";

  const d =
    date instanceof Date
      ? date
      : typeof date === "string"
      ? new Date(date)
      : date instanceof Timestamp
      ? date.toDate()
      : new Date(date);

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ---------------- TYPES ---------------- */

interface Report {
  id: string;
  category: string;
  type?: string;
  description: string;
  location: string;
  status: "Pending" | "Reviewed" | "Resolved";
  createdAt?: Timestamp | Date | string;
  submittedAt?: string;
  reportNumber: string;
  userEmail: string;
  userId?: string;
  userName?: string;
  area: string;
  title: string;
  evidenceUrl?: string | null;
  lastUpdated?: Timestamp;
}

/* =========================
   MAIN PAGE
========================= */

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Reviewed" | "Resolved"
  >("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let q: Query<DocumentData>;

    if (statusFilter === "all") {
      q = query(collection(db, "reports"));
    } else {
      q = query(
        collection(db, "reports"),
        where("status", "==", statusFilter)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData: Report[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Report, "id">),
        }));

        setReports(reportsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter]);

  return (
    <div className="space-y-8 p-6 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            GBV Reports
          </h1>
          <p className="text-slate-500 mt-1">
            Review and manage reported incidents.
          </p>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as typeof statusFilter)
          }
        >
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="Resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No reports found
            </h3>
            <p className="text-slate-500">
              There are no reports matching the selected filter.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}

/* =========================
   REPORT CARD
========================= */

function ReportCard({ report }: { report: Report }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localReport, setLocalReport] = useState(report);

  const statusColors = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Reviewed: "bg-blue-100 text-blue-700 border-blue-200",
    Resolved: "bg-green-100 text-green-700 border-green-200",
  };

  const statusIcons = {
    Pending: AlertTriangle,
    Reviewed: Clock,
    Resolved: CheckCircle,
  };

  const StatusIcon = statusIcons[localReport.status];

  const handleStatusChange = async (
    newStatus: Report["status"]
  ) => {
    setIsUpdating(true);
    try {
      await updateDoc(
        doc(db, "reports", localReport.id),
        {
          status: newStatus,
          lastUpdated: Timestamp.now(),
        }
      );

      setLocalReport({
        ...localReport,
        status: newStatus,
      });

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
        {/* Left */}
        <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
          <Badge
            className={cn(
              "w-fit px-3 py-1 flex items-center gap-2",
              statusColors[localReport.status]
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{localReport.status}</span>
          </Badge>

          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(
              localReport.createdAt ??
                localReport.submittedAt
            )}
          </div>

          <div className="text-sm text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {localReport.location || "No location provided"}
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            <span className="text-blue-600">
              {localReport.category ||
                localReport.type}
            </span>{" "}
            Incident
          </h3>

          <p className="text-slate-600 leading-relaxed line-clamp-2">
            {localReport.description ||
              localReport.title}
          </p>
        </div>

        {/* Right */}
        <div className="lg:w-40 flex-shrink-0 flex flex-col justify-center items-end gap-3">
          <Dialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Report #
                  {localReport.reportNumber ||
                    localReport.id.slice(0, 6)}
                  <Badge
                    className={cn(
                      "ml-2",
                      statusColors[localReport.status]
                    )}
                  >
                    {localReport.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Reported on{" "}
                  {formatDateLong(
                    localReport.createdAt ??
                      localReport.submittedAt
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-xs font-bold uppercase mb-1">
                      Category
                    </span>
                    {localReport.category ||
                      localReport.type ||
                      "N/A"}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-xs font-bold uppercase mb-1">
                      Location
                    </span>
                    {localReport.location || "N/A"}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase mb-2">
                    Description
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    {localReport.description ||
                      localReport.title ||
                      "No description provided"}
                  </div>
                </div>

                {localReport.evidenceUrl && (
                  <a
                    href={localReport.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Evidence
                  </a>
                )}

                {localReport.userEmail && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    Submitted by {localReport.userEmail}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {localReport.status !== "Resolved" && (
                  <Button
                    disabled={isUpdating}
                    onClick={() =>
                      handleStatusChange("Resolved")
                    }
                  >
                    Mark Resolved
                  </Button>
                )}

                {localReport.status === "Pending" && (
                  <Button
                    disabled={isUpdating}
                    variant="outline"
                    onClick={() =>
                      handleStatusChange("Reviewed")
                    }
                  >
                    Mark Reviewed
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
