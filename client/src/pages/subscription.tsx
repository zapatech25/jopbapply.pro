import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Crown, AlertCircle, Calendar, CreditCard, RefreshCw, X, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription, Plan, UserPlan } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SubscriptionDetail = Subscription & {
  plan: Plan;
  userPlan: UserPlan;
};

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDetail | null>(null);

  const { data: subscriptions, isLoading } = useQuery<SubscriptionDetail[]>({
    queryKey: ["/api/subscription/details"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (userPlanId: string) => {
      const res = await apiRequest("POST", "/api/subscription/cancel", { userPlanId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/plans"] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
      });
      setCancelDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Cancellation failed",
        description: "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (userPlanId: string) => {
      const res = await apiRequest("POST", "/api/subscription/reactivate", { userPlanId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/plans"] });
      toast({
        title: "Subscription reactivated",
        description: "Your subscription will automatically renew at the end of the current period.",
      });
    },
    onError: () => {
      toast({
        title: "Reactivation failed",
        description: "There was an error reactivating your subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCancel = (subscription: SubscriptionDetail) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedSubscription?.userPlan) {
      cancelMutation.mutate(selectedSubscription.userPlan.id);
    }
  };

  const handleReactivate = (subscription: SubscriptionDetail) => {
    if (subscription.userPlan) {
      reactivateMutation.mutate(subscription.userPlan.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge data-testid={`badge-status-active`} variant="default"><Check className="w-3 h-3 mr-1" />Active</Badge>;
      case "past_due":
        return <Badge data-testid={`badge-status-past_due`} variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Past Due</Badge>;
      case "canceled":
        return <Badge data-testid={`badge-status-canceled`} variant="secondary"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`} variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter(s => s.status === "active" && !s.cancelAtPeriodEnd) || [];
  const cancelledSubscriptions = subscriptions?.filter(s => s.cancelAtPeriodEnd || s.status === "canceled") || [];
  const pastDueSubscriptions = subscriptions?.filter(s => s.status === "past_due") || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-subscriptions">My Subscriptions</h1>
        </div>
        <p className="text-secondary">Manage your active subscriptions and billing</p>
      </div>

      {!subscriptions || subscriptions.length === 0 ? (
        <Card data-testid="card-no-subscriptions">
          <CardContent className="py-12">
            <div className="text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
              <p className="text-secondary mb-6">Subscribe to a plan to get recurring credits for job applications.</p>
              <Button data-testid="button-view-pricing" asChild>
                <a href="/pricing">View Pricing Plans</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pastDueSubscriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Payment Required
              </h2>
              <div className="grid gap-4">
                {pastDueSubscriptions.map((sub) => (
                  <Card key={sub.id} className="border-destructive" data-testid={`card-subscription-${sub.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2" data-testid={`text-plan-name-${sub.id}`}>
                            {sub.plan?.name || "Unknown Plan"}
                          </CardTitle>
                          <CardDescription data-testid={`text-plan-sku-${sub.id}`}>
                            {sub.plan?.sku} • {sub.plan?.billingPeriod}
                          </CardDescription>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Payment Failed</p>
                            <p className="text-sm text-secondary mt-1">
                              Your payment could not be processed. Please update your payment method to reactivate your subscription.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-tertiary">Next Retry</p>
                          <p className="font-medium" data-testid={`text-period-end-${sub.id}`}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {format(new Date(sub.currentPeriodEnd), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-tertiary">Credits Remaining</p>
                          <p className="font-medium" data-testid={`text-credits-${sub.id}`}>
                            {sub.userPlan?.creditsRemaining || 0} credits
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSubscriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
              <div className="grid gap-4">
                {activeSubscriptions.map((sub) => {
                  const plan = sub.plan;
                  const userPlan = sub.userPlan;
                  const creditsUsed = plan ? plan.credits - (userPlan?.creditsRemaining || 0) : 0;
                  const creditsTotal = plan?.credits || 0;
                  const usagePercent = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

                  return (
                    <Card key={sub.id} data-testid={`card-subscription-${sub.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2" data-testid={`text-plan-name-${sub.id}`}>
                              {plan?.name || "Unknown Plan"}
                            </CardTitle>
                            <CardDescription data-testid={`text-plan-sku-${sub.id}`}>
                              {plan?.sku} • {plan?.billingPeriod}
                            </CardDescription>
                          </div>
                          {getStatusBadge(sub.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-tertiary">Amount</p>
                            <p className="font-medium text-lg" data-testid={`text-amount-${sub.id}`}>
                              <CreditCard className="w-4 h-4 inline mr-1" />
                              ${typeof sub.amount === 'string' ? parseFloat(sub.amount).toFixed(2) : Number(sub.amount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-tertiary">Next Billing Date</p>
                            <p className="font-medium" data-testid={`text-next-billing-${sub.id}`}>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {format(new Date(sub.currentPeriodEnd), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-tertiary">Credit Usage</span>
                            <span className="font-medium" data-testid={`text-credit-usage-${sub.id}`}>
                              {creditsUsed} / {creditsTotal} used
                            </span>
                          </div>
                          <Progress value={usagePercent} data-testid={`progress-credits-${sub.id}`} />
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-success" />
                          <span data-testid={`text-auto-renew-${sub.id}`}>
                            Auto-renewal enabled • Renews on {format(new Date(sub.currentPeriodEnd), "MMMM dd, yyyy")}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={() => handleCancel(sub)}
                          disabled={cancelMutation.isPending}
                          data-testid={`button-cancel-${sub.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {cancelledSubscriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cancelled Subscriptions</h2>
              <div className="grid gap-4">
                {cancelledSubscriptions.map((sub) => (
                  <Card key={sub.id} data-testid={`card-subscription-${sub.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2" data-testid={`text-plan-name-${sub.id}`}>
                            {sub.plan?.name || "Unknown Plan"}
                          </CardTitle>
                          <CardDescription data-testid={`text-plan-sku-${sub.id}`}>
                            {sub.plan?.sku} • {sub.plan?.billingPeriod}
                          </CardDescription>
                        </div>
                        {getStatusBadge("canceled")}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-secondary/30 rounded-md p-4">
                        <p className="text-sm">
                          Your subscription is cancelled and will end on{" "}
                          <span className="font-medium" data-testid={`text-cancellation-date-${sub.id}`}>
                            {format(new Date(sub.currentPeriodEnd), "MMMM dd, yyyy")}
                          </span>
                          . You can still use your remaining credits until then.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-tertiary">Credits Remaining</p>
                          <p className="font-medium" data-testid={`text-credits-${sub.id}`}>
                            {sub.userPlan?.creditsRemaining || 0} credits
                          </p>
                        </div>
                        <div>
                          <p className="text-tertiary">Access Until</p>
                          <p className="font-medium" data-testid={`text-access-until-${sub.id}`}>
                            {format(new Date(sub.currentPeriodEnd), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="default"
                        onClick={() => handleReactivate(sub)}
                        disabled={reactivateMutation.isPending}
                        data-testid={`button-reactivate-${sub.id}`}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {reactivateMutation.isPending ? "Reactivating..." : "Reactivate Subscription"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent data-testid="dialog-cancel-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of your current billing period on{" "}
              {selectedSubscription && format(new Date(selectedSubscription.currentPeriodEnd), "MMMM dd, yyyy")}.
              You'll continue to have access to your remaining credits until then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-dialog-cancel">Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} data-testid="button-cancel-dialog-confirm">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
