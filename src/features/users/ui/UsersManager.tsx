"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Search,
  X,
  Users as UsersIcon,
  Mail,
  Pencil,
  Trash2,
  Store,
  CalendarDays,
  Clock,
} from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { Badge, Button, Card, CardBody, EmptyState, Field, Input, Modal } from "@/shared/ui";
import {
  USER_ROLES,
  USER_STATUSES,
  roleNeedsRestaurant,
  roleTone,
  userStatusTone,
  type User,
  type UserDraft,
  type UserPatch,
  type UserRole,
  type UserStatus,
} from "@/features/users/domain/user.entity";
import {
  createUserAccount,
  deleteUserAccount,
  updateUserAccount,
} from "@/features/users/application/user-actions";

type RestaurantOption = { id: string; slug: string; name: string };

type Dialog =
  | { type: "create" }
  | { type: "edit"; user: User }
  | { type: "details"; user: User }
  | { type: "delete"; id: string; name: string }
  | null;

type Labels = ReturnType<typeof useI18n>["dictionary"]["dashboard"]["usersAdmin"];

/**
 * Super-admin system-user manager: list every account on the platform, filter
 * by text / role / status, view full details, and create / edit / delete users.
 * Gated to the `users:manage` capability both here (the page won't render it
 * otherwise) and inside every Server Action it calls.
 */
