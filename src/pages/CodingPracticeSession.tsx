import React, { useState, useEffect } from 'react';
import {
  Play, Send, RotateCcw, Clock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Code, FileText, Lightbulb, History, Copy, ChevronRight, Terminal, BookOpen, X, Check
} from 'lucide-react';
import { practiceSessionStore, CodingSession, CodingProblem } from '../services/practiceSessionStore';
import { CodingEvaluation, PracticeRecord } from '../types';
import { api } from '../services/api';
import { userStore } from '../services/userStore';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';

interface CodingPracticeSessionProps {
  sessionId?: string;
}

export const CodingPracticeSession: React.FC<CodingPracticeSessionProps> = ({ sessionId: propSessionId }) => {
  const sessionId = propSessionId || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '');

  const [session, setSession] = useState<CodingSession | null>(null);
  const [currentProblemIdx, setCurrentProblemIdx] = useState<number>(0);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java'>('python');
  const [code, setCode] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<CodingEvaluation | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<PracticeRecord | null>(null);
  const [isTimerStopped, setIsTimerStopped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load session from store or fallback
  useEffect(() => {
    let currentSession = sessionId ? practiceSessionStore.getCodingSession(sessionId) : null;
    if (!currentSession) {
      const fallbackId = practiceSessionStore.createCodingSession({
        topics: ['Arrays', 'Two Pointers', 'Binary Search'],
        questionCount: 4,
        difficulty: 'Medium',
        timeMinutes: 45
      });
      currentSession = practiceSessionStore.getCodingSession(fallbackId);
    }

    if (currentSession) {
      setSession(currentSession);
      setCurrentProblemIdx(currentSession.currentProblemIndex || 0);
      const prob = currentSession.problems[currentSession.currentProblemIndex || 0];
      if (prob) {
        setCode(prob.starterCode[language] || prob.starterCode.python);
      }
      if (currentSession.timeMinutes > 0) {
        setSecondsRemaining(currentSession.timeMinutes * 60);
      } else {
        setSecondsRemaining(0);
      }
    }
  }, [sessionId]);

  // Update starter code when problem or language changes
  useEffect(() => {
    if (!session) return;
    const prob = session.problems[currentProblemIdx];
    if (prob) {
      setCode(prob.starterCode[language] || prob.starterCode.python);
      setEvaluation(null);
      setSubmitFeedback(null);
    }
  }, [currentProblemIdx, language]);

  // Timer countdown
  useEffect(() => {
    if (!session || session.timeMinutes === 0 || isTimerStopped || showSuccessModal || showCompletionModal) return;
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
  }, [session, isTimerStopped, showSuccessModal, showCompletionModal]);

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#0A192F] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Loading Standalone Coding Workspace...</p>
      </div>
    );
  }

  const currentProblem = session.problems[currentProblemIdx] || session.problems[0];
  const totalProblems = session.problems.length;

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveConsoleTab('result');
    try {
      const res = await api.submitCode(code);
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    setIsRunning(true);
    setActiveConsoleTab('result');
    try {
      const res = await api.submitCode(code);
      setEvaluation(res);

      const isAccepted = res.passed_tests === res.total_tests;
      if (isAccepted) {
        userStore.submitAssessmentResult('coding-challenge', 'technical', 100);
      }

      // Record submission in session
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newSubmission = {
        problemId: currentProblem.id,
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        runtime: '38 ms',
        memory: '16.2 MB',
        time: now
      };
      const updatedSubmissions = [...(session.submissions || []), newSubmission];

      if (currentProblemIdx < totalProblems - 1) {
        // Auto-advance to next question!
        const nextIdx = currentProblemIdx + 1;
        setSubmitFeedback(`Accepted! Auto-advancing to Problem ${nextIdx + 1}...`);
        practiceSessionStore.updateCodingSession(session.sessionId, {
          submissions: updatedSubmissions,
          currentProblemIndex: nextIdx
        });

        setTimeout(() => {
          setCurrentProblemIdx(nextIdx);
          setSubmitFeedback(null);
        }, 1200);
      } else {
        // Completed all questions in the session
        practiceSessionStore.updateCodingSession(session.sessionId, {
          submissions: updatedSubmissions,
          status: 'completed'
        });
        setSubmitFeedback('All problems in practice session completed! 🎉');
        setTimeout(() => {
          handlePromptEndPractice();
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePromptEndPractice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmedEndPractice = () => {
    setIsSubmitting(true);
    setIsTimerStopped(true);

    const submissions = session.submissions || [];
    const solvedCount = new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId)).size;
    const totalProbs = session.problems.length;
    const scorePct = totalProbs > 0 ? Math.round((solvedCount / totalProbs) * 100) : 0;
    const accuracyPct = submissions.length > 0
      ? Math.round((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100)
      : (solvedCount > 0 ? 100 : 0);

    const timeTaken = session.timeMinutes > 0
      ? Math.max(session.timeMinutes * 60 - secondsRemaining, 1)
      : Math.max(Math.floor((Date.now() - session.startedAt) / 1000), 1);

    const record: PracticeRecord = {
      id: `coding_${Date.now()}`,
      sessionId: session.sessionId,
      userEmail: userStore.getCurrentUserEmail(),
      practiceType: 'coding',
      title: 'Data Structures & Algorithms Practice',
      topics: session.topics || ['Algorithms'],
      difficulty: session.difficulty || 'Medium',
      score: scorePct,
      accuracy: accuracyPct,
      questionsAttempted: Math.max(solvedCount, submissions.length > 0 ? 1 : 0),
      totalQuestions: totalProbs,
      timeTakenSeconds: timeTaken,
      completedAt: new Date().toISOString(),
      status: 'Completed',
      metrics: {
        problemsSolved: solvedCount,
        testCasesPassed: evaluation ? evaluation.passed_tests : (solvedCount * 3),
        totalTestCases: evaluation ? evaluation.total_tests : (totalProbs * 3),
        bestRuntime: evaluation ? '38 ms' : '42 ms',
        bestMemory: '16.2 MB'
      }
    };

    userStore.savePracticeRecord(record);
    practiceSessionStore.updateCodingSession(session.sessionId, { status: 'completed' });

    setSavedRecord(record);
    setIsSubmitting(false);
    setShowConfirmModal(false);
    setShowCompletionModal(false);
    setShowSuccessModal(true);
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCode[language] || currentProblem.starterCode.python);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0A192F] text-slate-200 font-sans">
      
      {/* TOP BAR */}
      <header className="h-14 bg-[#0d1f38] border-b border-slate-700/60 px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-white">CareerForge</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              Coding Practice
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 pl-3 border-l border-slate-700">
            <span className="font-mono text-cyan-400 font-semibold">
              Problem {currentProblemIdx + 1} of {totalProblems}
            </span>
            <span>•</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{currentProblem.title}</span>
          </div>
        </div>

        {/* Center: Language & Timer */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#112240] border border-slate-700/70 rounded-lg px-2.5 py-1">
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="python" className="bg-[#0A192F] text-white">Python 3</option>
              <option value="javascript" className="bg-[#0A192F] text-white">JavaScript</option>
              <option value="java" className="bg-[#0A192F] text-white">Java 17</option>
            </select>
          </div>

          {session.timeMinutes > 0 && (
            <div className="flex items-center space-x-1.5 bg-[#112240] border border-slate-700/70 rounded-lg px-3 py-1 text-xs font-mono text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}
        </div>

        {/* Right CTA buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/70 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current text-cyan-400" />
            <span>Run Code</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-3 h-3 text-white" />
            <span>Submit Solution</span>
          </button>

          <button
            onClick={handlePromptEndPractice}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            End Practice
          </button>

          <button
            onClick={() => window.close()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors ml-1"
            title="Close Standalone Tab"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Auto-advance notification banner */}
      {submitFeedback && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{submitFeedback}</span>
        </div>
      )}

      {/* MAIN 2-COLUMN VIEWPORT: 35% PROBLEM / 65% CODE EDITOR */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT 35%: PROBLEM STATEMENT */}
        <div className="w-full md:w-[35%] flex flex-col border-r border-slate-700/60 bg-[#0d1e36] overflow-hidden">
          {/* Left panel tabs */}
          <div className="h-10 bg-[#091527] border-b border-slate-700/60 px-4 flex items-center space-x-4 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                activeLeftTab === 'description' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('editorial')}
              className={`flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                activeLeftTab === 'editorial' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                activeLeftTab === 'submissions' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({session.submissions?.length || 0})</span>
            </button>
          </div>

          {/* Left panel scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {activeLeftTab === 'description' && (
              <>
                {/* Title & Metadata */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                      {currentProblem.category}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {currentProblem.title}
                  </h1>
                  <div className="flex items-center space-x-2 mt-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentProblem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      currentProblem.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {currentProblem.difficulty}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400">Problem {currentProblemIdx + 1} of {totalProblems}</span>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="text-slate-300 space-y-2">
                  <p>{currentProblem.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Examples</span>
                  {currentProblem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-[#091527] border border-slate-700/70 rounded-xl p-3.5 space-y-2 font-mono text-[11px]">
                      <div className="text-slate-400 font-bold text-[10px] uppercase">Example {idx + 1}:</div>
                      <div>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-white font-semibold">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Output: </span>
                        <span className="text-emerald-400 font-semibold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-slate-500 font-sans">Explanation: </span>
                          <span className="text-slate-300 font-sans">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Constraints</span>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-400 font-mono text-[11px]">
                    {currentProblem.constraints.map((c, idx) => (
                      <li key={idx}><code>{c}</code></li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white">Optimal Approach & Complexity Analysis</h3>
                <p className="text-slate-300 leading-relaxed">
                  To achieve optimal runtime for {currentProblem.title}, analyze invariants and divide the search space. Use pointer operations to achieve O(1) auxiliary space.
                </p>
                <div className="p-3 rounded-lg bg-[#091527] border border-slate-700 font-mono text-[11px] text-cyan-300">
                  Time Complexity: O(log N) or O(N)<br/>
                  Space Complexity: O(1) auxiliary
                </div>
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Past Submissions</span>
                {session.submissions && session.submissions.length > 0 ? (
                  session.submissions.map((sub, idx) => (
                    <div key={idx} className="bg-[#091527] border border-slate-700/70 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{sub.status}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <span>{sub.runtime}</span> • <span>{sub.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6 italic">No submissions made yet in this session.</p>
                )}
              </div>
            )}

          </div>

          {/* Left panel bottom problem pager */}
          <div className="h-11 bg-[#091527] border-t border-slate-700/60 px-4 flex items-center justify-between shrink-0 text-xs">
            <button
              disabled={currentProblemIdx === 0}
              onClick={() => setCurrentProblemIdx(prev => Math.max(0, prev - 1))}
              className="flex items-center space-x-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev Problem</span>
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              {currentProblemIdx + 1} / {totalProblems}
            </span>

            <button
              disabled={currentProblemIdx === totalProblems - 1}
              onClick={() => setCurrentProblemIdx(prev => Math.min(totalProblems - 1, prev + 1))}
              className="flex items-center space-x-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <span>Next Problem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT 65%: CODE EDITOR & CONSOLE */}
        <div className="w-full md:w-[65%] flex flex-col bg-[#0A192F] overflow-hidden">
          
          {/* Editor Sub-Header */}
          <div className="h-10 bg-[#0c1c33] border-b border-slate-700/60 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'java'}</span>
            </div>

            <button
              onClick={handleResetCode}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset to starter template"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Code Editor Area with Line Numbers */}
          <div className="flex-1 flex overflow-hidden relative bg-[#071324]">
            {/* Line Number Gutter */}
            <div className="w-12 py-3 bg-[#050e1a] select-none text-right pr-3 font-mono text-xs text-slate-600 border-r border-slate-800 overflow-hidden shrink-0 leading-6">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newCode = code.substring(0, start) + '    ' + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => {
                    e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                  }, 0);
                }
              }}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto whitespace-pre"
            />
          </div>

          {/* BOTTOM CONSOLE PANEL (Testcases & Results) */}
          <div className="h-56 bg-[#091527] border-t border-slate-700/70 flex flex-col shrink-0">
            {/* Console Tabs */}
            <div className="h-9 bg-[#0c1c33] border-b border-slate-700/60 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4 h-full">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`flex items-center space-x-1.5 h-full border-b-2 font-semibold transition-colors ${
                    activeConsoleTab === 'testcase' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Testcases</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`flex items-center space-x-1.5 h-full border-b-2 font-semibold transition-colors ${
                    activeConsoleTab === 'result' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Results</span>
                </button>
              </div>

              {evaluation && activeConsoleTab === 'result' && (
                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  <span className={evaluation.passed_tests === evaluation.total_tests ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {evaluation.passed_tests === evaluation.total_tests ? 'Accepted' : 'Wrong Answer'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">38 ms</span>
                </div>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300">
              {activeConsoleTab === 'testcase' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {currentProblem.examples.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedTestCaseIdx === idx
                            ? 'bg-[#112240] text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#050e1a] border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px]">
                    <div className="text-slate-500 font-sans text-[10px] uppercase font-bold">Input:</div>
                    <div className="text-white">{currentProblem.examples[selectedTestCaseIdx]?.input}</div>
                    <div className="text-slate-500 font-sans text-[10px] uppercase font-bold mt-2">Expected Output:</div>
                    <div className="text-emerald-400">{currentProblem.examples[selectedTestCaseIdx]?.output}</div>
                  </div>
                </div>
              ) : (
                <div>
                  {isRunning ? (
                    <div className="flex items-center space-x-2 text-cyan-400 py-4">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Executing test cases against sandbox...</span>
                    </div>
                  ) : evaluation ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className={`text-base font-bold ${
                          evaluation.passed_tests === evaluation.total_tests ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {evaluation.passed_tests === evaluation.total_tests ? 'Accepted' : 'Wrong Answer'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {evaluation.passed_tests} / {evaluation.total_tests} test cases passed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="bg-[#050e1a] border border-slate-800 p-2.5 rounded-lg">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Runtime</span>
                          <span className="text-white font-bold">38 ms</span>
                        </div>
                        <div className="bg-[#050e1a] border border-slate-800 p-2.5 rounded-lg">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Memory</span>
                          <span className="text-white font-bold">16.2 MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic py-4">Click "Run Code" or "Submit Solution" to inspect execution results.</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1e36] border border-slate-700 rounded-2xl p-7 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Practice Session Finished!</h2>
              <p className="text-xs text-slate-300 mt-1">
                You successfully solved all problems in this configured practice set.
              </p>
            </div>

            <div className="bg-[#081324] border border-slate-800 p-4 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Problems Solved:</span>
                <span className="font-bold text-white">{totalProblems}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Difficulty Tier:</span>
                <span className="font-bold text-cyan-300">{session.difficulty}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Submissions Recorded:</span>
                <span className="font-bold text-emerald-400">{session.submissions?.length || 0}</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Review Problems
              </button>
              <button
                type="button"
                onClick={() => window.close()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Close Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL WITH CASE-SENSITIVE "CONFIRM" VERIFICATION */}
      <EndPracticeModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedEndPractice}
        isSubmitting={isSubmitting}
        practiceTitle="Coding Practice Session"
      />

      {/* SUCCESS MODAL */}
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
