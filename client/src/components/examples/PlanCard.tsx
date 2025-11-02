import PlanCard from "../PlanCard";

export default function PlanCardExample() {
  const samplePlan = {
    id: "1",
    sku: "APPS_150",
    name: "Professional",
    description: "Perfect for active job seekers",
    credits: 150,
    price: 79,
    active: true,
    isPopular: true,
  };

  return (
    <div className="max-w-sm">
      <PlanCard
        plan={samplePlan}
        onSelect={(plan) => console.log("Selected plan:", plan)}
      />
    </div>
  );
}
