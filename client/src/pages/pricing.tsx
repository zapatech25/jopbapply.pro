import { useState } from "react";
import Navigation from "@/components/Navigation";
import PlanCard from "@/components/PlanCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Plan } from "@/components/PlanCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function Pricing() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/promo-code/validate', { code });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.valid) {
        setAppliedPromoCode(data.promoCode);
        toast({
          title: "Promo code applied",
          description: `${data.promoCode.discountType === 'percentage' ? data.promoCode.discountValue + '%' : '$' + data.promoCode.discountValue} discount will be applied at checkout.`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: data.reason || "This promo code is not valid.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate promo code.",
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const response = await apiRequest('POST', '/api/payment/create-checkout-session', { 
        planId, 
        promoCode: appliedPromoCode?.code 
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markPopular = (planList: Plan[]) => {
    return planList.map((plan) => ({
      ...plan,
      price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
      isPopular: plan.sku === "APPS_150",
    }));
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }
    validatePromoMutation.mutate(promoCode.trim().toUpperCase());
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to purchase a plan.",
      });
      return;
    }
    
    checkoutMutation.mutate({ planId: plan.id });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your job search needs. Every 150 applications
              includes 7 calendar days of processing time.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <Label htmlFor="promo-code" className="text-sm font-medium mb-2 block">
              Have a promo code?
            </Label>
            <div className="flex gap-2">
              <Input
                id="promo-code"
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyPromoCode();
                  }
                }}
                data-testid="input-promo-code"
                className="flex-1"
              />
              <Button
                onClick={handleApplyPromoCode}
                disabled={validatePromoMutation.isPending}
                data-testid="button-apply-promo"
              >
                {validatePromoMutation.isPending ? "Validating..." : "Apply"}
              </Button>
            </div>
            {appliedPromoCode && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" data-testid="badge-promo-applied">
                  {appliedPromoCode.code} - 
                  {appliedPromoCode.discountType === 'percentage' 
                    ? ` ${appliedPromoCode.discountValue}% off` 
                    : ` $${appliedPromoCode.discountValue} off`}
                </Badge>
                <button
                  onClick={() => {
                    setAppliedPromoCode(null);
                    setPromoCode('');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  data-testid="button-remove-promo"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {markPopular(plans).map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">How do application credits work?</h3>
                <p className="text-muted-foreground">
                  Each credit allows you to submit one job application through our
                  platform. Credits never expire and can be used at your own pace.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What's the processing time?</h3>
                <p className="text-muted-foreground">
                  Every 150 application credits includes 7 calendar days of processing
                  time. Larger plans offer proportionally more time.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Can I upgrade my plan later?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade to a larger plan at any time. Your existing
                  credits will be preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
