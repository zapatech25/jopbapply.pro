import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, FileText, Zap, Clock } from "lucide-react";

interface AutomationStats {
  totalApplications: number;
  automatedCount: number;
  manualCount: number;
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export function AutomationStats() {
  const { data: stats, isLoading } = useQuery<AutomationStats>({
    queryKey: ["/api/user/automation-stats"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const automationPercentage = stats.totalApplications > 0
    ? Math.round((stats.automatedCount / stats.totalApplications) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-applications">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-applications">
              {stats.totalApplications}
            </div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-automated-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-automated-count">
              {stats.automatedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {automationPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-manual-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-manual-count">
              {stats.manualCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {100 - automationPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-jobs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-jobs">
              {stats.processingJobs + stats.queuedJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.queuedJobs} queued, {stats.processingJobs} processing
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.totalApplications > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automation Progress</CardTitle>
            <CardDescription>
              Your application automation breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Automated Applications</span>
                <span className="font-medium">{stats.automatedCount} / {stats.totalApplications}</span>
              </div>
              <Progress value={automationPercentage} className="h-2" data-testid="progress-automation" />
            </div>

            {stats.totalJobs > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Completed Jobs</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-completed-jobs">
                    {stats.completedJobs}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Failed Jobs</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-failed-jobs">
                    {stats.failedJobs}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
