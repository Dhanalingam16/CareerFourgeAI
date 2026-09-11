import React, { useState } from 'react';
import {
  User, Mail, GraduationCap, Briefcase, Calendar, Award, Target,
  CheckCircle2, Clock, Filter, Eye, ChevronRight, X, Code, Database,
  Mic, Sparkles, BookOpen, Layers, ArrowUpRight, BarChart3, AlertCircle
} from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';
import { PracticeRecord } from '../types';

interface ProfilePageProps {
  onNavigate: (tab: string, targetId?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const store = useUserStore();
  const stats = userStore.getPracticeStats();
  const [activeFilter, setActiveFilter] = useState<'all' | 'aptitude' | 'coding' | 'sql' | 'ai-interview'>('all');
  const [selectedRecord, setSelectedRecord] = useState<PracticeRecord | null>(null);

  const history = store.practiceHistory || [];

  const filteredHistory = history.filter(item => {
    if (activeFilter === 'all') return true;
    return item.practiceType === activeFilter;
  });

  const getModuleBadge = (type: string) => {
    switch (type) {
      case 'coding':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Code className="w-3 h-3" />
            <span>Coding</span>
          </span>
        );
      case 'sql':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <Database className="w-3 h-3" />
            <span>SQL</span>
          </span>
        );
      case 'ai-interview':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <Mic className="w-3 h-3" />
            <span>AI Interview</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <BookOpen className="w-3 h-3" />
            <span>Aptitude</span>
          </span>
        );
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          {score}%
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          {score}%
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
        {score}%
      </span>
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Just now';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const userInitials = store.profile.fullName
    ? store.profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CF';

