import React, { useEffect, useState } from 'react';
import { Send, Bot, User, ArrowRight, RefreshCw } from 'lucide-react';
import { Question, AnswerEvaluation } from '../types';
import { api } from '../services/api';

interface AdaptiveInterviewProps {
  onProceedToCoding: () => void;
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({ onProceedToCoding }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string; feedback?: string }>>([]);

  useEffect(() => {
    api.startInterview().then((q) => {
      setCurrentQuestion(q);
      setChatHistory([
        {
          sender: 'ai',
          text: q.question_text
        }
      ]);
      setLoading(false);
    });
  }, []);

  const handleSend = async () => {
    if (!userAnswer.trim() || !currentQuestion || submitting) return;
    setSubmitting(true);
    const text = userAnswer;
    setUserAnswer('');

    const updatedHistory = [...chatHistory, { sender: 'user' as const, text }];
    setChatHistory(updatedHistory);

    const res: AnswerEvaluation = await api.submitAnswer(currentQuestion.question_id, text);

    if (res.next_question) {
      setCurrentQuestion(res.next_question);
      setChatHistory([
        ...updatedHistory,
        {
          sender: 'ai',
          text: res.next_question.question_text,
          feedback: res.feedback
        }
      ]);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Initializing Adaptive Interview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Weakness Discovery Engine</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Adaptive Interview Room</h1>
        </div>

        <button
          onClick={onProceedToCoding}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Go to Coding Test <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col h-[480px]">
        <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs font-mono">
          <span>Category: <strong className="text-[#0A192F]">{currentQuestion?.category}</strong></span>
          <span>Question Budget: {currentQuestion?.sequence_num} / 15</span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-xl p-3.5 rounded ${
                msg.sender === 'user' ? 'bg-[#0A192F] text-white' : 'bg-[#F8FAFC] text-[#0A192F] border border-[#E2E8F0]'
              }`}>
                {msg.feedback && (
                  <p className="text-[11px] text-[#427AB5] font-semibold mb-1 pb-1 border-b border-[#E2E8F0]">
                    Feedback: {msg.feedback}
                  </p>
                )}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center space-x-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type your technical explanation..."
            className="flex-1 px-3 py-2 text-xs border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
          />
          <button
            onClick={handleSend}
            disabled={submitting || !userAnswer.trim()}
            className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors"
          >
            {submitting ? '...' : 'Send'}
          </button>
        </div>
      </div>

    </div>
  );
};
