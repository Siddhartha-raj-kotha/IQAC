"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { KeyRound, Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, changePassword } = useAuth();
  const { lang } = useLang();
  const e = lang === "en";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError(e ? "Please enter your current password." : "దయచేసి మీ ప్రస్తుత పాస్‌వర్డ్‌ను నమోదు చేయండి.");
      return;
    }

    if (!newPassword.trim()) {
      setError(e ? "Please enter a new password." : "దయచేసి కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి.");
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordMinLength", lang));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t("passwordSameAsCurrent", lang));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch", lang));
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        const successMsg = t("passwordChangedSuccess", lang);
        handleClose();
        if (onSuccess) onSuccess(successMsg);
      } else {
        if (result.error === "Current password is incorrect.") {
          setError(t("incorrectCurrentPassword", lang));
        } else if (result.error === "New password must be different from current password.") {
          setError(t("passwordSameAsCurrent", lang));
        } else if (result.error === "New password must be at least 6 characters.") {
          setError(t("passwordMinLength", lang));
        } else {
          setError(result.error || (e ? "Failed to change password." : "పాస్‌వర్డ్ మార్పు విఫలమైంది."));
        }
      }
    } catch {
      setError(e ? "An unexpected error occurred." : "ఊహించని లోపం జరిగింది.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="ku-header p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("changePassword", lang)}</h3>
              <p className="text-white/70 text-xs mt-0.5">{user.name} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={t("close", lang)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-sm animate-in slide-in-from-top-1">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              {e
                ? "Enter your current password to authenticate, then choose a secure new password (min. 6 characters)."
                : "ధృవీకరణ కోసం మీ ప్రస్తుత పాస్‌వర్డ్‌ను నమోదు చేసి, కనీసం 6 అక్షరాల కొత్త పాస్‌వర్డ్‌ను ఎంచుకోండి."}
            </span>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {t("currentPassword", lang)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className="form-input pr-10 text-sm"
                placeholder={e ? "Enter current password" : "ప్రస్తుత పాస్‌వర్డ్ నమోదు చేయండి"}
                value={currentPassword}
                onChange={ev => setCurrentPassword(ev.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {t("newPassword", lang)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="form-input pr-10 text-sm"
                placeholder={e ? "Enter new password (min 6 chars)" : "కొత్త పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు)"}
                value={newPassword}
                onChange={ev => setNewPassword(ev.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {t("confirmNewPassword", lang)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="form-input pr-10 text-sm"
                placeholder={e ? "Re-enter new password" : "కొత్త పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి"}
                value={confirmPassword}
                onChange={ev => setConfirmPassword(ev.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="btn btn-secondary text-sm"
            >
              {t("cancel", lang)}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-sm flex items-center gap-2"
            >
              <Lock size={15} />
              {submitting
                ? (e ? "Updating..." : "నవీకరిస్తోంది...")
                : t("updatePassword", lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
