import type { LocalizedText } from "@/shared/i18n/localized";

/**
 * Bulk menu import from a CSV template (pure — no React/fetch). The owner
 * downloads a template with one column per enabled language, fills it in
 * Excel / Google Sheets, and uploads it. Parsing tolerates what spreadsheet
 * apps actually produce: a UTF-8 BOM, `,` / `;` / tab separators, quoted cells,
 * CRLF, Arabic-Indic digits and thousands separators in prices.
 */

export const MAX_IMPORT_ROWS = 500;

/** Items per server call during import (small, so no call hits a time limit). */
export const IMPORT_BATCH_SIZE = 20;

export type ImportErrorCode =
  | "missing_category"
  | "missing_name"
  | "invalid_price"
  | "invalid_available"
  | "invalid_image";

export interface ImportRow {
  /** 1-based line in the file (header = line 1), for error messages. */
  line: number;
  category: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
  /** Price in major units (e.g. 12000 IQD). */
  price: number;
  available: boolean;
  imageUrl?: string;
}

export interface ImportParseResult {
  rows: ImportRow[];
  errors: { line: number; code: ImportErrorCode }[];
  /** Required columns absent from the header (fatal). */
  missingColumns: string[];
  /** More than {@link MAX_IMPORT_ROWS} data rows (fatal). */
  tooManyRows: boolean;
}

/** Template columns: category/name/description per language, then price, available, image_url. */
export function templateColumns(languages: string[], defaultLanguage: string): string[] {
  const langs = [defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)];
  return [
    ...langs.map((l) => `category_${l}`),
    ...langs.map((l) => `name_${l}`),
    ...langs.map((l) => `description_${l}`),
    "price",
    "available",
    "image_url",
  ];
}

const EXAMPLE: Record<string, { category: string; name: string; description: string }> = {
  en: { category: "Grills", name: "Lamb kebab", description: "Grilled lamb with bread" },
  ar: { category: "مشويات", name: "كباب لحم", description: "لحم مشوي مع خبز" },
  ckb: { category: "برژاو", name: "کەبابی گۆشت", description: "گۆشتی برژاو لەگەڵ نان" },
};

function csvCell(value: string): string {
  return /[",;\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * The downloadable template: a UTF-8 BOM (so Excel shows Arabic/Kurdish
 * correctly), the header, and one example row starting with `#` — rows whose
 * first cell starts with `#` are ignored on import.
 */
export function buildTemplateCsv(languages: string[], defaultLanguage: string): string {
  const columns = templateColumns(languages, defaultLanguage);
  const example = columns.map((col, i) => {
    const [field, lang] = col.split("_");
    let value = "";
    if (lang && (field === "category" || field === "name" || field === "description")) {
      value = EXAMPLE[lang]?.[field] ?? "";
    } else if (col === "price") value = "12000";
    else if (col === "available") value = "yes";
    return i === 0 ? `# ${value}` : value;
  });
  return "﻿" + [columns, example].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/** Pick the separator that splits the header line into the most columns. */
function detectDelimiter(firstLine: string): string {
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

/** RFC-4180 CSV → rows of cells (quotes, escaped `""`, CRLF/LF, BOM). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const delimiter = detectDelimiter(src.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

/** "12,000" / "١٢٬٠٠٠" / "12.5" / "12 000 IQD" → number; NaN when unreadable. */
export function parsePrice(raw: string): number {
  let v = raw
    .replace(/[٠-٩۰-۹]/g, (d) => DIGITS[d])
    .replace(/[٬’'\s ]/g, "")
    .replace(/٫/g, ".")
    .replace(/[^\d.,-]/g, "");
  if (v.includes(",") && v.includes(".")) v = v.replace(/,/g, "");
  else if (/^\d{1,3}(,\d{3})+$/.test(v)) v = v.replace(/,/g, "");
  else v = v.replace(",", ".");
  return v === "" ? NaN : Number(v);
}

const YES = new Set(["", "yes", "y", "true", "1", "available", "نعم", "متوفر", "متوفّر", "بەڵێ"]);
const NO = new Set(["no", "n", "false", "0", "sold out", "unavailable", "لا", "غير متوفر", "نفد", "نەخێر"]);

/** Parse an uploaded template into validated rows + per-line errors. */
export function parseMenuImport(
  text: string,
  languages: string[],
  defaultLanguage: string,
): ImportParseResult {
  const table = parseCsv(text);
  const header = (table[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  // Plain `category` / `name` / `description` also mean the default language.
  const langCol = (field: string, lang: string) => {
    const exact = col(`${field}_${lang}`);
    return exact >= 0 || lang !== defaultLanguage ? exact : col(field);
  };

  const missingColumns = [
    langCol("category", defaultLanguage) < 0 ? `category_${defaultLanguage}` : "",
    langCol("name", defaultLanguage) < 0 ? `name_${defaultLanguage}` : "",
    col("price") < 0 ? "price" : "",
  ].filter(Boolean);
  const result: ImportParseResult = { rows: [], errors: [], missingColumns, tooManyRows: false };
  if (missingColumns.length) return result;

  const imageCol = [col("image_url"), col("image"), col("photo")].find((i) => i >= 0) ?? -1;
  const data = table
    .map((cells, i) => ({ cells, line: i + 1 }))
    .slice(1)
    .filter(({ cells }) => {
      const first = cells.find((c) => c.trim() !== "")?.trim() ?? "";
      return first !== "" && !first.startsWith("#"); // blank and example/comment rows
    });
  if (data.length > MAX_IMPORT_ROWS) {
    result.tooManyRows = true;
    return result;
  }

  const read = (cells: string[], index: number) => (index >= 0 ? (cells[index] ?? "").trim() : "");
  const localizedField = (cells: string[], field: string): LocalizedText => {
    const out: LocalizedText = {};
    for (const lang of languages) {
      const value = read(cells, langCol(field, lang));
      if (value) out[lang] = value;
    }
    return out;
  };

  for (const { cells, line } of data) {
    const category = localizedField(cells, "category");
    const name = localizedField(cells, "name");
    const price = parsePrice(read(cells, col("price")));
    const availableRaw = read(cells, col("available")).toLowerCase();
    const imageUrl = read(cells, imageCol);

    let error: ImportErrorCode | null = null;
    if (!category[defaultLanguage]) error = "missing_category";
    else if (!name[defaultLanguage]) error = "missing_name";
    else if (!Number.isFinite(price) || price < 0) error = "invalid_price";
    else if (!YES.has(availableRaw) && !NO.has(availableRaw)) error = "invalid_available";
    else if (imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl)) error = "invalid_image";

    if (error) result.errors.push({ line, code: error });
    else
      result.rows.push({
        line,
        category,
        name,
        description: localizedField(cells, "description"),
        price,
        available: !NO.has(availableRaw),
        imageUrl: imageUrl || undefined,
      });
  }
  return result;
}
