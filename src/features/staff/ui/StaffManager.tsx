"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, Users, Mail } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  Modal,
} from "@/shared/ui";
import {
  STAFF_ROLES,
  type StaffDraft,
  type StaffMember,
  type StaffRole,
} from "@/features/staff/domain/staff.entity";
import {
  inviteStaff,
  removeStaff,
  updateStaff,
} from "@/features/staff/application/staff-actions";

type Dialog =
  | { type: "invite" }
  | { type: "remove"; id: string; name: string }
  | null;

/**
 * Restaurant-admin staff manager: invite team members, change their role, and
 * remove them. A member's role decides their capabilities — `owner` (admin) can
 * manage everything; `staff` can only toggle item availability. Gated to the
 * `staff:manage` capability both here (the page won't render it otherwise) and
 * inside every Server Action it calls.
 */
export function StaffManager({
  staff,
  restaurantId,
}: {
  staff: StaffMember[];
  restaurantId: string;
}) {
  const { locale, dictionary: t } = useI18n();
  const s = t.dashboard.staffManager;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);

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

  const roleLabel = (role: StaffRole) => s.roles[role];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-[rgb(var(--color-muted))]">{s.roleHint}</p>
        <Button onClick={() => setDialog({ type: "invite" })}>
          <UserPlus className="h-4 w-4" />
          {s.add}
        </Button>
      </div>

      {error && (
        <p className="rounded-[var(--radius-active)] bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {staff.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={s.empty}
          description={s.emptyHint}
          action={
            <Button onClick={() => setDialog({ type: "invite" })}>
              <UserPlus className="h-4 w-4" />
              {s.add}
            </Button>
          }
        />
      ) : (
        <Card>
          <CardBody className="flex flex-col divide-y divide-[rgb(var(--color-border))] p-0">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-primary))]/10 text-sm font-semibold text-[rgb(var(--color-primary))]"
                >
                  {initials(member.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-[rgb(var(--color-text))]">
                      {member.name}
                    </span>
                    <Badge tone={member.status === "active" ? "success" : "warning"}>
                      {s.statuses[member.status]}
                    </Badge>
                  </div>
                  <span className="inline-flex items-center gap-1.5 truncate text-sm text-[rgb(var(--color-muted))]">
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </span>
                </div>

                <label className="sr-only" htmlFor={`role-${member.id}`}>
                  {s.role}
                </label>
                <select
                  id={`role-${member.id}`}
                  value={member.role}
                  disabled={pending}
                  onChange={(e) =>
                    run(() =>
                      updateStaff({
                        locale,
                        id: member.id,
                        patch: { role: e.target.value as StaffRole },
                      }),
                    )
                  }
                  className="h-9 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] disabled:opacity-60"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={s.remove}
                  disabled={pending}
                  onClick={() => setDialog({ type: "remove", id: member.id, name: member.name })}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {dialog?.type === "invite" && (
        <InviteForm
          labels={s}
          pending={pending}
          onClose={() => setDialog(null)}
          onSubmit={(draft) => run(() => inviteStaff({ locale, restaurantId, draft }))}
        />
      )}

      {dialog?.type === "remove" && (
        <Modal
          open
          onClose={() => setDialog(null)}
          title={s.removeTitle}
          description={s.removeConfirm.replace("{name}", dialog.name)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={pending}>
                {s.cancel}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => run(() => removeStaff({ locale, id: dialog.id }))}
              >
                {s.remove}
              </Button>
            </>
          }
        >
          <p className="text-sm text-[rgb(var(--color-muted))]">{s.removeNote}</p>
        </Modal>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

type Labels = ReturnType<typeof useI18n>["dictionary"]["dashboard"]["staffManager"];

function InviteForm({
  labels: s,
  pending,
  onClose,
  onSubmit,
}: {
  labels: Labels;
  pending: boolean;
  onClose: () => void;
  onSubmit: (draft: StaffDraft) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");

  const validEmail = /.+@.+\..+/.test(email.trim());
  const valid = name.trim() !== "" && validEmail;

  return (
    <Modal
      open
      onClose={onClose}
      title={s.newMember}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {s.cancel}
          </Button>
          <Button
            disabled={!valid || pending}
            onClick={() => onSubmit({ name: name.trim(), email: email.trim(), role })}
          >
            {s.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label={s.memberName}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={s.namePlaceholder}
          />
        </Field>
        <Field label={s.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.emailPlaceholder}
          />
        </Field>
        <Field label={s.role} hint={role === "staff" ? s.roleHint : undefined}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {s.roles[r]}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/** First letters of the first two words of a name, for the avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}
