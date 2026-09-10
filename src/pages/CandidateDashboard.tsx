import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Target, Award, Sparkles, TrendingUp } from 'lucide-react';
import { SkillTruthResponse, JobGapResponse, ReadinessScore } from '../types';

interface CandidateDashboardProps {
  truthData: SkillTruthResponse | null;
  gapData: JobGapResponse | null;
  readinessData: ReadinessScore | null;
  userName?: string;
  targetRole?: string;
  onNavigate: (tab: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  truthData,
  gapData,
  readinessData,
  userName = 'Alex Mercer',
  targetRole = 'Software Engineer',
  onNavigate
}) => {
  const readiness = readinessData?.overall_score || 72;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* GREETING */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#0A192F]">
          Good morning, {userName.split(' ')[0]}.
        </h1>
        <p className="text-xs text-[#64748B] font-medium">
          Target role: <span className="font-bold text-[#0A192F]">{targetRole}</span>
        </p>
      </div>

      {/* CARD 1: YOUR JOB READINESS */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">YOUR JOB READINESS</span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-5xl font-black text-[#0A192F]">{readiness}%</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Good progress
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('roadmap')}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
          >
            Improve readiness <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
          </button>
        </div>

        {/* Supporting metrics row */}
        <div className="grid grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">ATS RESUME MATCH</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">78%</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">SKILL READINESS</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">68%</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">INTERVIEW READINESS</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">70%</span>
          </div>
        </div>
      </div>

      {/* CARD 2: NEXT BEST ACTION (ONE RECOMMENDED ACTION) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <span className="text-xs font-mono font-bold text-[#427AB5] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
          NEXT BEST ACTION
        </span>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0A192F]">Strengthen DSA</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed max-w-lg">
              Reason: DSA is highly important for your target Software Engineer role and your current evidence shows a gap in binary search variations and complexity analysis.
            </p>
          </div>

          <button
            onClick={() => onNavigate('interview')}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm shrink-0"
          >
            Start assessment <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
          </button>
        </div>
      </div>

      {/* GRID: TOP SKILL GAPS, RESUME, RECENT PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Top Skill Gaps */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
            TOP SKILL GAPS
          </span>
          <ol className="space-y-2 text-xs font-medium">
            <li className="flex justify-between items-center p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#0A192F]">1. DSA</span>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">High priority</span>
            </li>
            <li className="flex justify-between items-center p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#0A192F]">2. System Design</span>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">High priority</span>
            </li>
            <li className="flex justify-between items-center p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#0A192F]">3. Behavioral Interview</span>
              <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">Medium priority</span>
            </li>
          </ol>
        </div>

        {/* Resume ATS Score Card */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
              RESUME
            </span>
            <div className="mt-3">
              <span className="text-xs text-[#64748B] block">ATS Score:</span>
              <span className="text-2xl font-extrabold text-[#0A192F]">78%</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('resume')}
            className="w-full py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#0A192F] font-semibold text-xs border border-[#E2E8F0] rounded transition-colors flex items-center justify-center"
          >
            View analysis <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Recent Progress */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
            RECENT PROGRESS
          </span>
          <div className="pt-1 space-y-1">
            <span className="text-[11px] text-[#64748B] block">Previous readiness: 64%</span>
            <span className="text-sm font-bold text-[#0A192F] block">Current readiness: 72%</span>
            <span className="text-xs font-bold text-emerald-700 font-mono inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 mt-1">
              +8% Total Improvement
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
