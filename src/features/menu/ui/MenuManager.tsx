"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "motion/react";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Search,
  X,
  SearchX,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ListOrdered,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { localize, toLocalizedText, type LocalizedText } from "@/shared/i18n/localized";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  Switch,
  Textarea,
} from "@/shared/ui";
import type {
  Category,
  Menu,
  MenuItem,
} from "@/features/menu/domain/menu.entity";
import {
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
  setItemAvailability,
} from "@/features/menu/application/item-actions";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/menu/application/category-actions";

type Dialog =
  | { type: "category"; editing: Category | null }
  | { type: "item"; editing: MenuItem | null; categoryId: string }
  | { type: "delete"; kind: "item" | "category"; id: string; name: string }
  | { type: "reorder" }
  | null;

const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();
const langDir = (code: string) => SUPPORTED_LANGUAGES[code]?.dir ?? "ltr";

/**
 * Dashboard menu manager. Content (names/descriptions) is authored in every
 * language the restaurant supports (`languages`); the list renders in the active
 * UI locale, falling back to the restaurant's default language when a
 * translation is missing.
 *
 * `canManage` reflects the `menu:manage` capability. When false (a restaurant
 * **staff** member), the editing affordances — add/edit/delete of categories
 * and items — are hidden; only the per-item availability toggle remains, which
 * is the one thing staff may change.
 */
