import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { PersonalizedRoadmap } from '../types';
import { api } from '../services/api';

interface PersonalizedRoadmapProps {
  roadmapData: PersonalizedRoadmap | null;
  onRunReassessment: () => void;
}

export const PersonalizedRoadmapPage: React.FC<PersonalizedRoadmapProps> = ({
  roadmapData,
  onRunReassessment
}) => {
  const [data, setData] = useState<PersonalizedRoadmap | null>(roadmapData);
  const [loading, setLoading] = useState(!roadmapData);

  useEffect(() => {
    if (!roadmapData) {
      api.getRoadmap().then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [roadmapData]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Generating Impact-Based Learning Roadmap...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Impact-Based Priority</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">7-Day Improvement Roadmap</h1>
        </div>

        <button
          onClick={onRunReassessment}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#FFDE59]" />
          Simulate Re-assessment
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
          PRIORITY JUSTIFICATION
        </span>
        <p className="text-xs text-[#64748B] leading-relaxed">
          DSA and System Design take precedence over Docker because DSA and System Design are core high-importance requirements for your target Software Engineer role.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-3">
          DAILY ACTION PLAN
        </span>

        <div className="space-y-2">
          {data.seven_day_plan.map((task) => (
            <div
              key={task.day}
              className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between items-center text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-[#0A192F]">Day {task.day}:</span>
                <span className="font-bold text-[#0A192F]">{task.topic}</span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">{task.practice_goal}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
