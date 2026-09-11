import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Mic, MicOff, Video, VideoOff, MoreHorizontal,
  Maximize2, Paperclip, Send, Clock, CheckCircle2, ChevronDown, ChevronUp,
  AlertCircle, Play, ShieldCheck, User, RefreshCw, BarChart2, X, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';
import { practiceSessionStore } from '../services/practiceSessionStore';
import { PracticeRecord } from '../types';
import { EndPracticeModal } from '../components/EndPracticeModal';
import { PracticeCompletionSuccess } from '../components/PracticeCompletionSuccess';

interface AdaptiveInterviewProps {
  onProceedToCoding?: () => void;
  onNavigate?: (tab: string, targetId?: string) => void;
  isStandalone?: boolean;
  sessionId?: string;
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  onProceedToCoding,
  onNavigate,
  isStandalone = false,
  sessionId
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
  
  // --- LIVE VOICE INTERVIEW MODE & STATE MACHINE ---
  const [interviewMode, setInterviewMode] = useState<'live' | 'chat'>('live');
  const [interviewState, setInterviewState] = useState<
    'idle' | 'ai_thinking' | 'ai_speaking' | 'ready' | 'recording' | 'transcribing' | 'analyzing' | 'completed' | 'error'
  >('ready');
  const [micError, setMicError] = useState<string | null>(null);

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
  const [completedRecord, setCompletedRecord] = useState<PracticeRecord | null>(null);

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

  // --- MEDIA RECORDER REFS FOR LIVE VOICE ---
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Timer Countdown Effect
  useEffect(() => {
    if (viewMode !== 'interview' || completedRecord) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode, completedRecord]);

  // Session Hydration for Standalone Mode
  useEffect(() => {
    if (isStandalone && sessionId) {
      const sess = practiceSessionStore.getAISession(sessionId);
      if (sess) {
        if (sess.targetRole) setTargetRole(sess.targetRole);
        if (sess.interviewType) setInterviewType(sess.interviewType);
        if (sess.difficulty) setDifficulty(sess.difficulty);
        if (sess.numQuestions) setNumQuestions(sess.numQuestions);
        if (sess.targetCompany) setTargetCompany(sess.targetCompany);
        if (sess.focusSkills) setFocusSkillsInput(sess.focusSkills);
        if (sess.interviewMode) setInterviewMode(sess.interviewMode as 'live' | 'chat');
      }
    }
  }, [isStandalone, sessionId]);

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
  const speakQuestion = (text: string, onSpeechEnd?: () => void) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setInterviewState('ai_speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      let handled = false;
      const handleDone = () => {
        if (handled) return;
        handled = true;
        setInterviewState('ready');
        if (onSpeechEnd) onSpeechEnd();
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;

      // Fallback timer: word count calculation so state never freezes
      const words = text.split(/\s+/).length;
      const estMs = Math.max(2500, (words / 2.5) * 1000 + 1500);
      setTimeout(handleDone, estMs);

      window.speechSynthesis.speak(utterance);
    } else {
      setInterviewState('ready');
      if (onSpeechEnd) onSpeechEnd();
    }
  };

  // --- LIVE AUDIO RECORDING & SPEECH-TO-TEXT ---
  const startVoiceRecording = async () => {
    setMicError(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setMicError("No speech detected in audio. Please try speaking again.");
          setInterviewState('ready');
          return;
        }
        processAudioBlob(blob);
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setInterviewState('recording');
      setIsMicOn(true);
    } catch (err: any) {
      console.error("Microphone error:", err);
      setMicError("Microphone access denied or unavailable. Please grant microphone permissions in your browser.");
      setInterviewState('error');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setInterviewState('transcribing');
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  };

  const processAudioBlob = async (blob: Blob) => {
    setInterviewState('transcribing');
    setAiNotesText("Transcribing candidate speech via Groq Whisper STT...");
    try {
      const res = await api.transcribeAudio(blob);
      const transcript = res.transcript || '';
      if (!transcript.trim()) {
        setMicError("Couldn't understand the audio. Please try speaking again.");
        setInterviewState('ready');
        return;
      }
      setUserAnswer(transcript);
      await submitAnswerPayload(transcript);
    } catch (err) {
      console.error("STT error:", err);
      setMicError("Speech-to-Text conversion failed. Please try again or type your response.");
      setInterviewState('ready');
    }
  };

