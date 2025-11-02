import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { ApplicationBatch, User } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

type BatchWithUser = ApplicationBatch & { user: User };

export function BatchControlPanel() {
  const { toast } = useToast();
  const { data: batches, isLoading } = useQuery<BatchWithUser[]>({
    queryKey: ["/api/admin/batches"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin/batches/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/batches"] });
      toast({ title: "Success", description: "Batch status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Card><CardContent className="pt-6"><div className="text-muted-foreground">Loading batches...</div></CardContent></Card>;
  }

  if (!batches || batches.length === 0) {
    return <Card><CardContent className="pt-6"><div className="text-muted-foreground">No batches found</div></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Management</CardTitle>
        <CardDescription>Control batch processing status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Batch {batch.batchNumber}</h4>
                      <Badge variant="outline" className={statusColors[batch.status as keyof typeof statusColors]}>{batch.status}</Badge>
                      <Badge variant="secondary">{batch.totalApplications} apps</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>User: {batch.user.email}</div>
                      {batch.startedAt && <div>Started: {format(new Date(batch.startedAt), "MMM d, yyyy h:mm a")}</div>}
                      {batch.completedAt && <div>Completed: {format(new Date(batch.completedAt), "MMM d, yyyy h:mm a")}</div>}
                    </div>
                  </div>
                  <Select
                    value={batch.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: batch.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-full sm:w-40" data-testid={`select-batch-status-${batch.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
