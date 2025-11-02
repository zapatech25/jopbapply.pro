import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, FileText, History, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIArtifact {
  id: string;
  userId: string;
  artifactType: string;
  content: {
    input?: any;
    output?: string;
    metadata?: any;
  };
  createdAt: string;
}

export default function AIHistory() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: artifacts = [], isLoading } = useQuery<AIArtifact[]>({
    queryKey: ["/api/ai/artifacts"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  const getTypeIcon = (artifactType: string) => {
    switch (artifactType) {
      case "cv_optimization":
        return <Sparkles className="h-5 w-5 text-primary" />;
      case "cover_letter":
        return <FileText className="h-5 w-5 text-chart-2" />;
      default:
        return <History className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (artifactType: string) => {
    switch (artifactType) {
      case "cv_optimization":
        return "CV Optimization";
      case "cover_letter":
        return "Cover Letter";
      default:
        return artifactType;
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (authLoading || isLoading) {
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
        <div className="container mx-auto max-w-5xl px-4 space-y-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">AI Assistant History</h1>
              <p className="text-muted-foreground">
                View all your AI-generated content and analysis
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your AI-Generated Content</CardTitle>
              <CardDescription>
                {artifacts.length} artifact{artifacts.length !== 1 ? "s" : ""} generated
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {artifacts.length === 0 ? (
                <div className="p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">No AI content yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use our AI tools to generate CV tips and cover letters
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/dashboard/cv-optimizer")}
                      data-testid="button-go-cv-optimizer"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      CV Optimizer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/dashboard/cover-letter-generator")}
                      data-testid="button-go-cover-letter"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Cover Letter Generator
                    </Button>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[700px]">
                  <div className="divide-y">
                    {artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="p-4 hover-elevate transition-colors"
                        data-testid={`artifact-${artifact.id}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">{getTypeIcon(artifact.artifactType)}</div>
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="secondary">
                                    {getTypeLabel(artifact.artifactType)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(artifact.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                                {artifact.content?.metadata && (
                                  <div className="flex flex-wrap gap-2 text-sm">
                                    {artifact.content.metadata.targetRole && (
                                      <span className="text-muted-foreground">
                                        Role: {artifact.content.metadata.targetRole}
                                      </span>
                                    )}
                                    {artifact.content.metadata.jobTitle && (
                                      <span className="text-muted-foreground">
                                        {artifact.content.metadata.jobTitle} at {artifact.content.metadata.company}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(artifact.id)}
                              data-testid={`button-toggle-${artifact.id}`}
                            >
                              {expandedId === artifact.id ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View
                                </>
                              )}
                            </Button>
                          </div>

                          {expandedId === artifact.id && (
                            <div className="mt-4 space-y-4">
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold mb-2">Generated Content:</h4>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                                    {artifact.content?.output || "No content available"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
