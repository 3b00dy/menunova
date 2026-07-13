/**
 * Minimal, cacheable chrome for the public customer-facing menu. Kept separate
 * from marketing/dashboard so each tenant's menu can be branded independently.
 */
export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col px-6 py-10 max-w-3xl w-full mx-auto">{children}</div>;
}
