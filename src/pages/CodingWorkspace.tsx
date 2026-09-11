import React, { useState } from 'react';
import {
  Play, Send, RotateCcw, Clock, ArrowRight, CheckCircle2, AlertCircle,
  Code, FileText, Lightbulb, History, Copy, ChevronRight, Terminal, BookOpen
} from 'lucide-react';
import { CodingEvaluation, PracticeRecord } from '../types';
import { api } from '../services/api';
import { userStore } from '../services/userStore';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';

interface CodingWorkspaceProps {
  onProceedToSQL: () => void;
}

const PROBLEMS = [
  {
    id: 'rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Algorithms & Binary Search',
    description: `Given a rotated sorted integer array \`nums\` and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. You must write an algorithm with $O(\\log N)$ runtime complexity.`,
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4',
        explanation: '0 is located at index 4 in the rotated array.'
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1',
        explanation: '3 is not present in the array.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is guaranteed to be rotated at some pivot index.'
    ],
    starterCode: {
      python: `def search_rotated(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`,
      javascript: `function searchRotated(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid]) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[high]) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
}`
    }
  },
  {
    id: 'two-sum',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Easy',
    category: 'Two Pointers',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number.`,
    examples: [
      {
        input: 'numbers = [2,7,11,15], target = 9',
        output: '[1,2]',
        explanation: 'The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.'
      }
    ],
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000'
    ],
    starterCode: {
      python: `def two_sum(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        curr = numbers[l] + numbers[r]
        if curr == target:
            return [l + 1, r + 1]
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []`,
      javascript: `function twoSum(numbers, target) {
    let l = 0, r = numbers.length - 1;
    while (l < r) {
        let sum = numbers[l] + numbers[r];
        if (sum === target) return [l + 1, r + 1];
        if (sum < target) l++;
        else r--;
    }
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return new int[]{l + 1, r + 1};
            if (sum < target) l++; else r--;
        }
        return new int[]{};
    }
}`
    }
  }
];

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ onProceedToSQL }) => {
  const [selectedProblemId, setSelectedProblemId] = useState('rotated-array');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java'>('python');
  
  const currentProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];
  
  const [code, setCode] = useState(currentProblem.starterCode[language]);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<CodingEvaluation | null>(null);
  const [submissionsHistory, setSubmissionsHistory] = useState<Array<any>>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<PracticeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'java') => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
  };

  const currentProblemIndex = PROBLEMS.findIndex(p => p.id === selectedProblemId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleProblemChange = (probId: string) => {
    setSelectedProblemId(probId);
    const prob = PROBLEMS.find(p => p.id === probId) || PROBLEMS[0];
    setCode(prob.starterCode[language]);
    setResult(null);
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCode[language]);
    setResult(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    const res = await api.submitCode(code);
    setResult(res);
    setActiveConsoleTab('result');
    setRunning(false);
  };

  const handleSubmitSolution = async () => {
    setRunning(true);
    const res = await api.submitCode(code);
    setResult(res);
    setActiveConsoleTab('result');
    setRunning(false);

    // Record submission
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSubmissionsHistory(prev => [
      {
        id: Date.now(),
        status: res.passed_tests === res.total_tests ? 'Accepted' : 'Wrong Answer',
        runtime: '38 ms',
        memory: '16.2 MB',
        time: nowStr
      },
      ...prev
    ]);

    userStore.submitAssessmentResult('coding-assessment', 'technical', res.passed_tests === res.total_tests ? 95 : 65);

    // If there is a next question, advance to next question
    if (currentProblemIndex < PROBLEMS.length - 1) {
      const nextProblem = PROBLEMS[currentProblemIndex + 1];
      setToastMessage(`Solution submitted! Loading next question: ${nextProblem.title}...`);
      setTimeout(() => {
        setSelectedProblemId(nextProblem.id);
        setCode(nextProblem.starterCode[language]);
        setResult(null);
        setActiveLeftTab('description');
        setActiveConsoleTab('testcase');
        setToastMessage(null);
      }, 1000);
    } else {
      setToastMessage('All coding challenges completed! Ready to proceed.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = code;
      setCode(val.substring(0, start) + '    ' + val.substring(end));
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handlePromptEndPractice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmedEndPractice = () => {
    setIsSubmitting(true);

    const solvedCount = new Set(submissionsHistory.filter(s => s.status === 'Accepted').map(s => s.problemId || selectedProblemId)).size;
    const totalProbs = PROBLEMS.length;
    const scorePct = totalProbs > 0 ? Math.round((solvedCount / totalProbs) * 100) : 0;
    const accuracyPct = submissionsHistory.length > 0
      ? Math.round((submissionsHistory.filter(s => s.status === 'Accepted').length / submissionsHistory.length) * 100)
      : (solvedCount > 0 ? 100 : 0);

    const record: PracticeRecord = {
      id: `coding_${Date.now()}`,
      sessionId: `coding_ws_${Date.now()}`,
      userEmail: userStore.getCurrentUserEmail(),
      practiceType: 'coding',
      title: 'Algorithm & Data Structure Practice',
      topics: ['Algorithms', 'Binary Search', 'Two Pointers'],
      difficulty: 'Medium',
      score: scorePct,
      accuracy: accuracyPct,
      questionsAttempted: Math.max(solvedCount, submissionsHistory.length > 0 ? 1 : 0),
      totalQuestions: totalProbs,
      timeTakenSeconds: 320,
      completedAt: new Date().toISOString(),
      status: 'Completed',
      metrics: {
        problemsSolved: solvedCount,
        testCasesPassed: result ? result.passed_tests : (solvedCount * 3),
        totalTestCases: result ? result.total_tests : (totalProbs * 3),
        bestRuntime: '38 ms',
        bestMemory: '16.2 MB'
      }
    };

    userStore.savePracticeRecord(record);
    setSavedRecord(record);
    setIsSubmitting(false);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F] p-4 lg:p-6">
      
      {/* MAIN 2-COLUMN CODING WORKSPACE (Matching Screenshot 4) */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT PANEL: PROBLEM DESCRIPTION, EDITORIAL & SUBMISSIONS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[720px]">
          
          {/* TAB HEADER (Matching Screenshot 4) */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 text-xs font-semibold select-none shrink-0">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveLeftTab('description')}
                className={`py-3.5 px-3 border-b-2 font-bold transition-all flex items-center space-x-2 ${
                  activeLeftTab === 'description'
                    ? 'border-[#0A192F] text-[#0A192F]'
                    : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('editorial')}
                className={`py-3.5 px-3 border-b-2 font-bold transition-all flex items-center space-x-2 ${
                  activeLeftTab === 'editorial'
                    ? 'border-[#0A192F] text-[#0A192F]'
                    : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Editorial & Hints</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('submissions')}
                className={`py-3.5 px-3 border-b-2 font-bold transition-all flex items-center space-x-2 ${
                  activeLeftTab === 'submissions'
                    ? 'border-[#0A192F] text-[#0A192F]'
                    : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
                }`}
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Submissions ({submissionsHistory.length})</span>
              </button>
            </div>

            {/* PROBLEM SELECTOR DROPDOWN & NEXT STAGE LINK */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedProblemId}
                onChange={(e) => handleProblemChange(e.target.value)}
                className="py-1 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[11px] font-bold text-[#0A192F] focus:outline-none focus:border-[#0A192F] max-w-[140px] truncate"
                title="Select Problem"
              >
                {PROBLEMS.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              {onProceedToSQL && (
                <button
                  onClick={onProceedToSQL}
                  className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Proceed to SQL Workspace"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: DESCRIPTION (Matching Screenshot 4) */}
          {activeLeftTab === 'description' && (
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0A192F] font-sans flex-1">
              <div>
                <span className="text-[11px] font-mono text-[#0284C7] font-bold uppercase tracking-wider block mb-1.5">
                  {currentProblem.category}
                </span>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight">
                    {currentProblem.title}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-3 ${
                    currentProblem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                </div>
              </div>

              {/* PROBLEM STATEMENT */}
              <div className="space-y-3 leading-relaxed text-[#334155] text-[13px]">
                <p>{currentProblem.description}</p>
              </div>

              {/* EXAMPLES (Matching Screenshot 4) */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-[#0A192F] text-xs font-mono uppercase tracking-wider">
                  EXAMPLES
                </h3>
                {currentProblem.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-50/80 border border-[#E2E8F0] rounded-xl space-y-2 font-mono text-xs">
                    <div className="text-[#334155]">
                      <span className="font-bold text-[#0A192F]">Input: </span>
                      <span className="text-slate-600">{ex.input}</span>
                    </div>
                    <div className="text-[#334155]">
                      <span className="font-bold text-[#0A192F]">Output: </span>
                      <span className="text-slate-600">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-[#64748B] text-[11px] pt-1 border-t border-slate-200/80">
                        <span className="font-bold text-[#0A192F]">Explanation: </span>
                        <span>{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CONSTRAINTS (Matching Screenshot 4) */}
              <div className="space-y-2.5 pt-2">
                <h3 className="font-bold text-[#0A192F] text-xs font-mono uppercase tracking-wider">
                  CONSTRAINTS
                </h3>
                <ul className="space-y-2 font-mono text-xs text-[#475569]">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: EDITORIAL & HINTS */}
          {activeLeftTab === 'editorial' && (
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#0A192F] font-sans flex-1">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <h4 className="font-bold text-xs flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1.5 text-amber-600" /> Key Insights & Approach
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Notice that in a rotated sorted array, at least one half (left or right of mid) is guaranteed to be strictly sorted.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-[#0A192F]">Binary Search Algorithm Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] leading-relaxed">
                  <li>Find the middle index <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mid = (low + high) // 2</code>.</li>
                  <li>Check if <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">nums[mid] == target</code>. If true, return <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mid</code>.</li>
                  <li>Determine whether the left half <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">nums[low] &lt;= nums[mid]</code> is sorted:</li>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[11px]">
                    <li>If target lies within <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[nums[low], nums[mid])</code>, search left half.</li>
                    <li>Otherwise, search right half.</li>
                  </ul>
                  <li>If right half is sorted, apply symmetric logic.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS HISTORY */}
          {activeLeftTab === 'submissions' && (
            <div className="p-6 overflow-y-auto space-y-3 text-xs flex-1">
              {submissionsHistory.length === 0 ? (
                <div className="text-center py-12 text-[#64748B]">
                  No code submissions yet. Click "Run Code" or "Submit Solution".
                </div>
              ) : (
                submissionsHistory.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl flex justify-between items-center font-mono">
                    <div>
                      <span className={`font-bold text-xs block ${
                        sub.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{sub.time}</span>
                    </div>
                    <div className="text-right text-[11px] text-[#0A192F]">
                      <div>Runtime: {sub.runtime}</div>
                      <div>Memory: {sub.memory}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL: CODE EDITOR & CONSOLE (7 COLS) (Matching Screenshot 4) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col h-[calc(100vh-100px)] min-h-[720px]">

          {/* CODE EDITOR CONTAINER */}
          <div className="bg-[#0B0F17] rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl flex flex-col flex-1">
            
            {/* EDITOR HEADER (Matching Screenshot 4: <> solution.py | UTF-8 • PYTHON) */}
            <div className="px-5 py-3 bg-[#111827] border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <Code className="w-4 h-4 text-sky-400" />
                <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'java'}</span>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as any)}
                  className="bg-transparent text-slate-400 hover:text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer"
                  title="Change Language"
                >
                  <option value="python" className="bg-[#111827] text-slate-200">UTF-8 • PYTHON</option>
                  <option value="javascript" className="bg-[#111827] text-slate-200">UTF-8 • JAVASCRIPT</option>
                  <option value="java" className="bg-[#111827] text-slate-200">UTF-8 • JAVA</option>
                </select>

                <button
                  onClick={handleResetCode}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* EDITOR TEXTAREA WITH LINE NUMBERS GUTTER */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs text-slate-100 relative">
              {/* Line Numbers Gutter */}
              <div className="w-12 bg-[#0A0E17] py-4 text-right pr-3 select-none text-slate-600 font-mono text-xs border-r border-slate-800/60 space-y-1 shrink-0">
                {Array.from({ length: Math.max(17, code.split('\n').length) }).map((_, i) => (
                  <div key={i} className="leading-5">{i + 1}</div>
                ))}
              </div>

              {/* Textarea Code Input */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-5 selection:bg-sky-500/30 overflow-y-auto"
              />
            </div>

            {/* BOTTOM ACTIONS BAR (Matching Screenshot 4) */}
            <div className="px-5 py-3 bg-[#111827] border-t border-slate-800/80 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">Auto-formatting enabled</span>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 text-sky-400 fill-current" />
                  <span>{running ? 'Executing...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={running}
                  className="px-6 py-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-md shadow-sky-600/30"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Solution</span>
                </button>

                <button
                  onClick={handlePromptEndPractice}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  End Practice
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM CONSOLE PANEL (TESTCASE & RESULTS) (Matching Screenshot 4) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4 shrink-0">
            
            {/* CONSOLE TAB HEADER */}
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-xs font-bold">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'testcase' ? 'text-[#0A192F] border-b-2 border-[#0A192F]' : 'text-[#64748B] hover:text-[#0A192F]'
                  }`}
                >
                  <span className="font-mono font-bold text-xs">&gt;_</span>
                  <span>Testcases</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'result' ? 'text-[#0A192F] border-b-2 border-[#0A192F]' : 'text-[#64748B] hover:text-[#0A192F]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Execution Result</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: TESTCASE (Matching Screenshot 4) */}
            {activeConsoleTab === 'testcase' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-slate-50/80 border border-[#E2E8F0] rounded-xl space-y-1.5">
                  <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">CASE 1 INPUT:</div>
                  <div className="text-[#0A192F]">nums = [4, 5, 6, 7, 0, 1, 2]</div>
                  <div className="text-[#0A192F]">target = 0</div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESULT */}
            {activeConsoleTab === 'result' && (
              <div className="space-y-3 text-xs">
                {result ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-emerald-600 text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Accepted • {result.passed_tests}/{result.total_tests} Test Cases Passed</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">RUNTIME</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">38 ms</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Beats 94.2%</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">TIME COMPLEXITY</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{result.time_complexity}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Optimal Logarithmic</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">SPACE COMPLEXITY</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{result.space_complexity}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Constant Space</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#64748B]">
                    Run your code to execute testcases and inspect time/space complexity results.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
      
      {/* SUBMISSION FEEDBACK TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0A192F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-semibold z-50 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CONFIRMATION MODAL WITH CASE-SENSITIVE "CONFIRM" VERIFICATION */}
      <EndPracticeModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedEndPractice}
        isSubmitting={isSubmitting}
        practiceTitle="Coding Workspace"
      />

      {/* SUCCESS MODAL */}
      {showSuccessModal && savedRecord && (
        <PracticeCompletionSuccess
          record={savedRecord}
          onReview={() => setShowSuccessModal(false)}
          onViewProfile={() => {
            if (onProceedToSQL) onProceedToSQL();
          }}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

    </div>
  );
};
