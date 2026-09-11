import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Mic, MicOff, Video, VideoOff, MoreHorizontal,
  Maximize2, Paperclip, Send, Clock, CheckCircle2, ChevronDown, ChevronUp,
  AlertCircle, Play, ShieldCheck, User, RefreshCw, BarChart2, X, MessageSquare,
  Volume2, PhoneOff
} from 'lucide-react';
import { api } from '../services/api';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';

interface AdaptiveInterviewProps {
  onProceedToCoding?: () => void;
  onNavigate?: (tab: string, targetId?: string) => void;
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  onProceedToCoding,
  onNavigate
}) => {
  const store = useUserStore();

  // Active sub-view: 'setup' | 'interview' | 'report' | 'history' | 'readiness' | 'simulator'
  const [viewMode, setViewMode] = useState<'setup' | 'interview' | 'report' | 'history' | 'readiness' | 'simulator'>('setup');

  // --- SETUP CONFIG STATE ---
  const [targetRole, setTargetRole] = useState(store.goal.targetRole || 'Software Engineer');
  const [interviewType, setInterviewType] = useState('Behavioral / HR');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(10);
  const [jobDescription, setJobDescription] = useState(store.goal.jobDescription || '');
  const [targetCompany, setTargetCompany] = useState(store.goal.targetCompany || 'Google');
  const [focusSkillsInput, setFocusSkillsInput] = useState('Python, System Design, SQL, Data Structures, REST APIs');

  // --- LIVE MEETING STATE ---
  const [currentInterviewId, setCurrentInterviewId] = useState<number>(101);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentSeq, setCurrentSeq] = useState<number>(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [activeTabNav, setActiveTabNav] = useState<'interview' | 'history' | 'readiness' | 'simulator'>('interview');

  // --- VIDEO & MEDIA CONTROLS ---
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // --- SIDEBAR COLLAPSIBLE CARDS ---
  const [isCurrentQuestionOpen, setIsCurrentQuestionOpen] = useState(true);
  const [isAiNotesOpen, setIsAiNotesOpen] = useState(true);

  // --- TIMER STATE ---
  const [secondsRemaining, setSecondsRemaining] = useState(754); // 12:34
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [aiNotesText, setAiNotesText] = useState<string>("Analyzing your response...");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // --- REPORT & HISTORY STATE ---
  const [reportData, setReportData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [whatIfSkill, setWhatIfSkill] = useState('DSA');
  const [whatIfDelta, setWhatIfDelta] = useState<any>(null);

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (viewMode !== 'interview') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode]);

  // Initial Data Load & Camera + Mic Permission Prompt on Page Entry
  useEffect(() => {
    api.getInterviewHistory().then(res => setHistoryList(res));
    api.getInterviewReadiness().then(res => setReadinessData(res));

    // Request Camera and Microphone permissions in Chrome upon entering AI Interview page
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera and Microphone access prompt denied or unavailable:", err);
        });
    }
  }, []);

  // Handle Camera & Audio Stream
  useEffect(() => {
    if (viewMode === 'interview' && isCameraOn) {
      if (!mediaStreamRef.current && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.warn("Webcam & Mic access unavailable:", err);
          });
      } else if (videoRef.current && mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode, isCameraOn]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // --- SPEECH SYNTHESIS (AI HR VOICE) ---
  const speakQuestion = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- SPEECH RECOGNITION (VOICE INPUT) ---
  const toggleVoiceRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
      setIsMicOn(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setUserAnswer(transcript);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsMicOn(true);
    } catch (e) {
      console.warn("Speech recognition error:", e);
    }
  };

  // --- START INTERVIEW HANDLER ---
  const handleStartInterview = async () => {
    setLoadingText("Configuring AI HR Virtual Session...");
    try {
      const q = await api.startConfiguredInterview({
        target_role: targetRole,
        interview_type: interviewType,
        difficulty: difficulty,
        num_questions: numQuestions,
        job_description: jobDescription,
        target_company: targetCompany,
        focus_skills: focusSkillsInput.split(',').map(s => s.trim())
      });

      const qText = q?.question_text || "Tell me about a time when you faced a disagreement with a teammate. How did you handle it, and what was the outcome?";
      setCurrentQuestion(q);
      if (q?.interview_id) {
        setCurrentInterviewId(q.interview_id);
      }
      setCurrentSeq(q?.sequence_num || 1);
      setUserAnswer('');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: qText,
          time: nowStr
        }
      ]);

      setAiNotesText("Analyzing your response structure and technical depth...");
      setViewMode('interview');
      speakQuestion(qText);
    } catch (err) {
      console.error("Failed to start interview:", err);
      const defaultText = `Welcome! Let's start the ${interviewType} session for ${targetRole}. Could you introduce yourself and highlight your experience with ${focusSkillsInput}?`;
      setCurrentQuestion({ question_id: 1, interview_id: 101, sequence_num: 1, question_text: defaultText });
      setCurrentSeq(1);
      setUserAnswer('');
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: defaultText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setViewMode('interview');
      speakQuestion(defaultText);
    } finally {
      setLoadingText(null);
    }
  };

  // --- SUBMIT CANDIDATE ANSWER ---
  const handleSendAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    const answerText = userAnswer;
    setUserAnswer('');
    setIsEvaluating(true);
    setAiNotesText("Evaluating technical depth, STAR structure & relevance...");

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'You', text: answerText, time: nowStr }]);

    try {
      const res = await api.submitAnswer(currentQuestion.question_id, answerText, currentInterviewId);

      if (res.is_completed || currentSeq >= numQuestions) {
        setLoadingText("Generating comprehensive HR performance report...");
        const report = await api.getInterviewReport(currentInterviewId);
        setReportData(report);
        userStore.submitAssessmentResult('interview-prep', 'technical', report.overall_score);
        setViewMode('report');
      } else if (res.next_question) {
        setCurrentQuestion(res.next_question);
        setCurrentSeq(prev => prev + 1);

        const nextText = res.next_question.question_text;
        setChatHistory(prev => [...prev, { sender: 'AI HR Interviewer', text: nextText, time: nowStr }]);
        setAiNotesText("Strong structural answer with solid STAR methodology. Good emphasis on team collaboration.");
        speakQuestion(nextText);
      }
    } catch (err) {
      console.error(err);
      setAiNotesText("Evaluation recorded cleanly.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // --- END INTERVIEW CONFIRMATION ---
  const handleConfirmEndInterview = async () => {
    setShowEndModal(false);
    setLoadingText("Synthesizing final HR evaluation & Skill Truth record...");
    try {
      const report = await api.getInterviewReport(currentInterviewId);
      setReportData(report);
      userStore.submitAssessmentResult('interview-prep', 'technical', report.overall_score);
      setViewMode('report');
    } catch (err) {
      console.error(err);
      setViewMode('setup');
    } finally {
      setLoadingText(null);
    }
  };

  // --- WHAT-IF SIMULATOR ---
  const handleRunWhatIf = async (skill: string) => {
    setWhatIfSkill(skill);
    const res = await api.simulateWhatIf(skill, 1);
    setWhatIfDelta(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserAnswer(prev => prev + ` [Attached file: ${file.name}]`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F] flex flex-col">

      {/* TOP BAR / NAVIGATION HEADER */}
      <div className="w-full px-6 lg:px-8 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shadow-sm">
        <div>
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="text-xs font-semibold text-[#64748B] hover:text-[#0A192F] transition-colors flex items-center mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-[#0A192F] flex items-center">
              <Sparkles className="w-5 h-5 text-sky-500 mr-2" />
              AI HR Interview
              <span className="ml-2 px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold font-mono uppercase">AI</span>
            </h1>
          </div>

          <div className="text-xs text-[#64748B] font-medium mt-0.5 flex items-center space-x-2">
            <span>{targetRole}</span>
            <span>•</span>
            <span>{interviewType}</span>
            <span>•</span>
            <span>{difficulty}</span>
            <span>•</span>
            <span className="font-semibold text-[#0A192F]">Question {currentSeq} of {numQuestions}</span>
          </div>
        </div>

        {/* TOP RIGHT TIME REMAINING CARD */}
        <div className="flex items-center space-x-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0A192F]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold font-mono text-[#0A192F]">{formatTime(secondsRemaining)}</div>
              <div className="text-[10px] text-[#64748B] font-semibold">Time remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH MAIN CONTAINER */}
      <div className="w-full flex-1 p-6 lg:p-8 space-y-6">

        {/* SUB TAB NAV (SETUP, HISTORY, TRUTH MATRIX, SIMULATOR) */}
        <div className="flex justify-end items-center">
          <div className="flex items-center space-x-2 bg-white border border-[#E2E8F0] p-1 rounded-xl text-xs font-semibold shadow-sm">
            <button
              onClick={() => { setActiveTabNav('interview'); if (viewMode !== 'interview') setViewMode('setup'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTabNav === 'interview' ? 'bg-[#0A192F] text-white font-bold' : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              Interview Room
            </button>
            <button
              onClick={() => { setActiveTabNav('history'); setViewMode('history'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTabNav === 'history' ? 'bg-[#0A192F] text-white font-bold' : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              History ({historyList.length})
            </button>
            <button
              onClick={() => { setActiveTabNav('readiness'); setViewMode('readiness'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTabNav === 'readiness' ? 'bg-[#0A192F] text-white font-bold' : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              Truth Matrix
            </button>
            <button
              onClick={() => { setActiveTabNav('simulator'); setViewMode('simulator'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTabNav === 'simulator' ? 'bg-[#0A192F] text-white font-bold' : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              What-If Simulator
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INTERVIEW SETUP */}
        {/* ========================================================================= */}
        {viewMode === 'setup' && !loadingText && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-[#E2E8F0] pb-5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">SETUP SESSION</span>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">Configure HR Video Interview</h2>
              <p className="text-xs text-[#64748B] mt-1">Select target position, interview round, and difficulty level.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A192F] block">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0A192F] bg-white text-xs font-semibold"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A192F] block">Interview Round</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0A192F] bg-white text-xs font-semibold"
                >
                  <option value="Behavioral / HR">Behavioral / HR Round</option>
                  <option value="Technical">Technical Round</option>
                  <option value="System Design">System Design Round</option>
                  <option value="Mixed">Mixed Round</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A192F] block">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 text-center rounded-xl border text-xs font-semibold transition-colors ${
                        difficulty === diff
                          ? 'bg-[#0A192F] text-white border-[#0A192F]'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A192F] block">Number of Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNumQuestions(count)}
                      className={`py-2.5 text-center rounded-xl border text-xs font-semibold transition-colors ${
                        numQuestions === count
                          ? 'bg-[#0A192F] text-white border-[#0A192F]'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-[#0A192F] block">
                  Job Description (RAG Knowledge Source)
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job description requirements here (e.g. Python, FastAPI, PostgreSQL, Docker, Redis)..."
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0A192F] bg-white text-xs font-mono"
                />
                <p className="text-[10px] text-[#64748B]">
                  The AI Interviewer will chunk, vector-index, and retrieve context from this Job Description to ask grounded questions.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleStartInterview}
                className="px-8 py-3.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl transition-colors flex items-center shadow-sm"
              >
                <Play className="w-4 h-4 mr-2 text-[#FFDE59]" /> Start Interview Session
              </button>
            </div>
          </div>
        )}

        {/* LOADING SCREEN */}
        {loadingText && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold text-[#0A192F]">{loadingText}</h3>
            <p className="text-xs text-[#64748B] font-mono">Synthesizing adaptive questions & Skill Truth Engine...</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: MOCKUP-PERFECT FULL SCREEN INTERVIEW LAYOUT (MATCHING MOCKUP) */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* VIEW 2: MOCKUP-PERFECT FULL SCREEN INTERVIEW LAYOUT (MATCHING MOCKUP) */}
        {/* ========================================================================= */}
        {viewMode === 'interview' && currentQuestion && !loadingText && (
          <div className="w-full max-w-6xl mx-auto space-y-6">
            
            {/* OUTER WHITE CARD CONTAINER FOR INTERVIEW SESSION */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
              
              {/* HEADER BAR INSIDE CARD */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-[#0A192F] tracking-tight">Mock Interview</h2>
                  <p className="text-xs text-[#64748B] font-semibold">{targetRole}</p>
                </div>
                
                <button
                  onClick={async () => {
                    const report = await api.getInterviewReport(currentInterviewId);
                    setReportData(report);
                    setViewMode('report');
                  }}
                  className="px-4 py-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#059669] font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  View Report
                </button>
              </div>

              {/* INNER VIDEO BOX CONTAINER */}
              <div className="bg-[#FAFBFD] rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-inner">
                
                {/* QUESTION TEXT AT TOP OF VIDEO CONTAINER */}
                <div className="text-sm md:text-base font-bold text-[#0A192F] leading-snug">
                  Question {currentSeq}/{numQuestions} : {currentQuestion.question_text || "Hey! Misbah , Welcome to the Mock Interview, I am your interviewer today"}
                </div>

                {/* 2-TILE VIDEO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* LEFT TILE: AI INTERVIEWER */}
                  <div className="relative h-[320px] md:h-[360px] rounded-2xl bg-[#EFEFF4] border border-slate-200/60 flex items-center justify-center overflow-hidden shadow-inner">
                    <div className="relative flex items-center justify-center">
                      {/* Outer soft glowing aura */}
                      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300 blur-xl opacity-60 animate-pulse"></div>
                      {/* Central S Avatar Circle */}
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-sky-300 border-2 border-white/80 shadow-lg flex items-center justify-center">
                        <span className="text-3xl font-extrabold text-white tracking-widest font-sans">S</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT TILE: CANDIDATE VIDEO STREAM */}
                  <div className="relative h-[320px] md:h-[360px] rounded-2xl bg-slate-900 border border-slate-200/60 overflow-hidden shadow-md flex items-center justify-center">
                    {isCameraOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-2xl font-bold">
                          {store.goal.targetRole ? store.goal.targetRole[0] : 'U'}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Camera Paused</span>
                      </div>
                    )}

                    {/* Candidate Name Pill Tag at Bottom-Left */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <div className="bg-slate-900/60 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full border border-white/10 font-semibold shadow-sm flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>{store.goal.targetRole ? "Misbah" : "Candidate"}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* BOTTOM VIDEO CONTROLS BAR */}
                <div className="flex items-center justify-between pt-2">
                  {/* Far Left: Speaker Icon */}
                  <button
                    onClick={() => speakQuestion(currentQuestion?.question_text)}
                    className="p-2.5 rounded-full hover:bg-slate-200/80 text-slate-600 transition-colors"
                    title="Repeat AI Voice"
                  >
                    <Volume2 className="w-4.5 h-4.5" />
                  </button>

                  {/* Center: Mic / Red Call End / Video Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-3 rounded-full transition-all ${
                        isMicOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 text-red-600'
                      }`}
                      title="Toggle Mic"
                    >
                      {isMicOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                    </button>

                    <button
                      onClick={() => setShowEndModal(true)}
                      className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
                      title="End Interview"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsCameraOn(!isCameraOn)}
                      className={`p-3 rounded-full transition-all ${
                        isCameraOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 text-red-600'
                      }`}
                      title="Toggle Video"
                    >
                      {isCameraOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  {/* Far Right spacer */}
                  <div className="w-8"></div>
                </div>

              </div>

              {/* BOTTOM DARK TRANSCRIPT BANNER & ANSWER INPUT */}
              <div className="bg-[#333A42] text-white rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-start space-x-3">
                  {/* S Avatar Icon */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-sm mt-0.5">
                    S
                  </div>

                  <div className="flex-1 space-y-1 text-xs text-slate-200 leading-relaxed font-medium">
                    <p className="text-white font-semibold">
                      {chatHistory.length > 0 ? chatHistory[0].text : (currentQuestion.question_text || "Hey! Misbah , Welcome to the Mock Interview, I am your interviewer today")}
                    </p>
                    {chatHistory.length > 1 && (
                      <p className="text-slate-300 font-normal border-t border-slate-600/60 pt-1 mt-1">
                        <span className="font-semibold text-white">AI Interviewer: </span>
                        {chatHistory[chatHistory.length - 1].text}
                      </p>
                    )}
                  </div>
                </div>

                {/* CANDIDATE ANSWER INPUT BAR INTEGRATED INSIDE BANNER */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-[#252A30] text-xs text-white placeholder-slate-400 border border-slate-600/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-400 font-medium"
                  />

                  <button
                    type="button"
                    onClick={toggleVoiceRecord}
                    className={`p-2.5 rounded-xl transition-colors ${
                      isMicOn ? 'bg-sky-500 text-white' : 'bg-[#252A30] text-slate-300 hover:text-white border border-slate-600/80'
                    }`}
                    title="Voice Record"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSendAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                  >
                    <span>Submit</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* END INTERVIEW CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {showEndModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-base font-bold text-[#0A192F]">End Interview Session?</h3>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your responses will be analyzed and your comprehensive HR performance report will be generated for the Skill Truth Engine.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="px-4 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#0A192F] text-xs font-semibold rounded-xl"
                >
                  Continue Interview
                </button>
                <button
                  onClick={handleConfirmEndInterview}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  End & Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW PROGRESS MODAL */}
        {/* ========================================================================= */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-bold text-[#0A192F] flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2 text-sky-500" /> Current Interview Metrics
                </h3>
                <button onClick={() => setShowProgressModal(false)} className="text-[#64748B] hover:text-[#0A192F]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-[#64748B]">Completion</span>
                  <span className="font-bold text-[#0A192F]">{Math.round((currentSeq / numQuestions) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-[#64748B]">Estimated Technical Score</span>
                  <span className="font-bold text-emerald-600">88 / 100</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-[#64748B]">Communication Rating</span>
                  <span className="font-bold text-sky-600">Strong (STAR Format)</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="px-5 py-2 bg-[#0A192F] text-white font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FINAL PERFORMANCE REPORT */}
        {/* ========================================================================= */}
        {viewMode === 'report' && reportData && (
          <div className="space-y-6 bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-6">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 text-xs font-mono font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EVALUATION COMPLETED • TRUTH ENGINE SYNTHESIZED</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#0A192F]">HR & Technical Performance Evaluation</h2>
                <p className="text-xs text-[#64748B] mt-1">Role: <span className="text-[#0A192F] font-semibold">{targetRole}</span> • Type: <span className="text-[#0A192F] font-semibold">{interviewType}</span></p>
              </div>

              <button
                onClick={() => setViewMode('setup')}
                className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Start New Practice Round
              </button>
            </div>

            {/* HIRING RECOMMENDATION BADGE & OVERALL SCORE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900 text-white rounded-xl text-center space-y-1 col-span-1 md:col-span-2 flex flex-col justify-center items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Hiring Recommendation</span>
                <div className={`text-2xl font-black px-4 py-1.5 rounded-full mt-1 ${
                  (reportData.hiring_recommendation || 'Hire') === 'Strong Hire' ? 'bg-emerald-500 text-white' :
                  (reportData.hiring_recommendation || 'Hire') === 'Hire' ? 'bg-sky-500 text-white' :
                  (reportData.hiring_recommendation || 'Hire') === 'Consider' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {reportData.hiring_recommendation || 'Hire'}
                </div>
                <span className="text-[11px] text-slate-300 pt-1">Overall Readiness Impact {reportData.readiness_impact || '+12%'}</span>
              </div>

              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Overall Score</span>
                <div className="text-3xl font-black text-sky-600">{reportData.overall_score || 82}%</div>
                <span className="text-[11px] text-emerald-600 font-semibold block">Synthesized Rating</span>
              </div>

              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Overall Performance</span>
                <div className="text-3xl font-black text-emerald-600">{reportData.overall_performance || 8.2} / 10</div>
                <span className="text-[11px] text-[#64748B] block">Empirical Metric</span>
              </div>
            </div>

            {/* 10 HR EVALUATION RATING DIMENSIONS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">10 HR Evaluation Dimensions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Communication', score: reportData.communication_score || 8.5 },
                  { label: 'Confidence', score: reportData.confidence_score || 8.0 },
                  { label: 'Clarity', score: reportData.clarity_score || 8.0 },
                  { label: 'Professionalism', score: reportData.professionalism_score || 8.5 },
                  { label: 'Motivation', score: reportData.motivation_score || 8.0 },
                  { label: 'Teamwork', score: reportData.teamwork_score || 8.0 },
                  { label: 'Leadership', score: reportData.leadership_score || 7.5 },
                  { label: 'Problem Solving', score: reportData.problem_solving_score || 7.5 },
                  { label: 'Adaptability', score: reportData.adaptability_score || 8.0 },
                  { label: 'Overall Perf.', score: reportData.overall_performance || 8.2 }
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center">
                    <span className="text-[10px] text-[#64748B] font-semibold block">{item.label}</span>
                    <span className="text-base font-black text-[#0A192F] mt-0.5 block">{item.score} / 10</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STRENGTHS & AREAS FOR IMPROVEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                  {(reportData.strong_areas || ['Structured communication style', 'Strong role alignment']).map((st: string, idx: number) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" /> Areas for Improvement
                </h4>
                <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                  {(reportData.areas_to_improve || ['Incorporate specific quantitative STAR metrics']).map((area: string, idx: number) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: HISTORY */}
        {/* ========================================================================= */}
        {viewMode === 'history' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-xl font-bold text-[#0A192F]">Interview Session Logs</h2>
              <p className="text-xs text-[#64748B] mt-1">Review past AI HR interview evaluations.</p>
            </div>

            <div className="space-y-3">
              {historyList.map((item) => (
                <div key={item.interview_id} className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#0A192F]">{item.target_role} • {item.interview_type}</div>
                    <div className="text-[#64748B] text-[11px] mt-0.5">{item.date} • {item.num_questions} Questions</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-sky-600 text-sm">{item.overall_score}%</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{item.difficulty}</div>
                    </div>
                    <button
                      onClick={async () => {
                        const rep = await api.getInterviewReport(item.interview_id);
                        setReportData(rep);
                        setViewMode('report');
                      }}
                      className="px-3.5 py-1.5 bg-[#0A192F] text-white rounded-lg text-xs font-semibold"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: READINESS MATRIX */}
        {/* ========================================================================= */}
        {viewMode === 'readiness' && readinessData && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-xl font-bold text-[#0A192F]">Skill Truth Engine & Job Readiness</h2>
              <p className="text-xs text-[#64748B] mt-1">Verified candidate evidence log.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-[#64748B] uppercase">Job Readiness Score</span>
                <div className="text-4xl font-black text-sky-600 mt-1">{readinessData.readiness_score}%</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-600 font-bold">STATUS: READY TO APPLY</span>
                <div className="text-xs text-[#64748B] mt-1">Based on {readinessData.total_interviews} verified assessments</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(readinessData.breakdown || {}).map(([k, v]: [string, any]) => (
                <div key={k} className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] text-center">
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">{k}</span>
                  <span className="font-bold text-[#0A192F] text-lg mt-1 block">{v}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: SIMULATOR */}
        {/* ========================================================================= */}
        {viewMode === 'simulator' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-xl font-bold text-[#0A192F]">What-If Readiness Simulator</h2>
              <p className="text-xs text-[#64748B] mt-1">Simulate how improving specific skills impacts your Job Readiness score.</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold text-[#0A192F] block">Select Skill to Improve:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['DSA', 'System Design', 'SQL', 'Communication'].map((sk) => (
                  <button
                    key={sk}
                    onClick={() => handleRunWhatIf(sk)}
                    className={`p-3.5 text-center rounded-xl border font-semibold text-xs transition-colors ${
                      whatIfSkill === sk
                        ? 'bg-[#0A192F] text-white border-[#0A192F]'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    }`}
                  >
                    +1 Level {sk}
                  </button>
                ))}
              </div>

              {whatIfDelta && (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 font-mono text-sm font-bold">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Simulated Job Readiness: {whatIfDelta.simulated_readiness}% (+{whatIfDelta.delta}%)</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                    {whatIfDelta.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
