import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Target, Award, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';

interface CandidateDashboardProps {
  onNavigate: (tab: string, targetId?: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onNavigate }) => {
  const store = useUserStore();

  const readiness = store.readinessScore;
  const prevReadiness = store.previousReadinessScore;
  const scoreDiff = readiness - prevReadiness;

  const firstName = store.profile.fullName ? store.profile.fullName.split(' ')[0] : 'Candidate';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* GREETING & ROLE HEADER */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase">
            Profile Active
          </span>
          <span className="text-xs text-[#64748B] font-mono">
            {store.goal.experienceLevel} Experience Target
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0A192F]">
          Good morning, {firstName}.
        </h1>
        <p className="text-xs text-[#64748B] font-medium">
          Target role: <span className="font-bold text-[#0A192F]">{store.goal.targetRole}</span>
          {store.goal.targetCompany && store.goal.targetCompany !== 'No specific company' && (
            <span> at <strong className="text-[#0A192F]">{store.goal.targetCompany}</strong></span>
          )}
        </p>
      </div>

      {/* CARD 1: YOUR JOB READINESS */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">YOUR JOB READINESS</span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-5xl font-black text-[#0A192F]">{readiness}%</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                readiness >= 75
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {readiness >= 75 ? 'Strong alignment' : 'Good progress'}
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">ATS RESUME MATCH</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{store.atsResult.atsScore}%</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">DSA VERIFIED</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{store.categoryScores.dsa}%</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">SYS DESIGN VERIFIED</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{store.categoryScores.systemDesign}%</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">INTERVIEW READINESS</span>
            <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{store.categoryScores.interview}%</span>
          </div>
        </div>
      </div>

      {/* CARD 2: NEXT BEST ACTION (REACTIVELY UPDATED) */}
      <div className="bg-white rounded-lg border-2 border-[#427AB5] p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
          <span className="text-xs font-mono font-bold text-[#427AB5] uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#FFDE59]" />
            RECOMMENDED NEXT BEST ACTION
          </span>
          <span className="text-[10px] font-mono text-[#64748B] bg-slate-100 px-2 py-0.5 rounded flex items-center">
            <Clock className="w-3 h-3 mr-1 text-[#64748B]" />
            ~{store.nextBestAction.estimatedMinutes} mins
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-[#0A192F]">{store.nextBestAction.title}</h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {store.nextBestAction.impact}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed max-w-xl">
              {store.nextBestAction.reason}
            </p>
          </div>

          <button
            onClick={() => onNavigate('interview', store.nextBestAction.targetAssessmentId)}
            className="px-6 py-3 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm shrink-0"
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
            {store.skillGaps.map((gap, idx) => (
              <li key={gap.skill_name} className="flex justify-between items-center p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#0A192F] font-bold">{idx + 1}. {gap.skill_name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  gap.status === 'HIGH_PRIORITY_GAP'
                    ? 'text-amber-800 bg-amber-100'
                    : gap.status === 'NEEDS_IMPROVEMENT'
                    ? 'text-blue-800 bg-blue-100'
                    : 'text-emerald-800 bg-emerald-100'
                }`}>
                  {gap.status === 'HIGH_PRIORITY_GAP' ? 'High priority' : gap.status === 'NEEDS_IMPROVEMENT' ? 'Medium' : 'Verified'}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Resume ATS Score Card */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
              RESUME ATS MATCH
            </span>
            <div className="mt-3">
              <span className="text-xs text-[#64748B] block">Current Score:</span>
              <span className="text-2xl font-extrabold text-[#0A192F]">{store.atsResult.atsScore}%</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
              {store.atsResult.whatsWorking[0] || 'Resume matched with job criteria.'}
            </p>
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
            <span className="text-[11px] text-[#64748B] block">Previous readiness: {prevReadiness}%</span>
            <span className="text-sm font-bold text-[#0A192F] block">Current readiness: {readiness}%</span>
            {scoreDiff > 0 ? (
              <span className="text-xs font-bold text-emerald-700 font-mono inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{scoreDiff}% Readiness Growth
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#64748B] font-mono inline-block px-2 py-0.5 rounded bg-slate-100 mt-1">
                Baseline Verified
              </span>
            )}
          </div>
          {store.assessmentAttempts.length > 0 && (
            <div className="border-t border-[#E2E8F0] pt-2 text-[10px] font-mono text-[#64748B]">
              Latest attempt: <strong className="text-[#0A192F]">{store.assessmentAttempts[store.assessmentAttempts.length - 1].title}</strong> ({store.assessmentAttempts[store.assessmentAttempts.length - 1].score}%)
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
