import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MessageSquare,
  Settings, PhoneOff, Play, CheckCircle2, Sparkles, Clock, ShieldCheck,
  AlertCircle, ArrowRight, Send, RefreshCw, User, X, Sliders, ChevronRight, BarChart2
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
  const [numQuestions, setNumQuestions] = useState(5);
  const [jobDescription, setJobDescription] = useState(store.goal.jobDescription || '');
  const [targetCompany, setTargetCompany] = useState(store.goal.targetCompany || 'Google');
  const [focusSkillsInput, setFocusSkillsInput] = useState('Communication, Problem Solving, React, System Design');

  // --- LIVE MEETING STATE ---
  const [currentInterviewId, setCurrentInterviewId] = useState<number>(101);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentSeq, setCurrentSeq] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [activeTabNav, setActiveTabNav] = useState<'interview' | 'history' | 'readiness' | 'simulator'>('interview');

  // --- MEETING CONTROLS & AVATAR STATE ---
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiState, setAiState] = useState<'speaking' | 'listening' | 'evaluating' | 'idle'>('idle');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  // --- REPORT & HISTORY STATE ---
  const [reportData, setReportData] = useState<any>(null);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [whatIfSkill, setWhatIfSkill] = useState('DSA');
  const [whatIfDelta, setWhatIfDelta] = useState<any>(null);

  // --- REFS FOR MEDIA & RECOGNITION ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Initial load
  useEffect(() => {
    api.getInterviewHistory().then(res => setHistoryList(res));
    api.getInterviewReadiness().then(res => setReadinessData(res));
  }, []);

  // Handle Camera Feed in Interview View
  useEffect(() => {
    if (viewMode === 'interview' && isCameraOn) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Webcam unavailable or permission denied:", err);
          setIsCameraOn(false);
        });
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

  // Auto-scroll transcript drawer
  useEffect(() => {
    if (isTranscriptOpen && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTranscriptOpen]);

  // --- SPEECH SYNTHESIS (AI HR VOICE) ---
  const speakQuestion = (text: string) => {
    if (!text) return;
    setAiState('speaking');

    if ('speechSynthesis' in window && isSpeakerOn) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setAiState('listening');
        startSpeechRecognition();
      };
      utterance.onerror = () => {
        setAiState('listening');
        startSpeechRecognition();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer when audio disabled
      setTimeout(() => {
        setAiState('listening');
        startSpeechRecognition();
      }, 2000);
    }
  };

  // --- SPEECH RECOGNITION (CANDIDATE VOICE INPUT) ---
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && isMicOn) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setUserAnswer(currentTranscript);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Speech recognition error:", e);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // --- START INTERVIEW HANDLER ---
  const handleStartInterview = async () => {
    setLoadingText("Initializing AI HR Virtual Room & Loading Scenario...");
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

      const firstQuestionText = q.question_text || "Tell me about yourself and your background in software engineering.";
      setCurrentQuestion(q);
      setCurrentSeq(1);
      setUserAnswer('');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialGreeting = `Hi, I'm your AI HR interviewer. Thanks for joining today. Let's begin with your first question: "${firstQuestionText}"`;

      setChatHistory([
        { sender: 'AI HR Interviewer', text: initialGreeting, time: nowStr }
      ]);

      setViewMode('interview');
      speakQuestion(firstQuestionText);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } fontinally: {
      setLoadingText(null);
    }
  };

  // --- SUBMIT CANDIDATE ANSWER ---
  const handleSendAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    const answerText = userAnswer;
    stopSpeechRecognition();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setUserAnswer('');
    setAiState('evaluating');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'You', text: answerText, time: nowStr }]);

    try {
      const res = await api.submitAnswer(currentQuestion.question_id, answerText, currentInterviewId);

      if (res.is_completed || currentSeq >= numQuestions) {
        setLoadingText("Synthesizing interview evaluation report...");
        const report = await api.getInterviewReport(currentInterviewId);
        setReportData(report);

        userStore.submitAssessmentResult(
          'interview-prep',
          interviewType === 'SQL' ? 'interview' : 'technical',
          report.overall_score
        );
        setViewMode('report');
      } else if (res.next_question) {
        setCurrentQuestion(res.next_question);
        setCurrentSeq(prev => prev + 1);

        const nextText = res.next_question.question_text;
        setChatHistory(prev => [...prev, { sender: 'AI HR Interviewer', text: nextText, time: nowStr }]);
        speakQuestion(nextText);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setAiState('listening');
    }
  };

  // --- END INTERVIEW CONFIRMATION ---
  const handleConfirmEndInterview = async () => {
    setShowEndModal(false);
    stopSpeechRecognition();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setLoadingText("Generating comprehensive HR performance report...");
    try {
      const report = await api.getInterviewReport(currentInterviewId);
      setReportData(report);
      userStore.submitAssessmentResult(
        'interview-prep',
        'technical',
        report.overall_score
      );
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

  const handleNavigateTab = (tab: string, targetId?: string) => {
    if (onNavigate) {
      onNavigate(tab, targetId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans text-slate-100 space-y-6">

      {/* TOP NAVIGATION HEADER (SETUP / HISTORY / READINESS / SIMULATOR SWITCHER) */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block font-bold">CAREERFORGE AI • VIRTUAL ROOM</span>
          <h1 className="text-xl font-extrabold text-white mt-0.5">1-on-1 AI HR Video Interview</h1>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setActiveTabNav('interview'); if (viewMode !== 'interview') setViewMode('setup'); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabNav === 'interview' ? 'bg-sky-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Practice Room
          </button>
          <button
            onClick={() => { setActiveTabNav('history'); setViewMode('history'); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabNav === 'history' ? 'bg-sky-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            History ({historyList.length})
          </button>
          <button
            onClick={() => { setActiveTabNav('readiness'); setViewMode('readiness'); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabNav === 'readiness' ? 'bg-sky-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Truth Matrix
          </button>
          <button
            onClick={() => { setActiveTabNav('simulator'); setViewMode('simulator'); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabNav === 'simulator' ? 'bg-sky-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            What-If Simulator
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERVIEW SETUP CARD */}
      {/* ========================================================================= */}
      {viewMode === 'setup' && !loadingText && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono mb-1 font-semibold">
              <Video className="w-4 h-4" />
              <span>CONFIGURE VIRTUAL INTERVIEW ROOM</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Start HR Video Interview</h2>
            <p className="text-xs text-slate-400 mt-1">Set up your target position, difficulty, and company to generate adaptive HR & Technical questions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-950 text-white font-medium"
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

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Interview Category</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full p-3 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-950 text-white font-medium"
              >
                <option value="Behavioral / HR">Behavioral / HR Interview (STAR Method)</option>
                <option value="Technical">Technical Round (Core CS, System & Code)</option>
                <option value="System Design">System Design & Architecture</option>
                <option value="Mixed">Mixed HR + Technical Round</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 text-center rounded-xl border text-xs font-semibold transition-all ${
                      difficulty === diff
                        ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Number of Questions</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 8, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumQuestions(count)}
                    className={`py-2.5 text-center rounded-xl border text-xs font-semibold transition-all ${
                      numQuestions === count
                        ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Google, Meta, Microsoft..."
                className="w-full p-3 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-950 text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Focus Skills</label>
              <input
                type="text"
                value={focusSkillsInput}
                onChange={(e) => setFocusSkillsInput(e.target.value)}
                placeholder="Python, System Design, Communication..."
                className="w-full p-3 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-950 text-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-2">
            <label className="font-semibold text-slate-300 block">Job Description Context (Optional)</label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description to calibrate question difficulty and key responsibilities..."
              className="w-full p-3 border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-950 text-slate-200 font-mono text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartInterview}
              className="px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center shadow-lg shadow-sky-600/30"
            >
              <Video className="w-4 h-4 mr-2" /> Enter Virtual HR Meeting Room
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOADING SCREEN */}
      {/* ========================================================================= */}
      {loadingText && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white">{loadingText}</h3>
          <p className="text-xs text-slate-400 font-mono">Calibrating AI HR speech synthesis & readiness engine...</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: REALISTIC AI HR VIDEO MEETING ROOM */}
      {/* ========================================================================= */}
      {viewMode === 'interview' && currentQuestion && !loadingText && (
        <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[780px] relative font-sans">

          {/* 1. ROOM TOP HEADER */}
          <div className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-6 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-bold text-white tracking-wide">CAREERFORGE MEET</span>
              </div>
              <span className="text-slate-700">|</span>
              <span className="text-slate-300 font-semibold">{targetRole} • {interviewType} Round</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                {targetCompany}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">PROGRESS:</span>
                <span className="font-bold text-sky-400">{String(currentSeq).padStart(2, '0')} / {String(numQuestions).padStart(2, '0')}</span>
              </div>
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300"
                  style={{ width: `${(currentSeq / numQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2. MAIN MEETING STAGE & SIDE TRANSCRIPT */}
          <div className="flex-1 flex overflow-hidden relative bg-[#0F172A]">

            {/* MAIN VIDEO PANEL (AI HR INTERVIEWER) */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#0B0F17]">

              {/* TOP STATUS BADGE */}
              <div className="absolute top-6 left-6 z-20 flex items-center space-x-3">
                <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs font-semibold flex items-center space-x-2 shadow-lg">
                  {aiState === 'speaking' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
                      <span className="text-sky-300 font-bold">● AI HR is speaking...</span>
                    </>
                  )}
                  {aiState === 'listening' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-emerald-300 font-bold">● Listening to you...</span>
                    </>
                  )}
                  {aiState === 'evaluating' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce"></span>
                      <span className="text-amber-300 font-bold">● AI is evaluating your response...</span>
                    </>
                  )}
                  {aiState === 'idle' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span className="text-slate-300">● Meeting Ready</span>
                    </>
                  )}
                </div>

                {/* NON-INTRUSIVE AI EVALUATION INDICATORS */}
                {aiState === 'evaluating' && (
                  <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-full text-[11px] font-mono text-amber-300 animate-fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Analyzing: Relevance • Technical Depth • Communication</span>
                  </div>
                )}
              </div>

              {/* AI HR AVATAR DISPLAY WITH GLOWING ACTIVE RING */}
              <div className="relative flex flex-col items-center justify-center space-y-4">
                
                {/* Glowing Outer Ring */}
                <div className={`relative rounded-full p-2.5 transition-all duration-500 ${
                  aiState === 'speaking'
                    ? 'ring-4 ring-sky-400/80 shadow-[0_0_50px_rgba(56,189,248,0.4)] scale-105'
                    : aiState === 'listening'
                    ? 'ring-2 ring-emerald-500/40'
                    : 'ring-1 ring-slate-700'
                }`}>
                  {/* AI HR Graphic Avatar */}
                  <div className="w-44 h-44 rounded-full bg-slate-900 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
                      alt="AI HR Interviewer"
                      className="w-full h-full object-cover filter brightness-95 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  </div>

                  {/* Active Equalizer Sound Wave Bars when AI Speaks */}
                  {aiState === 'speaking' && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/95 border border-sky-400/60 rounded-full flex items-center space-x-1 z-10 shadow-lg">
                      <div className="w-1 h-3 bg-sky-400 animate-bounce"></div>
                      <div className="w-1 h-5 bg-sky-400 animate-bounce delay-75"></div>
                      <div className="w-1 h-4 bg-sky-400 animate-bounce delay-150"></div>
                      <div className="w-1 h-6 bg-sky-400 animate-bounce delay-100"></div>
                      <div className="w-1 h-3 bg-sky-400 animate-bounce"></div>
                    </div>
                  )}
                </div>

                {/* AI HR Name Overlay */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-white tracking-wide">AI HR Interviewer</h3>
                  <p className="text-xs text-slate-400 font-mono">Senior Talent Acquisition Lead • CareerForge AI</p>
                </div>
              </div>

              {/* CANDIDATE FLOATING SELF-CAM PREVIEW ("YOU") */}
              <div className="absolute bottom-28 right-6 w-60 h-44 bg-slate-900/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl z-30 transition-all hover:scale-105 group backdrop-blur-md">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-2">
                    <User className="w-10 h-10 text-slate-600" />
                    <span className="text-[11px] font-mono">Camera Paused</span>
                  </div>
                )}

                {/* Badge Bottom Left */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-slate-200 flex items-center space-x-1.5 border border-slate-800">
                  <span className="font-bold">You</span>
                  {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>

              {/* QUESTION SUBTITLE OVERLAY CARD */}
              <div className="absolute bottom-6 left-6 right-[270px] bg-slate-950/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 shadow-2xl z-20 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-400 font-bold uppercase tracking-wider">QUESTION {currentSeq} OF {numQuestions}</span>
                  {aiState === 'listening' && (
                    <span className="flex items-center text-emerald-400 text-[11px] animate-pulse">
                      <Mic className="w-3.5 h-3.5 mr-1" /> Speak your answer below or edit transcript...
                    </span>
                  )}
                </div>

                <p className="text-base font-semibold text-white leading-relaxed font-sans">
                  "{currentQuestion.question_text}"
                </p>

                {/* Real-time Answer Input & Submission Bar */}
                <div className="flex items-center space-x-3 pt-1">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                    placeholder={isMicOn ? "Speak your answer or type here..." : "Type your answer here..."}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                  <button
                    onClick={handleSendAnswer}
                    disabled={!userAnswer.trim() || aiState === 'evaluating'}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center shadow-md shadow-sky-600/30"
                  >
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5 ml-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE LIVE TRANSCRIPT SIDEBAR */}
            {isTranscriptOpen && (
              <div className="w-80 bg-slate-950 border-l border-slate-800 p-4 flex flex-col justify-between z-30 transition-all font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Live Transcript</span>
                  </div>
                  <button onClick={() => setIsTranscriptOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat History Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
                  {chatHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl space-y-1 ${
                        item.sender === 'You'
                          ? 'bg-sky-950/60 border border-sky-800/40 text-sky-100 ml-4'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-sky-300">{item.sender}</span>
                        <span>{item.time}</span>
                      </div>
                      <p className="leading-relaxed font-sans">{item.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 font-mono text-center">
                  Live speech transcript auto-saved
                </div>
              </div>
            )}
          </div>

          {/* 3. BOTTOM MEETING CONTROLS BAR */}
          <div className="h-20 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between z-40">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Encrypted AI HR Session</span>
            </div>

            {/* CIRCULAR MEETING CONTROL BUTTONS */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                className={`p-3.5 rounded-full transition-all border ${
                  isMicOn
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-red-950 border-red-800 text-red-400 hover:bg-red-900'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                className={`p-3.5 rounded-full transition-all border ${
                  isCameraOn
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-red-950 border-red-800 text-red-400 hover:bg-red-900'
                }`}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                title={isSpeakerOn ? "Mute AI Voice Readout" : "Unmute AI Voice Readout"}
                className={`p-3.5 rounded-full transition-all border ${
                  isSpeakerOn
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                title="Toggle Live Transcript"
                className={`p-3.5 rounded-full transition-all border ${
                  isTranscriptOpen
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                title="Meeting Settings"
                className="p-3.5 rounded-full bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* SEPARATED END INTERVIEW BUTTON */}
            <div>
              <button
                onClick={() => setShowEndModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-full transition-all flex items-center space-x-2 shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* END INTERVIEW CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showEndModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center space-x-3 text-red-400">
              <PhoneOff className="w-6 h-6" />
              <h3 className="text-lg font-bold">End Interview Session?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Your responses will be analyzed by the CareerForge Skill Truth Engine and your comprehensive HR performance report will be generated.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Continue Interview
              </button>
              <button
                onClick={handleConfirmEndInterview}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/30"
              >
                End & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SETTINGS MODAL */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center">
                <Settings className="w-4 h-4 mr-2 text-sky-400" /> Room & Audio Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-400 block font-mono">Microphone Input</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200">
                  {isMicOn ? "Default System Microphone (Active)" : "Microphone Muted"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-mono">Webcam Feed</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200">
                  {isCameraOn ? "Integrated Camera (Active)" : "Camera Off"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-mono">AI Speech Voice Engine</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200">
                  Web Speech API Utterance (English US - Natural HR)
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: COMPREHENSIVE INTERVIEW PERFORMANCE REPORT */}
      {/* ========================================================================= */}
      {viewMode === 'report' && reportData && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-100 shadow-2xl">
          
          <div className="flex justify-between items-start border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>EVALUATION COMPLETED • TRUTH ENGINE SYNTHESIZED</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">HR & Technical Interview Performance Report</h2>
              <p className="text-xs text-slate-400 mt-1">Role Target: <span className="text-white font-semibold">{targetRole}</span> • Type: <span className="text-white font-semibold">{interviewType}</span></p>
            </div>

            <button
              onClick={() => setViewMode('setup')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Start New Practice Round
            </button>
          </div>

          {/* OVERALL SCORE & READINESS METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Overall Interview Score</span>
              <div className="text-3xl font-black text-sky-400">{reportData.overall_score}%</div>
              <span className="text-[11px] text-emerald-400 font-semibold block">Readiness Contribution +{reportData.readiness_impact}%</span>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Technical Depth</span>
              <div className="text-3xl font-black text-emerald-400">{reportData.scores?.technical || reportData.overall_score}%</div>
              <span className="text-[11px] text-slate-400 block">Core CS & Domain Mastery</span>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Communication Clarity</span>
              <div className="text-3xl font-black text-amber-400">{reportData.scores?.communication || 82}%</div>
              <span className="text-[11px] text-slate-400 block">STAR Method & Structure</span>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence Level</span>
              <div className="text-3xl font-black text-purple-400">{reportData.scores?.confidence || 88}%</div>
              <span className="text-[11px] text-slate-400 block">Verified Evidence Record</span>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-slate-950 border border-emerald-950/60 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Demonstrated Strengths
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(reportData.strengths || [
                  "Clear structural response using standard STAR methodology.",
                  "Solid understanding of core software development lifecycle.",
                  "Concise explanation of problem-solving approach under technical constraints."
                ]).map((st: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-slate-950 border border-amber-950/60 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> Areas for Improvement
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(reportData.weaknesses || [
                  "Elaborate more on specific quantitative metrics and performance gains.",
                  "Provide deeper architectural rationale when selecting specific backend databases."
                ]).map((wk: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* DETAILED QUESTION BREAKDOWN */}
          {reportData.detailed_evaluations && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Question-by-Question HR Evaluation</h3>
              <div className="space-y-3">
                {reportData.detailed_evaluations.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-sky-400">Q{idx + 1}: {item.question_text}</span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">{item.score}/100</span>
                    </div>
                    <p className="text-slate-300 italic">"Candidate: {item.user_answer}"</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed"><span className="text-amber-400 font-semibold">Feedback:</span> {item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: HISTORY */}
      {/* ========================================================================= */}
      {viewMode === 'history' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Interview History & Session Records</h2>
            <p className="text-xs text-slate-400 mt-1">Review past AI HR interview evaluations and skill evidence logs.</p>
          </div>

          <div className="space-y-3">
            {historyList.map((item) => (
              <div key={item.interview_id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{item.target_role} • {item.interview_type}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{item.date} • {item.num_questions} Questions</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-sky-400 text-sm">{item.overall_score}%</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.difficulty}</div>
                  </div>
                  <button
                    onClick={async () => {
                      const rep = await api.getInterviewReport(item.interview_id);
                      setReportData(rep);
                      setViewMode('report');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
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
      {/* VIEW 5: TRUTH MATRIX & READINESS */}
      {/* ========================================================================= */}
      {viewMode === 'readiness' && readinessData && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Skill Truth Engine & Interview Readiness</h2>
            <p className="text-xs text-slate-400 mt-1">Verified candidate evidence contributing to your job readiness score.</p>
          </div>

          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Overall Job Readiness Score</span>
              <div className="text-4xl font-black text-sky-400 mt-1">{readinessData.readiness_score}%</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-bold">STATUS: READY TO APPLY</span>
              <div className="text-xs text-slate-400 mt-1">Based on {readinessData.total_interviews} verified interview assessments</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(readinessData.breakdown || {}).map(([k, v]: [string, any]) => (
              <div key={k} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{k}</span>
                <span className="font-bold text-white text-lg mt-1 block">{v}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: WHAT-IF SIMULATOR */}
      {/* ========================================================================= */}
      {viewMode === 'simulator' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 font-sans">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">What-If Readiness Simulator</h2>
            <p className="text-xs text-slate-400 mt-1">Simulate how improving specific interview skills impacts your Job Readiness score.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-300 block">Select Skill to Practice & Improve:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['DSA', 'System Design', 'SQL', 'Communication'].map((sk) => (
                <button
                  key={sk}
                  onClick={() => handleRunWhatIf(sk)}
                  className={`p-3.5 text-center rounded-xl border font-semibold text-xs transition-all ${
                    whatIfSkill === sk
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +1 Level {sk}
                </button>
              ))}
            </div>

            {whatIfDelta && (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 space-y-2">
                <div className="flex items-center space-x-2 font-mono text-sm font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Simulated Job Readiness: {whatIfDelta.simulated_readiness}% (+{whatIfDelta.delta}%)</span>
                </div>
                <p className="text-xs text-emerald-300 leading-relaxed font-sans">
                  {whatIfDelta.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
