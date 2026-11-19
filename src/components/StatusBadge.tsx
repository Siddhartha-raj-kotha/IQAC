"use client";
import { SubmissionStatus, statusColorMap } from "@/lib/mockData";
import { t, Lang } from "@/lib/translations";

const statusKeyMap: Record<SubmissionStatus, string> = {
  draft: "statusDraft",
  submitted: "statusSubmitted",
  returned_hod: "statusReturnedHOD",
  approved_hod: "statusApprovedHOD",
  returned_principal: "statusReturnedPrincipal",
  approved_principal: "statusApprovedPrincipal",
  returned_iqac: "statusReturnedIQAC",
  accepted_iqac: "statusAcceptedIQAC",
};

const statusIcon: Record<SubmissionStatus, string> = {
  draft: "✏️",
  submitted: "📤",
  returned_hod: "↩️",
  approved_hod: "✅",
  returned_principal: "↩️",
  approved_principal: "✅",
  returned_iqac: "↩️",
  accepted_iqac: "🏆",
};

interface Props {
  status: SubmissionStatus;
  lang: Lang;
  size?: "sm" | "md";
}

export function StatusBadge({ status, lang, size = "md" }: Props) {
  const colorClass = statusColorMap[status];
  const label = t(statusKeyMap[status], lang);
  const icon = statusIcon[status];
  return (
    <span
      className={`badge ${colorClass} ${size === "sm" ? "text-xs py-1 px-2" : ""}`}
      role="status"
      aria-label={label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
