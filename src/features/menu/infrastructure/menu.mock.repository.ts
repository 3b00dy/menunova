import type {
  Category,
  CategoryDraft,
  CategoryId,
  CategoryPatch,
  Menu,
  MenuItem,
  MenuItemDraft,
  MenuItemId,
  MenuItemPatch,
} from "@/features/menu/domain/menu.entity";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";

/**
 * In-memory {@link MenuRepository} for demo & local development.
 *
 * State lives in module-level maps so CRUD changes persist across requests
 * within a running server process (they reset on restart — which is fine for a
 * demo). Swap for the HTTP repository by setting `MENUNOVA_DATA_MODE=live`.
 */

interface MenuStore {
  slug: string;
  categories: Category[];
  items: MenuItem[];
}

const CURRENCY = "IQD";
const money = (major: number) => ({ amountMinor: Math.round(major * 100), currency: CURRENCY });

/** Restaurants keyed by slug. Seeded with a demo menu so the board isn't empty. */
const STORES = new Map<string, MenuStore>();

function seedDemo(): MenuStore {
  return {
    slug: "demo",
    categories: [
      { id: "c_starters", name: { en: "Starters", ar: "المقبّلات" }, position: 0 },
      { id: "c_mains", name: { en: "Mains", ar: "الأطباق الرئيسية" }, position: 1 },
      { id: "c_drinks", name: { en: "Drinks", ar: "المشروبات" }, position: 2 },
    ],
    items: [
      { id: "i_bruschetta", categoryId: "c_starters", name: { en: "Bruschetta", ar: "بروسكيتا" }, description: { en: "Toasted bread, tomato, basil.", ar: "خبز محمّص وطماطم وريحان." }, price: money(18), available: true },
      { id: "i_soup", categoryId: "c_starters", name: { en: "Lentil Soup", ar: "شوربة عدس" }, description: { en: "Warm spiced red lentils.", ar: "عدس أحمر متبّل ودافئ." }, price: money(15), available: true },
      { id: "i_margherita", categoryId: "c_mains", name: { en: "Margherita Pizza", ar: "بيتزا مارغريتا" }, description: { en: "San Marzano, mozzarella, basil.", ar: "صلصة سان مارزانو وموزاريلا وريحان." }, price: money(42), available: true },
      { id: "i_burger", categoryId: "c_mains", name: { en: "Smash Burger", ar: "سماش برغر" }, description: { en: "Double patty, cheddar, pickles.", ar: "قطعتا لحم وجبنة شيدر ومخلّل." }, price: money(48), available: false },
      { id: "i_lemonade", categoryId: "c_drinks", name: { en: "Mint Lemonade", ar: "ليموناضة بالنعناع" }, description: { en: "Fresh lemon, mint, soda.", ar: "ليمون طازج ونعناع وصودا." }, price: money(12), available: true },
    ],
  };
}

function storeFor(slug: string): MenuStore {
  let store = STORES.get(slug);
  if (!store) {
    store = slug === "demo" ? seedDemo() : { slug, categories: [], items: [] };
    STORES.set(slug, store);
  }
  return store;
}

// Monotonic id generator — avoids Math.random/Date so ids are stable per run.
let seq = 0;
const nextId = (prefix: string) => `${prefix}_${(seq += 1).toString(36)}`;

function snapshot(store: MenuStore): Menu {
  return {
    restaurantSlug: store.slug,
    categories: store.categories.map((c) => ({ ...c })),
    items: store.items.map((i) => ({ ...i, price: { ...i.price } })),
  };
}

export class InMemoryMenuRepository implements MenuRepository {
  async getByRestaurantSlug(slug: string): Promise<Menu | null> {
    return snapshot(storeFor(slug));
  }

  async createItem(slug: string, draft: MenuItemDraft): Promise<MenuItem> {
    const store = storeFor(slug);
    if (!store.categories.some((c) => c.id === draft.categoryId)) {
      throw new Error(`Unknown category: ${draft.categoryId}`);
    }
    const item: MenuItem = { id: nextId("i"), ...draft, price: { ...draft.price } };
    store.items.push(item);
    return { ...item };
  }

  async updateItem(id: MenuItemId, patch: MenuItemPatch): Promise<MenuItem> {
    const store = storeForItem(id);
    const item = store.items.find((i) => i.id === id)!;
    Object.assign(item, patch, patch.price ? { price: { ...patch.price } } : {});
    return { ...item };
  }

  async deleteItem(id: MenuItemId): Promise<void> {
    const store = storeForItem(id);
    store.items = store.items.filter((i) => i.id !== id);
  }

  async createCategory(slug: string, draft: CategoryDraft): Promise<Category> {
    const store = storeFor(slug);
    const position =
      draft.position ??
      (store.categories.reduce((max, c) => Math.max(max, c.position), -1) + 1);
    const category: Category = { id: nextId("c"), name: draft.name, position };
    store.categories.push(category);
    return { ...category };
  }

  async updateCategory(id: CategoryId, patch: CategoryPatch): Promise<Category> {
    const store = storeForCategory(id);
    const category = store.categories.find((c) => c.id === id)!;
    Object.assign(category, patch);
    return { ...category };
  }

  async deleteCategory(id: CategoryId): Promise<void> {
    const store = storeForCategory(id);
    store.categories = store.categories.filter((c) => c.id !== id);
    store.items = store.items.filter((i) => i.categoryId !== id); // cascade
  }
}

/** Locate the store that owns a given item/category id (mock only). */
function storeForItem(id: MenuItemId): MenuStore {
  for (const store of STORES.values()) {
    if (store.items.some((i) => i.id === id)) return store;
  }
  throw new Error(`Item not found: ${id}`);
}
function storeForCategory(id: CategoryId): MenuStore {
  for (const store of STORES.values()) {
    if (store.categories.some((c) => c.id === id)) return store;
  }
  throw new Error(`Category not found: ${id}`);
}
