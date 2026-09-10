from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import (
    LoginRequest, RegisterRequest, AuthResponse,
    JobAnalysisRequest, JobAnalysisResponse, ResumeAnalysisResponse,
    SkillTruthResponse, JobGapSimulatorResponse, QuestionResponse,
    AnswerRequest, AnswerEvaluationResponse, CodingSubmitRequest,
    CodingEvaluationResponse, SQLSubmitRequest, SQLEvaluationResponse,
    ReadinessBreakdownSchema, PersonalizedRoadmapResponse, ReassessmentResponse,
    RecruiterDashboardResponse
)
from app.ai.services import (
    JobRequirementAnalyzer, ResumeParser, SkillTruthEngine,
    WeaknessDiscoveryEngine, JobGapAnalyzer, AdaptiveInterviewEngine,
    CodingEvaluator, SQLEvaluator, JobReadinessCalculator,
    ImprovementPlanner, RecruiterService
)

router = APIRouter()

@router.post("/auth/demo", response_model=AuthResponse)
@router.post("/auth/login", response_model=AuthResponse)
def login_user(payload: Optional[LoginRequest] = None):
    return AuthResponse(
        status="authenticated",
        token="readyrole_jwt_session_2026",
        user={
            "id": 1,
            "full_name": "Alex Mercer",
            "email": payload.email if payload else "alex.mercer@demo.com",
            "age": 24,
            "experience_years": 3.0,
            "target_job_title": "Software Engineer (Full Stack)",
            "current_position": "Junior Developer",
            "role": "candidate"
        }
    )

@router.post("/auth/register", response_model=AuthResponse)
def register_user(payload: RegisterRequest):
    return AuthResponse(
        status="authenticated",
        token="readyrole_jwt_session_2026",
        user={
            "id": 2,
            "full_name": payload.full_name,
            "email": payload.email,
            "age": payload.age or 24,
            "experience_years": payload.experience_years or 3.0,
            "target_job_title": payload.target_job_title or "Software Engineer (Full Stack)",
            "current_position": payload.current_position or "Software Engineer",
            "role": "candidate"
        }
    )

@router.post("/job/analyze", response_model=JobAnalysisResponse)
def analyze_job(req: JobAnalysisRequest):
    return JobRequirementAnalyzer().analyze_job(req.role_title, req.job_description)

@router.get("/job/{job_id}", response_model=JobAnalysisResponse)
def get_job(job_id: int):
    return JobRequirementAnalyzer().analyze_job("Software Engineer (Full Stack)")

@router.post("/resume/upload", response_model=ResumeAnalysisResponse)
def upload_resume(file: UploadFile = File(None)):
    return ResumeParser().parse_resume()

@router.get("/skills/truth", response_model=SkillTruthResponse)
def get_skill_truth():
    return SkillTruthEngine().evaluate_skills([])

@router.get("/gap/simulate", response_model=JobGapSimulatorResponse)
def simulate_job_gap():
    return JobGapAnalyzer().analyze_gaps()

@router.post("/interview/start", response_model=QuestionResponse)
def start_interview():
    return WeaknessDiscoveryEngine().select_next_question(1, [])

@router.post("/interview/answer", response_model=AnswerEvaluationResponse)
def submit_answer(payload: AnswerRequest):
    return AdaptiveInterviewEngine().evaluate_answer(payload.question_id, payload.user_answer)

@router.post("/coding/submit", response_model=CodingEvaluationResponse)
def submit_code(payload: CodingSubmitRequest):
    return CodingEvaluator().evaluate(payload.code)

@router.post("/sql/submit", response_model=SQLEvaluationResponse)
def submit_sql(payload: SQLSubmitRequest):
    return SQLEvaluator().evaluate(payload.query)

@router.get("/readiness/{profile_id}", response_model=ReadinessBreakdownSchema)
def get_readiness_score(profile_id: int):
    return JobReadinessCalculator().calculate_readiness()

@router.post("/roadmap/generate", response_model=PersonalizedRoadmapResponse)
def generate_roadmap():
    return ImprovementPlanner().generate_plan()

@router.post("/reassessment/start", response_model=ReassessmentResponse)
def run_reassessment():
    return ImprovementPlanner().simulate_reassessment()

@router.get("/recruiter/dashboard", response_model=RecruiterDashboardResponse)
def get_recruiter_dashboard():
    return RecruiterService().get_dashboard()
