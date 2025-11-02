import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Receipt, Download, CreditCard, RefreshCw, DollarSign, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BillingHistoryPage() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge data-testid={`badge-status-completed`} variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge data-testid={`badge-status-failed`} variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge data-testid={`badge-status-pending`} variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "refunded":
        return <Badge data-testid={`badge-status-refunded`} variant="secondary"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`} variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge data-testid={`badge-type-purchase`} variant="outline">Purchase</Badge>;
      case "subscription":
        return <Badge data-testid={`badge-type-subscription`} variant="outline">Subscription</Badge>;
      case "renewal":
        return <Badge data-testid={`badge-type-renewal`} variant="outline">Renewal</Badge>;
      case "refund":
        return <Badge data-testid={`badge-type-refund`} variant="outline">Refund</Badge>;
      default:
        return <Badge data-testid={`badge-type-${type}`} variant="outline">{type}</Badge>;
    }
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading billing history...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = transactions?.reduce((sum, t) => {
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : Number(t.amount);
    return t.status === 'completed' ? sum + amount : sum;
  }, 0) || 0;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const thisMonthSpent = transactions?.reduce((sum, t) => {
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : Number(t.amount);
    const createdDate = new Date(t.createdAt);
    return t.status === 'completed' && createdDate >= thisMonthStart ? sum + amount : sum;
  }, 0) || 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-billing-history">Billing History</h1>
        </div>
        <p className="text-secondary">View all your transactions and download receipts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card data-testid="card-total-spent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-spent">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-tertiary mt-1">All-time total</p>
          </CardContent>
        </Card>

        <Card data-testid="card-month-spent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-spent">${thisMonthSpent.toFixed(2)}</div>
            <p className="text-xs text-tertiary mt-1">{format(thisMonthStart, "MMMM yyyy")}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-transaction-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-transaction-count">{transactions?.length || 0}</div>
            <p className="text-xs text-tertiary mt-1">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {!transactions || transactions.length === 0 ? (
        <Card data-testid="card-no-transactions">
          <CardContent className="py-12">
            <div className="text-center">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-secondary mb-6">Your billing history will appear here once you make a purchase.</p>
              <Button data-testid="button-view-pricing" asChild>
                <a href="/pricing">View Pricing Plans</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="card-transactions-table">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Detailed list of all your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell className="font-medium" data-testid={`text-date-${transaction.id}`}>
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                        <div className="text-xs text-tertiary">
                          {format(new Date(transaction.createdAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-description-${transaction.id}`}>
                        {transaction.description || "Payment"}
                        {transaction.discountAmount && (
                          <div className="text-xs text-success mt-1">
                            Discount: ${formatAmount(transaction.discountAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${transaction.id}`}>
                        {getTypeBadge(transaction.type)}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${transaction.id}`}>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`text-amount-${transaction.id}`}>
                        ${formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.stripeInvoiceId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://dashboard.stripe.com/invoices/${transaction.stripeInvoiceId}`, '_blank')}
                            data-testid={`button-download-${transaction.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
