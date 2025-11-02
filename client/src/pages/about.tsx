import { Link } from "wouter";
import { Target, Shield, Zap, BarChart3, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function AboutPage() {
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="bg-background rounded-lg p-8 shadow-sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="heading-about">
              About JobApply.pro
            </h1>
            <p className="text-2xl text-muted-foreground">
              Empowering Job Seekers. Enhancing Careers.
            </p>
          </div>

          <div className="prose prose-sm max-w-none space-y-8">
            <section>
              <p className="text-lg leading-relaxed">
                JobApply.pro was founded to make job hunting easier, smarter, and more transparent. We understand that applying for roles can be overwhelming — so we built a platform that helps users improve their CVs, track applications, and gain clarity in their job search process.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-6">What We Do</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <Sparkles className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>CV Enhancement</CardTitle>
                    <CardDescription>
                      Professional review and optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Our team refines and optimises CVs for clarity, relevance, and impact. We leverage AI-powered tools to help you create compelling application materials that stand out.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Target className="w-8 h-8 text-chart-2 mb-2" />
                    <CardTitle>Application Tracking</CardTitle>
                    <CardDescription>
                      Complete visibility and control
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Track all your job applications in one place. Our comprehensive dashboard lets you monitor statuses, view submission history, and export your data anytime.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Zap className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Assisted Submissions</CardTitle>
                    <CardDescription>
                      Streamlined application process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      With your permission, we submit your enhanced CV to approved job boards and employers, saving you time and effort. Nothing happens without your consent.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <BarChart3 className="w-8 h-8 text-chart-2 mb-2" />
                    <CardTitle>Analytics & Insights</CardTitle>
                    <CardDescription>
                      Data-driven job search
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Understand your application performance with visual analytics. Track success rates, identify trends, and make informed decisions about your job search strategy.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Bell className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Smart Notifications</CardTitle>
                    <CardDescription>
                      Stay informed, never miss updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Get real-time email notifications when your application status changes. Customize your notification preferences to stay in the loop your way.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Shield className="w-8 h-8 text-chart-2 mb-2" />
                    <CardTitle>Credit-Based System</CardTitle>
                    <CardDescription>
                      Flexible and transparent pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Purchase credit plans that fit your needs. Each application submission uses credits, giving you complete control over your spending and application volume.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Your Control. Your Data.</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span><strong>Keep You In Control:</strong> Every submission requires your authorisation — nothing happens without your consent.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span><strong>Transparency Dashboard:</strong> You can view, download, or export all submissions at any time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span><strong>GDPR Compliant:</strong> Your data is protected and handled in accordance with UK data protection laws.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-4">What We Don't Do</h2>
              <div className="bg-background border-l-4 border-muted p-6 rounded">
                <p className="text-lg mb-4">
                  We're <strong>not a recruitment agency</strong> and we <strong>do not guarantee job placements</strong>.
                </p>
                <p>
                  We don't take commissions or act on behalf of employers. Our loyalty is to you, the job seeker.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-4">Our Promise</h2>
              <p className="text-lg leading-relaxed">
                We believe in transparency, consent, and empowerment. Our mission is to make your job search more efficient and effective without compromising your control, privacy, or professional integrity.
              </p>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
              <p>
                <strong>Legal Entity:</strong> Zapa Technologies Ltd<br />
                <strong>Trading As:</strong> JobApply.pro<br />
                <strong>Address:</strong> 20 Chain Road, Manchester, M9 6GR, United Kingdom<br />
                <strong>Contact:</strong> <a href="mailto:support@jobapply.pro" className="text-primary hover:underline">support@jobapply.pro</a>
              </p>
            </section>

            <section className="text-center bg-gradient-to-r from-primary/10 to-chart-2/10 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Ready to streamline your job search?</h3>
              <p className="mb-6">Join thousands of job seekers who trust JobApply.pro</p>
              <Link href="/register">
                <Button size="lg" data-testid="button-get-started">
                  Get Started Today
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
