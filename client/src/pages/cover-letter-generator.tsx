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
import { FileText, Loader2, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface CoverLetterResponse {
  coverLetter: string;
  artifactId: string;
}

const coverLetterSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  jobDescription: z.string().optional(),
  userCV: z.string().optional(),
});

type CoverLetterFormValues = z.infer<typeof coverLetterSchema>;

export default function CoverLetterGenerator() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      jobDescription: "",
      userCV: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const generateMutation = useMutation({
    mutationFn: async (data: CoverLetterFormValues) => {
      return await apiRequest("/api/ai/cover-letter", "POST", data);
    },
    onSuccess: (data: CoverLetterResponse) => {
      setResult(data.coverLetter);
      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate cover letter. Please try again.",
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

  const onSubmit = (data: CoverLetterFormValues) => {
    generateMutation.mutate(data);
  };

  const handleReset = () => {
    setResult(null);
    form.reset();
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Cover letter copied successfully!",
      });
      setTimeout(() => setCopied(false), 2000);
    }
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
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
              <p className="text-muted-foreground">
                Create professional, tailored cover letters in seconds
              </p>
            </div>
          </div>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Generate Cover Letter</CardTitle>
                <CardDescription>
                  Provide job details to create a personalized cover letter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-job-title">Job Title *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-job-title"
                              placeholder="e.g., Senior Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-company">Company *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-company"
                              placeholder="e.g., Tech Corp Inc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-job-description">Job Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-job-description"
                              placeholder="Paste the job description here for better personalization..."
                              className="min-h-[120px] resize-y text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Including the job description helps create a more targeted cover letter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userCV"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-user-cv">Your CV (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-user-cv"
                              placeholder="Paste your CV here for a more personalized letter..."
                              className="min-h-[120px] resize-y text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your CV helps highlight relevant experience in the cover letter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      data-testid="button-generate-cover-letter"
                      disabled={generateMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Cover Letter...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Cover Letter
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
                    <CardTitle data-testid="text-cover-letter-ready">Your Cover Letter is Ready</CardTitle>
                    <CardDescription>
                      Review and customize your generated cover letter
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    data-testid="button-generate-another"
                  >
                    Generate Another
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap leading-relaxed text-sm" data-testid="text-cover-letter-content">
                      {result}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={handleCopy}
                    variant="default"
                    data-testid="button-copy-cover-letter"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
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
