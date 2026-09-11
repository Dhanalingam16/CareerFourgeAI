import React, { useState, useRef } from 'react';
import {
  Sparkles, RefreshCw, Flag, Clock, Lock, CheckCircle2, Circle,
  ChevronLeft, ChevronRight, Bookmark, Check, MessageSquare, ArrowRight, Compass
} from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';

interface PersonalizedRoadmapProps {
  onRunReassessment: () => void;
  onNavigateToAssessment?: (targetId?: string) => void;
}

interface RoadmapNode {
  id: number;
  title: string;
  category: 'FOUNDATIONS' | 'CORE' | 'ADVANCED' | 'CAREER' | 'PROJECTS';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Hands-on' | 'Prep';
  hours: number;
  description: string;
}

const ALL_ROLES = [
  'Software Engineer',
  'Frontend',
  'Backend',
  'Full Stack',
  'Android',
  'DevOps',
  'DevSecOps',
  'Data Analyst',
  'AI Engineer',
  'AI and Data Scientist',
  'Data Engineer',
  'Machine Learning',
  'PostgreSQL',
  'iOS',
  'Blockchain',
  'QA'
];

const INITIAL_NODES: RoadmapNode[] = [
  {
    id: 1,
    title: 'Software Engineer Fundamentals',
    category: 'FOUNDATIONS',
    difficulty: 'Beginner',
    hours: 5,
    description: 'Learn and practice software engineer fundamentals specifically for target engineering role.'
  },
  {
    id: 2,
    title: 'Software Engineer Tools & Workflow',
    category: 'FOUNDATIONS',
    difficulty: 'Beginner',
    hours: 5,
    description: 'Learn and practice software engineer tools & workflow specifically for target engineering role.'
  },
  {
    id: 3,
    title: 'Data Structures & Core Algorithms',
    category: 'CORE',
    difficulty: 'Intermediate',
    hours: 12,
    description: 'Master arrays, hash maps, trees, graph traversals, and dynamic programming patterns.'
  },
  {
    id: 4,
    title: 'Backend REST APIs & Database Design',
    category: 'CORE',
    difficulty: 'Intermediate',
    hours: 10,
    description: 'Build robust RESTful API endpoints, handle async tasks, and optimize SQL queries.'
  },
  {
    id: 5,
    title: 'System Design & High-Scale Architecture',
    category: 'ADVANCED',
    difficulty: 'Advanced',
    hours: 15,
    description: 'Design scalable distributed systems, caching strategies, load balancing, and database sharding.'
  },
  {
    id: 6,
    title: 'Frontend Frameworks & UI Architecture',
    category: 'CORE',
    difficulty: 'Intermediate',
    hours: 8,
    description: 'Build responsive, state-driven web applications using React, TypeScript, and modern CSS.'
  },
  {
    id: 7,
    title: 'Full-Stack Capstone Project',
    category: 'PROJECTS',
    difficulty: 'Hands-on',
    hours: 20,
    description: 'Implement an end-to-end cloud-deployed application with authentication, API, and DB.'
  },
  {
    id: 8,
    title: 'DevOps & Container Deployment',
    category: 'ADVANCED',
    difficulty: 'Intermediate',
    hours: 6,
    description: 'Containerize applications with Docker, set up CI/CD pipelines, and deploy on cloud infrastructure.'
  },
  {
    id: 9,
    title: 'Technical Mock Interview Preparation',
    category: 'CAREER',
    difficulty: 'Prep',
    hours: 8,
    description: 'Simulate real adaptive technical interviews and receive instant AI feedback on code & concepts.'
  },
  {
    id: 10,
    title: 'Behavioral & Architecture Deep Dive',
    category: 'CAREER',
    difficulty: 'Advanced',
    hours: 6,
    description: 'Practice STAR-method behavioral responses and system design trade-off discussions.'
  }
];

