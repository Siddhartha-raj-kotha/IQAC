"use client";
import { t, Lang } from "@/lib/translations";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Step {
  key: string;
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number; // 0-indexed
  lang: Lang;
  onStepClick?: (idx: number) => void;
}

export function WizardProgress({ steps, currentStep, lang, onStepClick }: Props) {
  return (
    <div className="w-full">
      {/* Progress text */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-ku-navy">
          {t("stepOf", lang)} {currentStep + 1} {t("of", lang)} {steps.length}:{" "}
          <span className="text-ku-blue">{steps[currentStep]?.label}</span>
        </p>
        <p className="text-sm text-gray-500">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% {lang === "en" ? "Complete" : "పూర్తయింది"}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #002147, #337ab7)",
          }}
        />
      </div>

      {/* Step pills — scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scroll-smooth">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepClick?.(idx)}
              className={`step-pill flex-shrink-0 ${isDone ? "done" : isActive ? "active" : "pending"}`}
              title={step.label}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${lang === "en" ? "Step" : "దశ"} ${idx + 1}: ${step.label}`}
            >
              {isDone ? <CheckCircle2 size={16} /> : isActive ? <span>{idx + 1}</span> : <span>{idx + 1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface NavProps {
  currentStep: number;
  totalSteps: number;
  lang: Lang;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onSubmit: () => void;
  saving?: boolean;
  isLocked?: boolean;
  isResubmit?: boolean;
}

export function WizardNav({ currentStep, totalSteps, lang, onNext, onPrev, onSave, onSubmit, saving, isLocked, isResubmit }: NavProps) {
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-5 border-t border-gray-200 mt-6 gap-3 flex-wrap">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentStep === 0}
        className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("previous", lang)}
      </button>

      <div className="flex items-center gap-3 flex-wrap justify-end">
        {!isLocked && (
          <button type="button" onClick={onSave} disabled={saving} className="btn btn-outline">
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> {t("saveDraft", lang)}...</>
            ) : (
              <>{t("saveDraft", lang)}</>
            )}
          </button>
        )}

        {isLast ? (
          isLocked ? (
            <span className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm border border-gray-300">
              🔒 {lang === "en" ? "Locked (Submitted to IQAC)" : "లాక్ చేయబడింది (IQAC కి సమర్పించబడింది)"}
            </span>
          ) : (
            <button type="button" onClick={onSubmit} className="btn btn-gold">
              {isResubmit ? `🔄 ${t("resubmitForm", lang)}` : `🚀 ${t("submitForm", lang)}`}
            </button>
          )
        ) : (
          <button type="button" onClick={onNext} className="btn btn-primary">
            {t("next", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
