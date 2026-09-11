export interface UserProfileData {
  fullName: string;
  email?: string;
  age: string;
  location: string;
  educationLevel: 'High School' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'Other';
  college: string;
  yearOfStudy: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Graduate' | 'Working Professional';
  graduationYear?: string;
}

export interface CareerGoalData {
  targetRole: string;
  experienceLevel: 'Student' | 'Fresher' | '0–2 years' | '2–5 years' | '5+ years';
  targetCompany: string;
  jobDescription?: string;
}

export interface ClaimedSkillItem {
  skillName: string;
  claimedLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AtsCategoryScores {
  ats_compatibility: number;
  content_quality: number;
  experience: number;
  technical_skills: number;
  projects: number;
  achievements: number;
  keywords: number;
  formatting: number;
  education: number;
  contact_information: number;
}

export interface AtsImprovement {
  priority: 'high' | 'medium' | 'low';
  section: string;
  problem: string;
  recommendation: string;
  example: string;
}

export interface AtsKeywordAnalysis {
  matched_keywords: string[];
  missing_keywords: string[];
  keyword_match_percentage: number;
}

export interface AtsChecklistItem {
  item: string;
  passed: boolean;
  note: string;
}

export interface AtsJobMatch {
  job_match_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  skill_gaps: string[];
  experience_gaps: string[];
  recommendations: string[];
}

export interface AtsAnalysisResponse {
  overall_score: number;
  summary: string;
  category_scores: AtsCategoryScores;
  strengths: string[];
  weaknesses: string[];
  improvements: AtsImprovement[];
  keyword_analysis: AtsKeywordAnalysis;
  section_analysis: Record<string, number>;
  ats_checklist: AtsChecklistItem[];
  final_recommendation: string;
  job_match?: AtsJobMatch | null;
  target_role?: string;
  filename?: string;
}

export interface ATSAnalysisResult {
  atsScore: number;
  whatsWorking: string[];
  whatsMissing: string[];
  targetRoleMatches: { skill: string; status: 'Strong' | 'Good' | 'Needs improvement' | 'Missing evidence' }[];
  calculationReasoning: string;
  fullAnalysis?: AtsAnalysisResponse;
}

export interface JobRequirement {
  skill_name: string;
  category: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
}

export interface JobDetails {
  id: number;
  title: string;
  company: string;
  experience_required: string;
  required_skills: JobRequirement[];
  preferred_skills: JobRequirement[];
  optional_skills: JobRequirement[];
  responsibilities: string[];
}

export interface SkillTruthItem {
  skill_name: string;
  claimed_level: string;
  verified_level: string;
  confidence: number;
  job_importance: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface SkillTruthResponse {
  profile_id: number;
  candidate_name: string;
  target_role: string;
  skills: SkillTruthItem[];
  truth_summary_narrative: string;
}

export interface SkillGapItem {
  skill_name: string;
  required_level: string;
  verified_level: string;
  status: 'READY' | 'NEEDS_IMPROVEMENT' | 'HIGH_PRIORITY_GAP';
  job_importance: 'HIGH' | 'MEDIUM' | 'LOW';
  gap_score: number;
  evidence: string;
}

export interface JobGapResponse {
  ready_skills: SkillGapItem[];
  needs_improvement: SkillGapItem[];
  high_priority_gaps: SkillGapItem[];
  summary_message: string;
}

export interface Question {
  question_id: number;
  interview_id?: number;
  sequence_num: number;
  total_budget: number;
  category: string;
  target_skill: string;
  question_text: string;
  difficulty: string;
}

export interface AnswerEvaluation {
  question_id: number;
  clarity_score?: number;
  relevance_score?: number;
  technical_depth_score?: number;
  discovered_weakness?: string | null;
  feedback?: string;
  is_followup_needed?: boolean;
  is_completed?: boolean;
  evaluation?: any;
  next_question?: Question;
}

export interface CodingEvaluation {
  correctness_score: number;
  passed_tests: number;
  total_tests: number;
  time_complexity: string;
  space_complexity: string;
  feedback: string;
  code_quality_rating: string;
}

export interface SQLEvaluation {
  correctness_score: number;
  is_valid_syntax: boolean;
  result_rows: Record<string, any>[];
  execution_time_ms: number;
  feedback: string;
  is_correct?: boolean;
  score?: number;
  syntax_valid?: boolean;
}

export interface ReadinessScore {
  overall_score: number;
  resume_compatibility: number;
  technical_skills: number;
  dsa_score: number;
  problem_solving: number;
  communication: number;
  project_knowledge: number;
  coding_score: number;
  sql_score: number;
  evidence_bullets: string[];
  disclaimer: string;
}

export interface RoadmapTask {
  day: number;
  topic: string;
  why_it_matters: string;
  difficulty: string;
  practice_goal: string;
  is_completed: boolean;
}

export interface RoadmapPriority {
  rank: number;
  skill_name: string;
  priority_score: number;
  justification: string;
}

export interface PersonalizedRoadmap {
  priority_rankings: RoadmapPriority[];
  seven_day_plan: RoadmapTask[];
}

export interface ReassessmentResult {
  previous_readiness_score: number;
  new_readiness_score: number;
  score_delta: number;
  improved_skills: { skill: string; before: number; after: number; delta: string }[];
  congratulations_message: string;
}

export interface RecruiterCandidate {
  candidate_id: number;
  candidate_name: string;
  target_role: string;
  job_readiness_score: number;
  resume_compatibility: number;
  verified_skills: Record<string, string>;
  top_strengths: string[];
  top_gaps: string[];
  decision_support_badge: 'Strong Match' | 'Recommended with Upskilling' | 'High Risk Gap';
}

export interface InterviewChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface InterviewChatRequest {
  interview_id?: string;
  message: string;
  history?: InterviewChatMessage[];
  interview_config?: Record<string, any>;
}

export interface InterviewEvaluationDetail {
  answer_quality: number;
  technical_knowledge: number;
  problem_solving: number;
  communication: number;
  depth: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface InterviewFinalReport {
  overall_score: number;
  technical_knowledge: number;
  problem_solving: number;
  communication: number;
  answer_quality: number;
  depth: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  final_feedback: string;
}

export interface InterviewChatResponse {
  interview_id: string;
  stage: 'setup' | 'interview' | 'completed';
  message: string;
  question?: string | null;
  current_question_num: number;
  total_questions: number;
  next_difficulty?: string | null;
  evaluation?: InterviewEvaluationDetail | null;
  final_report?: InterviewFinalReport | null;
  interview_config?: Record<string, any> | null;
  is_completed: boolean;
}

export interface RecruiterDashboard {
  job_title: string;
  total_applicants: number;
  applicants: RecruiterCandidate[];
}

export interface PracticeRecord {
  id: string;
  sessionId: string;
  userEmail: string;
  practiceType: 'aptitude' | 'coding' | 'sql' | 'ai-interview';
  title: string;
  topics: string[];
  difficulty: string;
  score: number; // 0-100
  accuracy: number; // 0-100%
  questionsAttempted: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  completedAt: string; // ISO date string
  status: 'Completed' | 'completed';
  metrics: {
    // Aptitude specifics
    correct?: number;
    wrong?: number;
    unattempted?: number;
    // Coding specifics
    problemsSolved?: number;
    testCasesPassed?: number;
    totalTestCases?: number;
    bestRuntime?: string;
    bestMemory?: string;
    // SQL specifics
    queriesExecuted?: number;
    syntaxValid?: boolean;
    rowsReturned?: number;
    executionTimeMs?: number;
    // AI Interview specifics
    overallScore?: number;
    technicalDepth?: number;
    communicationScore?: number;
    targetRole?: string;
  };
  detailedData?: any;
}

export interface PracticeStats {
  totalSessions: number;
  completedSessions: number;
  latestScore: number;
  averageScore: number;
  overallAccuracy: number;
  questionsPracticed: number;
  latestPracticeType: string;
  lastPracticeDate: string;
  recentActivity: PracticeRecord[];
}
