import React, { useState } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  RefreshCw, FileCode, Check, Target, Info, Award, AlertTriangle, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { userStore } from '../services/userStore';
import { AtsAnalysisResponse } from '../types';

interface ResumeUploadProps {
  onProceed: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onProceed }) => {
  const store = userStore.getSnapshot();
  const existingAnalysis = store.atsResult.fullAnalysis || null;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>(store.goal.targetRole || 'Software Engineer');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResponse | null>(existingAnalysis);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const name = file.name.toLowerCase();
      if (!name.endsWith('.pdf') && !name.endsWith('.docx') && !name.endsWith('.doc')) {
        setErrorMsg('Please select a PDF or DOCX file.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const name = file.name.toLowerCase();
      if (!name.endsWith('.pdf') && !name.endsWith('.docx') && !name.endsWith('.doc')) {
        setErrorMsg('Please upload a PDF or DOCX file.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF or DOCX resume file first.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setProgressStep(1);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 800);

    try {
      const result = await api.analyzeATS(selectedFile, targetRole, jobDescription);
      clearInterval(stepInterval);
      setAtsAnalysis(result);
      userStore.saveAtsAnalysis(result);
      setAnalyzing(false);
    } catch (err: any) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setErrorMsg(err.message || 'AI analysis failed. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAtsAnalysis(null);
    setErrorMsg(null);
  };

  // Helper for score badge
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Strong Alignment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 65) return { label: 'Good Alignment', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Needs Optimization', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#0A192F]">
      
      {/* PAGE HEADER */}
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">CAREER ENGINE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">GROQ AI POWERED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] mt-1">ATS Resume Checker & AI Evaluator</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real AI analysis of your resume against ATS criteria, keyword density, section scores, and optional job match.
          </p>
        </div>

        {atsAnalysis && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-white hover:bg-[#F8FAFC] text-[#0A192F] border border-[#E2E8F0] text-xs font-semibold flex items-center shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#64748B]" /> Analyze Another Resume
          </button>
        )}
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold block">Analysis Failed</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* VIEW 1: FILE UPLOAD FORM (IF NO ANALYSIS YET) */}
      {!atsAnalysis && !analyzing && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* DROPZONE */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0284C7]'
              }`}
            >
              {!selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A192F]">Upload Resume PDF or DOCX</h3>
                    <p className="text-xs text-[#64748B] mt-1">Drag and drop your file here, or click to browse</p>
                  </div>
                  <label className="inline-block px-5 py-2 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] font-mono text-[#94A3B8]">Supported Formats: PDF, DOCX (Max 10MB)</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-[#E2E8F0] text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0A192F] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F] truncate max-w-xs">{selectedFile.name}</h4>
                      <p className="text-[10px] text-[#64748B]">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI extraction</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Target Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0A192F] flex items-center">
                  <Target className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Target Job Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer (Full Stack)"
                  className="w-full text-xs p-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                />
              </div>

              {/* Optional Job Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#0A192F] flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Target Job Description (Optional)
                  </span>
                  <span className="text-[10px] font-normal text-[#64748B]">Enables Job Match Score & Keyword Gap</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description text here to run an instant resume-to-job match score comparison..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#0284C7] focus:outline-none font-mono"
                />
              </div>

            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                className={`px-8 py-3.5 rounded-lg text-white font-bold text-xs flex items-center shadow-md transition-all ${
                  selectedFile && !analyzing
                    ? 'bg-[#0A192F] hover:bg-[#112240] cursor-pointer'
                    : 'bg-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#FFDE59]" /> Analyze Resume with AI
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: ANIMATED AI PROCESSING LOADING OVERLAY */}
      {analyzing && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#E0F2FE] border-4 border-[#0284C7] border-t-transparent animate-spin mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#0284C7] animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A192F]">Running Groq AI Resume Extraction & ATS Analysis...</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Extracting document text, parsing technical skills, analyzing keyword density, and calculating compatibility scores.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
            <div className={`flex items-center text-xs space-x-2 ${progressStep >= 1 ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}`}>
              <Check className="w-4 h-4" />
              <span>1. Extracting text from uploaded PDF/DOCX document</span>
            </div>
            <div className={`flex items-center text-xs space-x-2 ${progressStep >= 2 ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}`}>
              <Check className="w-4 h-4" />
              <span>2. Evaluating technical experience & section alignment</span>
            </div>
            <div className={`flex items-center text-xs space-x-2 ${progressStep >= 3 ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}`}>
              <Check className="w-4 h-4" />
              <span>3. Running Groq AI keyword audit & generating recommendations</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL RESULTS DASHBOARD (AFTER REAL GROQ ANALYSIS) */}
      {atsAnalysis && !analyzing && (
        <div className="space-y-8">
          
          {/* HEADER SUMMARY CARD & ATS SCORE HERO */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E2E8F0] pb-6">
              
              {/* ATS OVERALL SCORE */}
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-[#0A192F] text-white flex flex-col items-center justify-center shrink-0 border-4 border-[#FFDE59] shadow-inner">
                  <span className="text-3xl font-extrabold">{atsAnalysis.overall_score}</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase">/ 100</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">ATS COMPATIBILITY SCORE</span>
                  <h2 className="text-xl font-extrabold text-[#0A192F] mt-0.5">
                    {atsAnalysis.overall_score >= 80 ? 'Excellent Match' : atsAnalysis.overall_score >= 65 ? 'Good Alignment' : 'Needs Optimization'}
                  </h2>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getScoreBadge(atsAnalysis.overall_score).color}`}>
                    {getScoreBadge(atsAnalysis.overall_score).label}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTON TO PROCEED */}
              <button
                onClick={onProceed}
                className="px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold flex items-center shadow-sm transition-colors"
              >
                Proceed to Skill Assessment <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
              </button>
            </div>

            {/* AI SUMMARY NARRATIVE */}
            <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-bold text-[#0A192F] flex items-center">
                <Sparkles className="w-4 h-4 text-[#0284C7] mr-1.5" /> AI Executive Summary
              </span>
              <p className="text-xs text-[#475569] leading-relaxed pt-0.5">{atsAnalysis.summary}</p>
            </div>

            {/* 10 CATEGORY SCORE BREAKDOWN GRID */}
            <div>
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-3">
                10-CATEGORY SCORE BREAKDOWN
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: 'ATS Compatibility', val: atsAnalysis.category_scores.ats_compatibility, max: 15 },
                  { name: 'Content Quality', val: atsAnalysis.category_scores.content_quality, max: 15 },
                  { name: 'Experience', val: atsAnalysis.category_scores.experience, max: 15 },
                  { name: 'Technical Skills', val: atsAnalysis.category_scores.technical_skills, max: 15 },
                  { name: 'Projects', val: atsAnalysis.category_scores.projects, max: 10 },
                  { name: 'Achievements', val: atsAnalysis.category_scores.achievements, max: 10 },
                  { name: 'Keywords', val: atsAnalysis.category_scores.keywords, max: 10 },
                  { name: 'Formatting', val: atsAnalysis.category_scores.formatting, max: 5 },
                  { name: 'Education', val: atsAnalysis.category_scores.education, max: 3 },
                  { name: 'Contact Info', val: atsAnalysis.category_scores.contact_information, max: 2 },
                ].map((cat, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] font-medium block truncate">{cat.name}</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-extrabold text-[#0A192F]">{cat.val}</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">/ {cat.max}</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0284C7] h-full rounded-full"
                        style={{ width: `${(cat.val / cat.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* JOB MATCH BREAKDOWN (IF JOB DESCRIPTION PROVIDED) */}
          {atsAnalysis.job_match && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#0284C7]" />
                  <span className="text-xs font-mono font-bold text-[#0A192F] uppercase tracking-wider">
                    TARGET JOB MATCH SCORE: {atsAnalysis.job_match.job_match_score}%
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  JOB DESCRIPTION COMPARISON
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-700 block">Matched Job Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsAnalysis.job_match.matched_keywords.length > 0 ? (
                      atsAnalysis.job_match.matched_keywords.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[11px]">
                          ✓ {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#64748B] italic">No direct keyword overlaps detected</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-amber-700 block">Missing Job Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsAnalysis.job_match.missing_keywords.length > 0 ? (
                      atsAnalysis.job_match.missing_keywords.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                          ! {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-700 italic">All key JD terms matched</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STRENGTHS vs WEAKNESSES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* STRENGTHS */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> STRENGTHS IDENTIFIED ({atsAnalysis.strengths.length})
              </span>
              <ul className="space-y-2 text-xs text-[#0A192F]">
                {atsAnalysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-emerald-600 font-bold mr-2 shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WEAKNESSES */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> AREAS NEEDING IMPROVEMENT ({atsAnalysis.weaknesses.length})
              </span>
              <ul className="space-y-2 text-xs text-[#0A192F]">
                {atsAnalysis.weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-amber-600 font-bold mr-2 shrink-0">!</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* HIGH PRIORITY IMPROVEMENTS (PROBLEM, RECOMMENDATION, EXAMPLE) */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-3">
              HIGH PRIORITY IMPROVEMENTS
            </span>

            <div className="space-y-4">
              {atsAnalysis.improvements.map((imp, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A192F] uppercase font-mono text-[11px]">{imp.section} Section</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      imp.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {imp.priority} priority
                    </span>
                  </div>

                  <div>
                    <strong className="text-red-700 font-semibold block">Problem:</strong>
                    <p className="text-[#475569]">{imp.problem}</p>
                  </div>

                  <div>
                    <strong className="text-emerald-700 font-semibold block">Recommendation:</strong>
                    <p className="text-[#475569]">{imp.recommendation}</p>
                  </div>

                  {imp.example && (
                    <div className="bg-white p-2.5 rounded border border-[#E2E8F0] font-mono text-[11px] text-[#0A192F]">
                      <span className="text-[10px] text-[#64748B] block font-sans font-semibold mb-0.5">Suggested Improvement Template:</span>
                      "{imp.example}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KEYWORD ANALYSIS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
                KEYWORD DENSITY AUDIT
              </span>
              <span className="text-xs font-bold text-[#0A192F]">
                Match Rate: {atsAnalysis.keyword_analysis.keyword_match_percentage}%
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 block mb-1.5">Matched Technical Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {atsAnalysis.keyword_analysis.matched_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-700 block mb-1.5">Missing / Relevant Target Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {atsAnalysis.keyword_analysis.missing_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION ANALYSIS SCORES & ATS CHECKLIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section Scores */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
                RESUME SECTION SCORES
              </span>
              <div className="space-y-2.5 text-xs">
                {Object.entries(atsAnalysis.section_analysis).map(([sec, sc], idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[#0A192F] font-semibold">
                      <span>{sec}</span>
                      <span>{sc}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sc >= 80 ? 'bg-emerald-600' : sc >= 65 ? 'bg-[#0284C7]' : 'bg-amber-500'}`}
                        style={{ width: `${sc}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Checklist */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
                ATS COMPLIANCE CHECKLIST
              </span>
              <div className="space-y-2 text-xs">
                {atsAnalysis.ats_checklist.map((chk, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center space-x-2">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-semibold text-[#0A192F]">{chk.item}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">{chk.note}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FINAL RECOMMENDATION & FOOTER CTA */}
          <div className="bg-[#0A192F] text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-[#FFDE59] uppercase tracking-wider block font-bold">
                FINAL AI RECOMMENDATION
              </span>
              <p className="text-xs text-[#E2E8F0] mt-1 max-w-2xl leading-relaxed">
                {atsAnalysis.final_recommendation}
              </p>
            </div>
            <button
              onClick={onProceed}
              className="px-6 py-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs whitespace-nowrap transition-colors flex items-center shadow-sm"
            >
              Continue to Skill Assessment <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
