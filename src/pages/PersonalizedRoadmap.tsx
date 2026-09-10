import React from 'react';
import { ArrowRight, CheckCircle2, RefreshCw, Circle, Sparkles } from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';

interface PersonalizedRoadmapProps {
  onRunReassessment: () => void;
  onNavigateToAssessment?: (targetId?: string) => void;
}

export const PersonalizedRoadmapPage: React.FC<PersonalizedRoadmapProps> = ({
  onRunReassessment,
  onNavigateToAssessment
}) => {
  const store = useUserStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Impact-Based Priority Engine</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">7-Day Personalized Improvement Roadmap</h1>
        </div>

        <button
          onClick={onRunReassessment}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#FFDE59]" />
          Run Re-assessment Simulation
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2 flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#427AB5]" />
          WHY THIS ORDER MATTERS
        </span>
        <p className="text-xs text-[#64748B] leading-relaxed">
          DSA and System Design take precedence in your 7-day roadmap because they constitute 50% of your composite Job Readiness Score for your target <strong className="text-[#0A192F]">{store.goal.targetRole}</strong> position. Completing Day 1 & Day 2 tasks addresses your highest priority skill gaps.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase">
            7-DAY ACTION PLAN
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {store.roadmap.filter(t => t.is_completed).length} / {store.roadmap.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {store.roadmap.map((task) => (
            <div
              key={task.day}
              className={`p-4 rounded border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                task.is_completed
                  ? 'bg-slate-50 border-[#E2E8F0] text-slate-500 opacity-90'
                  : 'bg-white border-[#E2E8F0] text-[#0A192F] hover:border-[#427AB5]'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="pt-0.5">
                  {task.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#427AB5] shrink-0" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-[#0A192F]">Day {task.day}:</span>
                    <span className="font-bold text-xs text-[#0A192F]">{task.topic}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      task.difficulty === 'Hard'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {task.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    {task.why_it_matters} — <span className="italic">{task.practice_goal}</span>
                  </p>
                </div>
              </div>

              {!task.is_completed && onNavigateToAssessment && (
                <button
                  onClick={() => onNavigateToAssessment(task.day <= 2 ? 'binary-search' : 'system-design')}
                  className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#112240] text-white text-[11px] font-semibold rounded shrink-0 flex items-center"
                >
                  Practice <ArrowRight className="w-3 h-3 ml-1 text-[#FFDE59]" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
