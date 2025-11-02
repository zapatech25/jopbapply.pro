import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Percent, DollarSign, RefreshCw, Calendar, Users, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PromoCode, InsertPromoCode } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPromoCodesPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  
  const [formData, setFormData] = useState<Partial<InsertPromoCode>>({
    code: "",
    discountType: "percentage",
    discountValue: "0",
    maxUses: null,
    expiresAt: null,
    active: true,
    description: "",
  });

  const { data: promoCodes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/promo-codes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Promo code created",
        description: "The promo code has been created successfully.",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "There was an error creating the promo code.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPromoCode> }) => {
      const res = await apiRequest("PATCH", `/api/admin/promo-codes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Promo code updated",
        description: "The promo code has been updated successfully.",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the promo code.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/promo-codes/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Promo code deleted",
        description: "The promo code has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the promo code.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "0",
      maxUses: null,
      expiresAt: null,
      active: true,
      description: "",
    });
    setEditingCode(null);
  };

  const handleOpenDialog = (code?: PromoCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        discountType: code.discountType as "percentage" | "fixed",
        discountValue: code.discountValue,
        maxUses: code.maxUses,
        expiresAt: code.expiresAt ? new Date(code.expiresAt) : null,
        active: code.active,
        description: code.description || "",
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code) {
      toast({
        title: "Validation error",
        description: "Promo code is required.",
        variant: "destructive",
      });
      return;
    }

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = (code: PromoCode) => {
    updateMutation.mutate({ id: code.id, data: { active: !code.active } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading promo codes...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeCodes = promoCodes?.filter(c => c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date())) || [];
  const expiredCodes = promoCodes?.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()) || [];
  const inactiveCodes = promoCodes?.filter(c => !c.active) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="heading-promo-codes">Promo Code Manager</h1>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-create-promo">
            <Plus className="w-4 h-4 mr-2" />
            Create Promo Code
          </Button>
        </div>
        <p className="text-secondary">Manage discount codes for pricing plans</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card data-testid="card-active-codes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Percent className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-count">{activeCodes.length}</div>
            <p className="text-xs text-tertiary mt-1">Currently valid</p>
          </CardContent>
        </Card>

        <Card data-testid="card-expired-codes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-expired-count">{expiredCodes.length}</div>
            <p className="text-xs text-tertiary mt-1">Past expiration</p>
          </CardContent>
        </Card>

        <Card data-testid="card-inactive-codes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inactive-count">{inactiveCodes.length}</div>
            <p className="text-xs text-tertiary mt-1">Manually disabled</p>
          </CardContent>
        </Card>
      </div>

      {!promoCodes || promoCodes.length === 0 ? (
        <Card data-testid="card-no-codes">
          <CardContent className="py-12">
            <div className="text-center">
              <Percent className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Promo Codes Yet</h3>
              <p className="text-secondary mb-6">Create your first promo code to offer discounts to users.</p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="card-promo-table">
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>Manage and edit discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((code) => (
                    <TableRow key={code.id} data-testid={`row-promo-${code.id}`}>
                      <TableCell className="font-mono font-medium" data-testid={`text-code-${code.id}`}>
                        {code.code}
                      </TableCell>
                      <TableCell data-testid={`text-discount-${code.id}`}>
                        {code.discountType === "percentage" ? (
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {code.discountValue}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {code.discountValue}
                          </span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-uses-${code.id}`}>
                        {code.currentUses || 0}
                        {code.maxUses && ` / ${code.maxUses}`}
                      </TableCell>
                      <TableCell data-testid={`text-valid-${code.id}`}>
                        {code.expiresAt ? format(new Date(code.expiresAt), "MMM dd, yyyy") : "No expiration"}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${code.id}`}>
                        {code.active ? (
                          code.expiresAt && new Date(code.expiresAt) < new Date() ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(code)}
                            data-testid={`button-edit-${code.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(code)}
                            data-testid={`button-toggle-${code.id}`}
                          >
                            {code.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(code.id)}
                            data-testid={`button-delete-${code.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-promo-form">
          <DialogHeader>
            <DialogTitle>{editingCode ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
            <DialogDescription>
              {editingCode ? "Update the promo code details" : "Create a new discount code for users"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="SUMMER2024"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                data-testid="input-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData({ ...formData, discountType: value as "percentage" | "fixed" })}
              >
                <SelectTrigger data-testid="select-discount-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {formData.discountType === "percentage" ? "Percentage (%)" : "Amount ($)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                data-testid="input-discount-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Unlimited"
                value={formData.maxUses || ""}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                data-testid="input-max-uses"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt ? format(formData.expiresAt, "yyyy-MM-dd") : ""}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value) : null })}
                data-testid="input-expires-at"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {editingCode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
