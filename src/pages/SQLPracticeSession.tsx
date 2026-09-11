import React, { useState, useEffect } from 'react';
import {
  Play, RotateCcw, Clock, ArrowRight, CheckCircle2, AlertCircle,
  Database, Table, FileText, Check, X, Terminal, ChevronRight, Layers
} from 'lucide-react';
import { practiceSessionStore, SQLSession } from '../services/practiceSessionStore';
import { SQLEvaluation, PracticeRecord } from '../types';
import { api } from '../services/api';
import { userStore } from '../services/userStore';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';

interface SQLPracticeSessionProps {
  sessionId?: string;
}

export const SQLPracticeSession: React.FC<SQLPracticeSessionProps> = ({ sessionId: propSessionId }) => {
  const sessionId = propSessionId || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '');

  const [session, setSession] = useState<SQLSession | null>(null);
  const [query, setQuery] = useState<string>('');
  const [executing, setExecuting] = useState<boolean>(false);
  const [result, setResult] = useState<SQLEvaluation | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<PracticeRecord | null>(null);

  // Load session from store or fallback
  useEffect(() => {
    let currentSession = sessionId ? practiceSessionStore.getSQLSession(sessionId) : null;
    if (!currentSession) {
      const fallbackId = practiceSessionStore.createSQLSession({
        topics: ['INNER JOIN & Multi-Table Joins', 'Aggregate Functions', 'GROUP BY & HAVING'],
        difficulty: 'Medium',
        timeMinutes: 30
      });
      currentSession = practiceSessionStore.getSQLSession(fallbackId);
    }

    if (currentSession) {
      setSession(currentSession);
      setQuery(currentSession.problem.defaultQuery);
      if (currentSession.timeMinutes > 0) {
        setSecondsRemaining(currentSession.timeMinutes * 60);
      } else {
        setSecondsRemaining(0);
      }
    }
  }, [sessionId]);

  // Timer countdown
  useEffect(() => {
    if (!session || session.timeMinutes === 0 || completedRecord) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [session, completedRecord]);

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#0A192F] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Loading Standalone SQL Workspace...</p>
      </div>
    );
  }

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await api.submitSQL(query);
      setResult(res);
      userStore.submitAssessmentResult('sql-assessment', 'technical', 100);
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const handleConfirmedEndPractice = () => {
    const totalTime = (session.timeMinutes > 0 ? session.timeMinutes * 60 : 1800);
    const timeTaken = Math.max(1, totalTime - secondsRemaining);
    const attempted = (result || query.trim().length > 30) ? 1 : 0;
    const isCorrect = result ? ((result.correctness_score && result.correctness_score >= 80) || result.result_rows.length > 0) : false;
    const correct = isCorrect ? 1 : 0;
    const score = isCorrect ? (result?.correctness_score || 95) : (attempted ? 50 : 0);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    const record: PracticeRecord = {
      id: `sql_${Date.now()}`,
      sessionId: session.sessionId || sessionId || `sql_sess_${Date.now()}`,
      userEmail: userStore.getCurrentUserEmail(),
      practiceType: 'sql',
      title: session.problem.title,
      topics: session.topics,
      difficulty: session.difficulty,
      score,
      accuracy,
      totalQuestions: 1,
      questionsAttempted: attempted,
      timeTakenSeconds: timeTaken,
      completedAt: new Date().toISOString(),
      status: 'Completed',
      metrics: {
        queriesExecuted: 1,
        syntaxValid: result?.is_valid_syntax ?? true,
        rowsReturned: result?.result_rows?.length || (result ? 5 : 0),
        executionTimeMs: result?.execution_time_ms || 28
      },
      detailedData: {
        query,
        executionTimeMs: result?.execution_time_ms || 28,
        rowsReturned: result?.result_rows?.length || (result ? 5 : 0)
      }
    };

    userStore.savePracticeRecord(record);
    setCompletedRecord(record);
    setShowEndModal(false);
  };

  const handleResetQuery = () => {
    setQuery(session.problem.defaultQuery);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0A192F] text-slate-200 font-sans">
      
      {/* TOP HEADER */}
      <header className="h-14 bg-[#0d1f38] border-b border-slate-700/60 px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-white">CareerForge</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              SQL Practice
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 pl-3 border-l border-slate-700">
            <span className="font-mono text-cyan-400 font-semibold">{session.difficulty} Tier</span>
            <span>•</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{session.problem.title}</span>
          </div>
        </div>

        {/* Center: Timer */}
        {session.timeMinutes > 0 && (
          <div className="flex items-center space-x-1.5 bg-[#112240] border border-slate-700/70 rounded-lg px-3 py-1 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        )}

        {/* Right CTA */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExecute}
            disabled={executing}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-cyan-600/20 disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current text-white" />
            <span>{executing ? 'Executing...' : 'Execute Query'}</span>
          </button>

          <button
            onClick={() => setShowEndModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-all shadow-xs"
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

      {/* MAIN 2-COLUMN VIEWPORT: 35% PROBLEM & SCHEMA / 65% SQL EDITOR & RESULTS */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT 35%: PROBLEM STATEMENT & INTERACTIVE SCHEMA VIEWER */}
        <div className="w-full md:w-[35%] flex flex-col border-r border-slate-700/60 bg-[#0d1e36] overflow-hidden">
          
          <div className="h-10 bg-[#091527] border-b border-slate-700/60 px-4 flex items-center space-x-2 shrink-0 text-xs font-semibold text-cyan-300">
            <Database className="w-3.5 h-3.5" />
            <span>Problem & Database Schema</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {/* Title & Metadata */}
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                SQL Challenge
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {session.problem.title}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {session.difficulty}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-slate-400">PostgreSQL / MySQL</span>
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Instructions</span>
              <p className="text-slate-300 leading-relaxed bg-[#091527] border border-slate-700/70 p-3.5 rounded-xl">
                {session.problem.prompt}
              </p>
            </div>

            {/* Interactive Schema Tables */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center space-x-1.5">
                <Table className="w-3.5 h-3.5 text-cyan-400" />
                <span>Database Schema</span>
              </span>

              {session.problem.schema.map((tbl, tIdx) => (
                <div key={tIdx} className="bg-[#091527] border border-slate-700/80 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-3.5 py-2 bg-[#060e1a] border-b border-slate-700/80 flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                      <Table className="w-3 h-3 text-cyan-400" />
                      <span>{tbl.table}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{tbl.columns.length} columns</span>
                  </div>

                  <div className="p-3 space-y-1.5 font-mono text-[11px]">
                    {tbl.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between py-0.5 border-b border-slate-800/60 last:border-0">
                        <span className="text-white font-medium">{col.name}</span>
                        <span className="text-slate-400 text-[10px]">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Expected Output */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Expected Output</span>
              <p className="text-slate-400 font-mono text-[11px] bg-[#091527] border border-slate-700/70 p-3 rounded-xl">
                {session.problem.expectedOutput}
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT 65%: SQL EDITOR & RESULTS TABLE */}
        <div className="w-full md:w-[65%] flex flex-col bg-[#0A192F] overflow-hidden">
          
          {/* Editor Sub-Header */}
          <div className="h-10 bg-[#0c1c33] border-b border-slate-700/60 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>query.sql</span>
            </div>

            <button
              onClick={handleResetQuery}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset query"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          {/* SQL Editor Area with Line Numbers */}
          <div className="flex-1 flex overflow-hidden relative bg-[#071324]">
            {/* Line Numbers */}
            <div className="w-12 py-3 bg-[#050e1a] select-none text-right pr-3 font-mono text-xs text-slate-600 border-r border-slate-800 overflow-hidden shrink-0 leading-6">
              {query.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* SQL Textarea */}
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-[#FFDE59] font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto whitespace-pre"
            />
          </div>

          {/* BOTTOM RESULTS PANEL */}
          <div className="h-64 bg-[#091527] border-t border-slate-700/70 flex flex-col shrink-0">
            
            {/* Results Header */}
            <div className="h-9 bg-[#0c1c33] border-b border-slate-700/60 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-semibold text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Results</span>
              </div>

              {result && (
                <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400">
                  <span>{result.result_rows.length} rows returned</span>
                  <span className="text-slate-500">•</span>
                  <span>{result.execution_time_ms} ms</span>
                </div>
              )}
            </div>

            {/* Results Table View */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs">
              {executing ? (
                <div className="flex items-center space-x-2 text-cyan-400 py-6 justify-center">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Executing SQL against relational engine...</span>
                </div>
              ) : result && result.result_rows.length > 0 ? (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#060f1c] text-cyan-300 border-b border-slate-700">
                        <th className="p-2.5">customer_id</th>
                        <th className="p-2.5">customer_name</th>
                        <th className="p-2.5">total_spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {result.result_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 text-slate-400">{row.customer_id}</td>
                          <td className="p-2.5 font-bold text-white">{row.customer_name}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">${row.total_spent?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic py-6 text-center">
                  Write your query above and click "Execute Query" to inspect live database output.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* END PRACTICE CONFIRMATION MODAL */}
      <EndPracticeModal
        isOpen={showEndModal}
        practiceType="SQL"
        onConfirm={handleConfirmedEndPractice}
        onCancel={() => setShowEndModal(false)}
      />

      {/* PRACTICE COMPLETION SUCCESS VIEW */}
      <PracticeCompletionSuccess
        isOpen={!!completedRecord}
        record={completedRecord}
        onClose={() => setCompletedRecord(null)}
        onReviewAnswers={() => setCompletedRecord(null)}
        onViewProfile={() => {
          if (window.opener) {
            window.opener.location.href = '/dashboard?tab=profile';
            window.close();
          } else {
            window.location.href = '/dashboard?tab=profile';
          }
        }}
        onReturnDashboard={() => {
          if (window.opener) {
            window.close();
          } else {
            window.location.href = '/dashboard';
          }
        }}
      />

    </div>
  );
};
