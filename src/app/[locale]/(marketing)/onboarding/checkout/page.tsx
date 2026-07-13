import { Card, Button } from "@/shared/ui";

/** SKELETON: payment/checkout step (wire `@/features/billing` createCheckout). */
export default function CheckoutPage() {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Payment integration goes here.
      </p>
      <Button>Pay & create my menu</Button>
    </Card>
  );
}
