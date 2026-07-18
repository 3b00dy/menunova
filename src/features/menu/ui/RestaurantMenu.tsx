"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Flame, Phone, MapPin, Globe, X, ArrowLeft, Sparkles } from "lucide-react";
import {
  type ThemeConfig,
  type LayoutMode,
  RADIUS_VALUES,
  SHADOW_VALUES,
} from "@/shared/theme/tenant-config";
import { cn } from "@/shared/utils/cn";
import {
  itemsInCategory,
  promotedItems,
  type MenuView,
  type MenuViewItem,
  type MenuViewCategory,
  type MenuRestaurant,
  type MenuSocial,
  type MenuViewLabels,
} from "@/features/menu/domain/menu-view";

/** CSS custom properties that carry the tenant's live colors/tokens. */
type MenuVars = CSSProperties & Record<`--pv-${string}`, string>;
type ButtonStyle = ThemeConfig["components"]["buttonStyle"];

/**
 * The public restaurant-menu renderer. Fully driven by the tenant's
 * {@link ThemeConfig} via inline CSS custom properties on the root, consumed
 * with Tailwind arbitrary values. `layout` is controlled by the caller.
 *
 * Interactions: item cards are compact (image, name, price, prep, calories) and
 * open a themed detail modal (description + add-ons) on click; the "categories"
 * mode drills from a category grid into a 2-up item list; promoted items surface
 * in a Promotions strip. Used by BOTH the public page and the Theme Builder
 * preview, so the two stay identical.
 */
