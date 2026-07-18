import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { Card, Button } from "@/shared/ui";

/**
 * MOCK checkout step. Real payment is out of scope; the new restaurant is
 * provisioned during registration, so this hands off to `/register`. Plan
 * upgrades will later live in the billing area.
 */
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Payment is mocked for now — continue to create your account and restaurant.
      </p>
      <Link href={routes.register(locale)}>
        <Button block>Pay &amp; create my menu</Button>
      </Link>
    </Card>
  );
}
