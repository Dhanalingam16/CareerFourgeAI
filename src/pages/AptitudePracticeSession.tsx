import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, RotateCcw,
  Sparkles, Award, BookOpen, ChevronRight, BarChart2, ShieldCheck, Check, X,
  Layers, ExternalLink
} from 'lucide-react';
import { practiceSessionStore, AptitudeSession, AptitudeQuestion } from '../services/practiceSessionStore';
import { userStore } from '../services/userStore';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';
import { PracticeRecord } from '../types';

interface AptitudePracticeSessionProps {
  sessionId?: string;
}

export const AptitudePracticeSession: React.FC<AptitudePracticeSessionProps> = ({ sessionId: propSessionId }) => {
  // Extract sessionId from prop or URL
  const sessionId = propSessionId || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '');

  const [session, setSession] = useState<AptitudeSession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // default 30 min
  const [isTimerStopped, setIsTimerStopped] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<PracticeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load session from store or create default fallback
  useEffect(() => {
    let currentSession = sessionId ? practiceSessionStore.getAptitudeSession(sessionId) : null;
    if (!currentSession) {
      // Fallback session if opened directly
      const fallbackId = practiceSessionStore.createAptitudeSession({
        topics: ['Percentages', 'Time & Work', 'Number Series', 'Algorithms'],
        questionCount: 15,
        difficulty: 'Medium',
        timeMinutes: 20
      });
      currentSession = practiceSessionStore.getAptitudeSession(fallbackId);
    }

    if (currentSession) {
      setSession(currentSession);
      setUserAnswers(currentSession.userAnswers || {});
      if (currentSession.timeMinutes > 0) {
        setSecondsRemaining(currentSession.timeMinutes * 60);
      } else {
        setSecondsRemaining(0); // untimed
      }
    }
  }, [sessionId]);

  // Timer countdown
  useEffect(() => {
    if (showResults || isTimerStopped || !session || session.timeMinutes === 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleConfirmedEndPractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults, isTimerStopped, session]);

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#0A192F] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Loading Dedicated Aptitude Workspace...</p>
      </div>
    );
  }

  const allQuestions = session.questions;
  const filteredQuestions = selectedCategory === 'All'
    ? allQuestions
    : allQuestions.filter(q => q.category === selectedCategory);

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0] || allQuestions[0];
  const globalIndex = allQuestions.findIndex(q => q.id === currentQ.id);

  const handleSelectOption = (optIdx: number) => {
    if (showResults) return; // locked in review mode
    const updated = {
      ...userAnswers,
      [currentQ.id]: optIdx
    };
    setUserAnswers(updated);
    practiceSessionStore.updateAptitudeSession(session.sessionId, { userAnswers: updated });
  };

  const handleClearOption = () => {
    if (showResults) return;
    const updated = { ...userAnswers };
    delete updated[currentQ.id];
    setUserAnswers(updated);
    practiceSessionStore.updateAptitudeSession(session.sessionId, { userAnswers: updated });
  };

  const handlePromptEndPractice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmedEndPractice = () => {
    setIsSubmitting(true);
    setIsTimerStopped(true);

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    allQuestions.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        attempted++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const scorePct = Math.round((correct / allQuestions.length) * 100);
    const accuracyPct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = session.timeMinutes > 0
      ? Math.max(session.timeMinutes * 60 - secondsRemaining, 1)
      : Math.max(Math.floor((Date.now() - session.startedAt) / 1000), 1);

    const record: PracticeRecord = {
      id: `aptitude_${Date.now()}`,
      sessionId: session.sessionId,
      userEmail: userStore.getCurrentUserEmail(),
      practiceType: 'aptitude',
      title: 'Aptitude Practice Assessment',
      topics: session.topics || ['Aptitude'],
      difficulty: session.difficulty || 'Medium',
      score: scorePct,
      accuracy: accuracyPct,
      questionsAttempted: attempted,
      totalQuestions: allQuestions.length,
      timeTakenSeconds: timeTaken,
      completedAt: new Date().toISOString(),
      status: 'Completed',
      metrics: {
        correct,
        wrong,
        unattempted: allQuestions.length - attempted
      }
    };

    userStore.savePracticeRecord(record);
    practiceSessionStore.updateAptitudeSession(session.sessionId, { status: 'completed' });

    setSavedRecord(record);
    setIsSubmitting(false);
    setShowConfirmModal(false);
    setShowResults(true);
    setShowSuccessModal(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getScoreSummary = () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    allQuestions.forEach(q => {
      if (userAnswers[q.id] === undefined) {
        unattempted++;
      } else if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });
    return {
      correct,
      wrong,
      unattempted,
      total: allQuestions.length,
      pct: Math.round((correct / allQuestions.length) * 100)
    };
  };

  const summary = getScoreSummary();
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-[#0A192F] flex flex-col">
      {/* FULL-SCREEN STANDALONE HEADER */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Brand & Module Identification */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-[#0A192F]">CareerForge</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                Aptitude Practice
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-[#64748B] pl-3 border-l border-slate-200">
              <span>{session.difficulty} Tier</span>
              <span>•</span>
              <span>{allQuestions.length} Problems</span>
            </div>
          </div>

          {/* Floating Category Navigation in Top Bar */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Core CS & Data Interpretation'].map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); }}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs ${
                    isActive
                      ? 'bg-white text-[#0A192F] font-bold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0A192F]'
                  }`}
                >
                  {cat === 'Core CS & Data Interpretation' ? 'Core CS' : cat}
                </button>
              );
            })}
          </div>

          {/* Controls: Timer & Submit */}
          <div className="flex items-center space-x-3">
            {session.timeMinutes > 0 && !showResults && (
              <div className="bg-slate-50 border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl flex items-center space-x-2 font-mono text-xs shadow-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Time</span>
                <span className="font-bold text-[#0A192F]">{formatTime(secondsRemaining)}</span>
              </div>
            )}

            {!showResults ? (
              <button
                onClick={handlePromptEndPractice}
                className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
              >
                <span>Submit Assessment</span>
              </button>
            ) : (
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Close Practice Tab
              </button>
            )}
          </div>
        </div>

        {/* Mobile category tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-100 mt-2 text-xs">
          {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Core CS & Data Interpretation'].map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); }}
              className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
                selectedCategory === cat ? 'bg-[#0A192F] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN VIEWPORT: 70% QUESTION CARD / 30% QUESTION PALETTE */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Results Banner (shown when submitted) */}
        {showResults && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                {summary.pct}%
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A192F]">Practice Session Complete</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  You scored {summary.correct} of {summary.total} correct. Review question explanations below.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Correct</span>
                <span className="text-base font-bold text-emerald-600">{summary.correct}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Wrong</span>
                <span className="text-base font-bold text-rose-600">{summary.wrong}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Unanswered</span>
                <span className="text-base font-bold text-slate-500">{summary.unattempted}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 70% (8 COLS): QUESTION CARD */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs relative">
              
              {/* Question Header & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-cyan-600 font-mono">
                    QUESTION {globalIndex + 1} OF {allQuestions.length}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {currentQ.topic || currentQ.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    currentQ.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                    currentQ.difficulty === 'Hard' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentQ.difficulty || 'Medium'}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-[#0A192F] leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options Cards */}
              <div className="space-y-3 mb-8">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  const isCorrect = currentQ.correctAnswer === optIdx;

                  let cardStyle = 'border-[#E2E8F0] hover:border-cyan-400 hover:bg-slate-50/50 text-[#0A192F]';
                  let circleStyle = 'border-slate-300 text-slate-600 bg-white';

                  if (showResults) {
                    if (isCorrect) {
                      cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900';
                      circleStyle = 'border-emerald-600 bg-emerald-600 text-white';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'border-rose-400 bg-rose-50/70 text-rose-900';
                      circleStyle = 'border-rose-500 bg-rose-500 text-white';
                    } else {
                      cardStyle = 'border-[#E2E8F0] opacity-60 text-slate-600';
                    }
                  } else if (isSelected) {
                    cardStyle = 'border-cyan-500 bg-cyan-50/50 text-[#0A192F] shadow-xs';
                    circleStyle = 'border-cyan-600 bg-cyan-600 text-white font-bold';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center space-x-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${cardStyle}`}
                    >
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-all ${circleStyle}`}>
                        {letter}
                      </div>
                      <span className="text-xs sm:text-sm font-medium flex-1 leading-normal">
                        {opt}
                      </span>
                      {showResults && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation in Review Mode */}
              {showResults && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-xs">
                  <div className="flex items-center space-x-2 text-cyan-700 font-bold mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Solution & Detailed Explanation</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {!showResults && userAnswers[currentQ.id] !== undefined && (
                  <button
                    type="button"
                    onClick={handleClearOption}
                    className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    Clear Selection
                  </button>
                )}

                <button
                  type="button"
                  disabled={currentIdx === filteredQuestions.length - 1}
                  onClick={() => setCurrentIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT 30% (4 COLS): QUESTION PALETTE */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Question Palette</span>
                <span className="text-xs text-[#64748B] font-mono">
                  {answeredCount} / {allQuestions.length} answered
                </span>
              </div>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-5 text-[#64748B]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded bg-cyan-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded ring-2 ring-[#0A192F] bg-slate-100" />
                  <span>Current</span>
                </div>
                {showResults && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span>Correct</span>
                  </div>
                )}
              </div>

              {/* Numbered Grid */}
              <div className="grid grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {allQuestions.map((q, idx) => {
                  const isCurrent = allQuestions[globalIndex]?.id === q.id;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCorrect = userAnswers[q.id] === q.correctAnswer;

                  let boxStyle = 'border-[#E2E8F0] bg-white text-slate-700 hover:border-cyan-400';

                  if (showResults) {
                    if (isAnswered && isCorrect) {
                      boxStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                    } else if (isAnswered && !isCorrect) {
                      boxStyle = 'border-rose-500 bg-rose-500 text-white font-bold';
                    } else {
                      boxStyle = 'border-slate-200 bg-slate-100 text-slate-400';
                    }
                  } else if (isAnswered) {
                    boxStyle = 'border-cyan-600 bg-cyan-600 text-white font-bold';
                  }

                  if (isCurrent) {
                    boxStyle += ' ring-2 ring-[#0A192F] ring-offset-1 font-extrabold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        // Switch category to All or whatever category question belongs to
                        setSelectedCategory('All');
                        const targetIdx = allQuestions.findIndex(item => item.id === q.id);
                        if (targetIdx !== -1) setCurrentIdx(targetIdx);
                      }}
                      className={`h-10 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all ${boxStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submission CTA in Palette */}
              {!showResults && (
                <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={handlePromptEndPractice}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    End Practice
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* CONFIRMATION MODAL WITH CASE-SENSITIVE "CONFIRM" VERIFICATION */}
      <EndPracticeModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedEndPractice}
        isSubmitting={isSubmitting}
        practiceTitle="Aptitude Practice"
      />

      {/* SUCCESS BANNER & RESULTS MODAL */}
      {showSuccessModal && savedRecord && (
        <PracticeCompletionSuccess
          record={savedRecord}
          onReview={() => setShowSuccessModal(false)}
          onViewProfile={() => {
            window.location.href = '/dashboard';
          }}
          onClose={() => window.close()}
        />
      )}
    </div>
  );
};