export function MenuManager({
  menu,
  slug,
  languages,
  defaultLanguage,
  canManage,
}: {
  menu: Menu | null;
  slug: string;
  languages: string[];
  defaultLanguage: string;
  canManage: boolean;
}) {
  const { locale, dictionary: t } = useI18n();
  const m = t.menu.manage;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // "Sold out only" — lets staff find and restore unavailable items quickly.
  const [soldOutOnly, setSoldOutOnly] = useState(false);

  const tr = (text: LocalizedText) => localize(text, locale, defaultLanguage);
  /** Enabled languages a name hasn't been translated into yet (US-RA-02). */
  const missingLangs = (text: LocalizedText) => languages.filter((l) => !text[l]?.trim());
  const listSep = locale === "ar" ? "، " : ", ";

  const categories = useMemo(
    () => [...(menu?.categories ?? [])].sort((a, b) => a.position - b.position),
    [menu],
  );
  const items = useMemo(() => menu?.items ?? [], [menu]);
  const defaultCurrency = items[0]?.price.currency ?? "IQD";

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      setDialog(null);
      router.refresh();
    });
  }

  // Filter by the active category chip and the search query. Search matches text
  // in ANY language so an Arabic or English keyword both find the item. During a
  // search, categories with no matches are hidden to focus results.
  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const matches = (i: MenuItem) =>
      (!soldOutOnly || !i.available) &&
      (q === "" ||
        [...Object.values(i.name), ...Object.values(i.description)]
          .join(" ")
          .toLowerCase()
          .includes(q));
    const scoped =
      activeCategory === "all"
        ? categories
        : categories.filter((c) => c.id === activeCategory);
    return scoped
      .map((category) => ({
        category,
        items: items.filter((i) => i.categoryId === category.id && matches(i)),
      }))
      .filter((g) => (q === "" && !soldOutOnly) || g.items.length > 0);
  }, [categories, items, activeCategory, q, soldOutOnly]);

  const totalMatches = groups.reduce((n, g) => n + g.items.length, 0);
  const soldOutCount = items.filter((i) => !i.available).length;
  const filtering = q !== "" || activeCategory !== "all" || soldOutOnly;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          {/* Staff (availability-only) get a task-focused title + hint (BR-ST-01). */}
          <h1 className="text-2xl font-semibold">
            {canManage ? t.dashboard.menu : m.availabilityTitle}
          </h1>
          {!canManage && (
            <p className="text-sm text-[rgb(var(--color-muted))]">{m.availabilityHint}</p>
          )}
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 1 && (
              <Button variant="outline" onClick={() => setDialog({ type: "reorder" })}>
                <ListOrdered className="h-4 w-4" />
                {m.reorder}
              </Button>
            )}
            <Button onClick={() => setDialog({ type: "category", editing: null })}>
              <Plus className="h-4 w-4" />
              {m.addCategory}
            </Button>
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-6 w-6" />}
          title={m.noCategories}
          description={canManage ? m.noCategoriesHint : undefined}
          action={
            canManage ? (
              <Button onClick={() => setDialog({ type: "category", editing: null })}>
                <Plus className="h-4 w-4" />
                {m.addCategory}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Toolbar: search + category filter chips */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={m.searchPlaceholder}
                aria-label={m.searchPlaceholder}
                className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] ps-9 pe-9 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={m.clearSearch}
                  className="absolute end-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <FilterChip
                label={m.allCategories}
                count={items.length}
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {(soldOutCount > 0 || soldOutOnly) && (
                <FilterChip
                  label={t.menu.soldOut}
                  count={soldOutCount}
                  active={soldOutOnly}
                  onClick={() => setSoldOutOnly((v) => !v)}
                />
              )}
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={tr(category.name)}
                  count={items.filter((i) => i.categoryId === category.id).length}
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>

            {q !== "" && (
              <p className="text-sm text-[rgb(var(--color-muted))]">
                {m.resultsCount.replace("{count}", String(totalMatches))}
              </p>
            )}
          </div>

          {groups.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title={m.noResults}
              description={m.noResultsHint}
              action={
                filtering ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setActiveCategory("all");
                      setSoldOutOnly(false);
                    }}
                  >
                    {m.clearFilters}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map(({ category, items: catItems }) => (
                <Card key={category.id}>
                  <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                        {tr(category.name)}
                      </h2>
                      <Badge tone="neutral">
                        {catItems.length} {m.itemsCount}
                      </Badge>
                      {canManage && missingLangs(category.name).length > 0 && (
                        <Badge tone="warning">
                          {m.missingTranslation.replace(
                            "{langs}",
                            missingLangs(category.name).map(langName).join(listSep),
                          )}
                        </Badge>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={m.editCategory}
                          onClick={() => setDialog({ type: "category", editing: category })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={m.deleteCategory}
                          onClick={() =>
                            setDialog({
                              type: "delete",
                              kind: "category",
                              id: category.id,
                              name: tr(category.name),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setDialog({ type: "item", editing: null, categoryId: category.id })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          {m.addItem}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody className="flex flex-col gap-2">
                    {catItems.length === 0 ? (
                      <p className="py-2 text-sm text-[rgb(var(--color-muted))]">{m.noItems}</p>
                    ) : (
                      catItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center gap-3 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] px-3 py-2.5"
                        >
                          <ItemThumb item={item} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-[rgb(var(--color-text))]">
                                {tr(item.name)}
                              </span>
                              {!item.available && (
                                <Badge tone="danger">{m.unavailable}</Badge>
                              )}
                              {canManage && missingLangs(item.name).length > 0 && (
                                <Badge tone="warning">
                                  {m.missingTranslation.replace(
                                    "{langs}",
                                    missingLangs(item.name).map(langName).join(listSep),
                                  )}
                                </Badge>
                              )}
                            </div>
                            {tr(item.description) && (
                              <p className="truncate text-sm text-[rgb(var(--color-muted))]">
                                {tr(item.description)}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 font-mono text-sm text-[rgb(var(--color-text))]">
                            {formatMoney(item.price, locale)}
                          </span>
                          <Switch
                            checked={item.available}
                            disabled={pending}
                            onChange={(next) =>
                              run(() => setItemAvailability(slug, item.id, next))
                            }
                          />
                          {canManage && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={m.editItem}
                                onClick={() =>
                                  setDialog({
                                    type: "item",
                                    editing: item,
                                    categoryId: item.categoryId,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={m.deleteItem}
                                onClick={() =>
                                  setDialog({
                                    type: "delete",
                                    kind: "item",
                                    id: item.id,
                                    name: tr(item.name),
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {dialog?.type === "category" && (
        <CategoryForm
          labels={m}
          editing={dialog.editing}
          languages={languages}
          pending={pending}
          onClose={() => setDialog(null)}
          onSubmit={(name) =>
            run(() =>
              dialog.editing
                ? updateCategory(slug, dialog.editing.id, { name })
                : createCategory(slug, { name }),
            )
          }
        />
      )}

      {dialog?.type === "item" && (
        <ItemForm
          labels={m}
          editing={dialog.editing}
          categories={categories}
          languages={languages}
          defaultLanguage={defaultLanguage}
          defaultCategoryId={dialog.categoryId}
          defaultCurrency={defaultCurrency}
          pending={pending}
          onClose={() => setDialog(null)}
          onSubmit={(draft) =>
            run(() =>
              dialog.editing
                ? updateMenuItem(slug, dialog.editing.id, draft)
                : createMenuItem(slug, draft),
            )
          }
        />
      )}

      {dialog?.type === "reorder" && (
        <CategoryReorder
          labels={m}
          categories={categories}
          label={(c) => tr(c.name)}
          pending={pending}
          onClose={() => setDialog(null)}
          onSave={(ordered) =>
            run(() =>
              Promise.all(
                ordered
                  // Positions are 1-based; only PATCH categories that moved.
                  .map((c, idx) => ({ c, position: idx + 1 }))
                  .filter(({ c, position }) => c.position !== position)
                  .map(({ c, position }) => updateCategory(slug, c.id, { position })),
              ),
            )
          }
        />
      )}

      {dialog?.type === "delete" && (
        <Modal
          open
          onClose={() => setDialog(null)}
          title={m.deleteTitle}
          description={
            dialog.kind === "category"
              ? m.deleteCategoryConfirm.replace("{name}", dialog.name)
              : m.deleteItemConfirm.replace("{name}", dialog.name)
          }
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={pending}>
                {m.cancel}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    dialog.kind === "category"
                      ? deleteCategory(slug, dialog.id)
                      : deleteMenuItem(slug, dialog.id),
                  )
                }
              >
                {m.delete}
              </Button>
            </>
          }
        >
          <p className="text-sm text-[rgb(var(--color-muted))]">
            {dialog.kind === "category" ? m.deleteCategoryNote : m.deleteItemNote}
          </p>
        </Modal>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

/** A pill button for the category filter row. */
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors " +
        (active
          ? "border-transparent bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
          : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary))]")
      }
    >
      <span>{label}</span>
      <span
        className={
          "rounded-full px-1.5 text-xs " +
          (active ? "bg-black/15" : "bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))]")
        }
      >
        {count}
      </span>
    </button>
  );
}

/**
 * Category order editor (US-RA-01 AC2): drag rows by their handle (pointer and
 * touch), or use the arrow buttons (keyboard / screen readers). Saves on submit.
 */
function CategoryReorder({
  labels: m,
  categories,
  label,
  pending,
  onClose,
  onSave,
}: {
  labels: Labels;
  categories: Category[];
  label: (c: Category) => string;
  pending: boolean;
  onClose: () => void;
  onSave: (ordered: Category[]) => void;
}) {
  const [order, setOrder] = useState<Category[]>(categories);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  };
  const changed = order.some((c, i) => c.id !== categories[i]?.id);

  return (
    <Modal
      open
      onClose={onClose}
      title={m.reorderTitle}
      description={m.reorderHint}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {m.cancel}
          </Button>
          <Button disabled={!changed || pending} onClick={() => onSave(order)}>
            {m.save}
          </Button>
        </>
      }
    >
      <Reorder.Group axis="y" values={order} onReorder={setOrder} className="flex flex-col gap-2">
        {order.map((category, idx) => (
          <ReorderRow
            key={category.id}
            category={category}
            label={label(category)}
            labels={m}
            isFirst={idx === 0}
            isLast={idx === order.length - 1}
            onUp={() => move(idx, idx - 1)}
            onDown={() => move(idx, idx + 1)}
          />
        ))}
      </Reorder.Group>
    </Modal>
  );
}

function ReorderRow({
  category,
  label,
  labels: m,
  isFirst,
  isLast,
  onUp,
  onDown,
}: {
  category: Category;
  label: string;
  labels: Labels;
  isFirst: boolean;
  isLast: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  // Drag only from the handle, so touch-scrolling the list still works.
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={category}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 py-2"
    >
      <button
        type="button"
        aria-label={m.dragHandle}
        title={m.dragHandle}
        onPointerDown={(e) => controls.start(e)}
        className="grid h-8 w-8 cursor-grab touch-none place-items-center rounded text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))] active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="min-w-0 flex-1 truncate font-medium text-[rgb(var(--color-text))]">
        {label}
      </span>
      <Button size="sm" variant="ghost" aria-label={m.moveUp} disabled={isFirst} onClick={onUp}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" aria-label={m.moveDown} disabled={isLast} onClick={onDown}>
        <ArrowDown className="h-4 w-4" />
      </Button>
    </Reorder.Item>
  );
}

/** Item thumbnail — the photo if provided, otherwise a neutral placeholder. */
function ItemThumb({ item }: { item: MenuItem }) {
  const base =
    "h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-active)] border border-[rgb(var(--color-border))]";
  if (item.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.imageUrl} alt="" className={base + " object-cover"} />;
  }
  return (
    <div className={base + " grid place-items-center bg-[rgb(var(--color-surface))] text-[rgb(var(--color-muted))]"}>
      <UtensilsCrossed className="h-5 w-5" />
    </div>
  );
}

type Labels = ReturnType<typeof useI18n>["dictionary"]["menu"]["manage"];

/** Small heading marking a per-language block in the forms. */
function LangBadge({ code }: { code: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-muted))]">
      {langName(code)}
    </span>
  );
}

function CategoryForm({
  labels: m,
  editing,
  languages,
  pending,
  onClose,
  onSubmit,
}: {
  labels: Labels;
  editing: Category | null;
  languages: string[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (name: LocalizedText) => void;
}) {
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(languages.map((l) => [l, editing?.name[l] ?? ""])),
  );
  const valid = languages.every((l) => names[l]?.trim());

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? m.editCategory : m.newCategory}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {m.cancel}
          </Button>
          <Button disabled={!valid || pending} onClick={() => onSubmit(toLocalizedText(names))}>
            {editing ? m.save : m.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {languages.map((lang, idx) => (
          <Field key={lang} label={`${m.categoryName} · ${langName(lang)}`}>
            <Input
              autoFocus={idx === 0}
              dir={langDir(lang)}
              value={names[lang] ?? ""}
              onChange={(e) => setNames((s) => ({ ...s, [lang]: e.target.value }))}
              placeholder={m.categoryNamePlaceholder}
            />
          </Field>
        ))}
      </div>
    </Modal>
  );
}

function ItemForm({
  labels: m,
  editing,
  categories,
  languages,
  defaultLanguage,
  defaultCategoryId,
  defaultCurrency,
  pending,
  onClose,
  onSubmit,
}: {
  labels: Labels;
  editing: MenuItem | null;
  categories: Category[];
  languages: string[];
  defaultLanguage: string;
  defaultCategoryId: string;
  defaultCurrency: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (draft: {
    categoryId: string;
    name: LocalizedText;
    description: LocalizedText;
    price: { amountMinor: number; currency: string };
    available: boolean;
    imageUrl?: string;
  }) => void;
}) {
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(languages.map((l) => [l, editing?.name[l] ?? ""])),
  );
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(languages.map((l) => [l, editing?.description[l] ?? ""])),
  );
  const [priceMajor, setPriceMajor] = useState(
    editing ? (editing.price.amountMinor / 100).toString() : "",
  );
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? defaultCategoryId);
  const [available, setAvailable] = useState(editing?.available ?? true);
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? "");

  const priceValue = Number(priceMajor);
  const validPrice = priceMajor.trim() !== "" && Number.isFinite(priceValue) && priceValue >= 0;
  const validNames = languages.every((l) => names[l]?.trim());
  const valid = validNames && validPrice && Boolean(categoryId);
  const currency = editing?.price.currency ?? defaultCurrency;
  const tr = (text: LocalizedText) => localize(text, defaultLanguage, defaultLanguage);

  function submit() {
    onSubmit({
      categoryId,
      name: toLocalizedText(names),
      description: toLocalizedText(descriptions),
      price: { amountMinor: Math.round(priceValue * 100), currency },
      available,
      imageUrl: imageUrl.trim() || undefined,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? m.editItem : m.newItem}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {m.cancel}
          </Button>
          <Button disabled={!valid || pending} onClick={submit}>
            {editing ? m.save : m.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Per-language content blocks */}
        {languages.map((lang, idx) => (
          <div
            key={lang}
            className="flex flex-col gap-3 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] p-3"
          >
            <LangBadge code={lang} />
            <Field label={m.itemName}>
              <Input
                autoFocus={idx === 0}
                dir={langDir(lang)}
                value={names[lang] ?? ""}
                onChange={(e) => setNames((s) => ({ ...s, [lang]: e.target.value }))}
                placeholder={m.itemNamePlaceholder}
              />
            </Field>
            <Field label={m.description}>
              <Textarea
                dir={langDir(lang)}
                value={descriptions[lang] ?? ""}
                onChange={(e) => setDescriptions((s) => ({ ...s, [lang]: e.target.value }))}
              />
            </Field>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <Field label={`${m.price} (${currency})`}>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={priceMajor}
              onChange={(e) => setPriceMajor(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field label={m.category}>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {tr(c.name)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={m.imageUrl} hint={m.imageUrlHint}>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Switch checked={available} onChange={setAvailable} label={m.available} />
      </div>
    </Modal>
  );
}
