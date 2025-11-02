import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lock, Unlock, ShoppingCart, Check, DollarSign, Coins } from "lucide-react";
import type { Resource } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";

function ResourcesList() {
  const [category, setCategory] = useState<string | undefined>();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", category],
    queryFn: async () => {
      const url = category 
        ? `/api/resources?category=${category}` 
        : "/api/resources";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json();
    },
  });

  const { data: userResources } = useQuery({
    queryKey: ["/api/user/resources"],
    enabled: !!user,
  });

  const purchasedIds = new Set(
    userResources?.map((ur: any) => ur.resourceId) || []
  );

  const categories = [
    { value: undefined, label: "All Resources" },
    { value: "interview_tips", label: "Interview Tips" },
    { value: "cv_guides", label: "CV Guides" },
    { value: "job_search", label: "Job Search" },
    { value: "career_advice", label: "Career Advice" },
    { value: "templates", label: "Templates" },
    { value: "courses", label: "Courses" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} data-testid={`skeleton-resource-${i}`}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const free = resources?.filter((r) => !r.isPaid) || [];
  const paid = resources?.filter((r) => r.isPaid) || [];
  const filteredResources = category 
    ? resources?.filter((r) => r.category === category) 
    : resources;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.label}
            variant={category === cat.value ? "default" : "outline"}
            onClick={() => setCategory(cat.value)}
            data-testid={`filter-${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-resources">
            All ({filteredResources?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="free" data-testid="tab-free-resources">
            Free ({free.length})
          </TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid-resources">
            Paid ({paid.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ResourceGrid 
            resources={filteredResources} 
            purchasedIds={purchasedIds}
          />
        </TabsContent>

        <TabsContent value="free" className="mt-6">
          <ResourceGrid 
            resources={category ? free.filter(r => r.category === category) : free} 
            purchasedIds={purchasedIds}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <ResourceGrid 
            resources={category ? paid.filter(r => r.category === category) : paid} 
            purchasedIds={purchasedIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceGrid({ resources, purchasedIds }: { resources?: Resource[]; purchasedIds: Set<string> }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">No resources found</p>
        <p className="text-sm text-muted-foreground">Try a different filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          isPurchased={purchasedIds.has(resource.id)}
        />
      ))}
    </div>
  );
}

function ResourceCard({ resource, isPurchased }: { resource: Resource; isPurchased: boolean }) {
  return (
    <Card className="flex flex-col" data-testid={`card-resource-${resource.slug}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
          {resource.featured && (
            <Badge variant="default" data-testid="badge-featured">Featured</Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1">
          {resource.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {resource.isPaid ? (
            <>
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                {resource.price && (
                  <span className="font-medium">£{resource.price}</span>
                )}
                {resource.credits && (
                  <span className="text-muted-foreground ml-2">
                    {resource.credits} credits
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Free</span>
            </>
          )}
        </div>
        <Link href={`/resources/${resource.slug}`}>
          <Button
            variant={isPurchased ? "outline" : "default"}
            size="sm"
            data-testid={`button-view-${resource.slug}`}
          >
            {isPurchased ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                View
              </>
            ) : (
              "View Details"
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function ResourceDetail() {
  const [, params] = useRoute("/resources/:slug");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: resource, isLoading } = useQuery<Resource>({
    queryKey: ["/api/resources", params?.slug],
    queryFn: async () => {
      const res = await fetch(`/api/resources/${params?.slug}`);
      if (!res.ok) throw new Error("Resource not found");
      return res.json();
    },
    enabled: !!params?.slug,
  });

  const { data: userResources } = useQuery({
    queryKey: ["/api/user/resources"],
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (method: string) => {
      if (!resource) throw new Error("No resource");
      return apiRequest("POST", `/api/resources/${resource.id}/purchase`, {
        purchaseMethod: method,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/plans"] });
      toast({
        title: "Resource purchased!",
        description: "You now have access to this resource.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: error.message || "Failed to purchase resource",
      });
    },
  });

  const isPurchased = userResources?.some((ur: any) => ur.resourceId === resource?.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">Resource not found</p>
        <Link href="/resources">
          <Button className="mt-4">Back to Resources</Button>
        </Link>
      </div>
    );
  }

  const canView = !resource.isPaid || isPurchased;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/resources">
          <Button variant="ghost" size="sm" data-testid="button-back-to-resources">
            ← Back to Resources
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2" data-testid="text-resource-title">
                {resource.title}
              </CardTitle>
              <CardDescription className="text-base">
                {resource.description}
              </CardDescription>
            </div>
            {resource.featured && <Badge variant="default">Featured</Badge>}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {resource.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {canView ? (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: resource.content.replace(/\n/g, "<br/>") }}
              data-testid="content-resource-full"
            />
          ) : (
            <div className="bg-muted p-8 rounded-lg text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">This is a premium resource</p>
              <p className="text-muted-foreground mb-6">
                Purchase to unlock full access
              </p>

              {!user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to purchase this resource
                  </p>
                  <Link href="/login">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {resource.credits && (
                    <Button
                      onClick={() => purchaseMutation.mutate("credits")}
                      disabled={purchaseMutation.isPending === true}
                      data-testid="button-purchase-credits"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      {purchaseMutation.isPending ? "Processing..." : `Purchase for ${resource.credits} Credits`}
                    </Button>
                  )}
                  {resource.price && (
                    <Button
                      onClick={() => purchaseMutation.mutate("payment")}
                      disabled={purchaseMutation.isPending === true}
                      variant="outline"
                      data-testid="button-purchase-payment"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {purchaseMutation.isPending ? "Processing..." : `Purchase for £${resource.price}`}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {canView && isPurchased && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">You own this resource</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Resources() {
  const [, params] = useRoute("/resources/:slug");
  const { user, logout } = useAuth();
  const { toast } = useToast();

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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-resources">
              Career Resources
            </h1>
            <p className="text-lg text-muted-foreground">
              Guides, tips, and tools to accelerate your job search
            </p>
          </div>

          {params?.slug ? <ResourceDetail /> : <ResourcesList />}
        </div>
      </main>
    </div>
  );
}
