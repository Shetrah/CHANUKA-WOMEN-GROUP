import { useState } from "react";
import { useReports, useUpdateReportStatus } from "@/hooks/use-reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, ExternalLink, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: reports, isLoading } = useReports(statusFilter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">GBV Reports</h1>
          <p className="text-muted-foreground mt-1">Review and manage reported incidents.</p>
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
          <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reports found</h3>
            <p className="text-muted-foreground">There are no reports matching the selected filter.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  const updateStatus = useUpdateReportStatus();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const StatusIcon = statusIcons[report.status as keyof typeof statusIcons] || AlertTriangle;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: report.id, status: newStatus });
    setIsDetailsOpen(false);
  };

  return (
    <div className="dashboard-card hover:border-primary/20 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: Status & Meta */}
        <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
          <Badge variant="outline" className={cn("w-fit px-3 py-1 flex items-center gap-2", statusColors[report.status as keyof typeof statusColors])}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{report.status}</span>
          </Badge>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {report.reportedAt ? format(new Date(report.reportedAt), 'MMM d, yyyy') : 'Unknown Date'}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {report.location || "No location provided"}
          </div>
        </div>

        {/* Center: Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-primary">{report.type}</span> Incident
            </h3>
          </div>
          <p className="text-slate-600 leading-relaxed line-clamp-2">
            {report.description}
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
                  <span>Report #{report.id.substring(0,6)}</span>
                  <Badge variant="outline" className={cn("ml-2", statusColors[report.status as keyof typeof statusColors])}>
                    {report.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Reported on {report.reportedAt ? format(new Date(report.reportedAt), 'PPP') : 'Unknown Date'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Type</span>
                    <span className="font-medium text-slate-900">{report.type}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Location</span>
                    <span className="font-medium text-slate-900">{report.location || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase">Description</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                    {report.description}
                  </div>
                </div>

                {report.evidenceUrl && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase">Evidence</h4>
                    <a 
                      href={report.evidenceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline bg-primary/5 px-4 py-2 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Attached Evidence
                    </a>
                  </div>
                )}
              </div>

              <DialogFooter className="sm:justify-between items-center gap-4 border-t pt-4">
                <div className="text-xs text-slate-400">
                  ID: {report.id}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {report.status !== 'resolved' && (
                    <Button 
                      variant="outline"
                      className="flex-1 sm:flex-none border-green-600 text-green-700 hover:bg-green-50"
                      onClick={() => handleStatusChange("resolved")}
                      disabled={updateStatus.isPending}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {report.status === 'pending' && (
                    <Button 
                      className="flex-1 sm:flex-none btn-primary"
                      onClick={() => handleStatusChange("reviewed")}
                      disabled={updateStatus.isPending}
                    >
                      Mark as Reviewed
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {report.status === "pending" && (
            <Button 
              size="sm" 
              className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none"
              onClick={() => updateStatus.mutate({ id: report.id, status: "reviewed" })}
              disabled={updateStatus.isPending}
            >
              Mark Reviewed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
