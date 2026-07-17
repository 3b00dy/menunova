# MenuNova — Backend Data Model & API Contract

This document describes the **Restaurant**, **Menu Category**, and **Menu Item** data
models and the exact REST endpoints the MenuNova frontend already calls. Implementing
the API to match this contract lets the frontend switch from its in-memory mock to the
real backend with **no frontend code changes** (flip `MENUNOVA_DATA_MODE=mock` →
`live`).

> The shapes below are taken directly from the frontend's HTTP layer
> (`*.http.repository.ts` + `*.mapper.ts`). JSON field names and endpoint paths must
> match exactly.

**Backend stack: ASP.NET Core (C#).** Two ASP.NET-specific things to get right first —
both covered with code in **§9**:
1. **JSON casing.** `System.Text.Json` defaults to **camelCase**; this API is
   **snake_case**. You must set a snake_case naming policy (§9.1) or the fields won't match.
2. **No `/api` prefix.** The frontend calls paths at the **host root**
   (`/restaurants`, `/restaurants/{slug}/menu`, `/menu-items/{id}`). Either route
   controllers at the root (not the default `api/[controller]`) **or** set
   `NEXT_PUBLIC_API_URL` to `https://host/api`.

---

## 1. Conventions

| Topic | Convention |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). All paths below are relative to it. |
| Format | JSON request/response. `Accept: application/json`; body requests send `Content-Type: application/json`. |
| **JSON casing** | **`snake_case`** for all API fields (e.g. `category_id`, `price_minor`, `image_url`). |
| Auth | Mutations (POST/PATCH/DELETE) send `Authorization: Bearer <token>`. See §7 (Authorization). |
| IDs | Opaque **strings** (UUID recommended). Frontend never parses them. |
| Timestamps | ISO 8601 strings (e.g. `created_at: "2025-11-02"` or full datetime). |
| Errors | Non-2xx returns a JSON body; frontend surfaces it as an error. Use standard codes (400 validation, 401/403 auth, 404 not found, 409 conflict for duplicate slug). |

### 1.1 Money
Prices are stored as **integer minor units** + an ISO-4217 currency code — never floats.

```jsonc
// price_minor = displayed amount × 100   →   1800 means 18.00
{ "price_minor": 1800, "currency": "IQD" }
```

### 1.2 Localized text (multi-language content)
Tenant-authored text (**category/item `name` and `description`**) is a **map of locale
code → string**. A restaurant enters content in each language it supports (currently
`en`, `ar`).

```jsonc
{ "en": "Starters", "ar": "المقبّلات" }
```
- `name` should be present for **every** language the restaurant supports.
- `description` is optional per language.
- Frontend fallback when a translation is missing: requested locale → default language → first non-empty. Backend just stores/returns the map as-is.
- Store as a JSON column, or a side `translations` table (see §6).

---

## 2. Restaurant (tenant)

The tenant record. Managed by the **super-admin** (list/create/update/delete).

| Field (API, snake_case) | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes (server-assigned) | Opaque id. |
| `slug` | string | yes | **Unique.** Used in the public menu URL `/r/{slug}`. `[a-z0-9-]`. |
| `name` | string | yes | Plain string (NOT localized). |
| `plan` | enum | yes | `free` \| `pro` \| `enterprise`. |
| `status` | enum | yes | `active` \| `trial` \| `suspended`. |
| `owner_email` | string \| null | no | Owner's email. |
| `logo_url` | string \| null | no | |
| `brand_color` | string \| null | no | Hex, themes the public menu. |
| `created_at` | string \| null | no | ISO date. |

```jsonc
// Restaurant JSON
{
  "id": "r_demo",
  "slug": "demo",
  "name": "Pizza Palace",
  "plan": "pro",
  "status": "active",
  "owner_email": "owner@pizzapalace.test",
  "logo_url": null,
  "brand_color": null,
  "created_at": "2025-11-02"
}
```

