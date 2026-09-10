import React, { useState } from 'react';
import { ArrowRight, Upload } from 'lucide-react';
import { api } from '../services/api';

interface ResumeUploadProps {
  onProceed: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onProceed }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  const handleParse = async () => {
    setAnalyzing(true);
    const data = await api.uploadResume();
    setResumeData(data);
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="border-b border-[#E2E8F0] pb-4">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block">Step 2</span>
        <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Resume & Claims Analysis</h1>
      </div>

      {!resumeData ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 shadow-sm text-center space-y-4">
          <Upload className="w-8 h-8 text-[#64748B] mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-[#0A192F]">Upload Resume PDF</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Extract skill claims & project experience</p>
          </div>
          <button
            onClick={handleParse}
            disabled={analyzing}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold rounded transition-colors"
          >
            {analyzing ? 'Parsing Resume...' : 'Parse Sample Resume'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block">COMPATIBILITY SCORE</span>
              <div className="text-3xl font-extrabold text-[#0A192F]">{resumeData.compatibility_score}%</div>
            </div>
            <button
              onClick={onProceed}
              className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold flex items-center"
            >
              Open Skill Truth Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
            </button>
          </div>

          <div className="text-xs space-y-2 text-[#64748B]">
            <span className="font-semibold text-[#0A192F] block">Matched Claims:</span>
            <p className="text-emerald-700 font-semibold">{resumeData.matched_skills.join(', ')}</p>
          </div>
        </div>
      )}

    </div>
  );
};