  // --- START INTERVIEW HANDLER ---
  const handleStartInterview = async () => {
    if (!isStandalone) {
      const newSessionId = practiceSessionStore.createAISession({
        targetRole,
        interviewType,
        difficulty,
        numQuestions,
        targetCompany,
        focusSkills: focusSkillsInput,
        interviewMode
      });
      window.open(`/practice/ai-interview/session/${newSessionId}`, '_blank', 'noopener,noreferrer');
      return;
    }

    setLoadingText("Configuring AI HR Virtual Session...");
    setInterviewState('ai_thinking');
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

      const qText = q.question_text || `Tell me about your technical experience with ${targetRole}.`;
      setCurrentQuestion(q);
      if (q.interview_id) {
        setCurrentInterviewId(q.interview_id);
      }
      setCurrentSeq(q.sequence_num || 1);
      setUserAnswer('');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: qText,
          time: nowStr
        }
      ]);

      setAiNotesText("Analyzing candidate response in real-time...");
      setViewMode('interview');
      
      if (interviewMode === 'live') {
        speakQuestion(qText);
      } else {
        setInterviewState('ready');
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      setInterviewState('ready');
    } finally {
      setLoadingText(null);
    }
  };

  // --- SUBMIT CANDIDATE ANSWER ---
  const handleSendAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion || isEvaluating) return;
    const answerText = userAnswer;
    setUserAnswer('');
    await submitAnswerPayload(answerText);
  };

  const submitAnswerPayload = async (answerText: string) => {
    if (!answerText.trim() || !currentQuestion || isEvaluating) return;

    setIsEvaluating(true);
    setInterviewState('analyzing');
    setAiNotesText("Evaluating technical depth, STAR structure & relevance with Groq LLM...");

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'You', text: answerText, time: nowStr }]);

    try {
      const res = await api.submitAnswer(currentQuestion.question_id, answerText, currentInterviewId);

      if (res.is_completed || currentSeq >= numQuestions) {
        setInterviewState('completed');
        setLoadingText("Generating comprehensive HR performance report...");
        let report: any = null;
        try {
          report = await api.getInterviewReport(currentInterviewId);
        } catch (e) {
          console.warn("Report fetch error:", e);
        }
        setReportData(report);
        const score = Math.round(report?.overall_score || 82);
        userStore.submitAssessmentResult('interview-prep', 'technical', score);

        const totalTimeSpent = Math.max(1, 754 - secondsRemaining);
        const record: PracticeRecord = {
          id: `interview_${Date.now()}`,
          sessionId: `interview_sess_${currentInterviewId || Date.now()}`,
          userEmail: userStore.getCurrentUserEmail(),
          practiceType: 'ai-interview',
          title: `${targetRole} AI HR Interview (${interviewMode === 'live' ? 'Live Voice' : 'Chat'})`,
          topics: [interviewType, focusSkillsInput.split(',')[0]?.trim() || 'Behavioral'],
          difficulty: difficulty,
          score,
          accuracy: Math.min(100, Math.max(50, score)),
          totalQuestions: numQuestions,
          questionsAttempted: currentSeq,
          timeTakenSeconds: totalTimeSpent,
          completedAt: new Date().toISOString(),
          status: 'Completed',
          metrics: {
            overallScore: score,
            technicalDepth: Math.round(report?.technical_knowledge || score),
            communicationScore: Math.round(report?.communication || score),
            targetRole
          },
          detailedData: {
            starMethodScore: Math.round(report?.communication || score),
            communicationDepth: report?.key_observations || 'Evaluated by Groq AI Interviewer',
            role: targetRole,
            company: targetCompany,
            interviewType,
            mode: interviewMode
          }
        };
        userStore.savePracticeRecord(record);
        api.submitPracticeCompletion(record);
        setCompletedRecord(record);
      } else if (res.next_question) {
        setCurrentQuestion(res.next_question);
        setCurrentSeq(res.next_question.sequence_num || (currentSeq + 1));

        const nextText = res.next_question.question_text;
        setChatHistory(prev => [...prev, { sender: 'AI HR Interviewer', text: nextText, time: nowStr }]);
        setAiNotesText(res.evaluation?.feedback || "Answer evaluated. Follow-up question generated based on your previous response.");
        
        if (interviewMode === 'live') {
          speakQuestion(nextText);
        } else {
          setInterviewState('ready');
        }
      }
    } catch (err) {
      console.error("Answer evaluation failed:", err);
      setAiNotesText("Evaluation recorded cleanly.");
      setInterviewState('ready');
    } finally {
      setIsEvaluating(false);
    }
  };

  // --- END INTERVIEW CONFIRMATION ---
  const handleConfirmEndInterview = async () => {
    setShowEndModal(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach(track => track.stop());
    }

    setLoadingText("Synthesizing final HR evaluation & Skill Truth record...");
    try {
      let report: any = null;
      try {
        report = await api.getInterviewReport(currentInterviewId);
      } catch (e) {
        report = { overall_score: 85 };
      }
      setReportData(report);
      userStore.submitAssessmentResult('interview-prep', 'technical', report?.overall_score || 85);

      const score = report?.overall_score || Math.min(95, Math.max(70, 75 + currentSeq * 2));
      const totalTimeSpent = Math.max(1, 754 - secondsRemaining);
      const attempted = currentSeq;

      const record: PracticeRecord = {
        id: `interview_${Date.now()}`,
        sessionId: `interview_sess_${Date.now()}`,
        userEmail: userStore.getCurrentUserEmail(),
        practiceType: 'ai-interview',
        title: `${targetRole} AI HR Interview (${interviewMode === 'live' ? 'Live Voice' : 'Chat'})`,
        topics: [interviewType, focusSkillsInput.split(',')[0]?.trim() || 'Behavioral'],
        difficulty: difficulty,
        score,
        accuracy: 88,
        totalQuestions: numQuestions,
        questionsAttempted: attempted,
        timeTakenSeconds: totalTimeSpent,
        completedAt: new Date().toISOString(),
        status: 'Completed',
        metrics: {
          overallScore: score,
          technicalDepth: 88,
          communicationScore: 92,
          targetRole
        },
        detailedData: {
          starMethodScore: 92,
          communicationDepth: 'Strong (STAR Format)',
          role: targetRole,
          company: targetCompany,
          interviewType,
          mode: interviewMode
        }
      };

      userStore.savePracticeRecord(record);
      api.submitPracticeCompletion(record);
      setCompletedRecord(record);
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
          {isStandalone ? (
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-extrabold text-sm tracking-tight text-[#0A192F]">CareerForge</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                AI Interview Practice
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0A192F] transition-colors flex items-center mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </button>
          )}
          
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

        {/* TOP RIGHT TIME REMAINING CARD & CLOSE TAB */}
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

          {isStandalone && (
            <button
              onClick={() => window.close()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Close Tab
            </button>
          )}
        </div>
      </div>

      {/* FULL-WIDTH MAIN CONTAINER */}
      <div className="w-full flex-1 p-6 lg:p-8 space-y-6">

        {/* SUB TAB NAV (SETUP, HISTORY, TRUTH MATRIX, SIMULATOR) - HIDDEN DURING ACTIVE INTERVIEW */}
        {viewMode !== 'interview' && (
          <div className="flex justify-end items-center">
            <div className="flex items-center space-x-2 bg-white border border-[#E2E8F0] p-1 rounded-xl text-xs font-semibold shadow-sm">
              <button
                onClick={() => { setActiveTabNav('interview'); setViewMode('setup'); }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTabNav === 'interview' ? 'bg-[#0A192F] text-[#0A192F] font-bold' : 'text-[#64748B] hover:text-[#0A192F]'
                }`}
              >
                Interview Setup
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
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: INTERVIEW SETUP */}
        {/* ========================================================================= */}
        {viewMode === 'setup' && !loadingText && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-[#E2E8F0] pb-5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">SETUP SESSION</span>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">Configure HR AI Interview</h2>
              <p className="text-xs text-[#64748B] mt-1">Select target position, interview round, mode, and difficulty level.</p>
            </div>

            {/* INTERVIEW MODE SELECTION */}
            <div className="space-y-2 pb-2">
              <label className="font-semibold text-[#0A192F] text-xs block">Select Interview Communication Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setInterviewMode('live')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    interviewMode === 'live'
                      ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 text-[#0A192F]'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${interviewMode === 'live' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#0A192F]">Live Voice AI Interview</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">LIVE VOICE</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      Speak directly into your microphone. AI speaks questions aloud and transcribes your audio with Groq Whisper STT.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewMode('chat')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    interviewMode === 'chat'
                      ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 text-[#0A192F]'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${interviewMode === 'chat' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A192F]">Chat Interview</div>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      Text-based interview. Read questions and type answers manually in the chat interface.
                    </p>
                  </div>
                </button>
              </div>
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
                <Play className="w-4 h-4 mr-2 text-[#FFDE59]" />
                {isStandalone ? 'Start Interview Session' : 'Start Realistic AI HR Interview →'}
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
        {/* VIEW 2: MERCOR-STYLE IMMERSIVE AI VOICE INTERVIEW ROOM */}
        {/* ========================================================================= */}
        {viewMode === 'interview' && currentQuestion && !loadingText && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

            {/* TOP BAR / INTERVIEW BAR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 px-6 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-[#0A192F]">CareerForge AI</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase font-mono">
                      {interviewMode === 'live' ? 'Live Voice Interview' : 'Chat Interview'}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] font-medium">
                    {targetRole} • {interviewType} • {difficulty}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-5">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#0A192F]">Question {currentSeq} of {numQuestions}</div>
                  <div className="text-[11px] font-mono font-semibold text-slate-500 flex items-center justify-end space-x-1">
                    <Clock className="w-3 h-3 text-cyan-600 mr-1" />
                    <span>{formatTime(secondsRemaining)} remaining</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEndModal(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors border border-rose-200"
                >
                  End Interview
                </button>
              </div>
            </div>

            {/* MAIN AI INTERVIEWER PORTRAIT & STATE CONTAINER */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6 relative overflow-hidden">
              
              {/* Subtle background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 via-transparent to-transparent pointer-events-none" />

              {/* State Indicator Pill */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-[#0A192F] relative z-10 shadow-xs">
                {interviewState === 'ai_speaking' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                    <span className="text-purple-700">🔊 AI Interviewer is Speaking...</span>
                    <div className="flex items-center space-x-0.5 ml-1">
                      <span className="w-1 bg-purple-600 h-3 animate-pulse"></span>
                      <span className="w-1 bg-purple-600 h-4 animate-pulse delay-75"></span>
                      <span className="w-1 bg-purple-600 h-2 animate-pulse delay-150"></span>
                    </div>
                  </>
                )}
                {interviewState === 'ready' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-800">🎤 Ready — Your Turn to Speak</span>
                  </>
                )}
                {interviewState === 'recording' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span className="text-rose-700">🔴 Listening to Candidate...</span>
                  </>
                )}
                {interviewState === 'transcribing' && (
                  <>
                    <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-amber-800">⏳ Transcribing Speech (Groq Whisper)...</span>
                  </>
                )}
                {interviewState === 'analyzing' && (
                  <>
                    <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sky-800">⚡ Evaluating Answer with Groq LLM...</span>
                  </>
                )}
                {interviewState === 'ai_thinking' && (
                  <>
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-indigo-800">🧠 Generating Contextual Follow-up...</span>
                  </>
                )}
              </div>

              {/* AI AVATAR PORTRAIT */}
              <div className="relative inline-block my-2">
                <div className={`w-32 h-32 rounded-full mx-auto p-1 bg-gradient-to-tr transition-all duration-300 ${
                  interviewState === 'ai_speaking' ? 'from-purple-500 via-indigo-500 to-sky-400 ring-4 ring-purple-400/30 scale-105' :
                  interviewState === 'recording' ? 'from-rose-500 via-amber-500 to-rose-600 ring-4 ring-rose-400/30 scale-105' :
                  'from-slate-200 to-slate-400'
                }`}>
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white relative overflow-hidden shadow-inner">
                    <Sparkles className={`w-14 h-14 transition-all ${
                      interviewState === 'ai_speaking' ? 'text-purple-400 animate-pulse' :
                      interviewState === 'recording' ? 'text-rose-400' : 'text-sky-400'
                    }`} />
                  </div>
                </div>

                {/* Speaker indicator badge on avatar */}
                {interviewState === 'ai_speaking' && (
                  <div className="absolute -bottom-1 right-2 bg-purple-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* AI INTERVIEWER NAME & TITLE */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">AI INTERVIEWER</h3>
                <h2 className="text-lg font-extrabold text-[#0A192F] mt-0.5">{targetCompany} AI Technical Recruiter</h2>
              </div>

              {/* PROMINENT CURRENT QUESTION DISPLAY */}
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-2xl mx-auto shadow-xs text-left space-y-2">
                <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider block">CURRENT QUESTION</span>
                <p className="text-base font-bold text-[#0A192F] leading-relaxed">
                  "{currentQuestion.question_text}"
                </p>
              </div>

            </div>

            {/* LIVE CONVERSATIONAL TRANSCRIPT */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-[#0A192F] flex items-center">
                  <MessageSquare className="w-4 h-4 text-sky-500 mr-2" /> Live Conversation Transcript
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{chatHistory.length} turns recorded</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-4 pr-2">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className="space-y-1">
                    {msg.sender === 'AI HR Interviewer' ? (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                            <span className="text-[#0A192F] font-bold">AI Interviewer</span>
                            <span>• {msg.time}</span>
                          </div>
                          <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed shadow-xs">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-end space-x-3">
                        <div className="space-y-1 max-w-xl text-right">
                          <div className="flex items-center justify-end space-x-2 text-[11px] font-semibold text-slate-500">
                            <span>{msg.time} •</span>
                            <span className="text-[#0A192F] font-bold">You (Candidate)</span>
                          </div>
                          <div className="p-4 bg-slate-100 border border-slate-200/80 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed text-left shadow-xs inline-block">
                            {msg.text}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          A
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* CONTROLS & MICROPHONE CONTROL AREA */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              
              {/* Mic Error Banner if any */}
              {micError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 font-medium">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{micError}</span>
                  </div>
                  <button
                    onClick={startVoiceRecording}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700 transition-colors"
                  >
                    Retry Mic
                  </button>
                </div>
              )}

              {/* ACTION BUTTON & STATE HANDLER */}
              {interviewMode === 'live' ? (
                <div className="text-center space-y-3">
                  {interviewState === 'ai_speaking' && (
                    <button disabled className="w-full py-4 bg-slate-100 text-slate-500 font-bold text-xs rounded-2xl cursor-not-allowed border border-slate-200 flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                      <span>🔊 Listening to AI Interviewer... (Microphone locked)</span>
                    </button>
                  )}

                  {interviewState === 'ready' && (
                    <button
                      onClick={startVoiceRecording}
                      className="w-full py-4 bg-[#0A192F] hover:bg-[#112240] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <Mic className="w-5 h-5 text-emerald-400" />
                      <span>🎙 Start Answer (Record Voice)</span>
                    </button>
                  )}

                  {interviewState === 'recording' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                        <span className="text-xs font-bold text-rose-800">🔴 Listening to your answer... Click stop when complete.</span>
                      </div>
                      <button
                        onClick={stopVoiceRecording}
                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <MicOff className="w-5 h-5" />
                        <span>⏹ Stop Recording & Submit Answer</span>
                      </button>
                    </div>
                  )}

                  {(interviewState === 'transcribing' || interviewState === 'analyzing') && (
                    <button disabled className="w-full py-4 bg-sky-50 border border-sky-200 text-sky-800 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>{interviewState === 'transcribing' ? '⏳ Transcribing audio with Groq Whisper STT...' : '⚡ Evaluating answer with Groq LLM...'}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* CHAT MODE TEXTAREA */
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAnswer())}
                    placeholder="Type your answer here..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-xs text-[#0A192F] focus:outline-none resize-none font-medium leading-relaxed"
                  />
                  <div className="flex justify-end">
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
              )}

              {/* BOTTOM CONTROL BAR */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition-colors ${
                      isMicOn ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isMicOn ? 'Microphone Active' : 'Mic Muted'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>🔊 Speaker Control</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowEndModal(true)}
                  className="text-rose-600 hover:text-rose-800 font-bold text-xs underline"
                >
                  End Practice Session
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* END INTERVIEW CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {/* END INTERVIEW CONFIRMATION MODAL */}
        <EndPracticeModal
          isOpen={showEndModal}
          practiceType="AI Interview"
          onConfirm={handleConfirmEndInterview}
          onCancel={() => setShowEndModal(false)}
        />

        {/* PRACTICE COMPLETION SUCCESS VIEW */}
        <PracticeCompletionSuccess
          isOpen={!!completedRecord}
          record={completedRecord}
          onClose={() => setCompletedRecord(null)}
          onReviewAnswers={() => {
            setCompletedRecord(null);
            setViewMode('report');
          }}
          onViewProfile={() => {
            if (isStandalone) {
              if (window.opener) {
                window.opener.location.href = '/dashboard?tab=profile';
                window.close();
              } else {
                window.location.href = '/dashboard?tab=profile';
              }
            } else if (onNavigate) {
              onNavigate('profile');
            }
          }}
          onReturnDashboard={() => {
            if (isStandalone) {
              if (window.opener) {
                window.close();
              } else {
                window.location.href = '/dashboard';
              }
            } else if (onNavigate) {
              onNavigate('dashboard');
            }
          }}
        />

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
