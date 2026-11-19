"use client";
import { useCallback } from "react";
import { DynamicRow } from "@/lib/mockData";
import { FileUpload } from "./FileUpload";
import { Lang, t } from "@/lib/translations";
import { Plus, Trash2 } from "lucide-react";

export interface ColumnDef {
  key: string;
  header: string;
  type?: "text" | "number" | "date" | "select" | "file" | "textarea";
  options?: string[];
  placeholder?: string;
  width?: string;
  required?: boolean;
}

interface Props {
  columns: ColumnDef[];
  rows: DynamicRow[];
  onChange: (rows: DynamicRow[]) => void;
  lang: Lang;
  sectionName: string;
  readOnly?: boolean;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function DynamicTable({ columns, rows, onChange, lang, sectionName, readOnly }: Props) {
  const addRow = useCallback(() => {
    if (readOnly) return;
    const newRow: DynamicRow = { id: generateId() };
    columns.forEach(col => { newRow[col.key] = ""; });
    onChange([...rows, newRow]);
  }, [rows, columns, onChange, readOnly]);

  const removeRow = useCallback((id: string) => {
    if (readOnly) return;
    if (rows.length === 1) {
      // Reset to empty instead of removing
      const empty: DynamicRow = { id: generateId() };
      columns.forEach(col => { empty[col.key] = ""; });
      onChange([empty]);
      return;
    }
    onChange(rows.filter(r => r.id !== id));
  }, [rows, columns, onChange, readOnly]);

  const updateCell = useCallback((id: string, key: string, value: string) => {
    if (readOnly) return;
    onChange(rows.map(r => r.id === id ? { ...r, [key]: value } : r));
  }, [rows, onChange, readOnly]);

  const safeRows = rows.length === 0 ? [{ id: generateId() } as DynamicRow] : rows;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-ku-border shadow-sm">
        <table className="dynamic-table min-w-full" aria-label={sectionName}>
          <thead>
            <tr>
              <th className="w-10 text-center">#</th>
              {columns.map(col => (
                <th key={col.key} style={{ minWidth: col.width ?? "120px" }}>
                  {col.header}
                  {col.required && <span className="text-yellow-300 ml-1">*</span>}
                </th>
              ))}
              {!readOnly && <th className="w-20 text-center">{t("actions", lang)}</th>}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, rowIdx) => (
              <tr key={row.id as string}>
                <td className="text-center text-gray-400 font-medium text-sm">{rowIdx + 1}</td>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.type === "file" ? (
                      <FileUpload
                        lang={lang}
                        value={row[col.key] as string || ""}
                        onChange={name => updateCell(row.id as string, col.key, name)}
                        onRemove={() => updateCell(row.id as string, col.key, "")}
                        disabled={readOnly}
                      />
                    ) : col.type === "select" ? (
                      <select
                        className={`table-input ${readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`}
                        value={row[col.key] as string || ""}
                        onChange={e => updateCell(row.id as string, col.key, e.target.value)}
                        aria-label={col.header}
                        disabled={readOnly}
                      >
                        <option value="">{lang === "en" ? "Select..." : "ఎంచుకోండి..."}</option>
                        {col.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : col.type === "textarea" ? (
                      <textarea
                        className={`table-input resize-none ${readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`}
                        rows={2}
                        value={row[col.key] as string || ""}
                        placeholder={col.placeholder}
                        onChange={e => updateCell(row.id as string, col.key, e.target.value)}
                        aria-label={col.header}
                        disabled={readOnly}
                      />
                    ) : (
                      <input
                        type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                        className={`table-input ${readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`}
                        value={row[col.key] as string || ""}
                        placeholder={col.placeholder}
                        onChange={e => updateCell(row.id as string, col.key, e.target.value)}
                        aria-label={col.header}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id as string)}
                      className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      title={t("removeRow", lang)}
                      aria-label={`${t("removeRow", lang)} ${rowIdx + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-ku-blue text-ku-navy font-semibold rounded-xl hover:bg-blue-50 transition-all text-sm"
        >
          <Plus size={18} className="text-ku-blue" />
          {t("addRow", lang)}
        </button>
      )}

      <p className="text-xs text-gray-400">
        {readOnly
          ? (lang === "en" ? `${safeRows.length} ${safeRows.length === 1 ? "entry" : "entries"} (View Only — Form Locked)` : `${safeRows.length} ఎంట్రీ(లు) (వీక్షణ మాత్రమే — లాక్ చేయబడింది)`)
          : (lang === "en"
              ? `${safeRows.length} ${safeRows.length === 1 ? "entry" : "entries"} — Click "+ Add Row" to add more.`
              : `${safeRows.length} ఎంట్రీ(లు) — మరిన్ని జోడించడానికి "+ వరుస జోడించు" నొక్కండి.`)}
      </p>
    </div>
  );
}
