import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import AdminPlanForm from "@/components/AdminPlanForm";
import AdminCSVUpload from "@/components/AdminCSVUpload";
import { BatchControlPanel } from "@/components/BatchControlPanel";
import { AutomationJobList } from "@/components/AutomationJobList";
import AdminAnalytics from "@/components/AdminAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Plan } from "@/components/PlanCard";
import type { Resource, BlogPost } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation(user ? "/dashboard" : "/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
    enabled: !!user && user.role === "admin",
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/admin/resources"],
    enabled: !!user && user.role === "admin",
  });

  const { data: blogPosts = [], isLoading: blogPostsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
    enabled: !!user && user.role === "admin",
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: Partial<Plan>) => {
      return apiRequest("POST", "/api/admin/plans", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({
        title: "Plan created",
        description: "The plan has been created successfully.",
      });
      setShowForm(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create plan",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Plan> }) => {
      return apiRequest("PATCH", `/api/admin/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({
        title: "Plan updated",
        description: "The plan has been updated successfully.",
      });
      setShowForm(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update plan",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleSavePlan = (planData: Partial<Plan>) => {
    if (selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan.id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: Partial<Resource>) => {
      return apiRequest("POST", "/api/admin/resources", resourceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      toast({ title: "Resource created", description: "The resource has been created successfully." });
      setShowResourceForm(false);
      setSelectedResource(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to create resource", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Resource> }) => {
      return apiRequest("PATCH", `/api/admin/resources/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      toast({ title: "Resource updated", description: "The resource has been updated successfully." });
      setShowResourceForm(false);
      setSelectedResource(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update resource", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      toast({ title: "Resource deleted", description: "The resource has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete resource", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: async (blogData: Partial<BlogPost>) => {
      return apiRequest("POST", "/api/admin/blog", blogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post created", description: "The blog post has been created successfully." });
      setShowBlogForm(false);
      setSelectedBlogPost(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to create blog post", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogPost> }) => {
      return apiRequest("PATCH", `/api/admin/blog/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post updated", description: "The blog post has been updated successfully." });
      setShowBlogForm(false);
      setSelectedBlogPost(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update blog post", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Blog post deleted", description: "The blog post has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete blog post", description: error.message || "Something went wrong", variant: "destructive" });
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

  if (authLoading || plansLoading || resourcesLoading || blogPostsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Resource Form Component
  const ResourceForm = ({ resource, onSave, onCancel }: { 
    resource?: Resource; 
    onSave: (data: Partial<Resource>) => void; 
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      slug: resource?.slug || "",
      title: resource?.title || "",
      description: resource?.description || "",
      content: resource?.content || "",
      category: resource?.category || "interview_tips",
      isPaid: resource?.isPaid ?? false,
      price: resource?.price || "",
      credits: resource?.credits || 0,
      tags: resource?.tags?.join(", ") || "",
      featured: resource?.featured ?? false,
      active: resource?.active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        credits: formData.credits || null,
        price: formData.price || null,
      });
    };

    return (
      <Card data-testid="card-admin-resource-form">
        <CardHeader>
          <CardTitle>{resource ? "Edit Resource" : "Create New Resource"}</CardTitle>
          <CardDescription>{resource ? "Update resource details" : "Add a new resource"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required data-testid="input-resource-slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-resource-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required data-testid="input-resource-description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required data-testid="input-resource-content" rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="select-resource-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview_tips">Interview Tips</SelectItem>
                  <SelectItem value="cv_guides">CV Guides</SelectItem>
                  <SelectItem value="job_search">Job Search</SelectItem>
                  <SelectItem value="career_advice">Career Advice</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="isPaid">Paid Resource</Label>
              <Switch id="isPaid" checked={formData.isPaid} onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })} data-testid="switch-resource-isPaid" />
            </div>
            {formData.isPaid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£)</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} data-testid="input-resource-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input id="credits" type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })} data-testid="input-resource-credits" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="interview, tips, career" data-testid="input-resource-tags" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="featured">Featured</Label>
              <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} data-testid="switch-resource-featured" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="active">Active</Label>
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} data-testid="switch-resource-active" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" data-testid="button-save-resource">{resource ? "Update Resource" : "Create Resource"}</Button>
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-resource">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Blog Form Component
  const BlogForm = ({ blogPost, onSave, onCancel }: { 
    blogPost?: BlogPost; 
    onSave: (data: Partial<BlogPost>) => void; 
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      slug: blogPost?.slug || "",
      title: blogPost?.title || "",
      excerpt: blogPost?.excerpt || "",
      content: blogPost?.content || "",
      author: blogPost?.author || "JobApply Team",
      category: blogPost?.category || "success_stories",
      tags: blogPost?.tags?.join(", ") || "",
      featured: blogPost?.featured ?? false,
      published: blogPost?.published ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
    };

    return (
      <Card data-testid="card-admin-blog-form">
        <CardHeader>
          <CardTitle>{blogPost ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
          <CardDescription>{blogPost ? "Update blog post details" : "Add a new blog post"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required data-testid="input-blog-slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-blog-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} required data-testid="input-blog-excerpt" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required data-testid="input-blog-content" rows={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required data-testid="input-blog-author" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="select-blog-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success_stories">Success Stories</SelectItem>
                  <SelectItem value="industry_insights">Industry Insights</SelectItem>
                  <SelectItem value="job_market">Job Market</SelectItem>
                  <SelectItem value="career_tips">Career Tips</SelectItem>
                  <SelectItem value="platform_updates">Platform Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="career, tips, job search" data-testid="input-blog-tags" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="featured">Featured</Label>
              <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} data-testid="switch-blog-featured" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="published">Published</Label>
              <Switch id="published" checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} data-testid="switch-blog-published" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" data-testid="button-save-blog">{blogPost ? "Update Blog Post" : "Create Blog Post"}</Button>
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-blog">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage plans, resources, blog posts, and application tracking data
            </p>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList data-testid="tabs-admin">
              <TabsTrigger value="plans" data-testid="tab-plans">Plans</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
              <TabsTrigger value="blog" data-testid="tab-blog">Blog</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle>Manage Plans</CardTitle>
                          <CardDescription>Create, edit, and deactivate plans</CardDescription>
                        </div>
                        <Button size="sm" onClick={handleCreatePlan} data-testid="button-create-plan">
                          <Plus className="w-4 h-4 mr-2" />
                          New Plan
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plans.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No plans created yet</p>
                          <p className="text-sm mt-2">Create your first plan</p>
                        </div>
                      ) : (
                        plans.map((plan) => (
                          <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`card-admin-plan-${plan.sku}`}>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">{plan.name}</p>
                                <Badge variant="outline" className="font-mono text-xs">{plan.sku}</Badge>
                                {plan.active && <Badge className="bg-chart-2/10 text-chart-2">Active</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{plan.credits} credits • £{plan.price}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleEditPlan(plan)} data-testid={`button-edit-plan-${plan.sku}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                  <AdminCSVUpload />
                </div>
                <div className="space-y-6">
                  {showForm ? (
                    <AdminPlanForm plan={selectedPlan || undefined} onSave={handleSavePlan} onCancel={() => { setShowForm(false); setSelectedPlan(null); }} />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center text-muted-foreground">
                          <p className="text-lg font-medium mb-2">No plan selected</p>
                          <p className="text-sm">Select a plan to edit or create a new one</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <BatchControlPanel />
                <AutomationJobList />
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle>Manage Resources</CardTitle>
                        <CardDescription>Create, edit, and delete resources</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => { setSelectedResource(null); setShowResourceForm(true); }} data-testid="button-create-resource">
                        <Plus className="w-4 h-4 mr-2" />
                        New Resource
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resources.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No resources created yet</p>
                        <p className="text-sm mt-2">Create your first resource</p>
                      </div>
                    ) : (
                      resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`card-admin-resource-${resource.slug}`}>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{resource.title}</p>
                              {resource.isPaid && <Badge variant="outline">Paid</Badge>}
                              {resource.featured && <Badge className="bg-chart-3/10 text-chart-3">Featured</Badge>}
                              {resource.active && <Badge className="bg-chart-2/10 text-chart-2">Active</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.category.replace(/_/g, " ")}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedResource(resource); setShowResourceForm(true); }} data-testid={`button-edit-resource-${resource.slug}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteResourceMutation.mutate(resource.id)} data-testid={`button-delete-resource-${resource.slug}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <div>
                  {showResourceForm ? (
                    <ResourceForm 
                      resource={selectedResource || undefined} 
                      onSave={(data) => {
                        if (selectedResource) {
                          updateResourceMutation.mutate({ id: selectedResource.id, data });
                        } else {
                          createResourceMutation.mutate(data);
                        }
                      }} 
                      onCancel={() => { setShowResourceForm(false); setSelectedResource(null); }} 
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center text-muted-foreground">
                          <p className="text-lg font-medium mb-2">No resource selected</p>
                          <p className="text-sm">Select a resource to edit or create a new one</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blog" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle>Manage Blog Posts</CardTitle>
                        <CardDescription>Create, edit, and delete blog posts</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => { setSelectedBlogPost(null); setShowBlogForm(true); }} data-testid="button-create-blog">
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {blogPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No blog posts created yet</p>
                        <p className="text-sm mt-2">Create your first blog post</p>
                      </div>
                    ) : (
                      blogPosts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`card-admin-blog-${post.slug}`}>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{post.title}</p>
                              {post.featured && <Badge className="bg-chart-3/10 text-chart-3">Featured</Badge>}
                              {post.published && <Badge className="bg-chart-2/10 text-chart-2">Published</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{post.category.replace(/_/g, " ")} • {post.author}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedBlogPost(post); setShowBlogForm(true); }} data-testid={`button-edit-blog-${post.slug}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteBlogPostMutation.mutate(post.id)} data-testid={`button-delete-blog-${post.slug}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <div>
                  {showBlogForm ? (
                    <BlogForm 
                      blogPost={selectedBlogPost || undefined} 
                      onSave={(data) => {
                        if (selectedBlogPost) {
                          updateBlogPostMutation.mutate({ id: selectedBlogPost.id, data });
                        } else {
                          createBlogPostMutation.mutate(data);
                        }
                      }} 
                      onCancel={() => { setShowBlogForm(false); setSelectedBlogPost(null); }} 
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center text-muted-foreground">
                          <p className="text-lg font-medium mb-2">No blog post selected</p>
                          <p className="text-sm">Select a blog post to edit or create a new one</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
