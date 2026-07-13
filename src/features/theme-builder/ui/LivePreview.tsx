import type { Dictionary } from "@/shared/i18n/getDictionary";
import type { ThemeConfig } from "@/shared/theme/tenant-config";
import { RestaurantMenu, type MenuView, type MenuViewLabels } from "@/features/menu";

type TB = Dictionary["themeBuilder"];

/**
 * Theme Builder live preview: a browser frame around the exact same
 * {@link RestaurantMenu} the public `/r/[slug]` page renders. The layout comes
 * from the config being edited, so the preview mirrors the real page 1:1.
 */
export function LivePreview({
  config,
  tb,
  menu,
}: {
  config: ThemeConfig;
  tb: TB;
  menu: MenuView;
}) {
  const labels: MenuViewLabels = {
    categories: tb.preview.categories,
    openNow: tb.preview.openNow,
    soldOut: tb.preview.soldOut,
    calories: tb.preview.calories,
    prepTime: tb.preview.prepTime,
    addOns: tb.preview.addOns,
    addToCart: tb.preview.addToCart,
    promotions: tb.preview.promotions,
    back: tb.preview.back,
    close: tb.preview.close,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[var(--shadow-pronounced)]">
      {/* Browser chrome (dashboard-themed, not tenant-themed) */}
      <div className="flex items-center gap-2 border-b border-[rgb(var(--color-border))] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <span className="mx-auto truncate rounded-full bg-[rgb(var(--color-bg))] px-3 py-0.5 text-[11px] text-[rgb(var(--color-muted))]">
          menunova.app/r/your-restaurant
        </span>
        <span className="hidden text-[11px] font-medium text-[rgb(var(--color-muted))] sm:inline">
          {tb.preview.device}
        </span>
      </div>

      <div className="max-h-[74vh] overflow-y-auto">
        <RestaurantMenu
          theme={config}
          data={menu}
          layout={config.components.layout}
          labels={labels}
        />
      </div>
    </div>
  );
}
