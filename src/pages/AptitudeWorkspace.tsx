import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RotateCcw,
  Sparkles, Award, BookOpen, ChevronRight, BarChart2, ShieldCheck
} from 'lucide-react';
import { userStore } from '../services/userStore';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';
import { PracticeRecord } from '../types';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const APTITUDE_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Quantitative Aptitude',
    question: 'A train 150 meters long is running at a speed of 54 km/hr. How long will it take to cross a platform 210 meters long?',
    options: ['18 seconds', '24 seconds', '20 seconds', '15 seconds'],
    correctAnswer: 1, // '24 seconds'
    explanation: 'Total distance to cover = 150m + 210m = 360m. Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 360 / 15 = 24 seconds.'
  },
  {
    id: 2,
    category: 'Quantitative Aptitude',
    question: 'If 12 men or 18 women can construct a wall in 14 days, then in how many days can 8 men and 16 women construct the same wall?',
    options: ['9 days', '10 days', '12 days', '8 days'],
    correctAnswer: 0, // '9 days'
    explanation: 'Work of 12 men = Work of 18 women => 1 man = 1.5 women. 8 men + 16 women = 8*(1.5) + 16 = 28 women. Required time = (18 * 14) / 28 = 9 days.'
  },
  {
    id: 3,
    category: 'Logical Reasoning',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
    correctAnswer: 1, // '(1/8)'
    explanation: 'This is a geometric division series where each number is halved (divided by 2) to get the next number: 1/4 / 2 = 1/8.'
  },
  {
    id: 4,
    category: 'Logical Reasoning',
    question: 'Statements: All mangoes are golden. No golden thing is cheap. Conclusions: I. All mangoes are cheap. II. No mango is cheap.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctAnswer: 1, // 'Only conclusion II follows'
    explanation: 'Since all mangoes are golden and no golden thing is cheap, it directly implies that no mango can be cheap. Thus, Conclusion II follows.'
  },
  {
    id: 5,
    category: 'Core CS & Data Interpretation',
    question: 'What is the worst-case time complexity of QuickSort when selecting the first element as the pivot?',
    options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
    correctAnswer: 1, // 'O(N^2)'
    explanation: 'In the worst case (e.g. when the input array is already sorted or reverse sorted), picking the first element as pivot partitions the array into size 0 and N-1, leading to O(N^2) time complexity.'
  }
];

