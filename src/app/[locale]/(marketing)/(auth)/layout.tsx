/**
 * Nested (auth) route group: shares a centered card layout for login/register.
 * Group name is stripped from the URL — routes are "/{locale}/login" etc.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