---

## 3. Restaurant language settings

Which languages a restaurant offers its menu in (drives the per-language content entry
and the public menu language switcher).

| Field | Type | Notes |
|---|---|---|
| `slug` | string | The restaurant slug. |
| `default_language` | string | Locale code (e.g. `en`). Fallback language. |
| `supported_languages` | string[] | Locale codes; **always includes `default_language`**. |

```jsonc
{ "slug": "demo", "default_language": "en", "supported_languages": ["en", "ar"] }
```

---

## 4. Menu — Category & Item

A restaurant's full menu is categories + items. **Content names/descriptions are
localized** (see §1.2).

### 4.1 Category
| Field (API) | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `name` | localized map | yes | `{ "en": "...", "ar": "..." }` |
| `position` | integer | yes | Sort order within the menu (ascending). |

### 4.2 Menu Item
| Field (API) | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `category_id` | string | yes | FK → Category.id (same restaurant). |
| `name` | localized map | yes | |
| `description` | localized map | yes (may be empty per-lang) | |
| `price_minor` | integer | yes | Minor units (see §1.1). |
| `currency` | string | yes | ISO 4217, e.g. `IQD`. |
| `available` | boolean | yes | In/out of stock toggle. |
| `image_url` | string \| null | no | |

### 4.3 Full-menu payload (`GET .../menu`)
```jsonc
{
  "restaurant_slug": "demo",
  "categories": [
    { "id": "c_starters", "name": { "en": "Starters", "ar": "المقبّلات" }, "position": 0 },
    { "id": "c_mains",    "name": { "en": "Mains",    "ar": "الأطباق الرئيسية" }, "position": 1 }
  ],
  "items": [
    {
      "id": "i_bruschetta",
      "category_id": "c_starters",
      "name":        { "en": "Bruschetta", "ar": "بروسكيتا" },
      "description": { "en": "Toasted bread, tomato, basil.", "ar": "خبز محمّص وطماطم وريحان." },
      "price_minor": 1800,
      "currency": "IQD",
      "available": true,
      "image_url": null
    }
  ]
}
```

---

## 5. API endpoints (exact paths the frontend calls)

`:slug` = restaurant slug, `:id` = the entity id. All are relative to the API base URL.

### Restaurants (super-admin)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/restaurants` | — | `Restaurant[]` |
| GET | `/restaurants/:slug` | — | `Restaurant` \| `null` |
| GET | `/restaurants/by-id/:id` | — | `Restaurant` \| `null` |
| POST | `/restaurants` | create body ↓ | created `Restaurant` |
| PATCH | `/restaurants/by-id/:id` | partial body ↓ | updated `Restaurant` |
| DELETE | `/restaurants/by-id/:id` | — | `204`/empty |

Create / update body (only sent fields on PATCH):
```jsonc
{ "name": "Pizza Palace", "slug": "demo", "owner_email": "owner@x.test", "plan": "pro", "status": "active" }
```
- **409** if `slug` already exists (create, or update to a taken slug).

### Menu (read)
| Method | Path | Response |
|---|---|---|
| GET | `/restaurants/:slug/menu` | full menu payload (§4.3) |

### Menu items
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/restaurants/:slug/menu-items` | item body ↓ | created item DTO |
| PATCH | `/menu-items/:id` | partial item body ↓ | updated item DTO |
| DELETE | `/menu-items/:id` | — | `204`/empty |

Item body (PATCH sends only changed fields):
```jsonc
{
  "category_id": "c_mains",
  "name":        { "en": "Margherita Pizza", "ar": "بيتزا مارغريتا" },
  "description": { "en": "San Marzano, mozzarella, basil.", "ar": "..." },
  "price_minor": 4200,
  "currency": "IQD",
  "available": true,
  "image_url": null
}
```

### Categories
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/restaurants/:slug/categories` | `{ "name": {..}, "position": 0 }` | created category DTO |
| PATCH | `/categories/:id` | `{ "name"?: {..}, "position"?: 0 }` | updated category DTO |
| DELETE | `/categories/:id` | — | `204`/empty. **Cascade-deletes the category's items.** |

