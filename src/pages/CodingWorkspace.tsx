import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { CodingEvaluation } from '../types';
import { api } from '../services/api';

interface CodingWorkspaceProps {
  onProceedToSQL: () => void;
}

const DEFAULT_PYTHON = `def search_rotated(nums, target):
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
    return -1`;

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ onProceedToSQL }) => {
  const [code, setCode] = useState(DEFAULT_PYTHON);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CodingEvaluation | null>(null);

  const handleRun = async () => {
    setRunning(true);
    const res = await api.submitCode(code);
    setResult(res);
    setRunning(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Coding Assessment</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Python Rotated Array Search</h1>
        </div>

        <button
          onClick={onProceedToSQL}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Open SQL Workspace <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-3 text-xs">
          <span className="font-mono font-bold text-[#64748B] uppercase block">PROBLEM PROMPT</span>
          <h3 className="font-bold text-[#0A192F]">Search in Rotated Sorted Array</h3>
          <p className="text-[#64748B] leading-relaxed">
            Given a rotated sorted integer array <code className="bg-slate-100 px-1 py-0.5 rounded">nums</code>, return target index in $O(\log N)$ time complexity.
          </p>

          {result && (
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0] space-y-1 font-mono text-[11px] pt-3">
              <div className="flex justify-between font-bold">
                <span>Tests Passed:</span>
                <span className="text-emerald-700">{result.passed_tests}/{result.total_tests}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="text-[#0A192F]">{result.time_complexity}</span>
              </div>
              <div className="flex justify-between">
                <span>Space:</span>
                <span className="text-[#0A192F]">{result.space_complexity}</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="bg-[#0A192F] rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 bg-[#112240] border-b border-slate-700 flex justify-between items-center text-xs">
              <span className="font-mono text-white">solution.py</span>
              <button
                onClick={handleRun}
                disabled={running}
                className="px-3 py-1 bg-[#427AB5] hover:bg-blue-600 text-white font-semibold rounded text-[11px] flex items-center"
              >
                <Play className="w-3 h-3 mr-1 fill-current" />
                {running ? 'Running...' : 'Run Code'}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 bg-[#0A192F] text-slate-100 font-mono text-xs focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
