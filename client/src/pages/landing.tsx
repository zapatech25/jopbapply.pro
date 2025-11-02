import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Plan } from "@/components/PlanCard";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: allPlans = [] } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const topPlans = allPlans
    .filter((plan) => ["APPS_150", "APPS_300", "CV_RETOUCH"].includes(plan.sku))
    .map((plan) => ({
      ...plan,
      price: parseFloat(plan.price),
      isPopular: plan.sku === "APPS_150",
    }));

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <HeroSection />

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Choose Your Plan
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select the perfect plan for your job search journey. All plans include
                application tracking and professional support.
              </p>
            </div>

            {topPlans.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {topPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={(selectedPlan) => {
                      toast({
                        title: "Plan selected",
                        description: `${selectedPlan.name} plan selected!`,
                      });
                    }}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link href="/pricing">
                <Button size="lg" variant="outline" data-testid="button-viewallplans">
                  View All Plans
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="bg-gradient-to-r from-primary to-chart-2 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Job Search?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                Join thousands of job seekers who are landing their dream roles faster
                with JobApply.pro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" data-testid="button-cta-register">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    data-testid="button-cta-pricing"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
