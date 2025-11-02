import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { AutomationJob } from "@shared/schema";

const statusColors = {
  queued: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function AutomationJobList() {
  const { data: jobs, isLoading } = useQuery<AutomationJob[]>({
    queryKey: ["/api/admin/automation/jobs"],
  });

  if (isLoading) {
    return <Card><CardContent className="pt-6"><div className="text-muted-foreground">Loading automation jobs...</div></CardContent></Card>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automation Jobs</CardTitle>
          <CardDescription>No automation jobs yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Automation jobs will appear here once created</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Jobs</CardTitle>
        <CardDescription>Monitor job board automation queue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover-elevate">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium capitalize">{job.provider} Job</h4>
                      <Badge variant="outline" className={statusColors[job.status as keyof typeof statusColors]}>{job.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Scheduled: {format(new Date(job.scheduledAt), "MMM d, yyyy h:mm a")}</div>
                      {job.executedAt && <div>Executed: {format(new Date(job.executedAt), "MMM d, yyyy h:mm a")}</div>}
                      {job.errorLog && <div className="text-red-600 dark:text-red-400">Error: {job.errorLog}</div>}
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
