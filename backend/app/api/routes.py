from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import (
    LoginRequest, RegisterRequest, AuthResponse,
    JobAnalysisRequest, JobAnalysisResponse, ResumeAnalysisResponse,
    AtsAnalysisResponse, SkillTruthResponse, JobGapSimulatorResponse, QuestionResponse,
    AnswerRequest, AnswerEvaluationResponse, InterviewSetupRequest,
    InterviewReportResponse, InterviewWhatIfRequest, InterviewWhatIfResponse,
    CodingSubmitRequest, CodingEvaluationResponse, SQLSubmitRequest, SQLEvaluationResponse,
    ReadinessBreakdownSchema, PersonalizedRoadmapResponse, ReassessmentResponse,
    RecruiterDashboardResponse, InterviewChatRequest, InterviewChatResponse
)
from app.ai.resume_extractor import extract_text_from_file
from app.ai.services import (
    JobRequirementAnalyzer, ResumeParser, SkillTruthEngine,
    WeaknessDiscoveryEngine, JobGapAnalyzer, AdaptiveInterviewEngine,
    CodingEvaluator, SQLEvaluator, JobReadinessCalculator,
    ImprovementPlanner, RecruiterService
)
from app.models.models import PracticeSession

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

@router.post("/resume/upload")
@router.post("/resume/analyze", response_model=AtsAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(None),
    target_role: Optional[str] = Form("Software Engineer"),
    job_description: Optional[str] = Form(None)
):
    if not file or not file.filename:
        # Fallback to mock parser if called without file for demo backwards compatibility
        return ResumeParser()._analyze_with_rules("Python SQL FastAPI Developer Experience 3 Years Bachelor Computer Science", "SampleResume.pdf", target_role or "Software Engineer", job_description)

    filename = file.filename
    file_bytes = await file.read()

    try:
        raw_text = extract_text_from_file(file_bytes, filename)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not extract readable text from this resume.")

    try:
        parser = ResumeParser()
        result = parser.analyze_ats(
            raw_text=raw_text,
            filename=filename,
            target_role=target_role,
            job_description=job_description
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI analysis failed. Please try again.")

@router.get("/skills/truth", response_model=SkillTruthResponse)
def get_skill_truth():
    return SkillTruthEngine().evaluate_skills([])

@router.get("/gap/simulate", response_model=JobGapSimulatorResponse)
def simulate_job_gap():
    return JobGapAnalyzer().analyze_gaps()

# --- Interview Prep Module Endpoints ---
@router.post("/interview/start", response_model=QuestionResponse)
def start_interview(payload: Optional[InterviewSetupRequest] = None):
    req = payload or InterviewSetupRequest()
    return AdaptiveInterviewEngine().start_interview(
        target_role=req.target_role or "Software Engineer",
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        num_questions=req.num_questions,
        job_description=req.job_description,
        target_company=req.target_company,
        focus_skills=req.focus_skills
    )

@router.post("/interview/chat", response_model=InterviewChatResponse)
def handle_interview_chat(payload: InterviewChatRequest):
    try:
        return AdaptiveInterviewEngine().handle_chat_turn(payload)
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI interviewer is temporarily unavailable. Please try again.")

@router.post("/interview/answer", response_model=AnswerEvaluationResponse)
def submit_answer(payload: AnswerRequest):
    return AdaptiveInterviewEngine().evaluate_answer(
        interview_id=payload.interview_id,
        question_id=payload.question_id,
        user_answer=payload.user_answer
    )

@router.post("/interview/stt")
async def transcribe_interview_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    filename = file.filename or "recording.webm"
    content_type = file.content_type or "audio/webm"
    transcript = AdaptiveInterviewEngine().transcribe_audio(audio_bytes, filename, content_type)
    return {"transcript": transcript}

@router.post("/interview/{interview_id}/submit", response_model=InterviewReportResponse)
@router.get("/interview/{interview_id}/report", response_model=InterviewReportResponse)
def get_interview_report(interview_id: int):
    return AdaptiveInterviewEngine().finalize_report(interview_id)

@router.get("/interview/history")
def get_interview_history():
    return AdaptiveInterviewEngine().get_history()

@router.get("/interview/readiness")
def get_interview_readiness():
    return AdaptiveInterviewEngine().get_readiness()

@router.get("/interview/what-changed")
def get_what_changed():
    return AdaptiveInterviewEngine().get_what_changed()

@router.post("/interview/what-if", response_model=InterviewWhatIfResponse)
def simulate_what_if(payload: InterviewWhatIfRequest):
    return AdaptiveInterviewEngine().simulate_what_if(payload.skill_name, payload.level_increase)

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

@router.post("/practice/complete")
def complete_practice_session(payload: dict, db: Session = Depends(get_db)):
    try:
        session_id = payload.get("sessionId") or payload.get("id") or f"sess_{int(datetime.utcnow().timestamp())}"
        session = PracticeSession(
            session_id=session_id,
            user_email=payload.get("userEmail", "alex.mercer@demo.com"),
            practice_type=payload.get("practiceType", "aptitude"),
            title=payload.get("title", "Practice Session"),
            topics=payload.get("topics", []),
            difficulty=payload.get("difficulty", "Medium"),
            score=float(payload.get("score", 0.0)),
            accuracy=float(payload.get("accuracy", 0.0)),
            questions_attempted=int(payload.get("questionsAttempted", 0)),
            total_questions=int(payload.get("totalQuestions", 0)),
            time_taken_seconds=int(payload.get("timeTakenSeconds", 0)),
            status="Completed",
            metrics=payload.get("metrics", {}),
            detailed_data=payload.get("detailedData", {})
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return {"status": "saved", "record_id": session.session_id}
    except Exception as e:
        db.rollback()
        return {"status": "saved_fallback", "record_id": str(payload.get("id", ""))}

@router.get("/practice/history")
def get_practice_history(email: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(PracticeSession)
        if email:
            query = query.filter(PracticeSession.user_email == email)
        sessions = query.order_by(PracticeSession.completed_at.desc()).all()
        return [
            {
                "id": s.session_id,
                "sessionId": s.session_id,
                "userEmail": s.user_email,
                "practiceType": s.practice_type,
                "title": s.title,
                "topics": s.topics or [],
                "difficulty": s.difficulty,
                "score": s.score,
                "accuracy": s.accuracy,
                "questionsAttempted": s.questions_attempted,
                "totalQuestions": s.total_questions,
                "timeTakenSeconds": s.time_taken_seconds,
                "status": s.status,
                "metrics": s.metrics or {},
                "completedAt": s.completed_at.isoformat() if s.completed_at else ""
            }
            for s in sessions
        ]
    except Exception:
        return []

@router.get("/practice/stats")
def get_practice_stats(email: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(PracticeSession)
        if email:
            query = query.filter(PracticeSession.user_email == email)
        sessions = query.order_by(PracticeSession.completed_at.desc()).all()
        if not sessions:
            return {
                "totalSessions": 0,
                "completedSessions": 0,
                "latestScore": 0,
                "averageScore": 0,
                "overallAccuracy": 0,
                "questionsPracticed": 0,
                "latestPracticeType": "",
                "lastPracticeDate": "",
                "recentActivity": []
            }
        scores = [s.score for s in sessions]
        accuracies = [s.accuracy for s in sessions]
        return {
            "totalSessions": len(sessions),
            "completedSessions": len(sessions),
            "latestScore": scores[0] if scores else 0,
            "averageScore": round(sum(scores) / len(scores)) if scores else 0,
            "overallAccuracy": round(sum(accuracies) / len(accuracies)) if accuracies else 0,
            "questionsPracticed": sum(s.questions_attempted for s in sessions),
            "latestPracticeType": sessions[0].practice_type if sessions else "",
            "lastPracticeDate": sessions[0].completed_at.isoformat() if sessions and sessions[0].completed_at else "",
            "recentActivity": [
                {
                    "id": s.session_id,
                    "sessionId": s.session_id,
                    "userEmail": s.user_email,
                    "practiceType": s.practice_type,
                    "title": s.title,
                    "topics": s.topics or [],
                    "difficulty": s.difficulty,
                    "score": s.score,
                    "accuracy": s.accuracy,
                    "questionsAttempted": s.questions_attempted,
                    "totalQuestions": s.total_questions,
                    "timeTakenSeconds": s.time_taken_seconds,
                    "status": s.status,
                    "metrics": s.metrics or {},
                    "completedAt": s.completed_at.isoformat() if s.completed_at else ""
                }
                for s in sessions[:5]
            ]
        }
    except Exception:
        return {
            "totalSessions": 0,
            "completedSessions": 0,
            "latestScore": 0,
            "averageScore": 0,
            "overallAccuracy": 0,
            "questionsPracticed": 0,
            "latestPracticeType": "",
            "lastPracticeDate": "",
            "recentActivity": []
        }

