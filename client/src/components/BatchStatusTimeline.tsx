import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { ApplicationBatch } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function BatchStatusTimeline() {
  const { data: batches, isLoading } = useQuery<ApplicationBatch[]>({
    queryKey: ["/api/user/batches"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch Status</CardTitle>
          <CardDescription>Track your application batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading batches...</div>
        </CardContent>
      </Card>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch Status</CardTitle>
          <CardDescription>Track your application batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No batches yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Timeline</CardTitle>
        <CardDescription>Track the status of your application batches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover-elevate active-elevate-2" data-testid={`card-batch-${batch.batchNumber}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 rounded-lg p-2 mt-1">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold" data-testid={`text-batch-number-${batch.batchNumber}`}>
                          Batch {batch.batchNumber}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={statusColors[batch.status as keyof typeof statusColors]}
                          data-testid={`badge-status-${batch.batchNumber}`}
                        >
                          {statusLabels[batch.status as keyof typeof statusLabels]}
                        </Badge>
                        {batch.submissionMode === "automated" && (
                          <Badge variant="secondary" data-testid={`badge-mode-${batch.batchNumber}`}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Automated
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div data-testid={`text-batch-apps-${batch.batchNumber}`}>
                          {batch.totalApplications} application{batch.totalApplications !== 1 ? "s" : ""}
                        </div>
                        {batch.startedAt && (
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            Started: {format(new Date(batch.startedAt), "MMM d, yyyy h:mm a")}
                          </div>
                        )}
                        {batch.completedAt && (
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            Completed: {format(new Date(batch.completedAt), "MMM d, yyyy h:mm a")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