### Restaurant language settings (not yet HTTP-wired on the frontend — implement to this shape)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/restaurants/:slug/settings/languages` | — | settings (§3) |
| PUT | `/restaurants/:slug/settings/languages` | `{ "default_language": "en", "supported_languages": ["en","ar"] }` | updated settings |

---

## 6. Suggested relational schema (reference — Postgres shown; SQL Server works too, see §9.3)

```sql
-- Restaurants (tenants)
restaurants(
  id            uuid primary key,
  slug          text unique not null,
  name          text not null,
  plan          text not null check (plan in ('free','pro','enterprise')),
  status        text not null check (status in ('active','trial','suspended')),
  owner_email   text,
  logo_url      text,
  brand_color   text,
  created_at    timestamptz not null default now()
)

-- Per-restaurant language settings
restaurant_settings(
  restaurant_id      uuid primary key references restaurants(id) on delete cascade,
  default_language   text not null,
  supported_languages text[] not null      -- must include default_language
)

-- Categories
categories(
  id            uuid primary key,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          jsonb not null,            -- { "en": "...", "ar": "..." }
  position      int  not null default 0
)

-- Menu items
menu_items(
  id            uuid primary key,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id   uuid not null references categories(id)  on delete cascade,  -- cascade = category delete removes items
  name          jsonb not null,            -- localized
  description   jsonb not null default '{}',
  price_minor   int  not null,             -- integer minor units
  currency      text not null,             -- ISO 4217
  available     boolean not null default true,
  image_url     text
)
```
(Localized `jsonb` columns are the simplest; a normalized `translations(entity, entity_id, locale, field, value)` table is an alternative.)

---

## 7. Rules & invariants (enforce server-side)

1. **Slug uniqueness** across restaurants; `409` on conflict (create or slug change).
2. **Category delete cascades** to its items (the frontend expects this — do NOT block on non-empty categories).
3. **`price_minor` is an integer** in minor units; reject floats.
4. **`name` should be non-empty for every supported language**; `description` optional. Backend may validate against `supported_languages`.
5. **`position`** orders categories ascending; on create, default to "append last" when omitted.
6. **`available`** is the in/out-of-stock flag surfaced to customers.
7. Item's `category_id` must belong to the **same restaurant**.

### Authorization (context)
- **Restaurant CRUD** (`/restaurants*`) → super-admin only.
- **Menu & category CRUD** → the owning restaurant's admin (and staff may toggle `available` only).
- Reads of a restaurant's public menu (`GET /restaurants/:slug/menu`) are public.
- Every mutation is authorized server-side (the frontend sends the bearer token but never enforces access).

---

## 8. Enums (single source of truth)

| Enum | Values |
|---|---|
| Restaurant `plan` | `free`, `pro`, `enterprise` |
| Restaurant `status` | `active`, `trial`, `suspended` |
| Locale codes (current) | `en`, `ar` (extensible) |

---

## 9. ASP.NET Core (C#) implementation

### 9.1 JSON serialization (REQUIRED — snake_case + string enums)
`System.Text.Json` defaults to camelCase; this API is snake_case. Configure it once.
`JsonNamingPolicy.SnakeCaseLower` requires **.NET 8+** (otherwise use `[JsonPropertyName]`
on each property).

