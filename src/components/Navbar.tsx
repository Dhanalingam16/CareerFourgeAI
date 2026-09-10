import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, FileText, User, LogOut, ChevronDown, Award } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  isAuthenticated,
  userName = 'Alex Mercer',
  onLogout,
}) => {
  const [assessmentsDropdownOpen, setAssessmentsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAssessmentActive = ['truth', 'gap', 'interview', 'coding', 'sql', 'project'].includes(currentTab);

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        
        {/* LEFT: CF Logo */}
        <div 
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm group-hover:bg-[#427AB5] transition-colors">
            CF
          </div>
          <div>
            <span className="text-base font-extrabold text-[#0A192F] tracking-tight block leading-none">
              CareerForge AI
            </span>
            <span className="text-[10px] text-[#64748B] font-medium leading-none block mt-1">
              Career readiness intelligence
            </span>
          </div>
        </div>

        {/* CENTER: Clean Navigation (Dashboard, Assessments, Roadmap, Resume, Profile) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-[#0A192F] font-bold border-b-2 border-[#427AB5] py-5'
                  : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              Dashboard
            </button>

            {/* ASSESSMENTS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setAssessmentsDropdownOpen(!assessmentsDropdownOpen)}
                className={`flex items-center space-x-1 transition-colors ${
                  isAssessmentActive
                    ? 'text-[#0A192F] font-bold border-b-2 border-[#427AB5] py-5'
                    : 'text-[#64748B] hover:text-[#0A192F]'
                }`}
              >
                <span>Assessments</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {assessmentsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-lg shadow-xl py-1 z-50 text-xs">
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('truth'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Skill Assessment (Skill Truth)
                  </button>
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('gap'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Skill Gap Simulator
                  </button>
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('interview'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    AI Interview
                  </button>
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('coding'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Coding Workspace
                  </button>
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('sql'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    SQL Workspace
                  </button>
                  <button
                    onClick={() => { setAssessmentsDropdownOpen(false); onNavigate('project'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Project Deep Dive
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('roadmap')}
              className={`transition-colors ${
                currentTab === 'roadmap'
                  ? 'text-[#0A192F] font-bold border-b-2 border-[#427AB5] py-5'
                  : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              Roadmap
            </button>

            <button
              onClick={() => onNavigate('resume')}
              className={`transition-colors ${
                currentTab === 'resume'
                  ? 'text-[#0A192F] font-bold border-b-2 border-[#427AB5] py-5'
                  : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              Resume
            </button>
          </nav>
        )}

        {/* RIGHT: Profile & Logout */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 text-xs font-semibold text-[#0A192F] py-1.5 px-3 rounded border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px] font-bold">
                  {userName ? userName.charAt(0) : 'A'}
                </div>
                <span>{userName || 'Profile'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-xl py-1 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <span className="font-bold text-[#0A192F] block">{userName}</span>
                    <span className="text-[10px] text-[#64748B]">Software Engineer Target</span>
                  </div>
                  <button
                    onClick={() => { setUserDropdownOpen(false); onNavigate('dashboard'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setUserDropdownOpen(false); onNavigate('resume'); }}
                    className="w-full text-left px-4 py-2 text-[#0A192F] hover:bg-[#F8FAFC] font-medium"
                  >
                    Resume & ATS
                  </button>
                  <div className="border-t border-[#E2E8F0] my-1"></div>
                  <button
                    onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => onNavigate('login')}
                className="text-[#0A192F] hover:text-[#427AB5] px-3 py-1.5"
              >
                Sign in
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white transition-colors shadow-sm"
              >
                Get started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
