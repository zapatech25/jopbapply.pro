import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Mail, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface JobRole {
  id: string;
  role: string;
  roleType: string;
  industry: string;
  keySkills: string[];
}

interface UserJobPreferences {
  id: string;
  userId: string;
  selectedRoleIds: string[];
  preferredEmail: string;
  interviewPhone?: string;
  submittedAt: string;
}

export default function JobPreferencesPage() {
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [preferredEmail, setPreferredEmail] = useState("");
  const [interviewPhone, setInterviewPhone] = useState("");

  const { data: jobRoles = [], isLoading: rolesLoading } = useQuery<JobRole[]>({
    queryKey: ["/api/job-roles"],
  });

  const { data: existingPreferences } = useQuery<UserJobPreferences>({
    queryKey: ["/api/user/job-preferences"],
  });

  useEffect(() => {
    if (existingPreferences) {
      setSelectedRoles(existingPreferences.selectedRoleIds || []);
      setPreferredEmail(existingPreferences.preferredEmail || "");
      setInterviewPhone(existingPreferences.interviewPhone || "");
    }
  }, [existingPreferences]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: { selectedRoleIds: string[]; preferredEmail: string; interviewPhone?: string }) => {
      const response = await apiRequest('POST', '/api/user/job-preferences', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/job-preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your job preferences have been saved successfully. Our team will review your application.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Maximum roles selected",
            description: "You can select up to 5 job roles",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      toast({
        title: "No roles selected",
        description: "Please select at least one job role",
        variant: "destructive",
      });
      return;
    }

    if (!preferredEmail || !preferredEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address",
        variant: "destructive",
      });
      return;
    }

    savePreferencesMutation.mutate({
      selectedRoleIds: selectedRoles,
      preferredEmail,
      interviewPhone: interviewPhone || undefined,
    });
  };

  const groupedRoles = jobRoles.reduce((acc, role) => {
    const industry = role.industry || "Other";
    if (!acc[industry]) {
      acc[industry] = [];
    }
    acc[industry].push(role);
    return acc;
  }, {} as Record<string, JobRole[]>);

  return (
    <div className="container max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="heading-job-preferences">Job Preferences</h1>
        <p className="text-secondary">
          Select up to 5 job roles you're interested in applying for
        </p>
      </div>

      {existingPreferences && (
        <Alert className="mb-6 bg-primary/5 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <p className="font-semibold">Preferences submitted</p>
            <p className="text-sm mt-1">
              Your job preferences have been submitted and are pending admin approval. You can update them below if needed.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Roles Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Select Job Roles
              </CardTitle>
              <CardDescription>
                Choose up to 5 roles that match your career goals ({selectedRoles.length}/5 selected)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {rolesLoading ? (
                <p className="text-center text-secondary py-8">Loading job roles...</p>
              ) : Object.keys(groupedRoles).length === 0 ? (
                <p className="text-center text-secondary py-8">No job roles available</p>
              ) : (
                Object.entries(groupedRoles).map(([industry, roles]) => (
                  <div key={industry} className="space-y-3">
                    <h3 className="font-semibold text-sm text-secondary uppercase tracking-wide">
                      {industry}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className={`
                            flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer
                            ${selectedRoles.includes(role.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover-elevate'
                            }
                          `}
                          onClick={() => handleRoleToggle(role.id)}
                          data-testid={`role-option-${role.id}`}
                        >
                          <Checkbox
                            checked={selectedRoles.includes(role.id)}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{role.role}</p>
                            <p className="text-xs text-secondary mt-0.5">{role.roleType}</p>
                            {role.keySkills && role.keySkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {role.keySkills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {role.keySkills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{role.keySkills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Where should employers reach you?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Preferred Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="preferredEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={preferredEmail}
                    onChange={(e) => setPreferredEmail(e.target.value)}
                    required
                    data-testid="input-preferred-email"
                  />
                  <p className="text-xs text-secondary">
                    This email will be used for job applications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interviewPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Interview Phone (Optional)
                  </Label>
                  <Input
                    id="interviewPhone"
                    type="tel"
                    placeholder="+447123456789"
                    value={interviewPhone}
                    onChange={(e) => setInterviewPhone(e.target.value)}
                    data-testid="input-interview-phone"
                  />
                  <p className="text-xs text-secondary">
                    Include country code (e.g., +44 for UK)
                  </p>
                </div>

                {selectedRoles.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <p className="font-semibold mb-1">Before you submit:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Make sure you've uploaded your CV</li>
                        <li>Double-check your email is correct</li>
                        <li>Selected roles match your experience</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={selectedRoles.length === 0 || savePreferencesMutation.isPending}
                  data-testid="button-save-preferences"
                >
                  {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>

                {selectedRoles.length > 0 && (
                  <p className="text-xs text-center text-secondary">
                    {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {selectedRoles.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Selected Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-selected-roles">
                  {selectedRoles.map((roleId) => {
                    const role = jobRoles.find(r => r.id === roleId);
                    return role ? (
                      <li key={roleId} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{role.role}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