export function UsersManager({
  users,
  restaurants,
  locale,
}: {
  users: User[];
  restaurants: RestaurantOption[];
  locale: Locale;
}) {
  const { dictionary: t } = useI18n();
  const u = t.dashboard.usersAdmin;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const restaurantName = (id?: string) =>
    id ? restaurants.find((r) => r.id === id)?.name ?? id : null;

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      users.filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) return false;
        if (statusFilter !== "all" && user.status !== statusFilter) return false;
        if (q === "") return true;
        const rName = restaurants.find((r) => r.id === user.restaurantId)?.name ?? "";
        const hay = [user.name, user.email, rName].join(" ").toLowerCase();
        return hay.includes(q);
      }),
    [users, restaurants, roleFilter, statusFilter, q],
  );

  function run(action: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        setDialog(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <section className="flex flex-col gap-5">
      {/* Toolbar: search + role/status filters + add. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={u.search}
            aria-label={u.search}
            className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] ps-9 pe-9 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={u.clearSearch}
              className="absolute end-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <FilterSelect
          label={u.role}
          value={roleFilter}
          onChange={(v) => setRoleFilter(v as UserRole | "all")}
          options={["all", ...USER_ROLES]}
          render={(v) => (v === "all" ? u.allRoles : u.roles[v as UserRole])}
        />
        <FilterSelect
          label={u.status}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as UserStatus | "all")}
          options={["all", ...USER_STATUSES]}
          render={(v) => (v === "all" ? u.allStatuses : u.statuses[v as UserStatus])}
        />
        <Button onClick={() => setDialog({ type: "create" })}>
          <UserPlus className="h-4 w-4" />
          {u.add}
        </Button>
      </div>

      <p className="text-sm text-[rgb(var(--color-muted))]">
        {u.count.replace("{n}", String(filtered.length)).replace("{total}", String(users.length))}
      </p>

      {error && (
        <p className="rounded-[var(--radius-active)] bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-6 w-6" />}
          title={users.length === 0 ? u.empty : u.noResults}
          description={users.length === 0 ? u.emptyHint : undefined}
          action={
            users.length === 0 ? (
              <Button onClick={() => setDialog({ type: "create" })}>
                <UserPlus className="h-4 w-4" />
                {u.add}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardBody className="flex flex-col divide-y divide-[rgb(var(--color-border))] p-0">
            {filtered.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDialog({ type: "details", user })}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                  aria-label={`${u.details}: ${user.name}`}
                >
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-primary))]/10 text-sm font-semibold text-[rgb(var(--color-primary))]"
                  >
                    {initials(user.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-[rgb(var(--color-text))]">
                        {user.name}
                      </span>
                      <Badge tone={roleTone(user.role)}>{u.roles[user.role]}</Badge>
                      <Badge tone={userStatusTone(user.status)}>{u.statuses[user.status]}</Badge>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-[rgb(var(--color-muted))]">
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {user.email}
                      </span>
                      {restaurantName(user.restaurantId) && (
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <Store className="h-3.5 w-3.5 shrink-0" />
                          {restaurantName(user.restaurantId)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={u.edit}
                    disabled={pending}
                    onClick={() => setDialog({ type: "edit", user })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={u.delete}
                    disabled={pending}
                    onClick={() => setDialog({ type: "delete", id: user.id, name: user.name })}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <UserForm
          labels={u}
          restaurants={restaurants}
          editing={dialog.type === "edit" ? dialog.user : null}
          pending={pending}
          onClose={() => setDialog(null)}
          onCreate={(draft) => run(() => createUserAccount({ locale, draft }))}
          onUpdate={(id, patch) => run(() => updateUserAccount({ locale, id, patch }))}
        />
      )}

      {dialog?.type === "details" && (
        <UserDetails
          labels={u}
          user={dialog.user}
          restaurantName={restaurantName(dialog.user.restaurantId)}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ type: "edit", user: dialog.user })}
        />
      )}

      {dialog?.type === "delete" && (
        <Modal
          open
          onClose={() => setDialog(null)}
          title={u.deleteTitle}
          description={u.deleteConfirm.replace("{name}", dialog.name)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={pending}>
                {u.cancel}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => run(() => deleteUserAccount({ locale, id: dialog.id }))}
              >
                {u.delete}
              </Button>
            </>
          }
        >
          <p className="text-sm text-[rgb(var(--color-muted))]">{u.deleteNote}</p>
        </Modal>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

function FilterSelect({
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
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {render(o)}
        </option>
      ))}
    </select>
  );
}

function UserForm({
  labels: u,
  restaurants,
  editing,
  pending,
  onClose,
  onCreate,
  onUpdate,
}: {
  labels: Labels;
  restaurants: RestaurantOption[];
  editing: User | null;
  pending: boolean;
  onClose: () => void;
  onCreate: (draft: UserDraft) => void;
  onUpdate: (id: string, patch: UserPatch) => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(editing?.role ?? "owner");
  const [status, setStatus] = useState<UserStatus>(editing?.status ?? "active");
  const [restaurantId, setRestaurantId] = useState<string>(
    editing?.restaurantId ?? restaurants[0]?.id ?? "",
  );

  const needsRestaurant = roleNeedsRestaurant(role);
  const validEmail = /.+@.+\..+/.test(email.trim());
  const validPassword = editing ? true : password.length >= 8;
  const valid =
    name.trim() !== "" &&
    validEmail &&
    validPassword &&
    (!needsRestaurant || restaurantId !== "");

  function submit() {
    if (editing) {
      onUpdate(editing.id, {
        name: name.trim(),
        role,
        status,
        restaurantId: needsRestaurant ? restaurantId : undefined,
      });
    } else {
      onCreate({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        status,
        restaurantId: needsRestaurant ? restaurantId : undefined,
      });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? u.edit : u.newUser}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {u.cancel}
          </Button>
          <Button disabled={!valid || pending} onClick={submit}>
            {editing ? u.save : u.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label={u.name}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={u.namePlaceholder}
          />
        </Field>
        <Field label={u.email} hint={editing ? u.emailLocked : undefined}>
          <Input
            type="email"
            dir="ltr"
            value={email}
            disabled={Boolean(editing)}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={u.emailPlaceholder}
          />
        </Field>
        {!editing && (
          <Field label={u.password} hint={password && !validPassword ? u.passwordHint : undefined}>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label={u.role}>
            <SelectBox value={role} onChange={(v) => setRole(v as UserRole)}>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {u.roles[r]}
                </option>
              ))}
            </SelectBox>
          </Field>
          <Field label={u.status}>
            <SelectBox value={status} onChange={(v) => setStatus(v as UserStatus)}>
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {u.statuses[s]}
                </option>
              ))}
            </SelectBox>
          </Field>
        </div>
        {needsRestaurant && (
          <Field label={u.restaurant}>
            <SelectBox value={restaurantId} onChange={setRestaurantId}>
              <option value="" disabled>
                {u.selectRestaurant}
              </option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectBox>
          </Field>
        )}
      </div>
    </Modal>
  );
}

function UserDetails({
  labels: u,
  user,
  restaurantName,
  onClose,
  onEdit,
}: {
  labels: Labels;
  user: User;
  restaurantName: string | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title={user.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {u.cancel}
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            {u.edit}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Badge tone={roleTone(user.role)}>{u.roles[user.role]}</Badge>
          <Badge tone={userStatusTone(user.status)}>{u.statuses[user.status]}</Badge>
        </div>
        <DetailRow icon={<Mail className="h-4 w-4" />} label={u.email} value={user.email} />
        <DetailRow
          icon={<Store className="h-4 w-4" />}
          label={u.restaurant}
          value={restaurantName ?? u.noRestaurant}
        />
        <DetailRow
          icon={<CalendarDays className="h-4 w-4" />}
          label={u.created}
          value={user.createdAt ?? u.noRestaurant}
        />
        <DetailRow
          icon={<Clock className="h-4 w-4" />}
          label={u.lastActive}
          value={formatDateTime(user.lastActiveAt) ?? u.never}
        />
        <DetailRow label={u.id} value={user.id} mono />
      </div>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--color-border))] pb-2 last:border-0">
      <span className="inline-flex items-center gap-2 text-[rgb(var(--color-muted))]">
        {icon}
        {label}
      </span>
      <span
        dir="ltr"
        className={
          mono
            ? "font-mono text-xs text-[rgb(var(--color-muted))]"
            : "truncate text-end font-medium text-[rgb(var(--color-text))]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
    >
      {children}
    </select>
  );
}

/** First letters of the first two words of a name, for the avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

/** Format an ISO timestamp to a short readable date, or null if absent/invalid. */
function formatDateTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
