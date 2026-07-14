"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, UtensilsCrossed, Search, X, SearchX } from "lucide-react";
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
  | null;

const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();
const langDir = (code: string) => SUPPORTED_LANGUAGES[code]?.dir ?? "ltr";

/**
 * Dashboard menu manager: full CRUD over categories and items. Content
 * (names/descriptions) is authored in every language the restaurant supports
 * (`languages`); the list renders in the active UI locale, falling back to the
 * restaurant's default language when a translation is missing.
 */
export function MenuManager({
  menu,
  slug,
  languages,
  defaultLanguage,
}: {
  menu: Menu | null;
  slug: string;
  languages: string[];
  defaultLanguage: string;
}) {
  const { locale, dictionary: t } = useI18n();
  const m = t.menu.manage;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const tr = (text: LocalizedText) => localize(text, locale, defaultLanguage);

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
      q === "" ||
      [...Object.values(i.name), ...Object.values(i.description)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const scoped =
      activeCategory === "all"
        ? categories
        : categories.filter((c) => c.id === activeCategory);
    return scoped
      .map((category) => ({
        category,
        items: items.filter((i) => i.categoryId === category.id && matches(i)),
      }))
      .filter((g) => q === "" || g.items.length > 0);
  }, [categories, items, activeCategory, q]);

  const totalMatches = groups.reduce((n, g) => n + g.items.length, 0);
  const filtering = q !== "" || activeCategory !== "all";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t.dashboard.menu}</h1>
        <Button onClick={() => setDialog({ type: "category", editing: null })}>
          <Plus className="h-4 w-4" />
          {m.addCategory}
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-6 w-6" />}
          title={m.noCategories}
          description={m.noCategoriesHint}
          action={
            <Button onClick={() => setDialog({ type: "category", editing: null })}>
              <Plus className="h-4 w-4" />
              {m.addCategory}
            </Button>
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
                    </div>
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
                              run(() => updateMenuItem(slug, item.id, { available: next }))
                            }
                          />
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
