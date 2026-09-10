import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { ResumeProcessingScreen } from './pages/ResumeProcessingScreen';
import { ATSResultPage } from './pages/ATSResultPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { TargetJobSetup } from './pages/TargetJobSetup';
import { ResumeUpload } from './pages/ResumeUpload';
import { SkillTruthProfile } from './pages/SkillTruthProfile';
import { JobGapSimulator } from './pages/JobGapSimulator';
import { AdaptiveInterview } from './pages/AdaptiveInterview';
import { ProjectDeepDive } from './pages/ProjectDeepDive';
import { CodingWorkspace } from './pages/CodingWorkspace';
import { SQLWorkspace } from './pages/SQLWorkspace';
import { JobReadinessDashboard } from './pages/JobReadinessDashboard';
import { PersonalizedRoadmapPage } from './pages/PersonalizedRoadmap';
import { ReassessmentSimulator } from './pages/ReassessmentSimulator';
import { JobDetails, SkillTruthResponse, JobGapResponse, ReadinessScore, PersonalizedRoadmap, UserProfileData, CareerGoalData, ClaimedSkillItem } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Alex Mercer');
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [readinessScore, setReadinessScore] = useState<number>(72);

  // App State Data
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [careerGoal, setCareerGoal] = useState<CareerGoalData | null>(null);
  const [claimedSkills, setClaimedSkills] = useState<ClaimedSkillItem[]>([]);
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [truthData, setTruthData] = useState<SkillTruthResponse | null>(null);
  const [gapData, setGapData] = useState<JobGapResponse | null>(null);
  const [readinessData, setReadinessData] = useState<ReadinessScore | null>(null);
  const [roadmapData, setRoadmapData] = useState<PersonalizedRoadmap | null>(null);

  const handleNavigate = (tab: string) => {
    // Protected routes check
    const protectedTabs = ['dashboard', 'job', 'resume', 'truth', 'gap', 'interview', 'project', 'coding', 'sql', 'readiness', 'roadmap', 'reassessment'];
    if (!isAuthenticated && protectedTabs.includes(tab)) {
      setCurrentTab('login');
      return;
    }
    setCurrentTab(tab);
  };

  // SIGNUP HANDLER -> MUST GO TO ONBOARDING (NEVER DIRECTLY TO DASHBOARD)
  const handleSignupSuccess = (user: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setUserName(user.name);
    setHasCompletedOnboarding(false);
    setCurrentTab('onboarding');
  };

  // LOGIN HANDLER -> RETURNING USERS GO DIRECTLY TO DASHBOARD
  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setUserName(user.name);
    setHasCompletedOnboarding(true);
    setCurrentTab('dashboard');
  };

  // ONBOARDING COMPLETED HANDLER -> RESUME PROCESSING SCREEN
  const handleOnboardingComplete = (data: {
    profile: UserProfileData;
    goal: CareerGoalData;
    skills: ClaimedSkillItem[];
    resumeFile: string | null;
  }) => {
    setUserProfile(data.profile);
    setCareerGoal(data.goal);
    setClaimedSkills(data.skills);
    if (data.goal.targetRole) {
      setTargetRole(data.goal.targetRole);
    }
    setHasCompletedOnboarding(true);
    setCurrentTab('processing');
  };

  // PROCESSING SCREEN COMPLETED -> ATS RESULT PAGE
  const handleProcessingComplete = () => {
    setCurrentTab('ats-result');
  };

  // ATS RESULT GO TO DASHBOARD HANDLER
  const handleATSGoToDashboard = () => {
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setUserName('');
    setCurrentTab('landing');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A192F] font-sans flex flex-col justify-between selection:bg-[#FFDE59]">
      <div>
        {/* Global Minimal SaaS Navbar */}
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLogout={handleLogout}
        />

        {/* Main Content Router */}
        <main>
          {currentTab === 'landing' && (
            <LandingPage
              onGetStarted={() => handleNavigate('signup')}
              onSignIn={() => handleNavigate('login')}
            />
          )}

          {currentTab === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={() => handleNavigate('signup')}
            />
          )}

          {currentTab === 'signup' && (
            <SignupPage
              onSignupSuccess={handleSignupSuccess}
              onNavigateToLogin={() => handleNavigate('login')}
            />
          )}

          {currentTab === 'onboarding' && (
            <OnboardingWizard onComplete={handleOnboardingComplete} />
          )}

          {currentTab === 'processing' && (
            <ResumeProcessingScreen onComplete={handleProcessingComplete} />
          )}

          {currentTab === 'ats-result' && (
            <ATSResultPage onGoToDashboard={handleATSGoToDashboard} />
          )}

          {currentTab === 'dashboard' && (
            <CandidateDashboard
              truthData={truthData}
              gapData={gapData}
              readinessData={readinessData}
              userName={userName}
              targetRole={targetRole}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'job' && (
            <TargetJobSetup
              currentJob={jobData}
              onJobUpdated={(j) => {
                setJobData(j);
                setTargetRole(j.title);
              }}
              onProceed={() => handleNavigate('resume')}
            />
          )}

          {currentTab === 'resume' && (
            <ResumeUpload onProceed={() => handleNavigate('truth')} />
          )}

          {currentTab === 'truth' && (
            <SkillTruthProfile
              truthData={truthData}
              onProceedToGap={() => handleNavigate('gap')}
            />
          )}

          {currentTab === 'gap' && (
            <JobGapSimulator
              gapData={gapData}
              onProceedToInterview={() => handleNavigate('interview')}
            />
          )}

          {currentTab === 'interview' && (
            <AdaptiveInterview onProceedToCoding={() => handleNavigate('coding')} />
          )}

          {currentTab === 'project' && (
            <ProjectDeepDive onProceedToCoding={() => handleNavigate('coding')} />
          )}

          {currentTab === 'coding' && (
            <CodingWorkspace onProceedToSQL={() => handleNavigate('sql')} />
          )}

          {currentTab === 'sql' && (
            <SQLWorkspace onProceedToReadiness={() => handleNavigate('readiness')} />
          )}

          {currentTab === 'readiness' && (
            <JobReadinessDashboard
              readinessData={readinessData}
              onProceedToRoadmap={() => handleNavigate('roadmap')}
            />
          )}

          {currentTab === 'roadmap' && (
            <PersonalizedRoadmapPage
              roadmapData={roadmapData}
              onRunReassessment={() => handleNavigate('reassessment')}
            />
          )}

          {currentTab === 'reassessment' && (
            <ReassessmentSimulator
              onBackToDashboard={() => {
                setReadinessScore(81);
                handleNavigate('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* COMPACT SAAS FOOTER */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs text-[#64748B] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-[9px]">
                CF
              </div>
              <span className="font-bold text-[#0A192F]">CareerForge AI</span>
            </div>
            <p className="text-[11px] text-[#64748B]">Know where you stand before you apply.</p>
          </div>

          <div className="flex space-x-12 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#0A192F] uppercase text-[10px] block">Product</span>
              <button onClick={() => handleNavigate('readiness')} className="block hover:underline">Readiness</button>
              <button onClick={() => handleNavigate('gap')} className="block hover:underline">Skill Gap</button>
              <button onClick={() => handleNavigate('roadmap')} className="block hover:underline">Roadmap</button>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-[#0A192F] uppercase text-[10px] block">Company</span>
              <span className="block cursor-pointer hover:underline">About</span>
              <span className="block cursor-pointer hover:underline">Contact</span>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B]">
            © 2026 CareerForge AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
