import React, { useState } from 'react';
import {
  Code, Check, Clock, ArrowRight, Layers, FileCode, CheckCircle2
} from 'lucide-react';
import { practiceSessionStore } from '../services/practiceSessionStore';

const CODING_TOPIC_GROUPS = [
  {
    category: 'Data Structures',
    topics: [
      'Arrays',
      'Strings',
      'Linked Lists',
      'Stack',
      'Queue',
      'Hashing',
      'Trees',
      'Graphs',
      'Heaps'
    ]
  },
  {
    category: 'Algorithms',
    topics: [
      'Sorting',
      'Searching',
      'Binary Search',
      'Two Pointers',
      'Sliding Window',
      'Recursion',
      'Dynamic Programming',
      'Greedy',
      'Backtracking'
    ]
  },
  {
    category: 'Programming',
    topics: [
      'OOP',
      'Bit Manipulation',
      'Mathematics',
      'Basic Programming'
    ]
  }
];

const QUESTION_COUNTS = [10, 20, 30, 40, 50];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const TIME_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
  { label: '90 minutes', value: 90 },
  { label: 'No Time Limit', value: 0 }
];

export const CodingConfigPage: React.FC = () => {
  const allTopicsFlat = CODING_TOPIC_GROUPS.flatMap(g => g.topics);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Arrays',
    'Binary Search',
    'Two Pointers',
    'Stack',
    'Dynamic Programming'
  ]);
  const [selectedCount, setSelectedCount] = useState<number>(20);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [selectedTime, setSelectedTime] = useState<number>(60); // 60 mins
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

  const isFormValid = selectedTopics.length > 0 && selectedCount > 0;

  const handleStartPractice = () => {
    if (!isFormValid || launching) return;
    setLaunching(true);

    const sessionId = practiceSessionStore.createCodingSession({
      topics: selectedTopics,
      questionCount: selectedCount,
      difficulty: selectedDifficulty,
      timeMinutes: selectedTime
    });

    const sessionUrl = `/practice/coding/session/${sessionId}`;
    window.open(sessionUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setLaunching(false);
    }, 1000);
  };

  const getTimeLabel = (mins: number) => {
    if (mins === 0) return 'No Time Limit';
    return `${mins} minutes`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            <Code className="w-4 h-4" />
            <span>PRACTICE IDE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
            Configure Coding Practice
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Select algorithms, data structures, challenge count, and session duration. Launching opens your dedicated full-screen coding IDE in a new browser tab.
          </p>
        </div>

        {/* 2-COLUMN CONFIGURATION LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT 8 COLS: CONFIGURATION STEPS */}
          <div className="lg:col-span-8 space-y-8">

            {/* STEP 1: SELECT TOPICS */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">STEP 1</span>
                  <h2 className="text-base font-bold text-[#0A192F]">Select Topics</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-[#64748B]">
                    {selectedTopics.length} of {allTopicsFlat.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0A192F] border border-[#E2E8F0] rounded-xl transition-all"
                  >
                    {selectedTopics.length === allTopicsFlat.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* TOPIC GROUPS */}
              <div className="space-y-6">
                {CODING_TOPIC_GROUPS.map(group => {
                  const groupAllSelected = group.topics.every(t => selectedTopics.includes(t));
                  const groupSelectedCount = group.topics.filter(t => selectedTopics.includes(t)).length;

                  return (
                    <div key={group.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.topics)}
                          className="text-xs font-bold text-[#0A192F] hover:text-[#0284C7] transition-colors flex items-center space-x-2"
                        >
                          <span>{group.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B]">
                            {groupSelectedCount}/{group.topics.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.topics)}
                          className="text-[11px] font-semibold text-[#0284C7] hover:underline"
                        >
                          {groupAllSelected ? 'Clear Category' : 'Select All'}
                        </button>
                      </div>

                      {/* TOPIC BUTTONS GRID */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {group.topics.map(topic => {
                          const isSelected = selectedTopics.includes(topic);
                          return (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => toggleTopic(topic)}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                                  : 'bg-white text-[#334155] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate mr-1.5">{topic}</span>
                              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                                isSelected ? 'bg-sky-500 text-white font-bold' : 'border border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: NUMBER OF QUESTIONS */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">STEP 2</span>
                <h2 className="text-base font-bold text-[#0A192F]">Select Number of Questions</h2>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {QUESTION_COUNTS.map(count => {
                  const isSelected = selectedCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSelectedCount(count)}
                      className={`py-3.5 rounded-xl border font-mono text-sm font-bold transition-all text-center ${
                        isSelected
                          ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: DIFFICULTY */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">STEP 3</span>
                <h2 className="text-base font-bold text-[#0A192F]">Select Difficulty</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIFFICULTIES.map(diff => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        isSelected
                          ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: TIME LIMIT */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">STEP 4</span>
                <h2 className="text-base font-bold text-[#0A192F]">Select Time Limit</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TIME_OPTIONS.map(opt => {
                  const isSelected = selectedTime === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedTime(opt.value)}
                      className={`p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                        isSelected
                          ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm font-bold'
                          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLS: STICKY CODING SUMMARY CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-[#E2E8F0] pb-4">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">OVERVIEW</span>
                <h3 className="text-lg font-black text-[#0A192F] mt-0.5">Practice Summary</h3>
              </div>

              {/* SUMMARY DETAILS */}
              <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Type:</span>
                  <span className="font-bold text-[#0A192F]">Coding</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Topics:</span>
                  <span className="font-bold text-[#0284C7]">
                    {selectedTopics.length <= 2 ? selectedTopics.join(', ') : `${selectedTopics.length} selected`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Questions:</span>
                  <span className="font-bold text-[#0A192F]">{selectedCount}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Difficulty:</span>
                  <span className="font-bold text-[#0A192F]">{selectedDifficulty}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-[#64748B]">Time:</span>
                  <span className="font-bold text-[#0A192F]">{getTimeLabel(selectedTime)}</span>
                </div>
              </div>

              {/* SELECTED TOPICS CHIPS */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono block">
                  Included Focus Areas:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedTopics.length === 0 ? (
                    <span className="text-xs text-amber-600 font-semibold italic">Please select at least 1 topic above.</span>
                  ) : (
                    selectedTopics.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-[#334155] rounded-md text-[10px] font-medium truncate">
                        ✓ {t}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* START CODING PRACTICE BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartPractice}
                  disabled={!isFormValid || launching}
                  className="w-full py-3.5 px-6 bg-[#0A192F] hover:bg-[#112240] disabled:opacity-40 disabled:hover:bg-[#0A192F] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>{launching ? 'Launching IDE...' : 'Start Coding Practice →'}</span>
                </button>
                <p className="text-[10px] text-[#64748B] text-center mt-2 font-mono">
                  Opens full-screen coding workspace in a new browser tab
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
