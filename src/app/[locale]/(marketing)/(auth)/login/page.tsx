import { LoginForm } from "@/features/auth/ui/LoginForm";

/** Login — "/{locale}/login". The form is a Client Component (locale + labels
 * come from the i18n context; it calls the `login` Server Action). */
export default function LoginPage() {
  return <LoginForm />;
}
