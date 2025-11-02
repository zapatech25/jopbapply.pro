import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

function BlogList() {
  const [category, setCategory] = useState<string | undefined>();

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", category],
    queryFn: async () => {
      const url = category 
        ? `/api/blog?category=${category}` 
        : "/api/blog";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  const categories = [
    { value: undefined, label: "All Posts" },
    { value: "success_stories", label: "Success Stories" },
    { value: "industry_insights", label: "Industry Insights" },
    { value: "job_market", label: "Job Market" },
    { value: "career_tips", label: "Career Tips" },
    { value: "platform_updates", label: "Platform Updates" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
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

  const featuredPosts = posts?.filter((p) => p.featured) || [];
  const regularPosts = posts?.filter((p) => !p.featured) || [];

  return (
    <div className="space-y-8">
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

      {featuredPosts.length > 0 && !category && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} featured />
            ))}
          </div>
        </div>
      )}

      <div>
        {!category && featuredPosts.length > 0 && (
          <h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
        )}
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No posts found</p>
            <p className="text-sm text-muted-foreground">Try a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Card 
      className={`flex flex-col ${featured ? "md:col-span-1" : ""}`}
      data-testid={`card-blog-${post.slug}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {post.category.replace(/_/g, " ")}
          </Badge>
          {featured && (
            <Badge variant="default" data-testid="badge-featured">Featured</Badge>
          )}
        </div>
        <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${post.slug}`}>
          <Button variant="outline" size="sm" data-testid={`button-read-${post.slug}`}>
            Read More →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", params?.slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${params?.slug}`);
      if (!res.ok) throw new Error("Blog post not found");
      return res.json();
    },
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">Blog post not found</p>
        <Link href="/blog">
          <Button className="mt-4">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/blog">
          <Button variant="ghost" size="sm" data-testid="button-back-to-blog">
            ← Back to Blog
          </Button>
        </Link>
      </div>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {post.category.replace(/_/g, " ")}
            </Badge>
            {post.featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-title">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>") }}
          data-testid="content-blog-full"
        />
      </article>

      <div className="mt-12 pt-8 border-t">
        <Link href="/blog">
          <Button variant="outline">
            ← Back to All Posts
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Blog() {
  const [, params] = useRoute("/blog/:slug");
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-blog">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Insights, success stories, and career advice from the JobApply.pro team
            </p>
          </div>

          {params?.slug ? <BlogDetail /> : <BlogList />}
        </div>
      </main>
    </div>
  );
}
