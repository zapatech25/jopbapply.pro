import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { exportApplicationsToCSV } from "@/lib/csvExport";
import type { Application } from "@shared/schema";

const STATUS_COLORS = {
  applied: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  in_review: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  interviewing: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  offer: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

const STATUS_LABELS = {
  applied: "Applied",
  in_review: "In Review",
  interviewing: "Interviewing",
  rejected: "Rejected",
  offer: "Offer",
};

export default function ApplicationsTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const { data: batchStats } = useQuery<{ totalApplications: number; batches: number[] }>({
    queryKey: ["/api/user/batches"],
  });

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: [
      "/api/applications",
      statusFilter !== "all" ? statusFilter : undefined,
      batchFilter !== "all" ? parseInt(batchFilter) : undefined,
      modeFilter !== "all" ? modeFilter : undefined,
    ],
    queryFn: async ({ queryKey }) => {
      const [url, status, batch, mode] = queryKey;
      const params = new URLSearchParams();

      if (status && status !== "all") {
        params.append("status", status as string);
      }

      if (batch && batch !== "all") {
        params.append("batchNumber", batch.toString());
      }

      if (mode && mode !== "all") {
        params.append("submissionMode", mode as string);
      }

      const queryString = params.toString();
      const fetchUrl = queryString ? `${url}?${queryString}` : url;

      const res = await fetch(fetchUrl as string);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Loading your applications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              {applications.length} application{applications.length !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-batch-filter">
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchStats?.batches?.map((batch) => (
                  <SelectItem key={batch} value={batch.toString()}>
                    Batch {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-mode-filter">
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => exportApplicationsToCSV(applications)}
              variant="outline"
              size="sm"
              disabled={applications.length === 0}
              data-testid="button-export-applications"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm mt-1">
              {statusFilter !== "all" || batchFilter !== "all"
                ? "Try adjusting your filters"
                : "Applications will appear here once uploaded by admin"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Mode</TableHead>
                  <TableHead className="hidden sm:table-cell">Batch</TableHead>
                  <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} data-testid={`row-application-${app.id}`}>
                    <TableCell className="font-medium">{app.jobTitle}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[app.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={app.submissionMode === "automated" ? "default" : "secondary"} data-testid={`badge-mode-${app.id}`}>
                        {app.submissionMode === "automated" ? "Automated" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">Batch {app.batchNumber}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(app.appliedDate), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
