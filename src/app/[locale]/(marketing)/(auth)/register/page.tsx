import { Card, Button, Input, Field } from "@/shared/ui";

/** SKELETON: registration form (wire `@/features/auth`). */
export default function RegisterPage() {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[rgb(var(--color-text))]">Create account</h1>
      <Field label="Email">
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field label="Password">
        <Input type="password" placeholder="••••••••" />
      </Field>
      <Button block>Create account</Button>
    </Card>
  );
}