```csharp
// Program.cs  (controllers)
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    // Enums as snake_case strings: free / pro / active / suspended …
    o.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower));
    // Do NOT transform dictionary KEYS — localized maps are keyed by locale ("en","ar").
    o.JsonSerializerOptions.DictionaryKeyPolicy = null;
});
// (Minimal APIs: builder.Services.ConfigureHttpJsonOptions(o => { … same … });)
```
- **Localized text** (`name`/`description`) → `Dictionary<string,string>`. Its keys stay `"en"`/`"ar"` because `DictionaryKeyPolicy` is null.
- **Price is flattened** on the wire — `price_minor` (int) + `currency` (string) are two top-level fields on the item, **not** a nested object.
- Send `null` for absent optional fields (e.g. `image_url`) — the default (`Never` ignore) is fine.

### 9.2 DTOs (C# records → the JSON in §2–§4)

```csharp
public enum RestaurantPlan { Free, Pro, Enterprise }        // ⇄ free / pro / enterprise
public enum RestaurantStatus { Active, Trial, Suspended }   // ⇄ active / trial / suspended

// snake_case policy turns OwnerEmail → owner_email, etc.
public record RestaurantDto(
    string Id, string Slug, string Name,
    RestaurantPlan Plan, RestaurantStatus Status,
    string? OwnerEmail, string? LogoUrl, string? BrandColor, string? CreatedAt);

public record CreateRestaurantRequest(
    string Name, string Slug, string? OwnerEmail,
    RestaurantPlan Plan, RestaurantStatus Status);
// PATCH: all nullable (only-present-fields semantics)
public record UpdateRestaurantRequest(
    string? Name, string? Slug, string? OwnerEmail,
    RestaurantPlan? Plan, RestaurantStatus? Status);

public record CategoryDto(string Id, Dictionary<string,string> Name, int Position);
public record UpsertCategoryRequest(Dictionary<string,string>? Name, int? Position);

public record MenuItemDto(
    string Id, string CategoryId,
    Dictionary<string,string> Name,
    Dictionary<string,string> Description,
    int PriceMinor, string Currency,
    bool Available, string? ImageUrl);

public record UpsertMenuItemRequest(
    string? CategoryId,
    Dictionary<string,string>? Name,
    Dictionary<string,string>? Description,
    int? PriceMinor, string? Currency,
    bool? Available, string? ImageUrl);

public record MenuDto(
    string RestaurantSlug,
    IReadOnlyList<CategoryDto> Categories,
    IReadOnlyList<MenuItemDto> Items);

public record LanguageSettingsDto(
    string Slug, string DefaultLanguage, IReadOnlyList<string> SupportedLanguages);
```

### 9.3 EF Core entities + `DbContext`
Works with SQL Server or Postgres. Localized `Dictionary<string,string>` is stored as a
JSON string via a value converter (`nvarchar(max)` on SQL Server, `jsonb` on Postgres).

```csharp
public class Restaurant
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = default!;
    public string Name { get; set; } = default!;
    public RestaurantPlan Plan { get; set; }
    public RestaurantStatus Status { get; set; }
    public string? OwnerEmail { get; set; }
    public string? LogoUrl { get; set; }
    public string? BrandColor { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<Category> Categories { get; set; } = new();
    public List<MenuItem> Items { get; set; } = new();
}

public class Category
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Dictionary<string,string> Name { get; set; } = new();
    public int Position { get; set; }
    public List<MenuItem> Items { get; set; } = new();
}

public class MenuItem
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public Dictionary<string,string> Name { get; set; } = new();
    public Dictionary<string,string> Description { get; set; } = new();
    public int PriceMinor { get; set; }
    public string Currency { get; set; } = default!;
    public bool Available { get; set; } = true;
    public string? ImageUrl { get; set; }
}

public class RestaurantSettings
{
    public Guid RestaurantId { get; set; }
    public string DefaultLanguage { get; set; } = "en";
    public List<string> SupportedLanguages { get; set; } = new();
}
```

