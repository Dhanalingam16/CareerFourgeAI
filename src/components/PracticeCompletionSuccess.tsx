import React from 'react';
import {
  CheckCircle2, Award, Clock, Target, ArrowRight, ExternalLink,
  BookOpen, Sparkles, Code, Database, Mic, RefreshCw
} from 'lucide-react';
import { PracticeRecord } from '../types';

interface PracticeCompletionSuccessProps {
  isOpen?: boolean;
  record: PracticeRecord | null;
  onReview?: () => void;
  onReviewAnswers?: () => void;
  onViewProfile?: () => void;
  onClose?: () => void;
  onReturnDashboard?: () => void;
}

export const PracticeCompletionSuccess: React.FC<PracticeCompletionSuccessProps> = ({
  isOpen = true,
  record,
  onReview,
  onReviewAnswers,
  onViewProfile,
  onClose,
  onReturnDashboard
}) => {
  if (!isOpen || !record) return null;

  const handleReview = onReview || onReviewAnswers;
  const handleReturn = onReturnDashboard || onClose;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const getModuleIcon = () => {
    switch (record.practiceType) {
      case 'coding':
        return <Code className="w-5 h-5 text-emerald-600" />;
      case 'sql':
        return <Database className="w-5 h-5 text-cyan-600" />;
      case 'ai-interview':
        return <Mic className="w-5 h-5 text-purple-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Success Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-7 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-white/20 text-white backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-emerald-100 block mb-1">
            ✓ Practice Completed Successfully
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Session Evaluated & Saved
          </h2>
          <p className="text-emerald-100 text-xs mt-1.5 max-w-md mx-auto">
            Your practice session has been completed successfully and permanently recorded to your profile history.
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="p-6 space-y-6">
          
          {/* Main Score & Accuracy Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                Final Score
              </span>
              <span className="text-3xl font-black text-[#0A192F] mt-1 block">
                {record.score}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Earned overall</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                Accuracy Rate
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {record.accuracy}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Valid responses</span>
            </div>
          </div>

          {/* Module-Specific Breakdown Cards */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                {getModuleIcon()}
                <span className="font-bold text-[#0A192F] uppercase tracking-wider text-[11px]">
                  {record.practiceType.replace('-', ' ')} Summary
                </span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                {formatTime(record.timeTakenSeconds)} taken
              </span>
            </div>

            {/* Aptitude Metrics */}
            {record.practiceType === 'aptitude' && (
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                  <span className="font-bold text-[#0A192F] text-sm">{record.totalQuestions}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Attempted</span>
                  <span className="font-bold text-[#0A192F] text-sm">{record.questionsAttempted}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Correct</span>
                  <span className="font-bold text-sm">{record.metrics.correct || 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="text-[10px] text-rose-600 block uppercase font-bold">Wrong</span>
                  <span className="font-bold text-sm">{record.metrics.wrong || 0}</span>
                </div>
              </div>
            )}

            {/* Coding Metrics */}
            {record.practiceType === 'coding' && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Problems Solved</span>
                  <span className="font-bold text-[#0A192F] text-sm">
                    {record.metrics.problemsSolved || record.questionsAttempted} / {record.totalQuestions}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Best Runtime</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {record.metrics.bestRuntime || '38 ms'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Memory</span>
                  <span className="font-bold text-cyan-600 text-sm">
                    {record.metrics.bestMemory || '16.2 MB'}
                  </span>
                </div>
              </div>
            )}

            {/* SQL Metrics */}
            {record.practiceType === 'sql' && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Queries Executed</span>
                  <span className="font-bold text-[#0A192F] text-sm">
                    {record.metrics.queriesExecuted || 1}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Syntax Check</span>
                  <span className="font-bold text-sm">Valid</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Rows Returned</span>
                  <span className="font-bold text-cyan-600 text-sm">
                    {record.metrics.rowsReturned || 5}
                  </span>
                </div>
              </div>
            )}

            {/* AI Interview Metrics */}
            {record.practiceType === 'ai-interview' && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Questions Answered</span>
                  <span className="font-bold text-[#0A192F] text-sm">
                    {record.questionsAttempted} / {record.totalQuestions}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900">
                  <span className="text-[10px] text-purple-600 block uppercase font-bold">STAR Structure</span>
                  <span className="font-bold text-sm">Verified</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Role Tested</span>
                  <span className="font-bold text-slate-700 text-[10px] truncate block mt-0.5">
                    {record.metrics.targetRole || 'SWE'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Rows: Topics & Difficulty */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Difficulty Tier:</span>
              <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800">
                {record.difficulty}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Saved To:</span>
              <span className="font-bold text-[#0A192F]">Profile → Practice History</span>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                Practice Topics:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {record.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {handleReview && (
            <button
              type="button"
              onClick={handleReview}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Review Answers</span>
            </button>
          )}

          <div className="w-full sm:w-auto flex items-center space-x-2">
            {onViewProfile && (
              <button
                type="button"
                onClick={onViewProfile}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 text-xs font-bold transition-colors"
              >
                View in Profile
              </button>
            )}

            <button
              type="button"
              onClick={handleReturn || (() => window.close())}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
