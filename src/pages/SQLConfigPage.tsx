import React, { useState } from 'react';
import {
  Database, CheckSquare, Square, Clock, HelpCircle, Check, ArrowRight,
  Sparkles, Layers, BookOpen, ChevronRight, Zap, Target, Table
} from 'lucide-react';
import { practiceSessionStore } from '../services/practiceSessionStore';

const SQL_TOPIC_GROUPS = [
  {
    category: 'Core Querying & Aggregations',
    topics: [
      'Basic SELECT & WHERE Filtering',
      'Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)',
      'GROUP BY & HAVING Clauses',
      'ORDER BY & Pagination (LIMIT/OFFSET)',
      'NULL Value Handling & COALESCE'
    ]
  },
  {
    category: 'Relational Joins & Set Operations',
    topics: [
      'INNER JOIN & Multi-Table Joins',
      'LEFT / RIGHT OUTER JOINs',
      'FULL OUTER JOIN & CROSS JOIN',
      'Self Joins & Complex Hierarchies',
      'UNION & UNION ALL Set Operations'
    ]
  },
  {
    category: 'Advanced Analytics & Optimization',
    topics: [
      'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
      'Analytics Functions (LEAD, LAG, NTILE)',
      'Subqueries (Correlated & Scalar)',
      'Common Table Expressions (CTEs & Recursive CTEs)',
      'String & Date Functions',
      'Indexing & Query Optimization Concepts',
      'Transactions & ACID Principles'
    ]
  }
];

const QUESTION_COUNTS = [5, 10, 15, 20];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const TIME_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
  { label: 'No Time Limit', value: 0 }
];

