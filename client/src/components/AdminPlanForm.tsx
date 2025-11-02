import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Plan } from "./PlanCard";

interface AdminPlanFormProps {
  plan?: Plan;
  onSave?: (plan: Partial<Plan>) => void;
  onCancel?: () => void;
}

export default function AdminPlanForm({ plan, onSave, onCancel }: AdminPlanFormProps) {
  const [formData, setFormData] = useState({
    sku: plan?.sku || "",
    name: plan?.name || "",
    description: plan?.description || "",
    credits: plan?.credits || 0,
    price: plan?.price || 0,
    active: plan?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      price: formData.price.toString(),
    };
    onSave?.(dataToSave);
    console.log("Plan saved:", dataToSave);
  };

  return (
    <Card data-testid="card-admin-plan-form">
      <CardHeader>
        <CardTitle>{plan ? "Edit Plan" : "Create New Plan"}</CardTitle>
        <CardDescription>
          {plan ? "Update plan details" : "Add a new pricing plan"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="APPS_150"
              required
              data-testid="input-plan-sku"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Professional"
              required
              data-testid="input-plan-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Perfect for active job seekers"
              required
              data-testid="input-plan-description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                placeholder="150"
                required
                data-testid="input-plan-credits"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (£)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="79"
                required
                data-testid="input-plan-price"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive plans won't be shown on the pricing page
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              data-testid="switch-plan-active"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-save-plan">
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-plan"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
