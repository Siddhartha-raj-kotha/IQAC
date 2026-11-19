"use client";
import { useRef } from "react";
import { Upload, File, X, Eye } from "lucide-react";
import { t, Lang } from "@/lib/translations";

interface Props {
  lang: Lang;
  value?: string; // stored filename
  onChange?: (name: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function FileUpload({ lang, value, onChange, onRemove, disabled }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(lang === "en" ? "File too large. Max 10 MB." : "ఫైల్ చాలా పెద్దది. గరిష్టం 10 MB.");
        return;
      }
      onChange?.(file.name);
    }
  };

  if (value) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${disabled ? "bg-gray-100 border border-gray-300 text-gray-700" : "bg-green-50 border border-green-200 text-green-800"}`}>
        <File size={16} className={disabled ? "text-gray-500 flex-shrink-0" : "text-green-700 flex-shrink-0"} />
        <span className="flex-1 truncate font-medium">{value}</span>
        {!disabled && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
            title="Remove file"
          >
            <X size={15} />
          </button>
        )}
        <a href="#" className="text-blue-600 hover:underline text-xs flex items-center gap-1" title={t("viewEvidence", lang)}>
          <Eye size={14} />
        </a>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => !disabled && ref.current?.click()}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg text-sm w-full justify-center transition-all ${
          disabled
            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-600 hover:border-ku-navy hover:text-ku-navy bg-gray-50 hover:bg-blue-50"
        }`}
      >
        <Upload size={15} />
        <span>{disabled ? (lang === "en" ? "No file uploaded" : "ఫైల్ లేదు") : t("uploadFile", lang)}</span>
      </button>
      {!disabled && <p className="text-xs text-gray-400 mt-1 text-center">{t("maxFileSize", lang)}</p>}
    </div>
  );
}
