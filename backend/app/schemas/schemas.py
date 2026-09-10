from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & Onboarding Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    age: Optional[int] = 24
    experience_years: Optional[float] = 3.0
    target_job_title: Optional[str] = "Software Engineer (Full Stack)"
    current_position: Optional[str] = "Junior Backend Developer"

class AuthResponse(BaseModel):
    status: str
    token: str = "demo_jwt_token_readyrole_2026"
    user: Dict[str, Any]

# --- Job Schemas ---
class JobRequirementSchema(BaseModel):
    skill_name: str
    category: str = "REQUIRED" # REQUIRED, PREFERRED, OPTIONAL
    importance: str = "HIGH" # HIGH, MEDIUM, LOW
    weight: float = 1.0

class JobAnalysisRequest(BaseModel):
    role_title: str
    job_description: Optional[str] = None
    predefined_id: Optional[str] = None

class JobAnalysisResponse(BaseModel):
    id: int
    title: str
    company: str
    experience_required: str
    required_skills: List[JobRequirementSchema]
    preferred_skills: List[JobRequirementSchema]
    optional_skills: List[JobRequirementSchema]
    responsibilities: List[str]

# --- Resume Schemas ---
class ResumeAnalysisResponse(BaseModel):
    compatibility_score: float # e.g. 78.0
    matched_skills: List[str]
    missing_skills: List[str]
    potential_gaps: List[str]
    extracted_projects: List[Dict[str, Any]]
    experience_summary: str

# --- Skill Truth Schemas ---
class SkillTruthItem(BaseModel):
    skill_name: str
    claimed_level: str # Advanced, Intermediate, Beginner
    verified_level: str # Expert, Advanced, Intermediate, Beginner
    confidence: float # 0.0 to 1.0
    job_importance: str # HIGH, MEDIUM, LOW
    evidence: List[str]
    weaknesses: List[str]
    recommendation: str

class SkillTruthResponse(BaseModel):
    profile_id: int
    candidate_name: str
    target_role: str
    skills: List[SkillTruthItem]
    truth_summary_narrative: str

# --- Job Gap Simulator Schemas ---
class SkillGapItem(BaseModel):
    skill_name: str
    required_level: str
    verified_level: str
    status: str # READY, NEEDS_IMPROVEMENT, HIGH_PRIORITY_GAP
    job_importance: str
    gap_score: float # 0 to 10
    evidence: str

class JobGapSimulatorResponse(BaseModel):
    ready_skills: List[SkillGapItem]
    needs_improvement: List[SkillGapItem]
    high_priority_gaps: List[SkillGapItem]
    summary_message: str

# --- Adaptive Interview Schemas ---
class QuestionResponse(BaseModel):
    question_id: int
    sequence_num: int
    total_budget: int = 15
    category: str # HR, Behavioral, Technical, DSA, Project, System Design, Coding, SQL
    target_skill: str
    question_text: str
    difficulty: str

class AnswerRequest(BaseModel):
    question_id: int
    user_answer: str

class AnswerEvaluationResponse(BaseModel):
    question_id: int
    clarity_score: float
    relevance_score: float
    technical_depth_score: float
    discovered_weakness: Optional[str]
    feedback: str
    is_followup_needed: bool
    next_question: Optional[QuestionResponse]

# --- Coding & SQL Schemas ---
class CodingSubmitRequest(BaseModel):
    code: str
    language: str = "python"

class CodingEvaluationResponse(BaseModel):
    correctness_score: float
    passed_tests: int
    total_tests: int
    time_complexity: str
    space_complexity: str
    feedback: str
    code_quality_rating: str

class SQLSubmitRequest(BaseModel):
    query: str

class SQLEvaluationResponse(BaseModel):
    correctness_score: float
    is_valid_syntax: bool
    result_rows: List[Dict[str, Any]]
    execution_time_ms: float
    feedback: str

# --- Project Deep Dive Schemas ---
class ProjectQuestionRequest(BaseModel):
    project_title: str

class ProjectEvaluationResponse(BaseModel):
    project_title: str
    architecture_score: float
    scalability_eval: str
    security_eval: str
    tradeoffs_understood: bool
    feedback: str

# --- Job Readiness Score Schemas ---
class ReadinessBreakdownSchema(BaseModel):
    overall_score: float # 72.0
    resume_compatibility: float # 78.0
    technical_skills: float # 76.0
    dsa_score: float # 61.0
    problem_solving: float # 68.0
    communication: float # 84.0
    project_knowledge: float # 81.0
    coding_score: float # 74.0
    sql_score: float # 88.0
    evidence_bullets: List[str]
    disclaimer: str = "This score estimates readiness against selected job requirements based on available empirical evidence."

# --- Personalized Roadmap Schemas ---
class RoadmapTaskSchema(BaseModel):
    day: int
    topic: str
    why_it_matters: str
    difficulty: str
    practice_goal: str
    is_completed: bool = False

class RoadmapPrioritySchema(BaseModel):
    rank: int
    skill_name: str
    priority_score: float
    justification: str

class PersonalizedRoadmapResponse(BaseModel):
    priority_rankings: List[RoadmapPrioritySchema]
    seven_day_plan: List[RoadmapTaskSchema]

class ReassessmentResponse(BaseModel):
    previous_readiness_score: float
    new_readiness_score: float
    score_delta: float
    improved_skills: List[Dict[str, Any]]
    congratulations_message: str

# --- Recruiter Dashboard Schemas ---
class RecruiterCandidateSchema(BaseModel):
    candidate_id: int
    candidate_name: str
    target_role: str
    job_readiness_score: float
    resume_compatibility: float
    verified_skills: Dict[str, str]
    top_strengths: List[str]
    top_gaps: List[str]
    decision_support_badge: str # "Strong Match", "Recommended with Upskilling", "High Risk Gap"

class RecruiterDashboardResponse(BaseModel):
    job_title: str
    total_applicants: int
    applicants: List[RecruiterCandidateSchema]
