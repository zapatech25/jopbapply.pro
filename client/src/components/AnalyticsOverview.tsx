import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Target, CreditCard, FileText, Download } from "lucide-react";
import { exportAnalyticsToCSV } from "@/lib/csvExport";

interface StatusBreakdown {
  status: string;
  count: number;
}

interface TimelineData {
  date: string;
  count: number;
}

interface UserAnalytics {
  totalApplications: number;
  statusBreakdown: StatusBreakdown[];
  applicationTimeline: TimelineData[];
  creditsUsed: number;
  creditsRemaining: number;
  successRate: number;
  batchStats: any[];
}

const STATUS_COLORS: Record<string, string> = {
  applied: "hsl(var(--chart-1))",
  in_review: "hsl(var(--chart-2))",
  interviewing: "hsl(var(--chart-3))",
  offer: "hsl(var(--chart-4))",
  rejected: "hsl(var(--chart-5))",
};

const formatStatusLabel = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export default function AnalyticsOverview() {
  const { data: analytics, isLoading } = useQuery<UserAnalytics>({
    queryKey: ["/api/user/analytics"],
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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
    );
  }

  if (!analytics) return null;

  const pieData = analytics.statusBreakdown.map(item => ({
    name: formatStatusLabel(item.status),
    value: item.count,
    fill: STATUS_COLORS[item.status] || "hsl(var(--muted))",
  }));

  const timelineData = analytics.applicationTimeline.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    applications: item.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analytics Overview</h2>
          <p className="text-muted-foreground">Track your application performance and success metrics</p>
        </div>
        <Button 
          onClick={() => exportAnalyticsToCSV(analytics)} 
          variant="outline"
          data-testid="button-export-analytics"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-applications">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-applications">
              {analytics.totalApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {analytics.batchStats.length} batches
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-success-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {analytics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications to offers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-credits-remaining">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-credits-remaining">
              {analytics.creditsRemaining}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.creditsUsed} credits used
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-credits-used">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-credits-used">
              {analytics.creditsUsed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-status-breakdown">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.totalApplications === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No applications yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-application-timeline">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Applications submitted over time</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.totalApplications === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No applications yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
