import { useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  batchCompletionAlerts: boolean;
  statusUpdateAlerts: boolean;
}

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: preferences, isLoading: prefsLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/user/notification-preferences"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user?.phone) {
      phoneForm.reset({ phone: user.phone });
    }
  }, [user, phoneForm]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return await apiRequest("/api/user/notification-preferences", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notification-preferences"] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async (data: PhoneFormValues) => {
      return await apiRequest("/api/user/phone", "PUT", { phone: data.phone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Phone updated",
        description: "Your phone number has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update phone number. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const onPhoneSubmit = (data: PhoneFormValues) => {
    updatePhoneMutation.mutate(data);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  if (authLoading || prefsLoading) {
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
        <div className="container mx-auto max-w-3xl px-4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
            <p className="text-muted-foreground">
              Manage how you receive updates about your job applications
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="email-enabled" data-testid="label-email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-enabled"
                  data-testid="switch-email-enabled"
                  checked={preferences?.emailEnabled ?? false}
                  onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sms-enabled" data-testid="label-sms-notifications">
                      SMS Notifications
                    </Label>
                    <Badge variant="secondary" data-testid="badge-coming-soon">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via text message
                  </p>
                </div>
                <Switch
                  id="sms-enabled"
                  data-testid="switch-sms-enabled"
                  checked={preferences?.smsEnabled ?? false}
                  onCheckedChange={(checked) => handleToggle("smsEnabled", checked)}
                  disabled={true}
                />
              </div>

              <div className="pt-4 border-t">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-phone-number">Phone Number (for future SMS)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-phone"
                              placeholder="+1234567890"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Save your phone number for when SMS notifications become available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      data-testid="button-save-phone"
                      disabled={updatePhoneMutation.isPending}
                    >
                      {updatePhoneMutation.isPending ? "Saving..." : "Save Phone Number"}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>
                Choose which events trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="batch-completion" data-testid="label-batch-completion">
                    Batch Completion
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when an application batch is fully processed
                  </p>
                </div>
                <Switch
                  id="batch-completion"
                  data-testid="switch-batch-completion"
                  checked={preferences?.batchCompletionAlerts ?? false}
                  onCheckedChange={(checked) => handleToggle("batchCompletionAlerts", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="status-updates" data-testid="label-status-updates">
                    Status Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when an application status changes
                  </p>
                </div>
                <Switch
                  id="status-updates"
                  data-testid="switch-status-updates"
                  checked={preferences?.statusUpdateAlerts ?? false}
                  onCheckedChange={(checked) => handleToggle("statusUpdateAlerts", checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
