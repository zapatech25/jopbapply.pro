import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Users, CreditCard, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

type FinancialMetrics = {
  totalRevenue: number;
  thisMonthRevenue: number;
  activeSubscriptions: number;
  mrr: number;
  revenueData: Array<{ date: string; amount: number }>;
};

export default function AdminFinancialDashboard() {
  const { data: metrics, isLoading } = useQuery<FinancialMetrics>({
    queryKey: ["/api/admin/financial-metrics"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  const parseAmount = (amount: string | number): number => {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
  };

  const totalRevenue = metrics ? parseAmount(metrics.totalRevenue) : 0;
  const thisMonthRevenue = metrics ? parseAmount(metrics.thisMonthRevenue) : 0;
  const mrr = metrics ? parseAmount(metrics.mrr) : 0;

  const chartData = metrics?.revenueData.map(d => ({
    date: format(new Date(d.date), "MMM dd"),
    amount: parseAmount(d.amount),
  })) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-financial-dashboard">Financial Dashboard</h1>
        </div>
        <p className="text-secondary">Overview of platform revenue and subscription metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-tertiary mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card data-testid="card-month-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-revenue">
              ${thisMonthRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-tertiary mt-1">
              {format(new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-subscriptions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-subscriptions">
              {metrics?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-tertiary mt-1">Currently subscribed users</p>
          </CardContent>
        </Card>

        <Card data-testid="card-mrr">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <CreditCard className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mrr">
              ${mrr.toFixed(2)}
            </div>
            <p className="text-xs text-tertiary mt-1">Monthly recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-revenue-chart">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-center">
              <div>
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm text-secondary">No revenue data available yet</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full" data-testid="chart-revenue">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-revenue-breakdown">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Summary of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-lg font-bold" data-testid="text-breakdown-total">
                  ${totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-lg font-bold" data-testid="text-breakdown-month">
                  ${thisMonthRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Recurring</span>
                <span className="text-lg font-bold text-success" data-testid="text-breakdown-mrr">
                  ${mrr.toFixed(2)}/mo
                </span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tertiary">Active Subscriptions</span>
                  <span className="font-medium" data-testid="text-breakdown-subs">
                    {metrics?.activeSubscriptions || 0} users
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-growth-indicators">
          <CardHeader>
            <CardTitle>Growth Indicators</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Revenue Per User</span>
                <span className="text-lg font-bold" data-testid="text-arpu">
                  ${metrics?.activeSubscriptions && metrics.activeSubscriptions > 0
                    ? (mrr / metrics.activeSubscriptions).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue Growth Rate</span>
                <span className="text-lg font-bold text-success" data-testid="text-growth-rate">
                  {thisMonthRevenue > 0 && totalRevenue > thisMonthRevenue
                    ? ((thisMonthRevenue / (totalRevenue - thisMonthRevenue)) * 100).toFixed(1)
                    : "0.0"}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction Count</span>
                <span className="text-lg font-bold" data-testid="text-transaction-count">
                  {chartData.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