export const SQLConfigPage: React.FC = () => {
  const allTopicsFlat = SQL_TOPIC_GROUPS.flatMap(g => g.topics);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'INNER JOIN & Multi-Table Joins',
    'Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)',
    'GROUP BY & HAVING Clauses',
    'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
    'Common Table Expressions (CTEs & Recursive CTEs)'
  ]);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [selectedTime, setSelectedTime] = useState<number>(30); // 30 mins
  const [launching, setLaunching] = useState<boolean>(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const toggleCategory = (groupTopics: string[]) => {
    const allSelected = groupTopics.every(t => selectedTopics.includes(t));
    if (allSelected) {
      setSelectedTopics(prev => prev.filter(t => !groupTopics.includes(t)));
    } else {
      setSelectedTopics(prev => Array.from(new Set([...prev, ...groupTopics])));
    }
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === allTopicsFlat.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics([...allTopicsFlat]);
    }
  };

  const handleStartPractice = () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one SQL topic to begin practice.');
      return;
    }

    setLaunching(true);

    const sessionId = practiceSessionStore.createSQLSession({
      topics: selectedTopics,
      difficulty: selectedDifficulty,
      timeMinutes: selectedTime
    });

    // Open workspace in a NEW TAB
    const newTabUrl = `/practice/sql/session/${sessionId}`;
    window.open(newTabUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setLaunching(false);
    }, 1200);
  };

  const isAllSelected = selectedTopics.length === allTopicsFlat.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-[#0A192F]">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2">
            <Database className="w-4 h-4" />
            <span>Dedicated Practice Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Configure SQL Query Practice</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Master relational databases, complex joins, nested aggregations, and high-performance window functions with schema exploration and live query execution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: 4 Configuration Steps (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STEP 1: SELECT TOPICS */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0A192F]">Select SQL Topics</h2>
                  <p className="text-xs text-[#64748B]">Choose specific database querying domains for your session</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#0A192F] transition-colors"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Select All Topics ({allTopicsFlat.length})</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {SQL_TOPIC_GROUPS.map((group) => {
                const groupSelectedCount = group.topics.filter(t => selectedTopics.includes(t)).length;
                const isGroupAll = groupSelectedCount === group.topics.length;

                return (
                  <div key={group.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleCategory(group.topics)}
                        className="flex items-center space-x-2 text-xs font-bold text-[#0A192F] hover:text-cyan-600 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>{group.category}</span>
                        <span className="text-[11px] font-normal text-[#64748B]">
                          ({groupSelectedCount}/{group.topics.length})
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {group.topics.map(topic => {
                        const isSelected = selectedTopics.includes(topic);
                        return (
                          <div
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-50/50 shadow-xs'
                                : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <div className="w-4 h-4 rounded bg-cyan-600 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                              )}
                            </div>
                            <span className={`text-xs font-medium ${isSelected ? 'text-[#0A192F] font-semibold' : 'text-slate-700'}`}>
                              {topic}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: NUMBER OF QUESTIONS */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A192F]">Select Number of Problems</h2>
                <p className="text-xs text-[#64748B]">Determine target challenge volume for this query exercise</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUESTION_COUNTS.map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedCount(count)}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                    selectedCount === count
                      ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                      : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg">{count}</div>
                  <div className="text-[10px] font-medium opacity-80">Problems</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: SELECT DIFFICULTY */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A192F]">Select Difficulty Level</h2>
                <p className="text-xs text-[#64748B]">Target your relational database skill tier</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border text-left ${
                    selectedDifficulty === diff
                      ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                      : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{diff}</span>
                    {selectedDifficulty === diff && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] font-normal opacity-75">
                    {diff === 'Easy' && 'Single table, simple WHERE & ORDER'}
                    {diff === 'Medium' && 'Multi-table JOINs, GROUP BY'}
                    {diff === 'Hard' && 'Window functions, CTEs & subqueries'}
                    {diff === 'Mixed' && 'Adaptive mix across all levels'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: TIME LIMIT */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A192F]">Select Time Limit</h2>
                <p className="text-xs text-[#64748B]">Simulate high-pressure technical database interviews or practice untimed</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`py-3 px-4 rounded-xl font-semibold text-xs transition-all border text-center ${
                    selectedTime === opt.value
                      ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                      : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <Clock className={`w-4 h-4 mx-auto mb-1 ${selectedTime === opt.value ? 'text-cyan-400' : 'text-[#64748B]'}`} />
                  <div>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Sticky Live Configuration Summary (4 Cols) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4 pb-3 border-b border-[#E2E8F0]">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Practice Summary</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Selected Topics</span>
                <span className="font-bold text-[#0A192F] bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedTopics.length} / {allTopicsFlat.length}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Total Questions</span>
                <span className="font-bold text-[#0A192F]">{selectedCount} Questions</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Difficulty Tier</span>
                <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-cyan-100 text-cyan-800">
                  {selectedDifficulty}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Time Limit</span>
                <span className="font-bold text-[#0A192F]">
                  {selectedTime === 0 ? 'No Limit' : `${selectedTime} Minutes`}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase block mb-2">Topic Highlights</span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedTopics.slice(0, 7).map(t => (
                    <span key={t} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                      {t}
                    </span>
                  ))}
                  {selectedTopics.length > 7 && (
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-1 rounded-md font-semibold">
                      +{selectedTopics.length - 7} more
                    </span>
                  )}
                  {selectedTopics.length === 0 && (
                    <span className="text-[11px] text-amber-600 font-medium italic">
                      No topics selected yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] space-y-3">
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={selectedTopics.length === 0 || launching}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0A192F] to-[#112240] hover:from-[#112240] hover:to-[#0A192F] text-white font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {launching ? (
                  <span>Launching Standalone Workspace...</span>
                ) : (
                  <>
                    <span>Start SQL Practice</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
                Opens a dedicated, distraction-free SQL workspace in a new tab with interactive schema tables, syntax console, and database engine.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/60 rounded-xl p-4 text-xs">
            <div className="flex items-center space-x-2 text-cyan-800 font-bold mb-1">
              <Table className="w-4 h-4" />
              <span>Real DB Execution Engine</span>
            </div>
            <p className="text-cyan-900/80 leading-relaxed text-[11px]">
              Queries run against an in-memory SQL execution engine with instant row validation, execution timings, and schema introspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
