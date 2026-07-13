"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Match the pathname exactly instead of as a prefix. */
  end?: boolean;
}

function useIsActive(href: string, end?: boolean): boolean {
  const pathname = usePathname();
  return end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item }: { item: NavItem }) {
  const { href, label, icon: Icon, end } = item;
  const active = useIsActive(href, end);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
          : "text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({
  brand,
  items,
  footer,
}: {
  brand: ReactNode;
  items: NavItem[];
  footer?: ReactNode;
}) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-e border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
      <div className="px-5 py-5 border-b border-[rgb(var(--color-border))]">{brand}</div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}
      </nav>
      {footer && (
        <div className="px-3 py-4 border-t border-[rgb(var(--color-border))]">{footer}</div>
      )}
    </aside>
  );
}

function MobileNavLink({ item }: { item: NavItem }) {
  const { href, label, icon: Icon, end } = item;
  const active = useIsActive(href, end);
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
          : "bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="md:hidden sticky top-0 z-30 flex gap-1 overflow-x-auto no-scrollbar bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] px-3 py-2">
      {items.map((item) => (
        <MobileNavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}
