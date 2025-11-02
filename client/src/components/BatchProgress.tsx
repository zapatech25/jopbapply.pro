import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserPlan, Plan } from "@shared/schema";

export default function BatchProgress() {
  const { data: userPlans = [] } = useQuery<(UserPlan & { plan: Plan })[]>({
    queryKey: ["/api/user/plans"],
  });

  const { data: batchStats } = useQuery<{ totalApplications: number; batches: number[] }>({
    queryKey: ["/api/user/batches"],
  });

  const totalCredits = userPlans.reduce((sum, up) => sum + (up.plan?.credits || 0), 0);
  const remainingCredits = userPlans.reduce((sum, up) => sum + up.creditsRemaining, 0);
  const usedCredits = totalCredits - remainingCredits;

  const creditsPerBatch = 150;
  const currentBatch = batchStats?.batches?.[batchStats.batches.length - 1] || 0;
  const applicationsInCurrentBatch = batchStats?.totalApplications
    ? batchStats.totalApplications - (currentBatch - 1) * creditsPerBatch
    : 0;

  const daysPerBatch = 7;
  const expectedDays = Math.ceil(usedCredits / creditsPerBatch) * daysPerBatch;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-remaining-credits">
            {remainingCredits}
          </div>
          <p className="text-xs text-muted-foreground">
            {usedCredits} of {totalCredits} credits used
          </p>
          <Progress value={(usedCredits / totalCredits) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-applications">
            {batchStats?.totalApplications || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {batchStats?.batches?.length || 0} batch
            {(batchStats?.batches?.length || 0) !== 1 ? "es" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-processing-days">
            {expectedDays} days
          </div>
          <p className="text-xs text-muted-foreground">
            ~{daysPerBatch} days per {creditsPerBatch} applications
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