export function RestaurantMenu({
  theme,
  data,
  layout,
  labels,
  className,
}: {
  theme: ThemeConfig;
  data: MenuView;
  layout: LayoutMode;
  labels: MenuViewLabels;
  className?: string;
}) {
  const { brandColors: c, typography, components, brandAssets } = theme;
  const buttonStyle = components.buttonStyle;

  const [selectedCategory, setActiveCategory] = useState<string>(
    data.categories[0]?.id ?? "",
  );
  const [categoriesView, setCategoriesView] = useState<"grid" | "items">("grid");
  const [selectedItem, setSelectedItem] = useState<MenuViewItem | null>(null);

  // Derive the active category during render instead of syncing via an effect:
  // if the current selection is no longer in the data, fall back to the first.
  const activeCategory = data.categories.some((cat) => cat.id === selectedCategory)
    ? selectedCategory
    : data.categories[0]?.id ?? "";

  const screenStyle: MenuVars = {
    padding: 0,
    "--pv-bg": c.background,
    "--pv-primary": c.primary,
    "--pv-secondary": c.secondary,
    "--pv-text": c.text,
    "--pv-surface": `color-mix(in srgb, ${c.text} 5%, ${c.background})`,
    "--pv-border": `color-mix(in srgb, ${c.text} 14%, ${c.background})`,
    "--pv-primary-soft": `color-mix(in srgb, ${c.primary} 14%, ${c.background})`,
    "--pv-radius": RADIUS_VALUES[components.borderRadius],
    "--pv-shadow": SHADOW_VALUES[components.shadow],
    backgroundColor: "var(--pv-bg)",
    color: "var(--pv-text)",
    fontFamily: `'${typography.bodyFont}', system-ui, sans-serif`,
  };
  const headingFont = `'${typography.headingFont}', Georgia, serif`;

  const items = itemsInCategory(data, activeCategory);
  const promos = promotedItems(data);
  const activeName =
    data.categories.find((cat) => cat.id === activeCategory)?.name ?? "";
  const openItem = (item: MenuViewItem) => setSelectedItem(item);

  return (
    <div className={className} style={screenStyle}>
      <MenuHeader
        restaurant={data.restaurant}
        brandAssets={brandAssets}
        headingFont={headingFont}
        labels={labels}
      />

      {promos.length > 0 && (
        <PromotionsStrip
          items={promos}
          labels={labels}
          headingFont={headingFont}
          onOpen={openItem}
        />
      )}

      {layout === "categories" &&
        (categoriesView === "grid" ? (
          <div className="px-5 pb-8 pt-5">
            <SectionHeading headingFont={headingFont}>{labels.categories}</SectionHeading>
            <CategoryGrid
              categories={data.categories}
              headingFont={headingFont}
              onSelect={(id) => {
                setActiveCategory(id);
                setCategoriesView("items");
              }}
            />
          </div>
        ) : (
          <div className="px-5 pb-8 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                aria-label={labels.back}
                onClick={() => setCategoriesView("grid")}
                className="grid h-8 w-8 place-items-center rounded-full"
                style={{ backgroundColor: "var(--pv-surface)", color: "var(--pv-text)" }}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <SectionHeading headingFont={headingFont} className="mb-0">
                {activeName}
              </SectionHeading>
            </div>
            <ItemGrid items={items} headingFont={headingFont} labels={labels} onOpen={openItem} />
          </div>
        ))}

      {layout === "nav" && (
        <div className="pb-8">
          <CategoryNav
            categories={data.categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
          <div className="px-5 pt-4">
            <SectionHeading headingFont={headingFont}>{activeName}</SectionHeading>
            <ItemGrid items={items} headingFont={headingFont} labels={labels} onOpen={openItem} />
          </div>
        </div>
      )}

      {layout === "sidebar" && (
        <div className="flex pb-8">
          <CategorySidebar
            categories={data.categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
          <div className="min-w-0 flex-1 px-4 pt-4">
            <SectionHeading headingFont={headingFont}>{activeName}</SectionHeading>
            <ItemGrid items={items} headingFont={headingFont} labels={labels} onOpen={openItem} />
          </div>
        </div>
      )}

      <MenuFooter restaurant={data.restaurant} />

      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            labels={labels}
            buttonStyle={buttonStyle}
            headingFont={headingFont}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------- header --------------------------------- */

function MenuHeader({
  restaurant,
  brandAssets,
  headingFont,
  labels,
}: {
  restaurant: MenuRestaurant;
  brandAssets: ThemeConfig["brandAssets"];
  headingFont: string;
  labels: MenuViewLabels;
}) {
  return (
    <header>
      <div
        className="h-32 w-full bg-cover bg-center"
        style={{
          backgroundImage: brandAssets.coverImageUrl
            ? `url(${brandAssets.coverImageUrl})`
            : "linear-gradient(135deg, var(--pv-primary), var(--pv-secondary))",
        }}
      />
      <div className="flex items-end gap-3 px-5 pb-3">
        <div
          className="-mt-9 grid shrink-0 place-items-center overflow-hidden rounded-full border-4"
          style={{
            borderColor: "var(--pv-bg)",
            backgroundColor: "var(--pv-surface)",
            height: "4.5rem",
            width: "4.5rem",
          }}
        >
          {brandAssets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- tenant asset URL
            <img src={brandAssets.logoUrl} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--pv-primary)", fontFamily: headingFont }}
            >
              {restaurant.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <h1
            className="truncate text-xl font-bold leading-tight"
            style={{ fontFamily: headingFont, color: "var(--pv-text)" }}
          >
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="truncate text-xs" style={{ color: "var(--pv-secondary)" }}>
              {restaurant.tagline}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 pb-4 text-xs">
        {(restaurant.hoursOpen || restaurant.hoursClose) && (
          <span className="inline-flex items-center gap-1.5" style={{ color: "var(--pv-secondary)" }}>
            <Clock className="h-3.5 w-3.5" />
            {restaurant.hoursOpen} – {restaurant.hoursClose}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
          style={{ backgroundColor: "var(--pv-primary-soft)", color: "var(--pv-primary)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--pv-primary)" }} />
          {labels.openNow}
        </span>
      </div>
    </header>
  );
}

function SectionHeading({
  children,
  headingFont,
  className,
}: {
  children: ReactNode;
  headingFont: string;
  className?: string;
}) {
  return (
    <h2
      className={cn("mb-3 text-base font-semibold", className)}
      style={{ fontFamily: headingFont, color: "var(--pv-text)" }}
    >
      {children}
    </h2>
  );
}

/* ------------------------------ promotions ------------------------------- */

function PromotionsStrip({
  items,
  labels,
  headingFont,
  onOpen,
}: {
  items: MenuViewItem[];
  labels: MenuViewLabels;
  headingFont: string;
  onOpen: (item: MenuViewItem) => void;
}) {
  return (
    <section className="pt-4">
      <div className="px-5">
        <SectionHeading headingFont={headingFont} className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" style={{ color: "var(--pv-primary)" }} />
          {labels.promotions}
        </SectionHeading>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.name}
            onClick={() => onOpen(item)}
            className="flex w-40 shrink-0 flex-col overflow-hidden border text-start transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: "var(--pv-border)",
              borderRadius: "var(--pv-radius)",
              boxShadow: "var(--pv-shadow)",
              backgroundColor: "var(--pv-surface)",
            }}
          >
            <div className="relative">
              <ItemImage item={item} headingFont={headingFont} className="aspect-[16/10]" />
              <span
                className="absolute start-2 top-2 grid h-6 w-6 place-items-center rounded-full"
                style={{ backgroundColor: "var(--pv-primary)", color: "#ffffff" }}
              >
                <Sparkles className="h-3 w-3" />
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2.5">
              <h3
                className="line-clamp-1 text-sm font-semibold"
                style={{ fontFamily: headingFont, color: "var(--pv-text)" }}
              >
                {item.name}
              </h3>
              <PriceBlock item={item} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- categories ------------------------------ */

function CategoryGrid({
  categories,
  headingFont,
  onSelect,
}: {
  categories: MenuViewCategory[];
  headingFont: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className="group relative aspect-[4/3] overflow-hidden text-start"
          style={{ borderRadius: "var(--pv-radius)", boxShadow: "var(--pv-shadow)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- mock/tenant asset */}
          <img
            src={cat.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <span
            className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white"
            style={{ fontFamily: headingFont }}
          >
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function CategoryNav({
  categories,
  active,
  onSelect,
}: {
  categories: MenuViewCategory[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      className="no-scrollbar sticky top-0 z-10 flex gap-2 overflow-x-auto border-b px-5 py-3"
      style={{ backgroundColor: "var(--pv-bg)", borderColor: "var(--pv-border)" }}
      aria-label="Menu categories"
    >
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(cat.id)}
            className="shrink-0 whitespace-nowrap px-4 py-2 text-xs font-semibold transition-colors"
            style={{
              borderRadius: "9999px",
              backgroundColor: isActive ? "var(--pv-primary)" : "var(--pv-surface)",
              color: isActive ? "#ffffff" : "var(--pv-secondary)",
              border: isActive ? "1px solid transparent" : "1px solid var(--pv-border)",
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </nav>
  );
}

function CategorySidebar({
  categories,
  active,
  onSelect,
}: {
  categories: MenuViewCategory[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      className="w-28 shrink-0 border-e py-4 sm:w-36"
      style={{ borderColor: "var(--pv-border)" }}
      aria-label="Menu categories"
    >
      <ul className="flex flex-col gap-1 px-2">
        {categories.map((cat) => {
          const isActive = cat.id === active;
          return (
            <li key={cat.id}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(cat.id)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-start text-xs font-medium transition-colors"
                style={{
                  borderRadius: "var(--pv-radius)",
                  backgroundColor: isActive ? "var(--pv-primary-soft)" : "transparent",
                  color: isActive ? "var(--pv-primary)" : "var(--pv-secondary)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- mock/tenant asset */}
                <img src={cat.imageUrl} alt="" className="h-7 w-7 shrink-0 rounded-md object-cover" />
                <span className="truncate">{cat.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* ---------------------------------- items -------------------------------- */

/** 2-up responsive grid of compact item cards. */
function ItemGrid({
  items,
  headingFont,
  labels,
  onOpen,
}: {
  items: MenuViewItem[];
  headingFont: string;
  labels: MenuViewLabels;
  onOpen: (item: MenuViewItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          headingFont={headingFont}
          labels={labels}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function ItemImage({
  item,
  headingFont,
  className,
}: {
  item: MenuViewItem;
  headingFont: string;
  className?: string;
}) {
  if (item.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- mock/tenant asset
      <img src={item.imageUrl} alt="" className={cn("w-full object-cover", className)} />
    );
  }
  return (
    <div
      className={cn("grid w-full place-items-center", className)}
      style={{ backgroundColor: "var(--pv-primary-soft)" }}
      aria-hidden
    >
      <span className="text-2xl font-bold" style={{ color: "var(--pv-primary)", fontFamily: headingFont }}>
        {item.name.charAt(0)}
      </span>
    </div>
  );
}

/** Compact card: image, name, price, prep time, calories. Opens the modal. */
function ItemCard({
  item,
  headingFont,
  labels,
  onOpen,
}: {
  item: MenuViewItem;
  headingFont: string;
  labels: MenuViewLabels;
  onOpen: (item: MenuViewItem) => void;
}) {
  const soldOut = item.available === false;
  return (
    <button
      type="button"
      aria-label={item.name}
      onClick={() => onOpen(item)}
      className="group flex flex-col overflow-hidden border text-start transition-transform hover:-translate-y-0.5"
      style={{
        borderColor: "var(--pv-border)",
        borderRadius: "var(--pv-radius)",
        boxShadow: "var(--pv-shadow)",
        backgroundColor: "var(--pv-surface)",
        opacity: soldOut ? 0.6 : 1,
      }}
    >
      <div className="relative">
        <ItemImage item={item} headingFont={headingFont} className="aspect-[4/3]" />
        {soldOut && (
          <span
            className="absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{ backgroundColor: "var(--pv-bg)", color: "var(--pv-secondary)" }}
          >
            {labels.soldOut}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3
          className="line-clamp-1 text-sm font-semibold leading-tight"
          style={{ fontFamily: headingFont, color: "var(--pv-text)" }}
        >
          {item.name}
        </h3>
        <PriceBlock item={item} />
        <MetaChips item={item} labels={labels} className="mt-0.5" />
      </div>
    </button>
  );
}

function MetaChips({
  item,
  labels,
  className,
}: {
  item: MenuViewItem;
  labels: MenuViewLabels;
  className?: string;
}) {
  if (item.calories == null && item.prepMinutes == null) return null;
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]", className)}
      style={{ color: "var(--pv-secondary)" }}
    >
      {item.calories != null && (
        <span className="inline-flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {item.calories} {labels.calories}
        </span>
      )}
      {item.prepMinutes != null && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.prepMinutes} {labels.prepTime}
        </span>
      )}
    </div>
  );
}

function PriceBlock({ item }: { item: MenuViewItem }) {
  if (item.discountedPrice) {
    return (
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-sm font-bold" style={{ color: "var(--pv-primary)" }}>
          {item.discountedPrice}
        </span>
        <span className="text-xs line-through" style={{ color: "var(--pv-secondary)" }}>
          {item.price}
        </span>
      </div>
    );
  }
  return (
    <span className="whitespace-nowrap text-sm font-bold" style={{ color: "var(--pv-primary)" }}>
      {item.price}
    </span>
  );
}

/* ------------------------------ detail modal ----------------------------- */

function ItemDetailModal({
  item,
  labels,
  buttonStyle,
  headingFont,
  onClose,
}: {
  item: MenuViewItem;
  labels: MenuViewLabels;
  buttonStyle: ButtonStyle;
  headingFont: string;
  onClose: () => void;
}) {
  const soldOut = item.available === false;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-md sm:rounded-3xl"
        style={{ backgroundColor: "var(--pv-bg)", color: "var(--pv-text)" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        <button
          type="button"
          aria-label={labels.close}
          onClick={onClose}
          className="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto">
          {item.imageUrl && (
            <ItemImage item={item} headingFont={headingFont} className="h-52" />
          )}
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: headingFont, color: "var(--pv-text)" }}
              >
                {item.name}
              </h2>
              <PriceBlock item={item} />
            </div>

            {soldOut && (
              <span
                className="inline-block w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                style={{ borderColor: "var(--pv-border)", color: "var(--pv-secondary)" }}
              >
                {labels.soldOut}
              </span>
            )}

            <MetaChips item={item} labels={labels} />

            {item.description && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--pv-secondary)" }}>
                {item.description}
              </p>
            )}

            {item.addons && item.addons.length > 0 && (
              <div className="flex flex-col gap-2">
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: "var(--pv-secondary)" }}
                >
                  {labels.addOns}
                </span>
                <div className="flex flex-col gap-1.5">
                  {item.addons.map((addon) => (
                    <div
                      key={addon.name}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--pv-border)" }}
                    >
                      <span>{addon.name}</span>
                      <span style={{ color: "var(--pv-primary)" }}>{addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!soldOut && <ModalAddButton buttonStyle={buttonStyle} label={labels.addToCart} />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalAddButton({ buttonStyle, label }: { buttonStyle: ButtonStyle; label: string }) {
  const solid: CSSProperties = {
    backgroundColor: "var(--pv-primary)",
    color: "#ffffff",
    border: "1px solid transparent",
  };
  const outline: CSSProperties = {
    backgroundColor: "transparent",
    color: "var(--pv-primary)",
    border: "1px solid var(--pv-primary)",
  };
  return (
    <button
      type="button"
      className="mt-1 w-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
      style={{ ...(buttonStyle === "solid" ? solid : outline), borderRadius: "var(--pv-radius)" }}
    >
      {label}
    </button>
  );
}

/* --------------------------------- footer -------------------------------- */

function MenuFooter({ restaurant }: { restaurant: MenuRestaurant }) {
  const { phone, address, socials } = restaurant;
  if (!phone && !address && (!socials || socials.length === 0)) return null;

  return (
    <footer className="mt-2 border-t px-5 py-5" style={{ borderColor: "var(--pv-border)" }}>
      <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--pv-secondary)" }}>
        {phone && (
          <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:opacity-80">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {phone}
          </a>
        )}
        {address && (
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {address}
          </span>
        )}
      </div>
      {socials && socials.length > 0 && (
        <div className="mt-4 flex gap-2">
          {socials.map((social) => (
            <a
              key={social.type}
              href={social.href}
              aria-label={social.label}
              className="grid h-10 w-10 place-items-center transition-colors hover:opacity-80"
              style={{
                borderRadius: "var(--pv-radius)",
                border: "1px solid var(--pv-border)",
                color: "var(--pv-text)",
              }}
            >
              <SocialIcon social={social} />
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}

function SocialIcon({ social }: { social: MenuSocial }) {
  const cls = "h-4 w-4";
  if (social.type === "instagram") return <InstagramIcon className={cls} />;
  if (social.type === "facebook") return <FacebookIcon className={cls} />;
  if (social.type === "tiktok") return <TikTokIcon className={cls} />;
  return <Globe className={cls} />;
}

/* Inline brand glyphs (lucide dropped brand icons for trademark reasons). */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden focusable="false">
      <path d="M14 8.5V7c0-.8.2-1 1-1h1.5V3H14c-2.2 0-3.5 1.3-3.5 3.6V8.5H8.5v3h2V21h3.5v-9.5h2.3l.4-3H14Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden focusable="false">
      <path d="M16.5 3c.32 1.94 1.55 3.5 3.5 3.86v2.63c-1.28.02-2.5-.36-3.53-1.05v6.06a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6.03.9.08v2.74a2.9 2.9 0 1 0 2.02 2.76V3h2.71Z" />
    </svg>
  );
}
