import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, FileText, CreditCard, TrendingUp, Target, Briefcase } from "lucide-react";

interface AdminAnalytics {
  totalUsers: number;
  totalApplications: number;
  totalCreditsDistributed: number;
  totalCreditsUsed: number;
  platformSuccessRate: number;
  userActivity: {
    date: string;
    newUsers: number;
    applications: number;
  }[];
  batchPerformance: {
    totalBatches: number;
    avgApplicationsPerBatch: number;
  };
}

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery<AdminAnalytics>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const activityData = analytics.userActivity.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.newUsers,
    applications: item.applications,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Platform Analytics</h2>
        <p className="text-muted-foreground">Overview of platform performance and user activity</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card data-testid="card-admin-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-total-users">
              {analytics.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-total-applications">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-total-applications">
              {analytics.totalApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform-wide submissions
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-success-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Platform Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-success-rate">
              {analytics.platformSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications to offers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-credits-distributed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Credits Distributed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-credits-distributed">
              {analytics.totalCreditsDistributed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total available credits
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-credits-used">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-credits-used">
              {analytics.totalCreditsUsed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total applications sent
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-batch-performance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Avg Batch Size</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-avg-batch-size">
              {analytics.batchPerformance.avgApplicationsPerBatch.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.batchPerformance.totalBatches} total batches
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-admin-activity-timeline">
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>User registrations and application submissions over time</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.userActivity.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No activity data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                  name="New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
