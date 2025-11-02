import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@assets/generated_images/Professional_job_tracking_dashboard_mockup_9763b48e.png";

export default function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Streamline Your Job Search with{" "}
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Automation
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Professional job application tracking with credit-based submissions.
                Apply to hundreds of positions efficiently while maintaining quality
                and personalization.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">
                  Credit-based application system - apply to multiple jobs with ease
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">
                  Professional tracking dashboard to monitor all applications
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">
                  CV enhancement services to stand out from the competition
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-viewpricing">
                  View Pricing Plans
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  data-testid="button-hero-register"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Job Application Dashboard"
                className="w-full h-auto"
                data-testid="img-hero"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-chart-2/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
