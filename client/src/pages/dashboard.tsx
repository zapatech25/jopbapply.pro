import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import Navigation from "@/components/Navigation";
import ApplicationsTable from "@/components/ApplicationsTable";
import BatchProgress from "@/components/BatchProgress";
import { BatchStatusTimeline } from "@/components/BatchStatusTimeline";
import { AutomationStats } from "@/components/AutomationStats";
import AnalyticsOverview from "@/components/AnalyticsOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UserPlan {
  id: string;
  userId: string;
  planId: string;
  creditsRemaining: number;
  purchasedAt: string;
  plan: {
    id: string;
    sku: string;
    name: string;
    credits: number;
  };
}

interface UserResource {
  id: string;
  userId: string;
  resourceId: string;
  purchaseMethod: string;
  creditsSpent: number | null;
  amountPaid: string | null;
  purchasedAt: string;
  resource: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    isPaid: boolean;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: userPlans = [], isLoading: plansLoading } = useQuery<UserPlan[]>({
    queryKey: ["/api/user/plans"],
    enabled: !!user,
  });

  const { data: userResources = [], isLoading: resourcesLoading } = useQuery<UserResource[]>({
    queryKey: ["/api/user/resources"],
    enabled: !!user,
  });

  const totalCredits = userPlans.reduce((sum, plan) => sum + plan.creditsRemaining, 0);
  const activePlansCount = userPlans.length;

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  if (authLoading || plansLoading || resourcesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your job applications and manage your credits
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/dashboard/cv-optimizer">
                <Button variant="outline" size="sm" data-testid="link-cv-optimizer">
                  CV Optimizer
                </Button>
              </Link>
              <Link href="/dashboard/cover-letter-generator">
                <Button variant="outline" size="sm" data-testid="link-cover-letter">
                  Cover Letter Generator
                </Button>
              </Link>
              <Link href="/dashboard/ai-history">
                <Button variant="outline" size="sm" data-testid="link-ai-history">
                  AI History
                </Button>
              </Link>
            </div>
          </div>

          <AnalyticsOverview />

          <BatchProgress />

          <AutomationStats />

          <div className="grid lg:grid-cols-2 gap-6">
            <ApplicationsTable />
            <BatchStatusTimeline />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Plans</CardTitle>
              <CardDescription>Active subscription plans and credits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active plans yet</p>
                  <p className="text-sm mt-2">Purchase a plan to get started</p>
                </div>
              ) : (
                userPlans.map((userPlan) => (
                  <div
                    key={userPlan.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    data-testid={`card-user-plan-${userPlan.id}`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {userPlan.plan.name} ({userPlan.plan.sku})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Purchased {new Date(userPlan.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{userPlan.creditsRemaining}</p>
                      <p className="text-sm text-muted-foreground">
                        of {userPlan.plan.credits} credits
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Resources</CardTitle>
              <CardDescription>Career resources and guides you've purchased</CardDescription>
            </CardHeader>
            <CardContent>
              {userResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No resources purchased yet</p>
                  <p className="text-sm mt-2">Browse our resources to enhance your job search</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userResources.map((userResource) => (
                    <Card
                      key={userResource.id}
                      className="hover-elevate"
                      data-testid={`card-user-resource-${userResource.resource.slug}`}
                    >
                      <CardHeader>
                        <div className="space-y-2">
                          <CardTitle className="text-lg line-clamp-2">
                            {userResource.resource.title}
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {userResource.resource.category.replace(/_/g, " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              data-testid={`badge-purchase-method-${userResource.purchaseMethod}`}
                            >
                              {userResource.purchaseMethod === "credits" && "Purchased with credits"}
                              {userResource.purchaseMethod === "payment" && "Paid"}
                              {userResource.purchaseMethod === "free" && "Free"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {userResource.resource.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Purchased {new Date(userResource.purchasedAt).toLocaleDateString()}
                          </p>
                          {userResource.purchaseMethod === "credits" && userResource.creditsSpent && (
                            <p className="text-xs text-muted-foreground">
                              {userResource.creditsSpent} credits spent
                            </p>
                          )}
                          {userResource.purchaseMethod === "payment" && userResource.amountPaid && (
                            <p className="text-xs text-muted-foreground">
                              £{userResource.amountPaid} paid
                            </p>
                          )}
                        </div>
                        <Link href={`/resources/${userResource.resource.slug}`}>
                          <Button
                            className="w-full"
                            data-testid={`button-view-resource-${userResource.resource.slug}`}
                          >
                            View Resource
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
