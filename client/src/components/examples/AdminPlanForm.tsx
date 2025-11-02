import AdminPlanForm from "../AdminPlanForm";

export default function AdminPlanFormExample() {
  return (
    <div className="max-w-2xl">
      <AdminPlanForm
        onSave={(plan) => console.log("Plan saved:", plan)}
        onCancel={() => console.log("Cancel clicked")}
      />
    </div>
  );
}