```csharp
protected override void OnModelCreating(ModelBuilder b)
{
    var localized = new ValueConverter<Dictionary<string,string>, string>(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
        v => JsonSerializer.Deserialize<Dictionary<string,string>>(v, (JsonSerializerOptions?)null)
             ?? new());

    b.Entity<Restaurant>(e => {
        e.HasIndex(x => x.Slug).IsUnique();                 // §7 rule 1
        e.Property(x => x.Plan).HasConversion<string>();
        e.Property(x => x.Status).HasConversion<string>();
    });
    b.Entity<Category>().Property(x => x.Name).HasConversion(localized);
    b.Entity<MenuItem>(e => {
        e.Property(x => x.Name).HasConversion(localized);
        e.Property(x => x.Description).HasConversion(localized);
        // Deleting a category cascades to its items (§7 rule 2)
        e.HasOne<Category>().WithMany(c => c.Items)
         .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
    });
    // SupportedLanguages: Npgsql maps List<string> to text[] natively;
    // on SQL Server add a JSON value converter like `localized`.
}
```

### 9.4 Controllers (routes MUST match §5 exactly — no `api/` prefix)
```csharp
[ApiController]
public class RestaurantsController : ControllerBase
{
    [HttpGet("restaurants")]                 public Task<ActionResult<List<RestaurantDto>>> List();
    [HttpGet("restaurants/{slug}")]          public Task<ActionResult<RestaurantDto?>> GetBySlug(string slug);
    [HttpGet("restaurants/by-id/{id}")]      public Task<ActionResult<RestaurantDto?>> GetById(Guid id);
    [HttpPost("restaurants")]                public Task<ActionResult<RestaurantDto>> Create(CreateRestaurantRequest body);
    [HttpPatch("restaurants/by-id/{id}")]    public Task<ActionResult<RestaurantDto>> Update(Guid id, UpdateRestaurantRequest body);
    [HttpDelete("restaurants/by-id/{id}")]   public Task<IActionResult> Delete(Guid id); // 204
}

[ApiController]
public class MenuController : ControllerBase
{
    [HttpGet("restaurants/{slug}/menu")]            public Task<ActionResult<MenuDto>> GetMenu(string slug);
    [HttpPost("restaurants/{slug}/menu-items")]     public Task<ActionResult<MenuItemDto>> CreateItem(string slug, UpsertMenuItemRequest body);
    [HttpPatch("menu-items/{id}")]                  public Task<ActionResult<MenuItemDto>> UpdateItem(Guid id, UpsertMenuItemRequest body);
    [HttpDelete("menu-items/{id}")]                 public Task<IActionResult> DeleteItem(Guid id); // 204
    [HttpPost("restaurants/{slug}/categories")]     public Task<ActionResult<CategoryDto>> CreateCategory(string slug, UpsertCategoryRequest body);
    [HttpPatch("categories/{id}")]                  public Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, UpsertCategoryRequest body);
    [HttpDelete("categories/{id}")]                 public Task<IActionResult> DeleteCategory(Guid id); // 204
    [HttpGet("restaurants/{slug}/settings/languages")] public Task<ActionResult<LanguageSettingsDto>> GetLanguages(string slug);
    [HttpPut("restaurants/{slug}/settings/languages")] public Task<ActionResult<LanguageSettingsDto>> PutLanguages(string slug, /* {default_language, supported_languages} */ LanguageSettingsUpdate body);
}
```
- Duplicate slug → `return Conflict();` (HTTP 409, §7 rule 1).
- Not found on GET-by-slug/id → return `Ok(null)` (frontend accepts `null`) or `404`.

### 9.5 Auth (JWT bearer)
Frontend sends `Authorization: Bearer <token>` on every mutation. Enforce with policies:
- `[Authorize(Roles = "super_admin")]` on `RestaurantsController` (restaurant CRUD).
- Restaurant admin/staff on menu & category mutations (staff limited to toggling
  `available`). Menu **reads** (`GET …/menu`) can be `[AllowAnonymous]`.
Configure `AddAuthentication().AddJwtBearer(...)`; the token's role/claims map to the
roles above.