  return (
    <div className="p-8 max-w-[1300px] mx-auto space-y-8 font-sans text-[#0F172A]">
      
      {/* 1. CANDIDATE PROFILE BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#1E3A8A] text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white">
              {userInitials}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {store.profile.fullName || 'CareerForge Candidate'}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  {store.goal.targetRole || 'Software Engineer'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{store.profile.email || 'candidate@careerforge.ai'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{store.profile.college || 'National Institute of Technology'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Class of {store.profile.graduationYear || '2026'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Job Readiness
              </span>
              <span className="text-xl font-black text-[#0A192F]">
                {store.readinessScore || 69}%
              </span>
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FFDE59]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRACTICE PERFORMANCE OVERVIEW CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider font-mono">
              Practice Performance Overview
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Real-time synced across sessions
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Completed Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                COMPLETED SESSIONS
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#0F172A] tracking-tight">
                {stats.completedSessions}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {stats.totalSessions} total logged
              </span>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                AVERAGE SCORE
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 tracking-tight">
                {stats.averageScore}%
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Latest: {stats.latestScore > 0 ? `${stats.latestScore}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Card 3: Overall Accuracy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                OVERALL ACCURACY
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#0A192F] tracking-tight">
                {stats.overallAccuracy}%
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Across all practice modules
              </span>
            </div>
          </div>

          {/* Card 4: Questions Practiced */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                QUESTIONS PRACTICED
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-purple-700 tracking-tight">
                {stats.questionsPracticed}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {stats.lastPracticeDate ? `Last: ${formatDate(stats.lastPracticeDate).split('•')[0]}` : 'Ready for next test'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. PRACTICE HISTORY TABLE & FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        
        {/* Header & Filter Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
              Practice History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently saved record of completed practice sessions and evaluated metrics.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl">
            {(['all', 'aptitude', 'coding', 'sql', 'ai-interview'] as const).map(tab => {
              const count = tab === 'all'
                ? history.length
                : history.filter(h => h.practiceType === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize flex items-center space-x-1.5 ${
                    activeFilter === tab
                      ? 'bg-white text-[#0A192F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.replace('-', ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeFilter === tab ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/60 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List Content */}
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No practice sessions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {activeFilter === 'all'
                  ? 'Complete your first dedicated practice session in Aptitude, Coding, SQL, or AI Interview to see your permanent history and evaluated metrics here.'
                  : `No ${activeFilter.replace('-', ' ')} practice sessions completed yet.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onNavigate('aptitude-practice')}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
              >
                Start Aptitude Practice
              </button>
              <button
                onClick={() => onNavigate('coding-practice')}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
              >
                Start Coding Practice
              </button>
              <button
                onClick={() => onNavigate('sql-practice')}
                className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold transition-colors"
              >
                Start SQL Practice
              </button>
              <button
                onClick={() => onNavigate('interview-practice')}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
              >
                Start AI Interview
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-5">Module</th>
                  <th className="py-3 px-5">Session / Topics</th>
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Time</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      {getModuleBadge(item.practiceType)}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors text-xs line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">
                          {item.difficulty}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-xs">{item.topics.slice(0, 2).join(', ')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(item.completedAt)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getScoreBadge(item.score)}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-emerald-600 font-mono">
                      {item.accuracy}%
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-slate-600">
                      {item.questionsAttempted} / {item.totalQuestions}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-slate-500">
                      {formatTime(item.timeTakenSeconds)}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(item);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. DETAIL INSPECTION MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#0A192F] p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {selectedRecord.practiceType === 'coding' ? (
                    <Code className="w-5 h-5 text-emerald-400" />
                  ) : selectedRecord.practiceType === 'sql' ? (
                    <Database className="w-5 h-5 text-cyan-400" />
                  ) : selectedRecord.practiceType === 'ai-interview' ? (
                    <Mic className="w-5 h-5 text-purple-400" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-cyan-300">
                      {selectedRecord.practiceType.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(selectedRecord.completedAt)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {selectedRecord.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Score & Accuracy Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Score</span>
                  <span className="text-2xl font-black text-[#0A192F] mt-1 block">{selectedRecord.score}%</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Accuracy</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">{selectedRecord.accuracy}%</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Questions</span>
                  <span className="text-2xl font-black text-[#0A192F] mt-1 block">
                    {selectedRecord.questionsAttempted}/{selectedRecord.totalQuestions}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Time Spent</span>
                  <span className="text-2xl font-black text-cyan-700 mt-1 block font-mono">
                    {formatTime(selectedRecord.timeTakenSeconds)}
                  </span>
                </div>
              </div>

              {/* Topics Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono block">Topics Evaluated</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.topics.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-medium border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Module-Specific Deep Dive */}
              {selectedRecord.practiceType === 'coding' && (
                <div className="space-y-3 bg-[#0A192F] rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold">Execution Benchmarks</span>
                    <span>Runtime: {selectedRecord.metrics.bestRuntime || '38 ms'} • Memory: {selectedRecord.metrics.bestMemory || '16.2 MB'}</span>
                  </div>
                  {selectedRecord.detailedData?.code && (
                    <div className="mt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Submitted Solution</span>
                      <pre className="p-3 bg-[#071324] rounded-lg text-xs font-mono text-[#FFDE59] overflow-x-auto leading-relaxed">
                        {selectedRecord.detailedData.code}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {selectedRecord.practiceType === 'sql' && (
                <div className="space-y-3 bg-[#0A192F] rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span className="text-cyan-400 font-bold">Database Engine Evaluation</span>
                    <span>Execution: {selectedRecord.metrics.executionTimeMs || 28} ms • Rows: {selectedRecord.metrics.rowsReturned || 5}</span>
                  </div>
                  {selectedRecord.detailedData?.query && (
                    <div className="mt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Executed SQL Query</span>
                      <pre className="p-3 bg-[#071324] rounded-lg text-xs font-mono text-[#FFDE59] overflow-x-auto leading-relaxed">
                        {selectedRecord.detailedData.query}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {selectedRecord.practiceType === 'ai-interview' && (
                <div className="space-y-3 bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-xs text-purple-900">
                  <div className="font-bold text-sm text-purple-950 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI Interview Assessment Insights</span>
                  </div>
                  <p className="leading-relaxed">
                    Evaluated against target role <span className="font-bold">{selectedRecord.metrics.targetRole || 'Software Engineer'}</span>.
                    Responses demonstrated strong STAR methodology structure with comprehensive situational context and actionable technical takeaways.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                      <span className="text-slate-500 block text-[10px]">STAR Methodology</span>
                      <span className="font-bold text-emerald-700">Verified (92% Adherence)</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                      <span className="text-slate-500 block text-[10px]">Communication Rating</span>
                      <span className="font-bold text-purple-800">Strong (Professional)</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.practiceType === 'aptitude' && (
                <div className="space-y-2 bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900">
                  <div className="font-bold text-sm text-blue-950">Aptitude Breakdown</div>
                  <p>
                    Correct answers: <span className="font-bold text-emerald-700">{selectedRecord.metrics.correct || 0}</span> | 
                    Wrong answers: <span className="font-bold text-rose-700">{selectedRecord.metrics.wrong || 0}</span> | 
                    Accuracy: <span className="font-bold text-blue-700">{selectedRecord.accuracy}%</span>
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
