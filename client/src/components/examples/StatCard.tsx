import StatCard from "../StatCard";
import { CreditCard } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="max-w-xs">
      <StatCard
        icon={CreditCard}
        label="Credits Remaining"
        value={142}
        iconColor="text-primary"
      />
    </div>
  );
}
