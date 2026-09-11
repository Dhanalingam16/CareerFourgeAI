import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Info, Sparkles, Check, AlertTriangle, Target } from 'lucide-react';
import { userStore } from '../services/userStore';

interface ATSResultPageProps {
  onGoToDashboard: () => void;
}

export const ATSResultPage: React.FC<ATSResultPageProps> = ({ onGoToDashboard }) => {
  const store = userStore.getSnapshot();
  const atsData = store.atsResult;
  const fullAnalysis = atsData.fullAnalysis;

  const score = fullAnalysis ? fullAnalysis.overall_score : atsData.atsScore;
  const targetRole = store.goal.targetRole || 'Software Engineer';

  const whatsWorking = fullAnalysis ? fullAnalysis.strengths : atsData.whatsWorking;
  const whatsMissing = fullAnalysis ? fullAnalysis.weaknesses : atsData.whatsMissing;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* HEADER */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">Analysis Completed</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">AI VERIFIED</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A192F] mt-0.5">Your ATS Resume Analysis</h1>
        </div>

        <button
          onClick={onGoToDashboard}
          className="px-6 py-3 rounded bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs transition-colors flex items-center shadow-sm"
        >
          Go to my baseline assessment <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

      {/* ATS SCORE CARD */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xs font-mono text-[#64748B] uppercase block">ATS COMPATIBILITY SCORE</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-5xl font-extrabold text-[#0A192F]">{score}</span>
            <span className="text-sm font-semibold text-[#64748B]">/ 100</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            Measures resume-to-job requirement compatibility across 10 core ATS evaluation categories.
          </p>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded border border-[#E2E8F0] text-xs font-mono space-y-1 shrink-0 min-w-[200px]">
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Target Role:</span>
            <strong className="text-[#0A192F]">{targetRole}</strong>
          </div>
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Match Level:</span>
            <strong className={score >= 80 ? 'text-emerald-700' : score >= 65 ? 'text-[#0284C7]' : 'text-amber-700'}>
              {score >= 80 ? 'Strong Alignment' : score >= 65 ? 'Good Alignment' : 'Needs Optimization'}
            </strong>
          </div>
        </div>
      </div>

      {/* AI SUMMARY IF FULL ANALYSIS AVAILABLE */}
      {fullAnalysis && (
        <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] space-y-1">
          <span className="text-xs font-bold text-[#0A192F] flex items-center">
            <Sparkles className="w-4 h-4 text-[#0284C7] mr-1.5" /> AI Executive Summary
          </span>
          <p className="text-xs text-[#475569] leading-relaxed pt-0.5">{fullAnalysis.summary}</p>
        </div>
      )}

      {/* WHAT'S WORKING vs WHAT'S MISSING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* What's Working */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            WHAT'S WORKING
          </span>
          <ul className="space-y-2 text-xs text-[#0A192F]">
            {whatsWorking.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-emerald-600 font-bold mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's Missing */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            WHAT'S MISSING / NEEDS IMPROVEMENT
          </span>
          <ul className="space-y-2 text-xs text-[#0A192F]">
            {whatsMissing.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-amber-600 font-bold mr-2">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* HIGH PRIORITY IMPROVEMENTS (IF AVAILABLE) */}
      {fullAnalysis && fullAnalysis.improvements && fullAnalysis.improvements.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-3">
            HIGH PRIORITY IMPROVEMENTS
          </span>

          <div className="space-y-3">
            {fullAnalysis.improvements.map((imp, idx) => (
              <div key={idx} className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-[#0A192F]">
                  <span>{imp.section} Section</span>
                  <span className="text-red-700 uppercase text-[10px]">{imp.priority} priority</span>
                </div>
                <p className="text-[#475569]"><strong>Problem:</strong> {imp.problem}</p>
                <p className="text-[#475569]"><strong>Recommendation:</strong> {imp.recommendation}</p>
                {imp.example && (
                  <div className="bg-white p-2 rounded border border-[#E2E8F0] font-mono text-[11px] text-[#0A192F]">
                    "{imp.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KEYWORD DENSITY AUDIT */}
      {fullAnalysis && fullAnalysis.keyword_analysis && (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
            KEYWORD DENSITY AUDIT ({fullAnalysis.keyword_analysis.keyword_match_percentage}% MATCH)
          </span>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-emerald-700 block mb-1">Matched Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {fullAnalysis.keyword_analysis.matched_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-amber-700 block mb-1 mt-2">Missing / Recommended Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {fullAnalysis.keyword_analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CTA BUTTON */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onGoToDashboard}
          className="px-8 py-3 rounded bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs transition-colors flex items-center shadow-sm"
        >
          Go to my baseline assessment <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

    </div>
  );
};