export const PersonalizedRoadmapPage: React.FC<PersonalizedRoadmapProps> = ({
  onRunReassessment,
  onNavigateToAssessment
}) => {
  const store = useUserStore();
  const defaultRole = store.goal.targetRole || 'Software Engineer';

  const [selectedRole, setSelectedRole] = useState<string>(defaultRole);
  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [bookmarkedNodes, setBookmarkedNodes] = useState<number[]>([]);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const roleScrollRef = useRef<HTMLDivElement>(null);

  const scrollRoles = (direction: 'left' | 'right') => {
    if (roleScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      roleScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleNodeCompletion = (id: number) => {
    setCompletedNodes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedNodes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
    }, 800);
  };

  // Filter nodes by selected track
  const filteredNodes = INITIAL_NODES.filter(node => {
    if (activeTrack === 'All') return true;
    if (activeTrack === 'Foundations') return node.category === 'FOUNDATIONS';
    if (activeTrack === 'Core') return node.category === 'CORE';
    if (activeTrack === 'Advanced') return node.category === 'ADVANCED';
    if (activeTrack === 'Career') return node.category === 'CAREER';
    if (activeTrack === 'Projects') return node.category === 'PROJECTS';
    return true;
  });

  const completionPercentage = Math.round((completedNodes.length / INITIAL_NODES.length) * 100);
  const nextUncompletedNode = INITIAL_NODES.find(n => !completedNodes.includes(n.id)) || INITIAL_NODES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans text-[#0F172A] selection:bg-[#FEF08A]">
      
      {/* TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-[#0284C7] font-mono text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>CAREERFORGE LEARNING PATH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            {selectedRole} Roadmap
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium max-w-2xl">
            Build practical {selectedRole} skills through fundamentals, advanced concepts, projects and interview preparation.
          </p>
        </div>

        {/* TOP RIGHT ACTION BUTTONS */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onRunReassessment}
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold shadow-sm transition-colors flex items-center"
          >
            Re-assessment
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-sm transition-colors flex items-center"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 text-[#FEF08A] ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate with AI
          </button>
        </div>
      </div>

      {/* ROLE SELECTOR BAR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-sm flex items-center space-x-3">
        <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider pl-2 shrink-0">
          ROLE
        </span>

        {/* Scroll Left Button */}
        <button
          onClick={() => scrollRoles('left')}
          className="p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9] shrink-0 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Role Pills */}
        <div
          ref={roleScrollRef}
          className="flex-1 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {ALL_ROLES.map((role, idx) => {
            const isActive = selectedRole.toLowerCase() === role.toLowerCase();
            return (
              <button
                key={idx}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0F172A] text-white font-bold shadow-sm'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollRoles('right')}
          className="p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9] shrink-0 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PROGRESS, NEXT UP, TRACKS FILTER (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* YOUR PROGRESS CARD */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
              YOUR PROGRESS
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-[#0F172A]">{completionPercentage}%</span>
              <span className="text-xs text-[#64748B] font-mono">{completedNodes.length}/{INITIAL_NODES.length} completed</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0284C7] h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* NEXT UP CARD */}
          <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">
              NEXT UP
            </span>
            <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
              {nextUncompletedNode.title}
            </h4>
            <p className="text-xs text-[#64748B] font-medium">
              {nextUncompletedNode.hours} hours · {nextUncompletedNode.difficulty}
            </p>
          </div>

          {/* TRACKS FILTER */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block px-2 mb-2">
              TRACKS
            </span>

            {[
              { id: 'All', label: 'All' },
              { id: 'Foundations', label: 'Foundations' },
              { id: 'Core', label: 'Core' },
              { id: 'Advanced', label: 'Advanced' },
              { id: 'Career', label: 'Career' },
              { id: 'Projects', label: 'Projects' },
            ].map(track => {
              const isActive = activeTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(track.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white font-bold shadow-sm'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <span>{track.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                </button>
              );
            })}
          </div>

          {/* TIP BOX */}
          <p className="text-[11px] text-[#64748B] leading-relaxed px-1">
            <strong className="font-semibold text-[#0F172A]">Tip:</strong> Complete nodes in order. Locked nodes become available when prerequisites are completed.
          </p>

        </div>

        {/* MIDDLE COLUMN: INTERACTIVE ROADMAP (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* INTERACTIVE ROADMAP HEADER BAR */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-[#0284C7]" />
                <span className="font-bold text-sm text-[#0F172A]">{selectedRole}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  ~6 months
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  {INITIAL_NODES.length} learning nodes
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">Personalized using your skills + gaps</span>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">
                    INTERACTIVE ROADMAP
                  </span>
                  <h3 className="text-xs font-bold text-[#475569] mt-0.5">
                    Follow the path from foundations → projects → interviews
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">{filteredNodes.length} shown</span>
              </div>
            </div>

          </div>

          {/* TIMELINE / NODE FLOW CARDS */}
          <div className="relative space-y-6 pt-2">
            
            {filteredNodes.map((node, index) => {
              const isCompleted = completedNodes.includes(node.id);
              const isBookmarked = bookmarkedNodes.includes(node.id);
              const isNext = !isCompleted && (index === 0 || completedNodes.includes(filteredNodes[index - 1]?.id));

              return (
                <div key={node.id} className="relative flex items-start space-x-4">
                  
                  {/* CENTRAL TIMELINE CONNECTOR & NUMBERED CIRCLE */}
                  <div className="flex flex-col items-center shrink-0 pt-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all z-10 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isNext
                          ? 'bg-[#0284C7] text-white ring-4 ring-sky-100'
                          : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : isNext ? node.id : <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />}
                    </div>

                    {index < filteredNodes.length - 1 && (
                      <div
                        className={`w-0.5 h-full min-h-[90px] mt-2 transition-colors ${
                          isCompleted ? 'bg-emerald-500' : 'bg-[#E2E8F0]'
                        }`}
                      />
                    )}
                  </div>

                  {/* NODE CARD */}
                  <div
                    className={`flex-1 bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : isNext
                        ? 'border-[#0284C7] ring-1 ring-sky-200'
                        : 'border-[#E2E8F0] opacity-85'
                    }`}
                  >
                    {/* CATEGORY & DIFFICULTY BADGE */}
                    <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider">
                          {node.category}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                          {node.difficulty}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleBookmark(node.id)}
                        className={`p-1 rounded hover:bg-[#F8FAFC] transition-colors ${
                          isBookmarked ? 'text-[#0284C7]' : 'text-[#94A3B8]'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* NODE TITLE & DESCRIPTION */}
                    <h4 className="text-sm font-extrabold text-[#0F172A] leading-snug">
                      {node.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      {node.description}
                    </p>

                    {/* DURATION META */}
                    <div className="flex items-center space-x-1.5 text-xs text-[#64748B] mt-3 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{node.hours}h</span>
                    </div>

                    {/* BOTTOM ACTION ROW */}
                    <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-between items-center">
                      <button
                        onClick={() => toggleNodeCompletion(node.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <span>Mark complete</span>
                        )}
                      </button>

                      {onNavigateToAssessment && (
                        <button
                          onClick={() => onNavigateToAssessment('binary-search')}
                          className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold flex items-center"
                        >
                          Practice <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* RIGHT COLUMN: ROADMAP GUIDE, PERSONALIZED FOR YOU, CTAs (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* ROADMAP GUIDE CARD */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block">
              ROADMAP GUIDE
            </span>
            <h4 className="text-sm font-bold text-[#0F172A]">How to use this path</h4>
            
            <div className="space-y-3 pt-1 text-xs text-[#475569]">
              <div className="flex items-start space-x-2.5">
                <Circle className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-[#0F172A] block">Open a node</strong>
                  <span className="text-[11px] text-[#64748B]">See skills, projects, prerequisites and resources.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Lock className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-[#0F172A] block">Follow prerequisites</strong>
                  <span className="text-[11px] text-[#64748B]">Complete earlier nodes before moving into advanced topics.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-[#0F172A] block">Track progress</strong>
                  <span className="text-[11px] text-[#64748B]">Your completed nodes are saved separately for each role.</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONALIZED FOR YOU CARD */}
          <div className="bg-[#0F172A] text-white rounded-xl p-5 shadow-md space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#FEF08A]" />
              <span className="text-xs font-bold tracking-tight">Personalized for you</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              CareerForge uses your claimed skills, skill gaps, experience and target job to generate the learning sequence.
            </p>
            <button
              onClick={() => onNavigateToAssessment && onNavigateToAssessment('binary-search')}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center justify-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#FEF08A]" />
              <span>Ask Career Agent</span>
            </button>
          </div>

          {/* BLUE CTA BUTTON */}
          <button
            onClick={() => onNavigateToAssessment && onNavigateToAssessment('binary-search')}
            className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Start interview practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* FLOATING BOTTOM RIGHT AI CAREER AGENT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onNavigateToAssessment && onNavigateToAssessment('binary-search')}
          className="px-4 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs shadow-xl border border-slate-700 flex items-center space-x-2 transition-transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-[#FEF08A]" />
          <span>AI Career Agent</span>
        </button>
      </div>

    </div>
  );
};
