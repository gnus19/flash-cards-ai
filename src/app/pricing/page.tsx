import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pricing
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that fits you. Upgrade anytime.
        </p>
      </div>
      <PricingTable />
    </div>
  );
}
