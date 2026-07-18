/**
 * Minimal, cacheable chrome for the public customer-facing menu. Kept separate
 * from marketing/dashboard so each tenant's menu can be branded independently.
 */
export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col px-2 py-2 max-w-3xl w-full mx-auto">{children}</div>;
}