export const AptitudeWorkspace: React.FC<{ onNavigateToCoding?: () => void }> = ({ onNavigateToCoding }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<PracticeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter questions
  const questions = selectedCategory === 'All'
    ? APTITUDE_QUESTIONS
    : APTITUDE_QUESTIONS.filter(q => q.category === selectedCategory);

  const currentQ = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const handleSelectOption = (optIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handlePromptEndPractice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmedEndPractice = () => {
    setIsSubmitting(true);
    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    APTITUDE_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        attempted++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const scorePct = Math.round((correct / APTITUDE_QUESTIONS.length) * 100);
    const accuracyPct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = Math.max(900 - secondsRemaining, 1);

    const record: PracticeRecord = {
      id: `apt_${Date.now()}`,
      sessionId: `apt_ws_${Date.now()}`,
      userEmail: userStore.getCurrentUserEmail(),
      practiceType: 'aptitude',
      title: 'Quantitative & Logical Aptitude Assessment',
      topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Core CS'],
      difficulty: 'Medium',
      score: scorePct,
      accuracy: accuracyPct,
      questionsAttempted: attempted,
      totalQuestions: APTITUDE_QUESTIONS.length,
      timeTakenSeconds: timeTaken,
      completedAt: new Date().toISOString(),
      status: 'Completed',
      metrics: {
        correct,
        wrong,
        unattempted: APTITUDE_QUESTIONS.length - attempted
      }
    };

    userStore.savePracticeRecord(record);
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
    APTITUDE_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: APTITUDE_QUESTIONS.length,
      pct: Math.round((correct / APTITUDE_QUESTIONS.length) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP ROW: CATEGORY TABS & COMPACT TIMER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* CATEGORY SELECTOR TABS (Matching Screenshot 2) */}
          <div className="inline-flex items-center bg-white p-1 border border-[#E2E8F0] rounded-2xl shadow-sm text-xs font-semibold">
            {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Core CS & Data Interpretation'].map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); }}
                  className={`px-5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#0A192F] text-white font-bold shadow-sm'
                      : 'text-[#475569] hover:text-[#0A192F] hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* TIMER & SUBMIT CONTROL */}
          {!showResults && (
            <div className="flex items-center space-x-3">
              <div className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl flex items-center space-x-2 font-mono text-xs text-[#0A192F] shadow-sm">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timer</span>
                <span className="font-bold text-[#0A192F]">{formatTime(secondsRemaining)}</span>
              </div>
              <button
                onClick={handlePromptEndPractice}
                className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
              >
                <span>End Practice</span>
              </button>
            </div>
          )}
        </div>

        {/* ASSESSMENT MAIN GRID */}
        {!showResults ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT QUESTION CARD (8 COLS) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* CARD TOP META */}
              <div className="flex justify-between items-center pb-2">
                <span className="px-3.5 py-1 bg-[#E0F2FE] text-[#0284C7] font-semibold text-xs rounded-full">
                  {currentQ.category}
                </span>
                <span className="text-xs text-[#64748B] font-medium">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              {/* QUESTION TEXT (Prominent) */}
              <div className="pt-1 pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#0A192F] leading-snug tracking-tight">
                  {currentQ.question}
                </h2>
              </div>

              {/* MULTIPLE-CHOICE OPTIONS LIST (Large clean clickable cards matching Screenshot 2) */}
              <div className="space-y-3 pt-1">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 px-5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-[#0A192F] bg-sky-50/40 ring-1 ring-[#0A192F] shadow-sm'
                          : 'bg-white text-[#1E293B] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-[#0A192F] text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm font-medium text-[#1E293B] leading-relaxed">{opt}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#0284C7] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* FOOTER NAV BUTTONS (Matching Screenshot 2) */}
              <div className="flex justify-between items-center pt-6 border-t border-[#E2E8F0]/80">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-6 py-2.5 border border-[#E2E8F0] disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0A192F] hover:bg-slate-50 transition-all"
                >
                  Previous Question
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePromptEndPractice}
                    className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <span>Finish Assessment</span>
                    <CheckCircle2 className="w-4 h-4 ml-1 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT QUESTION PALETTE CARD (4 COLS) (Matching Screenshot 2) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-mono">
                  QUESTION PALETTE ({questions.length})
                </h3>

                {/* NUMBERED BOXES ROW/GRID */}
                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-11 rounded-2xl font-mono text-xs font-bold transition-all border flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                            : isAnswered
                            ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500 font-bold hover:bg-emerald-100'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* PALETTE LEGEND */}
                <div className="pt-4 border-t border-[#E2E8F0]/80 space-y-2.5 text-xs text-[#64748B]">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-100/50 flex items-center justify-center"></span>
                    <span className="font-medium text-slate-600">Answered Question</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white"></span>
                    <span className="font-medium text-slate-600">Unanswered</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* RESULTS SUMMARY VIEW */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2 border-b border-[#E2E8F0] pb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">Aptitude Assessment Summary</h2>
              <p className="text-xs text-[#64748B]">Results saved to Skill Truth Engine & Candidate Profile.</p>
            </div>

            {(() => {
              const summary = getScoreSummary();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Accuracy Score</span>
                      <span className="text-3xl font-black text-sky-600 mt-1 block">{summary.pct}%</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Correct Answers</span>
                      <span className="text-3xl font-black text-emerald-600 mt-1 block">{summary.correct} / {summary.total}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Readiness Impact</span>
                      <span className="text-3xl font-black text-purple-600 mt-1 block">+12%</span>
                    </div>
                  </div>

                  {/* ANSWER BREAKDOWN & EXPLANATIONS */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-mono">Question Explanations</h4>
                    <div className="space-y-3">
                      {APTITUDE_QUESTIONS.map((q, qIndex) => {
                        const isCorrect = userAnswers[q.id] === q.correctAnswer;
                        const userAnswerOpt = userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : 'Not answered';
                        return (
                          <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0A192F]">Question {qIndex + 1}: {q.question}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              <span>Your answer: <strong>{userAnswerOpt}</strong> • Correct: <strong>{q.options[q.correctAnswer]}</strong></span>
                            </div>
                            <div className="text-slate-500 text-[11px] leading-relaxed pt-1 border-t border-slate-200">
                              <BookOpen className="w-3.5 h-3.5 inline mr-1 text-sky-600" />
                              {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => { setShowResults(false); setUserAnswers({}); setCurrentIdx(0); }}
                      className="px-6 py-2.5 border border-[#E2E8F0] text-[#0A192F] font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Retake Quiz
                    </button>

                    {onNavigateToCoding && (
                      <button
                        onClick={onNavigateToCoding}
                        className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl flex items-center transition-all shadow-sm"
                      >
                        <span>Proceed to Coding Assessment</span>
                        <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* CONFIRMATION MODAL WITH CASE-SENSITIVE "CONFIRM" VERIFICATION */}
      <EndPracticeModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedEndPractice}
        isSubmitting={isSubmitting}
        practiceTitle="Aptitude Assessment"
      />

      {/* SUCCESS MODAL */}
      {showSuccessModal && savedRecord && (
        <PracticeCompletionSuccess
          record={savedRecord}
          onReview={() => setShowSuccessModal(false)}
          onViewProfile={() => {
            if (onNavigateToCoding) onNavigateToCoding();
          }}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};
