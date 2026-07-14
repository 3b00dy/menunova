"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, X, Store, ExternalLink } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Badge, Button, Card, EmptyState, Field, Input, Modal } from "@/shared/ui";
import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPlan,
  RestaurantStatus,
} from "@/features/restaurant/domain/restaurant.entity";
import {
  RESTAURANT_PLANS,
  RESTAURANT_STATUSES,
  statusTone,
} from "@/features/restaurant/domain/restaurant.entity";
// Import the actions directly (NOT via the feature barrel): the barrel also
// re-exports server-only code (getSession → next/headers) that must not enter
// the client bundle.
import {
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "@/features/restaurant/application/restaurant-actions";

type Dialog =
  | { type: "form"; editing: Restaurant | null }
  | { type: "delete"; id: string; name: string }
  | null;

type Labels = ReturnType<typeof useI18n>["dictionary"]["dashboard"]["restaurantsAdmin"];

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Super-admin restaurant manager: list every restaurant with inline
 * create/edit/delete via modals. Client Component that calls the feature's
 * Server Actions and refreshes the server-rendered data after each mutation.
 */
export function RestaurantsManager({
  restaurants,
  locale,
}: {
  restaurants: Restaurant[];
  locale: Locale;
}) {
  const { dictionary: t } = useI18n();
  const r = t.dashboard.restaurantsAdmin;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      restaurants.filter(
        (x) =>
          q === "" ||
          [x.name, x.slug, x.ownerEmail ?? ""].join(" ").toLowerCase().includes(q),
      ),
    [restaurants, q],
  );

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      setDialog(null);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={r.search}
            aria-label={r.search}
            className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] ps-9 pe-9 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={r.clearSearch}
              className="absolute end-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={() => setDialog({ type: "form", editing: null })}>
          <Plus className="h-4 w-4" />
          {r.add}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Store className="h-6 w-6" />}
          title={restaurants.length === 0 ? r.empty : r.noResults}
          description={restaurants.length === 0 ? r.emptyHint : undefined}
          action={
            restaurants.length === 0 ? (
              <Button onClick={() => setDialog({ type: "form", editing: null })}>
                <Plus className="h-4 w-4" />
                {r.add}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((rest) => (
            <Card key={rest.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-surface))] text-[rgb(var(--color-muted))]">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-[rgb(var(--color-text))]">
                    {rest.name}
                  </span>
                  <Badge tone={statusTone(rest.status)}>{r.statuses[rest.status]}</Badge>
                  <Badge tone="info">{r.plans[rest.plan]}</Badge>
                </div>
                <div className="truncate text-sm text-[rgb(var(--color-muted))]">
                  /{rest.slug}
                  {rest.ownerEmail ? ` · ${rest.ownerEmail}` : ""}
                </div>
              </div>
              <Link
                href={routes.publicMenu(locale, rest.slug)}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-[rgb(var(--color-primary))] hover:underline"
              >
                {r.viewMenu}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={r.edit}
                  onClick={() => setDialog({ type: "form", editing: rest })}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={r.delete}
                  onClick={() => setDialog({ type: "delete", id: rest.id, name: rest.name })}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {dialog?.type === "form" && (
        <RestaurantForm
          labels={r}
          editing={dialog.editing}
          pending={pending}
          onClose={() => setDialog(null)}
          onSubmit={(draft) =>
            run(() =>
              dialog.editing
                ? updateRestaurant({ locale, id: dialog.editing.id, patch: draft })
                : createRestaurant({ locale, draft }),
            )
          }
        />
      )}

      {dialog?.type === "delete" && (
        <Modal
          open
          onClose={() => setDialog(null)}
          title={r.deleteTitle}
          description={r.deleteConfirm.replace("{name}", dialog.name)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={pending}>
                {r.cancel}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => run(() => deleteRestaurant({ locale, id: dialog.id }))}
              >
                {r.delete}
              </Button>
            </>
          }
        >
          <p className="text-sm text-[rgb(var(--color-muted))]">{r.deleteNote}</p>
        </Modal>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

function SelectField({
  label,
  value,
  options,
  render,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  render: (v: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render(o)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function RestaurantForm({
  labels: r,
  editing,
  pending,
  onClose,
  onSubmit,
}: {
  labels: Labels;
  editing: Restaurant | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (draft: RestaurantDraft) => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  // Auto-derive the slug from the name until the user edits the slug directly
  // (or when editing an existing restaurant, keep its slug).
  const [slugTouched, setSlugTouched] = useState(Boolean(editing));
  const [ownerEmail, setOwnerEmail] = useState(editing?.ownerEmail ?? "");
  const [plan, setPlan] = useState<RestaurantPlan>(editing?.plan ?? "free");
  const [status, setStatus] = useState<RestaurantStatus>(editing?.status ?? "trial");

  const valid = name.trim().length > 0 && slug.trim().length > 0;

  function onName(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit() {
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      ownerEmail: ownerEmail.trim() || undefined,
      plan,
      status,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? r.edit : r.newRestaurant}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {r.cancel}
          </Button>
          <Button disabled={!valid || pending} onClick={submit}>
            {editing ? r.save : r.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label={r.name}>
          <Input autoFocus value={name} onChange={(e) => onName(e.target.value)} placeholder={r.namePlaceholder} />
        </Field>
        <Field label={r.slug} hint={r.slugHint}>
          <Input
            value={slug}
            dir="ltr"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="pizza-palace"
          />
        </Field>
        <Field label={r.ownerEmail}>
          <Input
            type="email"
            dir="ltr"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="owner@example.com"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={r.plan}
            value={plan}
            options={RESTAURANT_PLANS}
            render={(v) => r.plans[v as RestaurantPlan]}
            onChange={(v) => setPlan(v as RestaurantPlan)}
          />
          <SelectField
            label={r.status}
            value={status}
            options={RESTAURANT_STATUSES}
            render={(v) => r.statuses[v as RestaurantStatus]}
            onChange={(v) => setStatus(v as RestaurantStatus)}
          />
        </div>
      </div>
    </Modal>
  );
}
