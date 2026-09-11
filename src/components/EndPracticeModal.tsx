import React, { useState } from 'react';
import { AlertCircle, X, Check, ShieldAlert } from 'lucide-react';

interface EndPracticeModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  practiceTitle?: string;
  practiceType?: string;
}

export const EndPracticeModal: React.FC<EndPracticeModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  isSubmitting = false,
  practiceTitle,
  practiceType
}) => {
  const displayTitle = practiceTitle || (practiceType ? `${practiceType} Practice Session` : 'Practice Session');
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  const isExactMatch = confirmInput === 'CONFIRM';

  const handleConfirm = () => {
    if (isExactMatch && !isSubmitting) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isExactMatch && !isSubmitting) {
      handleConfirm();
    } else if (e.key === 'Escape' && !isSubmitting) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                End Assessment
              </span>
              <h3 className="text-base font-extrabold text-[#0A192F] leading-tight">
                End Practice Session?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <p className="text-sm font-semibold text-[#0A192F]">
            Are you sure you want to end this practice session?
          </p>

          <p className="leading-relaxed text-slate-600">
            Your current answers and progress in <strong className="text-[#0A192F]">{displayTitle}</strong> will be submitted for evaluation. You will not be able to resume this session once ended.
          </p>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold block">Important Notice:</span>
            <span>All completed answers will be finalized and permanently recorded to your profile history.</span>
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-[#0A192F]">
              To confirm ending this practice session, type <span className="font-mono text-rose-600 px-1 py-0.5 bg-rose-50 rounded">CONFIRM</span> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder='Type "CONFIRM"'
              disabled={isSubmitting}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-[#0A192F] tracking-wide focus:outline-none focus:border-cyan-600 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Case-sensitive verification</span>
              {confirmInput && (
                <span className={isExactMatch ? 'text-emerald-600 font-bold flex items-center' : 'text-slate-400'}>
                  {isExactMatch ? '✓ Ready to submit' : 'Must match CONFIRM'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isExactMatch || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating & Saving...</span>
              </>
            ) : (
              <span>Confirm & End Practice</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
