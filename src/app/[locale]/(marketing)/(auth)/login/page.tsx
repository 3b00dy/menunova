import { Card, Button, Input, Field } from "@/shared/ui";

/** SKELETON: login form goes here (wire `@/features/auth` login action). */
export default function LoginPage() {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[rgb(var(--color-text))]">Sign in</h1>
      <Field label="Email">
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field label="Password">
        <Input type="password" placeholder="••••••••" />
      </Field>
      <Button block>Sign in</Button>
    </Card>
  );
}
