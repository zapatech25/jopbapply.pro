import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface CVOptimizationResponse {
  tips: string;
  artifactId: string;
}

const cvFormSchema = z.object({
  currentCV: z.string().min(50, "CV content must be at least 50 characters"),
  targetRole: z.string().optional(),
  targetIndustry: z.string().optional(),
});

type CVFormValues = z.infer<typeof cvFormSchema>;

export default function CVOptimizer() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<CVFormValues>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: {
      currentCV: "",
      targetRole: "",
      targetIndustry: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const generateMutation = useMutation({
    mutationFn: async (data: CVFormValues) => {
      return await apiRequest("/api/ai/cv-optimization", "POST", data);
    },
    onSuccess: (data: CVOptimizationResponse) => {
      setResult(data.tips);
      toast({
        title: "Tips generated",
        description: "Your CV optimization tips are ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate tips. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  const onSubmit = (data: CVFormValues) => {
    generateMutation.mutate(data);
  };

  const handleReset = () => {
    setResult(null);
    form.reset();
  };

  if (authLoading) {
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
        <div className="container mx-auto max-w-4xl px-4 space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">CV Optimization Assistant</h1>
              <p className="text-muted-foreground">
                Get AI-powered tips to improve your CV and stand out
              </p>
            </div>
          </div>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your CV</CardTitle>
                <CardDescription>
                  Paste your CV content and optionally specify your target role to get personalized optimization tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="currentCV"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-cv-content">CV Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-cv-content"
                              placeholder="Paste your current CV content here..."
                              className="min-h-[200px] resize-y text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters required for analysis
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-target-role">Target Role (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-target-role"
                              placeholder="e.g., Senior Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the role you're targeting for more tailored advice
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetIndustry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-target-industry">Target Industry (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-target-industry"
                              placeholder="e.g., Technology, Healthcare, Finance"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the industry for industry-specific recommendations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      data-testid="button-generate-tips"
                      disabled={generateMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Tips...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Optimization Tips
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="default" data-testid="badge-optimization-complete">
                        Optimization Complete
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Review your personalized CV optimization tips
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    data-testid="button-analyze-another"
                  >
                    Analyze Another CV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4" data-testid="text-optimization-tips-title">
                    Optimization Tips
                  </h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap leading-relaxed text-sm" data-testid="text-optimization-tips">
                      {result}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setLocation("/dashboard/ai-history")}
                    variant="outline"
                    data-testid="button-view-ai-history"
                  >
                    View AI History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
