import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export interface Plan {
  id: string;
  sku: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  active: boolean;
  isPopular?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onSelect?: (plan: Plan) => void;
}

export default function PlanCard({ plan, onSelect }: PlanCardProps) {
  const features = [
    `${plan.credits} job applications`,
    plan.credits >= 150
      ? `${Math.floor(plan.credits / 150) * 7} days processing time`
      : "Fast processing",
    "Application status tracking",
    "Priority support",
  ];

  if (plan.sku === "CV_RETOUCH") {
    features.splice(0, features.length);
    features.push(
      "Professional CV review",
      "Expert recommendations",
      "Formatting optimization",
      "ATS-friendly formatting"
    );
  }

  return (
    <Card
      className={`relative flex flex-col h-full transition-all hover:shadow-lg ${
        plan.isPopular ? "border-primary shadow-md" : ""
      }`}
      data-testid={`card-plan-${plan.sku}`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground" data-testid="badge-popular">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl" data-testid={`text-plan-name-${plan.sku}`}>
            {plan.name}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs" data-testid={`badge-sku-${plan.sku}`}>
            {plan.sku}
          </Badge>
        </div>
        <CardDescription data-testid={`text-plan-description-${plan.sku}`}>
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" data-testid={`text-plan-price-${plan.sku}`}>
              £{plan.price}
            </span>
            <span className="text-muted-foreground">/plan</span>
          </div>
          {plan.credits > 0 && (
            <p className="text-sm text-muted-foreground">
              {plan.credits} credits included
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.isPopular ? "default" : "outline"}
          onClick={() => onSelect?.(plan)}
          data-testid={`button-select-plan-${plan.sku}`}
        >
          Select Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
