"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Download, FileUp, TriangleAlert } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import type { LocalizedText } from "@/shared/i18n/localized";
import { formatMoney } from "@/shared/utils/formatMoney";
import { Button, Modal } from "@/shared/ui";
import type { Category } from "@/features/menu/domain/menu.entity";
import {
  buildTemplateCsv,
  IMPORT_BATCH_SIZE,
  MAX_IMPORT_ROWS,
  parseMenuImport,
  type ImportParseResult,
} from "@/features/menu/domain/menu-import";
import { importMenuItems, prepareMenuImport } from "@/features/menu/application/import-actions";

const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();

type Phase =
  | { kind: "start"; error?: string }
  | { kind: "preview"; parsed: ImportParseResult; newCategories: number }
  | { kind: "importing"; done: number; total: number }
  | { kind: "done"; items: number; categories: number; failedLines: number[]; error?: string };

/**
 * Bulk import dialog (BRD BR-RA-08): download a CSV template with a column per
 * menu language → fill it in a spreadsheet → upload → preview with per-line
 * errors → import in small batches with progress. Missing categories are
 * created once up front, so batches never duplicate them.
 */
export function BulkImport({
  slug,
  languages,
  defaultLanguage,
  currency,
  categories,
  onClose,
  onImported,
}: {
  slug: string;
  languages: string[];
  defaultLanguage: string;
  currency: string;
  /** Existing categories — to preview how many the file will add. */
  categories: Category[];
  onClose: () => void;
  /** Called after an import that saved something (to refresh the menu). */
  onImported: () => void;
}) {
  const { locale, dictionary: t } = useI18n();
  const im = t.menu.manage.import;
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "start" });

  const keyOf = (name: LocalizedText) => (name[defaultLanguage] ?? "").trim().toLocaleLowerCase();

  function downloadTemplate() {
    const blob = new Blob([buildTemplateCsv(languages, defaultLanguage)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-menu-template.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function readFile(file: File | undefined) {
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";
    const text = await file.text();
    // U+FFFD means it wasn't UTF-8 (e.g. Excel's legacy "CSV" with Arabic).
    if (text.includes("�")) return setPhase({ kind: "start", error: im.readError });
    const parsed = parseMenuImport(text, languages, defaultLanguage);
    if (parsed.missingColumns.length)
      return setPhase({
        kind: "start",
        error: im.missingColumns.replace("{columns}", parsed.missingColumns.join(", ")),
      });
    if (parsed.tooManyRows)
      return setPhase({ kind: "start", error: im.tooMany.replace("{max}", String(MAX_IMPORT_ROWS)) });
    if (parsed.rows.length === 0 && parsed.errors.length === 0)
      return setPhase({ kind: "start", error: im.noRows });
    const existing = new Set(categories.map((c) => keyOf(c.name)));
    const fileCategories = new Set(parsed.rows.map((r) => keyOf(r.category)));
    const newCategories = [...fileCategories].filter((k) => !existing.has(k)).length;
    setPhase({ kind: "preview", parsed, newCategories });
  }

  async function runImport(parsed: ImportParseResult) {
    const rows = parsed.rows;
    setPhase({ kind: "importing", done: 0, total: rows.length });
    let items = 0;
    let createdCategories = 0;
    const failedLines: number[] = [];
    try {
      // One representative name per category (first occurrence).
      const byKey = new Map<string, LocalizedText>();
      for (const r of rows) if (!byKey.has(keyOf(r.category))) byKey.set(keyOf(r.category), r.category);
      const { ids, created } = await prepareMenuImport({
        slug,
        defaultLanguage,
        categories: [...byKey.values()],
      });
      createdCategories = created;

      for (let start = 0; start < rows.length; start += IMPORT_BATCH_SIZE) {
        const batch = rows.slice(start, start + IMPORT_BATCH_SIZE);
        const res = await importMenuItems({
          slug,
          items: batch.map((r) => ({
            categoryId: ids[keyOf(r.category)] ?? "",
            name: r.name,
            description: r.description,
            price: { amountMinor: Math.round(r.price * 100), currency },
            available: r.available,
            imageUrl: r.imageUrl,
          })),
        });
        items += res.created;
        res.failed.forEach((i) => failedLines.push(batch[i].line));
        setPhase({ kind: "importing", done: Math.min(start + batch.length, rows.length), total: rows.length });
      }
      setPhase({ kind: "done", items, categories: createdCategories, failedLines });
    } catch {
      setPhase({ kind: "done", items, categories: createdCategories, failedLines, error: im.runError });
    }
    if (items || createdCategories) onImported();
  }

  const busy = phase.kind === "importing";

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={im.title}
      size="lg"
      footer={
        phase.kind === "preview" ? (
          <>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              {im.chooseAnother}
            </Button>
            <Button disabled={phase.parsed.rows.length === 0} onClick={() => runImport(phase.parsed)}>
              {im.run.replace("{count}", String(phase.parsed.rows.length))}
            </Button>
          </>
        ) : phase.kind === "done" ? (
          <Button onClick={onClose}>{im.close}</Button>
        ) : (
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {im.close}
          </Button>
        )
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => void readFile(e.target.files?.[0])}
      />

      {phase.kind === "start" && (
        <div className="flex flex-col gap-5">
          <ol className="flex flex-col gap-3 text-sm text-[rgb(var(--color-text))]">
            {[im.step1, im.step2, im.step3].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-primary))]/10 text-xs font-semibold text-[rgb(var(--color-primary))]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              {im.downloadTemplate}
            </Button>
            <Button onClick={() => fileRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              {im.chooseFile}
            </Button>
          </div>
          <p className="text-xs text-[rgb(var(--color-muted))]">
            {im.note.replace("{lang}", langName(defaultLanguage))}
          </p>
          {phase.error && <ErrorBox text={phase.error} />}
        </div>
      )}

      {phase.kind === "preview" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-[rgb(var(--color-text))]">
            {im.summary
              .replace("{items}", String(phase.parsed.rows.length))
              .replace(
                "{categories}",
                String(new Set(phase.parsed.rows.map((r) => keyOf(r.category))).size),
              )
              .replace("{newCategories}", String(phase.newCategories))}
          </p>

          {phase.parsed.rows.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{im.preview}</span>
              <ul className="flex flex-col divide-y divide-[rgb(var(--color-border))] rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] text-sm">
                {phase.parsed.rows.slice(0, 6).map((r) => (
                  <li key={r.line} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="min-w-0 truncate text-[rgb(var(--color-text))]">
                      {r.name[defaultLanguage]}
                      <span className="text-[rgb(var(--color-muted))]"> · {r.category[defaultLanguage]}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[rgb(var(--color-text))]">
                      {formatMoney({ amountMinor: Math.round(r.price * 100), currency }, locale)}
                    </span>
                  </li>
                ))}
              </ul>
              {phase.parsed.rows.length > 6 && (
                <span className="text-xs text-[rgb(var(--color-muted))]">
                  {im.more.replace("{count}", String(phase.parsed.rows.length - 6))}
                </span>
              )}
            </div>
          )}

          {phase.parsed.errors.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-[var(--radius-active)] bg-amber-50 p-3 text-sm text-amber-900">
              <span className="flex items-center gap-1.5 font-medium">
                <TriangleAlert className="h-4 w-4" />
                {im.errors.replace("{count}", String(phase.parsed.errors.length))}
              </span>
              <ul className="flex flex-col gap-0.5 text-xs">
                {phase.parsed.errors.slice(0, 15).map((e) => (
                  <li key={e.line}>
                    {im.line.replace("{line}", String(e.line))}: {im.err[e.code]}
                  </li>
                ))}
              </ul>
              {phase.parsed.errors.length > 15 && (
                <span className="text-xs">
                  {im.more.replace("{count}", String(phase.parsed.errors.length - 15))}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {phase.kind === "importing" && (
        <div className="flex flex-col gap-3 py-4">
          <p className="text-sm text-[rgb(var(--color-text))]">
            {im.importing.replace("{done}", String(phase.done)).replace("{total}", String(phase.total))}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--color-surface))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--color-primary))] transition-all"
              style={{ width: `${phase.total ? (phase.done / phase.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {phase.kind === "done" && (
        <div className="flex flex-col gap-3">
          <p className="flex items-start gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {im.done
              .replace("{items}", String(phase.items))
              .replace("{categories}", String(phase.categories))}
          </p>
          {phase.failedLines.length > 0 && (
            <ErrorBox
              text={im.failed
                .replace("{count}", String(phase.failedLines.length))
                .replace("{lines}", phase.failedLines.slice(0, 20).join(", "))}
            />
          )}
          {phase.error && <ErrorBox text={phase.error} />}
        </div>
      )}
    </Modal>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 rounded-[var(--radius-active)] bg-red-50 px-3 py-2 text-sm text-red-700">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {text}
    </p>
  );
}
