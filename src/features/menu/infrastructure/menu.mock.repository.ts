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

function seedSakura(): MenuStore {
  return {
    slug: "sakura-sushi",
    categories: [
      { id: "sk_nigiri", name: { en: "Nigiri", ar: "نيغيري" }, position: 0 },
      { id: "sk_rolls", name: { en: "Signature Rolls", ar: "لفائف مميّزة" }, position: 1 },
      { id: "sk_ramen", name: { en: "Ramen", ar: "رامن" }, position: 2 },
    ],
    items: [
      { id: "sk_salmon", categoryId: "sk_nigiri", name: { en: "Salmon Nigiri", ar: "سلمون نيغيري" }, description: { en: "Two pieces, wild-caught salmon.", ar: "قطعتان من السلمون البرّي." }, price: money(20), available: true, imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop" },
      { id: "sk_tuna", categoryId: "sk_nigiri", name: { en: "Tuna Nigiri", ar: "تونا نيغيري" }, description: { en: "Two pieces, bluefin tuna.", ar: "قطعتان من تونا الزعنفة الزرقاء." }, price: money(24), available: true },
      { id: "sk_dragon", categoryId: "sk_rolls", name: { en: "Dragon Roll", ar: "لفيفة التنّين" }, description: { en: "Eel, avocado, cucumber.", ar: "أنقليس وأفوكادو وخيار." }, price: money(38), available: true, imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop" },
      { id: "sk_ramen1", categoryId: "sk_ramen", name: { en: "Tonkotsu Ramen", ar: "رامن تونكوتسو" }, description: { en: "Pork broth, soft egg, chashu.", ar: "مرق لحم وبيضة طريّة وتشاشو." }, price: money(45), available: false },
    ],
  };
}

function seedSmash(): MenuStore {
  return {
    slug: "smash-house",
    categories: [
      { id: "sm_burgers", name: { en: "Burgers", ar: "برغر" }, position: 0 },
      { id: "sm_sides", name: { en: "Sides", ar: "أطباق جانبية" }, position: 1 },
      { id: "sm_shakes", name: { en: "Shakes", ar: "ميلك شيك" }, position: 2 },
    ],
    items: [
      { id: "sm_classic", categoryId: "sm_burgers", name: { en: "The Classic", ar: "الكلاسيكي" }, description: { en: "Single smash, American cheese, house sauce.", ar: "قطعة لحم وجبنة أمريكية وصلصة البيت." }, price: money(30), available: true, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
      { id: "sm_double", categoryId: "sm_burgers", name: { en: "Double Trouble", ar: "دبل ترابل" }, description: { en: "Double smash, double cheese, pickles.", ar: "قطعتا لحم وجبنة مضاعفة ومخلّل." }, price: money(42), available: true },
      { id: "sm_fries", categoryId: "sm_sides", name: { en: "Loaded Fries", ar: "بطاطا محمّلة" }, description: { en: "Cheese sauce, jalapeños, scallions.", ar: "صلصة جبن وهالبينو وبصل أخضر." }, price: money(18), available: true },
      { id: "sm_shake", categoryId: "sm_shakes", name: { en: "Oreo Shake", ar: "ميلك شيك أوريو" }, description: { en: "Thick vanilla shake, crushed Oreo.", ar: "شيك فانيلا كثيف مع أوريو مطحون." }, price: money(16), available: true },
    ],
  };
}

/** Per-slug seed factories — restaurants not listed start with an empty menu. */
const SEEDS: Record<string, () => MenuStore> = {
  demo: seedDemo,
  "sakura-sushi": seedSakura,
  "smash-house": seedSmash,
};

function storeFor(slug: string): MenuStore {
  let store = STORES.get(slug);
  if (!store) {
    store = SEEDS[slug]?.() ?? { slug, categories: [], items: [] };
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
