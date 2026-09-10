import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Mic, MicOff, Video, VideoOff, MoreHorizontal,
  Maximize2, Paperclip, Send, Clock, CheckCircle2, ChevronDown, ChevronUp,
  AlertCircle, Play, ShieldCheck, User, RefreshCw, BarChart2, X
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
  const [focusSkillsInput, setFocusSkillsInput] = useState('Communication, STAR Method, React, Problem Solving');

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

  // Timer Countdown Effect
  useEffect(() => {
    if (viewMode !== 'interview') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode]);

  // Initial Data Load
  useEffect(() => {
    api.getInterviewHistory().then(res => setHistoryList(res));
    api.getInterviewReadiness().then(res => setReadinessData(res));
  }, []);

  // Handle Camera Stream
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
          console.warn("Webcam access unavailable:", err);
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

  // Format seconds to mm:ss
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

      const qText = q.question_text || "Tell me about a time when you faced a disagreement with a teammate. How did you handle it, and what was the outcome?";
      setCurrentQuestion(q);
      setCurrentSeq(3);
      setUserAnswer('');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: qText,
          time: '10:24 AM'
        },
        {
          sender: 'You',
          text: 'In my last project, I disagreed with my teammate about the approach to build the feature. I suggested we go with a modular design...',
          time: '10:26 AM'
        }
      ]);

      setAiNotesText("Analyzing your response...");
      setViewMode('interview');
      speakQuestion(qText);
    } catch (err) {
      console.error("Failed to start interview:", err);
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F]">

      {/* TOP BAR / NAVIGATION HEADER */}
      <div className="px-8 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
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

        {/* TOP RIGHT TIME REMAINING CARD & PROFILE */}
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

      {/* MAIN CONTAINER */}
      <div className="p-8 max-w-7xl mx-auto">

        {/* SUB TAB NAV (SETUP, HISTORY, TRUTH MATRIX, SIMULATOR) */}
        <div className="flex justify-end items-center mb-6">
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
        {/* VIEW 2: MOCKUP-PERFECT LIVE INTERVIEW VIEW */}
        {/* ========================================================================= */}
        {viewMode === 'interview' && currentQuestion && !loadingText && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: VIDEO CALL & CONVERSATION STREAM (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. LARGE CENTRAL VIDEO PANEL */}
              <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md transition-all ${
                isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[420px]'
              }`}>
                {/* AI HR Video Background Image */}
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
                  alt="AI HR Interviewer"
                  className="w-full h-full object-cover filter brightness-95"
                />

                {/* Optional WebCam overlay element for candidate if active */}
                {isCameraOn && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="hidden"
                  />
                )}

                {/* Top-Left Badge: AI HR Interviewer */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-slate-900/80 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/50 flex items-center space-x-2 font-medium shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>AI HR Interviewer</span>
                  </div>
                </div>

                {/* Top-Right Badge: CareerForge AI - Your AI HR Interviewer */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-slate-900/80 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/50 flex items-center space-x-2 font-medium shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <div>
                      <div className="font-bold text-[11px] text-white">CareerForge AI</div>
                      <div className="text-[9px] text-slate-300 font-mono">Your AI HR Interviewer</div>
                    </div>
                  </div>
                </div>

                {/* Bottom-Left Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-3">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all ${
                      isMicOn ? 'bg-slate-900/80 text-white hover:bg-slate-800' : 'bg-red-600/90 text-white'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all ${
                      isCameraOn ? 'bg-slate-900/80 text-white hover:bg-slate-800' : 'bg-red-600/90 text-white'
                    }`}
                  >
                    {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setShowOptionsModal(!showOptionsModal)}
                    className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom-Right Fullscreen Control */}
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. CHAT / CONVERSATION STREAM BELOW VIDEO */}
              <div className="space-y-4 pt-2">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className="space-y-1">
                    {msg.sender === 'AI HR Interviewer' ? (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#64748B]">
                            <span className="text-[#0A192F] font-bold">AI HR Interviewer</span>
                            <span>{msg.time}</span>
                          </div>
                          <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed shadow-sm">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-end space-x-3">
                        <div className="space-y-1 max-w-2xl text-right">
                          <div className="flex items-center justify-end space-x-2 text-[11px] font-semibold text-[#64748B]">
                            <span>{msg.time}</span>
                            <span className="text-[#0A192F] font-bold">You</span>
                          </div>
                          <div className="p-4 bg-slate-100 border border-slate-200/80 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed text-left shadow-sm inline-block">
                            {msg.text}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                          A
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 3. ANSWER INPUT BOX CONTAINER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
                <textarea
                  rows={3}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAnswer())}
                  placeholder="Type your answer here..."
                  className="w-full text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none resize-none font-medium leading-relaxed"
                />

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center space-x-3 text-[#64748B]">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoiceRecord}
                      className={`p-2 rounded-lg transition-colors ${
                        isMicOn ? 'bg-sky-50 text-sky-600' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Voice Microphone Record"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleSendAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                  >
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5 ml-2 text-[#FFDE59]" />
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 5 SIDEBAR CARDS (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">

              {/* CARD 1: INTERVIEW PROGRESS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#0A192F]">
                  <span>Interview Progress</span>
                  <span className="text-[#64748B] font-mono">{currentSeq} of {numQuestions}</span>
                </div>

                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(currentSeq / numQuestions) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E2E8F0] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-semibold block">Role</span>
                    <span className="font-bold text-[#0A192F] text-[11px] block truncate">{targetRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-semibold block">Type</span>
                    <span className="font-bold text-[#0A192F] text-[11px] block truncate">{interviewType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-semibold block">Difficulty</span>
                    <span className="font-bold text-[#0A192F] text-[11px] block truncate">{difficulty}</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: CURRENT QUESTION */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <div
                  onClick={() => setIsCurrentQuestionOpen(!isCurrentQuestionOpen)}
                  className="flex justify-between items-center text-xs font-bold text-[#0A192F] cursor-pointer"
                >
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 text-sky-500 mr-2" /> Current Question
                  </span>
                  {isCurrentQuestionOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </div>

                {isCurrentQuestionOpen && (
                  <div className="p-4 bg-sky-50/60 border border-sky-100/80 rounded-xl text-xs text-[#0A192F] font-medium leading-relaxed">
                    "{currentQuestion.question_text}"
                  </div>
                )}
              </div>

              {/* CARD 3: INTERVIEW TIPS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <div className="flex items-center text-xs font-bold text-[#0A192F]">
                  <Sparkles className="w-4 h-4 text-sky-500 mr-2" /> Interview Tips
                </div>

                <ul className="space-y-2.5 text-xs text-[#64748B] font-medium">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Be specific with your examples (STAR method).</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Highlight your role and contribution.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Show how you handled the situation.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Focus on positive outcomes and learnings.</span>
                  </li>
                </ul>
              </div>

              {/* CARD 4: QUICK ACTIONS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#0A192F]">Quick Actions</div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowEndModal(true)}
                    className="py-2.5 px-4 border border-[#E2E8F0] hover:bg-slate-50 text-[#0A192F] font-semibold text-xs rounded-xl transition-colors"
                  >
                    End Interview
                  </button>
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    View Progress
                  </button>
                </div>
              </div>

              {/* CARD 5: AI HR NOTES */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <div
                  onClick={() => setIsAiNotesOpen(!isAiNotesOpen)}
                  className="flex justify-between items-center text-xs font-bold text-[#0A192F] cursor-pointer"
                >
                  <span className="flex items-center">
                    <ShieldCheck className="w-4 h-4 text-sky-500 mr-2" /> AI HR Notes
                  </span>
                  {isAiNotesOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </div>

                {isAiNotesOpen && (
                  <div className="text-xs text-[#64748B] font-medium leading-relaxed space-y-2">
                    <p>{aiNotesText}</p>
                    {isEvaluating && (
                      <div className="flex items-center space-x-1.5 text-sky-600 font-bold pt-1">
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                        <span>Evaluator Active...</span>
                      </div>
                    )}
                  </div>
                )}
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

            {/* OVERALL SCORE & READINESS METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Overall Score</span>
                <div className="text-3xl font-black text-sky-600">{reportData.overall_score}%</div>
                <span className="text-[11px] text-emerald-600 font-semibold block">Readiness Impact +{reportData.readiness_impact}%</span>
              </div>

              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Technical Depth</span>
                <div className="text-3xl font-black text-emerald-600">{reportData.scores?.technical || reportData.overall_score}%</div>
                <span className="text-[11px] text-[#64748B] block">Domain Knowledge</span>
              </div>

              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Communication</span>
                <div className="text-3xl font-black text-amber-600">{reportData.scores?.communication || 85}%</div>
                <span className="text-[11px] text-[#64748B] block">STAR Method</span>
              </div>

              <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Confidence</span>
                <div className="text-3xl font-black text-purple-600">{reportData.scores?.confidence || 88}%</div>
                <span className="text-[11px] text-[#64748B] block">Verified Evidence</span>
              </div>
            </div>

            {/* STRENGTHS & WEAKNESSES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-emerald-800 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Demonstrated Strengths
                </h3>
                <ul className="space-y-2 text-xs text-emerald-900 font-medium">
                  {(reportData.strengths || [
                    "Clear structural response using standard STAR methodology.",
                    "Solid understanding of core software development lifecycle.",
                    "Concise explanation of problem-solving approach under technical constraints."
                  ]).map((st: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-amber-800 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-600" /> Areas for Improvement
                </h3>
                <ul className="space-y-2 text-xs text-amber-900 font-medium">
                  {(reportData.weaknesses || [
                    "Elaborate more on specific quantitative metrics and performance gains.",
                    "Provide deeper architectural rationale when selecting backend databases."
                  ]).map((wk: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>{wk}</span>
                    </li>
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
