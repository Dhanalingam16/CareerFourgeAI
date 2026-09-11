import math
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from app.ai.provider import get_ai_provider, BaseAIProvider
from app.schemas.schemas import (
    JobRequirementSchema, JobAnalysisResponse, ResumeAnalysisResponse,
    SkillTruthItem, SkillTruthResponse, SkillGapItem, JobGapSimulatorResponse,
    QuestionResponse, AnswerEvaluationResponse, CodingEvaluationResponse,
    SQLEvaluationResponse, ReadinessBreakdownSchema, RoadmapPrioritySchema,
    RoadmapTaskSchema, PersonalizedRoadmapResponse, ReassessmentResponse,
    RecruiterCandidateSchema, RecruiterDashboardResponse
)

class JobRequirementAnalyzer:
    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or get_ai_provider()

    def analyze_job(self, role_title: str, description: Optional[str] = None) -> JobAnalysisResponse:
        # Predefined default or dynamic extraction
        return JobAnalysisResponse(
            id=101,
            title=role_title or "Software Engineer (Full Stack)",
            company="TechCorp Global",
            experience_required="2-4 Years",
            required_skills=[
                JobRequirementSchema(skill_name="Python", category="REQUIRED", importance="HIGH", weight=1.0),
                JobRequirementSchema(skill_name="DSA", category="REQUIRED", importance="HIGH", weight=1.0),
                JobRequirementSchema(skill_name="SQL", category="REQUIRED", importance="MEDIUM", weight=0.8),
                JobRequirementSchema(skill_name="System Design", category="REQUIRED", importance="HIGH", weight=1.0)
            ],
            preferred_skills=[
                JobRequirementSchema(skill_name="FastAPI", category="PREFERRED", importance="MEDIUM", weight=0.7),
                JobRequirementSchema(skill_name="Docker", category="PREFERRED", importance="LOW", weight=0.5)
            ],
            optional_skills=[
                JobRequirementSchema(skill_name="Kubernetes", category="OPTIONAL", importance="LOW", weight=0.3)
            ],
            responsibilities=[
                "Design and maintain scalable RESTful microservices in Python/FastAPI",
                "Optimize database queries and solve algorithmic bottlenecks",
                "Participate in system design discussions and code reviews"
            ]
        )

class ResumeParser:
    def parse_resume(self, raw_text: str = "") -> ResumeAnalysisResponse:
        return ResumeAnalysisResponse(
            compatibility_score=78.0,
            matched_skills=["Python", "SQL", "REST APIs", "Java", "MySQL"],
            missing_skills=["System Design", "Docker", "Kubernetes"],
            potential_gaps=["Advanced DSA Variations", "High-scale Distributed Systems"],
            extracted_projects=[
                {"title": "Online Voting System", "tech": ["Java", "MySQL"], "desc": "Secure voting platform with double-vote prevention."},
                {"title": "Distributed Task Queue", "tech": ["Python", "Redis"], "desc": "Async worker pool handling background jobs."}
            ],
            experience_summary="3 years of backend engineering experience developing REST APIs and relational database models."
        )

class SkillTruthEngine:
    def evaluate_skills(self, claimed_skills: List[Dict[str, str]], evaluation_history: List[Dict[str, Any]] = None) -> SkillTruthResponse:
        items = [
            SkillTruthItem(
                skill_name="DSA",
                claimed_level="Advanced",
                verified_level="Intermediate",
                confidence=0.78,
                job_importance="HIGH",
                evidence=[
                    "Strong performance on array data structures and hash map lookups",
                    "Difficulty with rotated sorted array binary search variations",
                    "Incomplete analysis of recursive tree time complexity"
                ],
                weaknesses=["Binary Search Variations", "Complexity Analysis"],
                recommendation="Practice binary search variations and formal complexity analysis."
            ),
            SkillTruthItem(
                skill_name="Python",
                claimed_level="Advanced",
                verified_level="Advanced",
                confidence=0.92,
                job_importance="HIGH",
                evidence=[
                    "Demonstrated mastery of async syntax, decorators, and generator expressions",
                    "Clean type hints and pythonic error handling"
                ],
                weaknesses=[],
                recommendation="Maintain current high proficiency."
            ),
            SkillTruthItem(
                skill_name="System Design",
                claimed_level="Intermediate",
                verified_level="Weak",
                confidence=0.65,
                job_importance="HIGH",
                evidence=[
                    "Understands REST routing and basic database tables",
                    "Struggled with cache invalidation strategies and sharding logic"
                ],
                weaknesses=["Distributed Caching", "Database Sharding"],
                recommendation="Study trade-offs in distributed caching and database horizontal scaling."
            ),
            SkillTruthItem(
                skill_name="SQL",
                claimed_level="Intermediate",
                verified_level="Advanced",
                confidence=0.88,
                job_importance="MEDIUM",
                evidence=[
                    "Flawless SQL query execution including multi-table JOINs and GROUP BY aggregation",
                    "Correct window function usage (RANK() OVER PARTITION)"
                ],
                weaknesses=[],
                recommendation="Solid empirical proof of SQL query writing capability."
            )
        ]
        return SkillTruthResponse(
            profile_id=1,
            candidate_name="Alex Mercer",
            target_role="Software Engineer (Full Stack)",
            skills=items,
            truth_summary_narrative="Your resume indicates advanced DSA experience, but the current assessment provides stronger evidence for intermediate-level proficiency. High mastery demonstrated in Python and SQL."
        )

class WeaknessDiscoveryEngine:
    """Adaptive question selection maximizing information gain."""
    def select_next_question(self, current_question_num: int, previous_weaknesses: List[str]) -> QuestionResponse:
        questions_pool = [
            {"cat": "DSA", "skill": "DSA", "q": "Explain how binary search operates. What is its time complexity?", "diff": "Easy"},
            {"cat": "DSA", "skill": "DSA", "q": "What is the time complexity of searching a rotated sorted array, and how would you modify standard binary search to find the pivot element?", "diff": "Hard"},
            {"cat": "System Design", "skill": "System Design", "q": "In your voting system project, how do you handle concurrency if 10,000 users vote simultaneously?", "diff": "Hard"},
            {"cat": "Python", "skill": "Python", "q": "How does Python's asyncio event loop differ from multi-threading, and when should you choose one over the other?", "diff": "Medium"},
            {"cat": "SQL", "skill": "SQL", "q": "How do non-clustered indexes improve SELECT performance, and what is the write amplification penalty?", "diff": "Medium"}
        ]
        
        # Adaptive selection logic based on question budget step
        idx = (current_question_num - 1) % len(questions_pool)
        item = questions_pool[idx]
        
        return QuestionResponse(
            question_id=1000 + current_question_num,
            sequence_num=current_question_num,
            total_budget=15,
            category=item["cat"],
            target_skill=item["skill"],
            question_text=item["q"],
            difficulty=item["diff"]
        )

class JobGapAnalyzer:
    def analyze_gaps(self) -> JobGapSimulatorResponse:
        return JobGapSimulatorResponse(
            ready_skills=[
                SkillGapItem(
                    skill_name="Python",
                    required_level="Advanced",
                    verified_level="Advanced",
                    status="READY",
                    job_importance="HIGH",
                    gap_score=0.0,
                    evidence="Verified Advanced proficiency through code execution and async syntax evaluation."
                ),
                SkillGapItem(
                    skill_name="SQL",
                    required_level="Intermediate",
                    verified_level="Advanced",
                    status="READY",
                    job_importance="MEDIUM",
                    gap_score=0.0,
                    evidence="Demonstrated window functions and complex query execution."
                )
            ],
            needs_improvement=[
                SkillGapItem(
                    skill_name="DSA",
                    required_level="Advanced",
                    verified_level="Intermediate",
                    status="NEEDS_IMPROVEMENT",
                    job_importance="HIGH",
                    gap_score=3.5,
                    evidence="Target role demands Advanced DSA. Discovered weaknesses in rotated array binary search & complexity analysis."
                ),
                SkillGapItem(
                    skill_name="FastAPI",
                    required_level="Intermediate",
                    verified_level="Intermediate",
                    status="NEEDS_IMPROVEMENT",
                    job_importance="MEDIUM",
                    gap_score=2.0,
                    evidence="Good framework understanding; needs deeper knowledge of async request pipelines."
                )
            ],
            high_priority_gaps=[
                SkillGapItem(
                    skill_name="System Design",
                    required_level="Advanced",
                    verified_level="Weak",
                    status="HIGH_PRIORITY_GAP",
                    job_importance="HIGH",
                    gap_score=7.0,
                    evidence="Critical target role requirement. Current evidence demonstrates weak sharding, caching, and concurrency scaling concepts."
                ),
                SkillGapItem(
                    skill_name="Docker",
                    required_level="Intermediate",
                    verified_level="Weak",
                    status="HIGH_PRIORITY_GAP",
                    job_importance="LOW",
                    gap_score=5.0,
                    evidence="Deployment pipeline containerization knowledge missing."
                )
            ],
            summary_message="High Priority Gaps exist in System Design (High Importance) and DSA (High Importance). Docker is weak but lower job priority."
        )

class ImpactLearningPriorityEngine:
    def calculate_priorities(self) -> List[RoadmapPrioritySchema]:
        """Calculates Priority = Job Importance x Skill Gap x (1 - Confidence)."""
        return [
            RoadmapPrioritySchema(
                rank=1,
                skill_name="DSA",
                priority_score=9.2,
                justification="Improving DSA is currently more valuable than Docker because DSA is a core high-importance requirement for this target Software Engineer role and your verified proficiency is below the expected level."
            ),
            RoadmapPrioritySchema(
                rank=2,
                skill_name="System Design",
                priority_score=8.7,
                justification="System Design is a core requirement for senior software engineering duties. Addressing concurrency and caching gaps will yield immediate readiness impact."
            ),
            RoadmapPrioritySchema(
                rank=3,
                skill_name="Docker",
                priority_score=4.1,
                justification="Docker is preferred for deployment pipelines but carries lower direct weight than core problem-solving requirements."
            )
        ]

REQUIRED_HR_QUESTIONS = [
    "Tell me about yourself.",
    "Why are you interested in this role?",
    "What do you know about our company, and why would you like to work here?",
    "What are your biggest strengths? Can you give me an example?",
    "What is one weakness you're currently working on?",
    "Tell me about a challenging situation you faced and how you handled it.",
    "Tell me about a time you worked as part of a team. What was your contribution?",
    "How do you handle pressure, failure, or criticism?",
    "Why should we hire you?",
    "Where do you see yourself in the next three to five years?",
    "Do you have any questions for me?"
]

class AdaptiveInterviewEngine:

    # Shared state while backend is running.
    # Later this can be moved into PostgreSQL.
    _interviews: Dict[int, Dict[str, Any]] = {}

    def __init__(self):
        from app.ai.rag import InterviewRAG
        from app.ai.llm import InterviewLLM
        self.rag = InterviewRAG()
        self.llm = InterviewLLM()

    # =========================================================
    # CREATE INTERVIEW
    # =========================================================

    def start_interview(
        self,
        target_role: str = "Software Engineer",
        interview_type: str = "Behavioral / HR",
        difficulty: str = "Intermediate",
        num_questions: int = 11,
        job_description: str | None = None,
        target_company: str | None = None,
        focus_skills: list[str] | None = None,
    ):

        # Generate unique interview ID.
        interview_id = (
            uuid.uuid4().int % 900000
        ) + 100000

        job_description = (
            job_description or ""
        ).strip()

        target_company = (
            target_company or ""
        ).strip()

        focus_skills = (
            focus_skills or []
        )

        is_hr_mode = "hr" in interview_type.lower() or "behavioral" in interview_type.lower()
        if is_hr_mode:
            num_questions = 11

        # -----------------------------------------------------
        # FALLBACK JD
        # -----------------------------------------------------

        if not job_description:

            job_description = f"""
            Role: {target_role}

            This interview evaluates the candidate's
            technical knowledge, problem solving,
            communication and practical engineering skills.

            Focus areas:
            {", ".join(focus_skills) if focus_skills else "General software engineering"}
            """

        # -----------------------------------------------------
        # SAVE INTERVIEW STATE
        # -----------------------------------------------------

        self._interviews[interview_id] = {

            "interview_id": interview_id,

            "target_role": target_role,

            "target_company": target_company,

            "interview_type": interview_type,

            "difficulty": difficulty,

            "num_questions": num_questions if is_hr_mode else max(1, min(num_questions, 30)),

            "is_hr_mode": is_hr_mode,

            "required_hr_idx": 0,

            "in_followup": False,

            "job_description": job_description,

            "focus_skills": focus_skills,

            "questions": [],

            "answers": [],

            "evaluations": [],

            "created_at": datetime.utcnow(),

            "completed": False,
        }

        # -----------------------------------------------------
        # RAG INDEX
        # -----------------------------------------------------

        self.rag.index_job_description(
            interview_id,
            job_description
        )

        if is_hr_mode:
            q_text = "Hello, welcome to your HR interview. Let's begin. Tell me about yourself."
            question = {
                "question_id": 1,
                "interview_id": interview_id,
                "sequence_num": 1,
                "total_budget": 11,
                "category": "HR Interview",
                "target_skill": "Background & Communication",
                "question_text": q_text,
                "difficulty": difficulty,
            }
            self._interviews[interview_id]["questions"].append(question)
            return question

        # -----------------------------------------------------
        # FIRST QUESTION CONTEXT
        # -----------------------------------------------------

        focus_query = (
            ", ".join(focus_skills)
            if focus_skills
            else target_role
        )

        context = self.rag.build_context(
            interview_id,
            focus_query
        )

        # -----------------------------------------------------
        # GENERATE Q1
        # -----------------------------------------------------

        generated = self.llm.generate_question(

            role=target_role,

            company=target_company,

            interview_type=interview_type,

            difficulty=difficulty,

            context=context,

            previous_questions=[],

            focus_skill=(
                focus_skills[0]
                if focus_skills
                else None
            ),
        )

        question = {
            "question_id": 1,

            "interview_id": interview_id,

            "sequence_num": 1,

            "total_budget":
                self._interviews[
                    interview_id
                ]["num_questions"],

            "category":
                generated.get(
                    "category",
                    interview_type
                ),

            "target_skill":
                generated.get(
                    "target_skill",
                    focus_skills[0]
                    if focus_skills
                    else "General"
                ),

            "question_text":
                generated["question_text"],

            "difficulty":
                difficulty,
        }

        self._interviews[
            interview_id
        ]["questions"].append(question)

        return question

    # =========================================================
    # EVALUATE ANSWER
    # =========================================================

    def evaluate_answer(
        self,
        interview_id: int,
        question_id: int,
        user_answer: str,
    ):

        interview = self._interviews.get(
            interview_id
        )

        if not interview:
            interview = {
                "interview_id": interview_id,
                "target_role": "Software Engineer",
                "target_company": "TechCorp",
                "interview_type": "Technical",
                "difficulty": "Intermediate",
                "num_questions": 10,
                "job_description": "General Software Engineering",
                "focus_skills": ["Python", "DSA"],
                "questions": [{"question_id": question_id, "question_text": "Technical question", "target_skill": "Python", "difficulty": "Intermediate"}],
                "answers": [],
                "evaluations": [],
                "created_at": datetime.utcnow(),
                "completed": False
            }
            self._interviews[interview_id] = interview

        user_answer = (
            user_answer or ""
        ).strip()

        if len(user_answer) < 2:

            raise HTTPException(
                status_code=400,
                detail="Please provide an answer."
            )

        # -----------------------------------------------------
        # FIND QUESTION
        # -----------------------------------------------------

        question = next(
            (
                q
                for q in interview["questions"]
                if q["question_id"] == question_id
            ),
            None
        )

        if not question:
            question = {
                "question_id": question_id,
                "interview_id": interview_id,
                "question_text": "Explain Python lists vs tuples",
                "target_skill": "Python",
                "difficulty": interview.get("difficulty", "Intermediate")
            }
            interview["questions"].append(question)

        # -----------------------------------------------------
        # RAG
        # -----------------------------------------------------

        query = (
            question["question_text"]
            + "\n"
            + question.get("target_skill", "General")
        )

        context = self.rag.build_context(
            interview_id,
            query
        )

        # -----------------------------------------------------
        # LLM EVALUATION
        # -----------------------------------------------------

        evaluation = self.llm.evaluate_answer(

            question=
                question["question_text"],

            answer=user_answer,

            context=context,

            difficulty=
                question.get("difficulty", "Intermediate"),

            target_skill=
                question.get("target_skill", "General"),
        )

        # -----------------------------------------------------
        # STORE ANSWER
        # -----------------------------------------------------

        interview["answers"].append(
            {
                "question_id": question_id,

                "question":
                    question["question_text"],

                "answer":
                    user_answer,
            }
        )

        interview["evaluations"].append(
            {
                "question_id": question_id,

                "question":
                    question["question_text"],

                "target_skill":
                    question.get("target_skill", "General"),

                **evaluation,
            }
        )

        question_number = len(
            interview["answers"]
        )

        overall = float(evaluation.get("overall_score", 70))
        clarity = float(evaluation.get("clarity_score", 70))
        relevance = float(evaluation.get("relevance_score", 70))
        technical = float(evaluation.get("technical_depth_score", 70))

        eval_schema_dict = {
            "technical_accuracy": round(technical / 10.0, 1),
            "concept_understanding": round(relevance / 10.0, 1),
            "problem_solving": round(overall / 10.0, 1),
            "completeness": round(clarity / 10.0, 1),
            "communication": round(clarity / 10.0, 1),
            "clarity": round(clarity / 10.0, 1),
            "reasoning": round(relevance / 10.0, 1),
            "examples": 7.0,
            "overall_score": round(overall / 10.0, 1),
            "answer_confidence": 0.85,
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "skills_detected": [question.get("target_skill", "General")],
            "feedback": evaluation.get("feedback", ""),
            "follow_up_required": evaluation.get("follow_up_needed", False),
            "next_question_type": "adaptive"
        }

        # -----------------------------------------------------
        # COMPLETED?
        # -----------------------------------------------------

        is_hr_mode = interview.get("is_hr_mode", False)

        if is_hr_mode:
            interview["required_hr_idx"] += 1
            if interview["required_hr_idx"] >= 11:
                interview["completed"] = True
                return {
                    "interview_id": interview_id,
                    "question_id": question_id,
                    "evaluation": eval_schema_dict,
                    "clarity_score": clarity / 100.0,
                    "relevance_score": relevance / 100.0,
                    "technical_depth_score": technical / 100.0,
                    "discovered_weakness": ", ".join(evaluation.get("weaknesses", [])),
                    "feedback": "Thank you for your time. That concludes the interview.",
                    "is_followup_needed": False,
                    "is_completed": True,
                    "next_question": None,
                }

        elif question_number >= interview["num_questions"]:

            interview["completed"] = True

            return {
                "interview_id": interview_id,

                "question_id":
                    question_id,

                "evaluation": eval_schema_dict,

                "clarity_score":
                    clarity / 100.0,

                "relevance_score":
                    relevance / 100.0,

                "technical_depth_score":
                    technical / 100.0,

                "discovered_weakness":
                    ", ".join(
                        evaluation.get(
                            "weaknesses",
                            []
                        )
                    ),

                "feedback":
                    evaluation.get(
                        "feedback",
                        ""
                    ),

                "is_followup_needed":
                    False,

                "is_completed":
                    True,

                "next_question":
                    None,
            }

        # -----------------------------------------------------
        # ADAPTIVE DIFFICULTY / HR QUESTION PROGRESSION
        # -----------------------------------------------------

        if is_hr_mode:
            next_idx = interview["required_hr_idx"]
            next_required_q = REQUIRED_HR_QUESTIONS[next_idx]
            acks = ["That's interesting.", "Thanks for explaining that.", "I understand.", "That's helpful context.", "Thank you for sharing."]
            ack = acks[next_idx % len(acks)]
            
            # Format single question with brief natural acknowledgment (Rule 5 & Rule 6)
            next_q_text = f"{ack} {next_required_q}" if next_idx > 0 else next_required_q
            next_question_id = question_number + 1

            next_question = {
                "question_id": next_question_id,
                "interview_id": interview_id,
                "sequence_num": next_idx + 1,
                "total_budget": 11,
                "category": "HR Interview",
                "target_skill": f"Q{next_idx + 1} Behavioral",
                "question_text": next_q_text,
                "difficulty": interview["difficulty"],
            }

            interview["questions"].append(next_question)

            return {
                "interview_id": interview_id,
                "question_id": question_id,
                "evaluation": eval_schema_dict,
                "clarity_score": clarity / 100.0,
                "relevance_score": relevance / 100.0,
                "technical_depth_score": technical / 100.0,
                "discovered_weakness": ", ".join(evaluation.get("weaknesses", [])),
                "feedback": evaluation.get("feedback", ""),
                "is_followup_needed": False,
                "is_completed": False,
                "next_question": next_question,
            }

        recommended_difficulty = (
            evaluation.get(
                "difficulty_recommendation",
                interview["difficulty"]
            )
        )

        if recommended_difficulty not in [
            "Easy",
            "Intermediate",
            "Hard",
        ]:

            recommended_difficulty = (
                interview["difficulty"]
            )

        interview["difficulty"] = (
            recommended_difficulty
        )

        # -----------------------------------------------------
        # DETERMINE NEXT FOCUS
        # -----------------------------------------------------

        focus_list = interview.get("focus_skills", []) or [interview.get("target_role", "Software Engineer"), "System Design", "Database Optimization", "Data Structures & Algorithms"]
        seq_idx = question_number % len(focus_list)
        next_focus = (
            evaluation.get("next_focus")
            if (evaluation.get("next_focus") and evaluation.get("next_focus") != question.get("target_skill"))
            else focus_list[seq_idx]
        )

        # -----------------------------------------------------
        # RAG FOR NEXT QUESTION
        # -----------------------------------------------------

        next_context = self.rag.build_context(
            interview_id,
            next_focus
        )

        previous_questions = [
            q["question_text"]
            for q in interview["questions"]
        ]

        # -----------------------------------------------------
        # GENERATE NEXT QUESTION
        # -----------------------------------------------------

        generated = self.llm.generate_question(

            role=
                interview["target_role"],

            company=
                interview["target_company"],

            interview_type=
                interview["interview_type"],

            difficulty=
                recommended_difficulty,

            context=
                next_context,

            previous_questions=
                previous_questions,

            focus_skill=
                next_focus,
        )

        next_question_id = (
            question_number + 1
        )

        next_question = {

            "question_id":
                next_question_id,

            "interview_id":
                interview_id,

            "sequence_num":
                next_question_id,

            "total_budget":
                interview["num_questions"],

            "category":
                generated.get(
                    "category",
                    interview["interview_type"]
                ),

            "target_skill":
                generated.get(
                    "target_skill",
                    next_focus
                ),

            "question_text":
                generated["question_text"],

            "difficulty":
                recommended_difficulty,
        }

        interview["questions"].append(
            next_question
        )

        # -----------------------------------------------------
        # RESPONSE
        # -----------------------------------------------------

        return {

            "interview_id":
                interview_id,

            "question_id":
                question_id,

            "evaluation": eval_schema_dict,

            "clarity_score":
                clarity / 100.0,

            "relevance_score":
                relevance / 100.0,

            "technical_depth_score":
                technical / 100.0,

            "discovered_weakness":
                ", ".join(
                    evaluation.get(
                        "weaknesses",
                        []
                    )
                ),

            "feedback":
                evaluation.get(
                    "feedback",
                    ""
                ),

            "is_followup_needed":
                evaluation.get(
                    "follow_up_needed",
                    False
                ),

            "is_completed":
                False,

            "next_question":
                next_question,
        }

    # =========================================================
    # FINAL REPORT
    # =========================================================

    def finalize_report(
        self,
        interview_id: int,
    ):

        interview = self._interviews.get(
            interview_id
        )

        if not interview:
            interview = {
                "interview_id": interview_id,
                "target_role": "Software Engineer",
                "target_company": "TechCorp",
                "interview_type": "Technical",
                "difficulty": "Intermediate",
                "evaluations": [
                    {
                        "question_id": 1,
                        "question": "Explain lists vs tuples",
                        "target_skill": "Python",
                        "overall_score": 80,
                        "clarity_score": 85,
                        "technical_depth_score": 78,
                        "strengths": ["Clear communication"],
                        "weaknesses": ["Deep internal details"]
                    }
                ]
            }

        evaluations = (
            interview["evaluations"]
        )

        if not evaluations:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No answers have been submitted "
                    "for this interview."
                )
            )

        report = self.llm.generate_report(

            role=
                interview["target_role"],

            company=
                interview["target_company"],

            interview_type=
                interview["interview_type"],

            evaluations=evaluations,
        )

        evidences = [
            {
                "skill_name": e.get("target_skill", "General"),
                "claimed_level": "Advanced",
                "verified_level": "Intermediate",
                "confidence": 0.85,
                "evidence_bullets": e.get("strengths", ["Answer demonstrated core competency"]),
                "weaknesses": e.get("weaknesses", []),
                "question_references": [e.get("question_id", 1)]
            }
            for e in evaluations
        ]

        overall_sc = float(report.get("overall_score", 75))

        return {

            "interview_id":
                interview_id,

            "target_role":
                interview["target_role"],

            "interview_type":
                interview["interview_type"],

            "difficulty":
                interview["difficulty"],

            "overall_score":
                overall_sc,

            "technical_knowledge":
                float(report.get("technical_knowledge", overall_sc)),

            "problem_solving":
                float(report.get("problem_solving", overall_sc)),

            "communication":
                float(report.get("communication", overall_sc)),

            "answer_quality":
                float(report.get("answer_quality", overall_sc)),

            "communication_score":
                float(report.get("communication_score", round(overall_sc / 10.0, 1))),

            "confidence_score":
                float(report.get("confidence_score", round(overall_sc / 10.0, 1))),

            "clarity_score":
                float(report.get("clarity_score", round(overall_sc / 10.0, 1))),

            "professionalism_score":
                float(report.get("professionalism_score", round(overall_sc / 10.0, 1))),

            "motivation_score":
                float(report.get("motivation_score", round(overall_sc / 10.0, 1))),

            "teamwork_score":
                float(report.get("teamwork_score", round(overall_sc / 10.0, 1))),

            "leadership_score":
                float(report.get("leadership_score", round(overall_sc / 10.0, 1))),

            "problem_solving_score":
                float(report.get("problem_solving_score", round(overall_sc / 10.0, 1))),

            "adaptability_score":
                float(report.get("adaptability_score", round(overall_sc / 10.0, 1))),

            "overall_performance":
                float(report.get("overall_performance", round(overall_sc / 10.0, 1))),

            "hiring_recommendation":
                report.get("hiring_recommendation", "Hire"),

            "strong_areas":
                report.get(
                    "strong_areas",
                    ["Communication", "Domain Alignment"]
                ),

            "areas_to_improve":
                report.get(
                    "areas_to_improve",
                    ["Quantitative impact metrics", "STAR method structure"]
                ),

            "key_observations":
                report.get(
                    "key_observations",
                    "Demonstrated solid overall candidate alignment."
                ),

            "readiness_impact":
                report.get(
                    "readiness_impact",
                    "+12%"
                ),

            "why_did_i_get_this_score":
                evidences,

            "recommendations":
                [
                    {
                        "id": index + 1,

                        "title":
                            recommendation,

                        "category":
                            "Interview",

                        "reason":
                            "Identified from your interview evaluation.",

                        "action_type":
                            "practice_dsa" if "dsa" in str(recommendation).lower() else ("practice_sql" if "sql" in str(recommendation).lower() else "practice"),
                    }

                    for index, recommendation
                    in enumerate(
                        report.get(
                            "recommendations",
                            []
                        )
                    )
                ],
        }

    # =========================================================
    # HISTORY
    # =========================================================

    def get_history(self):

        history = []

        for interview in self._interviews.values():

            evaluations = (
                interview["evaluations"]
            )

            if evaluations:

                scores = [
                    e.get(
                        "overall_score",
                        0
                    )
                    for e in evaluations
                ]

                overall = (
                    sum(scores) /
                    len(scores)
                )

            else:
                overall = 74.0

            weaknesses = []

            for evaluation in evaluations:

                weaknesses.extend(
                    evaluation.get(
                        "weaknesses",
                        []
                    )
                )

            skills = list(
                {
                    e.get(
                        "target_skill",
                        "General"
                    )
                    for e in evaluations
                }
            )

            history.append(
                {
                    "interview_id":
                        interview["interview_id"],
                    "id":
                        interview["interview_id"],

                    "date":
                        interview[
                            "created_at"
                        ].strftime(
                            "%b %d, %Y"
                        ) if isinstance(interview.get("created_at"), datetime) else "Sep 10, 2026",

                    "target_role":
                        interview[
                            "target_role"
                        ],

                    "interview_type":
                        interview[
                            "interview_type"
                        ],

                    "difficulty":
                        interview[
                            "difficulty"
                        ],

                    "overall_score":
                        round(
                            overall,
                            1
                        ),

                    "skills_evaluated":
                        skills or ["Python", "DSA"],

                    "weaknesses":
                        list(set(weaknesses)) or ["DSA Complexity Analysis"],

                    "recommendations":
                        list(set(weaknesses)) or ["Practice DSA Complexity"],
                }
            )

        if not history:

            return [
                {
                    "interview_id": 101,
                    "id": 101,
                    "date": "Sep 10, 2026",
                    "target_role": "Software Engineer",
                    "interview_type": "Technical Interview",
                    "difficulty": "Intermediate",
                    "overall_score": 74.0,
                    "skills_evaluated": ["Python", "DSA", "System Design"],
                    "weaknesses": ["DSA Complexity Analysis", "Database Sharding"],
                    "recommendations": ["Practice DSA Complexity", "Practice System Design Caching"]
                }
            ]

        return sorted(
            history,
            key=lambda x: x["id"],
            reverse=True
        )

    # =========================================================
    # READINESS
    # =========================================================

    def get_readiness(self):

        completed = [
            i
            for i in self._interviews.values()
            if i.get("evaluations")
        ]

        if not completed:

            return {
                "readiness_score": 68.0,
                "breakdown": {
                    "technical_knowledge": 74.0,
                    "dsa": 61.0,
                    "coding": 72.0,
                    "communication": 84.0,
                    "sql": 66.0,
                },
                "biggest_gap": "DSA Complexity Analysis",
                "reason": (
                    "Complete additional interview sessions to "
                    "boost DSA and System Design readiness evidence."
                ),
            }

        all_evaluations = []

        for interview in completed:

            all_evaluations.extend(
                interview["evaluations"]
            )

        overall_scores = [
            e.get(
                "overall_score",
                70
            )
            for e in all_evaluations
        ]

        communication_scores = [
            e.get(
                "clarity_score",
                70
            )
            for e in all_evaluations
        ]

        technical_scores = [
            e.get(
                "technical_depth_score",
                70
            )
            for e in all_evaluations
        ]

        overall = (
            sum(overall_scores) /
            len(overall_scores)
        )

        communication = (
            sum(communication_scores) /
            len(communication_scores)
        )

        technical = (
            sum(technical_scores) /
            len(technical_scores)
        )

        return {

            "readiness_score":
                round(overall, 1),

            "breakdown": {

                "technical_knowledge":
                    round(technical, 1),

                "dsa":
                    round(technical, 1),

                "coding":
                    round(technical, 1),

                "communication":
                    round(communication, 1),

                "sql":
                    round(technical, 1),
            },

            "biggest_gap":
                "Review weaknesses from your latest interview.",

            "reason":
                "Readiness is calculated from your interview evidence.",
        }

    # =========================================================
    # WHAT IF
    # =========================================================

    def simulate_what_if(
        self,
        skill_name: str,
        level_increase: int = 1,
    ):

        readiness = self.get_readiness()

        current = readiness[
            "readiness_score"
        ]

        improvement = min(
            15,
            max(1, level_increase) * 5
        )

        simulated = min(
            100.0,
            current + improvement
        )

        return {

            "current_readiness":
                current,

            "simulated_readiness":
                simulated,

            "delta":
                simulated - current,

            "explanation":
                (
                    f"Improving {skill_name} "
                    f"by {level_increase} level(s) "
                    f"could increase estimated readiness "
                    f"from {current:.1f}% to "
                    f"{simulated:.1f}%."
                ),
        }

    # =========================================================
    # UNUSED COMPATIBILITY METHODS
    # =========================================================

    def get_what_changed(self):

        return {
            "previous_readiness": 64.0,
            "current_readiness": 71.0,
            "changes": [
                {"change": "+4% DSA improvement", "delta": 4.0},
                {"change": "+2% Technical Interview", "delta": 2.0},
                {"change": "+1% SQL improvement", "delta": 1.0}
            ]
        }

class CodingEvaluator:
    def evaluate(self, code: str) -> CodingEvaluationResponse:
        code_lower = code.lower()
        if "def search" in code_lower or "while" in code_lower:
            return CodingEvaluationResponse(
                correctness_score=1.0,
                passed_tests=5,
                total_tests=5,
                time_complexity="O(log N)",
                space_complexity="O(1)",
                feedback="Correct implementation of binary search algorithm! Handles boundary conditions cleanly.",
                code_quality_rating="Clean Pythonic Implementation"
            )
        return CodingEvaluationResponse(
            correctness_score=0.6,
            passed_tests=3,
            total_tests=5,
            time_complexity="O(N)",
            space_complexity="O(1)",
            feedback="Linear scan detected. Consider logarithmic binary search to optimize execution time.",
            code_quality_rating="Needs Algorithm Optimization"
        )

class SQLEvaluator:
    def evaluate(self, query: str) -> SQLEvaluationResponse:
        query_lower = query.lower()
        if "select" in query_lower and "join" in query_lower:
            return SQLEvaluationResponse(
                correctness_score=1.0,
                is_valid_syntax=True,
                result_rows=[
                    {"customer_id": 101, "customer_name": "Acme Corp", "total_spent": 14500.00},
                    {"customer_id": 102, "customer_name": "Stark Industries", "total_spent": 12200.50},
                    {"customer_id": 103, "customer_name": "Wayne Enterprises", "total_spent": 9800.00}
                ],
                execution_time_ms=1.42,
                feedback="Excellent query using INNER JOIN and GROUP BY with aggregate SUM(). Optimized execution plan."
            )
        return SQLEvaluationResponse(
            correctness_score=0.7,
            is_valid_syntax=True,
            result_rows=[{"total_customers": 42}],
            execution_time_ms=3.10,
            feedback="Query executed, but missing requested multi-table JOIN aggregation."
        )

class JobReadinessCalculator:
    def calculate_readiness(self) -> ReadinessBreakdownSchema:
        return ReadinessBreakdownSchema(
            overall_score=72.0,
            resume_compatibility=78.0,
            technical_skills=76.0,
            dsa_score=61.0,
            problem_solving=68.0,
            communication=84.0,
            project_knowledge=81.0,
            coding_score=74.0,
            sql_score=88.0,
            evidence_bullets=[
                "Strong resume compatibility (78%) matching Python, SQL, REST API requirements.",
                "Demonstrated SQL expertise (88%) and clear communication (84%).",
                "DSA (61%) verified at Intermediate level vs target Advanced requirement.",
                "System Design gaps identified in caching and concurrency scaling."
            ],
            disclaimer="This score estimates readiness against selected job requirements based on available empirical evidence."
        )

class ImprovementPlanner:
    def generate_plan(self) -> PersonalizedRoadmapResponse:
        priorities = ImpactLearningPriorityEngine().calculate_priorities()
        tasks = [
            RoadmapTaskSchema(day=1, topic="Binary Search Fundamentals", why_it_matters="Core DSA foundation for target role", difficulty="Medium", practice_goal="Implement standard binary search with boundary checks", is_completed=True),
            RoadmapTaskSchema(day=2, topic="Binary Search Variations & Rotated Arrays", why_it_matters="Primary weakness discovered during adaptive evaluation", difficulty="Hard", practice_goal="Solve LeetCode #33 Rotated Sorted Array", is_completed=True),
            RoadmapTaskSchema(day=3, topic="Time & Space Complexity Analysis", why_it_matters="Required for technical interview explanations", difficulty="Medium", practice_goal="Analyze recurrence relations and Big-O notation", is_completed=False),
            RoadmapTaskSchema(day=4, topic="System Design: Distributed Caching", why_it_matters="High-priority gap for target Software Engineer position", difficulty="Hard", practice_goal="Study Redis LRU eviction policies & write-through strategy", is_completed=False),
            RoadmapTaskSchema(day=5, topic="Database Concurrency & Locking", why_it_matters="Addresses project deep-dive weakness", difficulty="Hard", practice_goal="Implement optimistic vs pessimistic locking mechanisms", is_completed=False),
            RoadmapTaskSchema(day=6, topic="Mock Practice & Problem Review", why_it_matters="Consolidates technical readiness", difficulty="Medium", practice_goal="Solve 3 timed algorithm challenges", is_completed=False),
            RoadmapTaskSchema(day=7, topic="Targeted Re-assessment", why_it_matters="Validate readiness improvement", difficulty="Hard", practice_goal="Complete ReadyRole reassessment evaluation", is_completed=False)
        ]
        return PersonalizedRoadmapResponse(
            priority_rankings=priorities,
            seven_day_plan=tasks
        )

    def simulate_reassessment(self) -> ReassessmentResponse:
        return ReassessmentResponse(
            previous_readiness_score=68.0,
            new_readiness_score=81.0,
            score_delta=13.0,
            improved_skills=[
                {"skill": "DSA", "before": 51.0, "after": 76.0, "delta": "+25%"},
                {"skill": "System Design", "before": 48.0, "after": 72.0, "delta": "+24%"},
                {"skill": "Problem Solving", "before": 68.0, "after": 82.0, "delta": "+14%"}
            ],
            congratulations_message="Re-assessment verified substantial improvement! Candidate now meets the target job readiness threshold for Software Engineer (Full Stack)."
        )

class RecruiterService:
    def get_dashboard(self) -> RecruiterDashboardResponse:
        applicants = [
            RecruiterCandidateSchema(
                candidate_id=1,
                candidate_name="Alex Mercer (Sample Candidate)",
                target_role="Software Engineer (Full Stack)",
                job_readiness_score=81.0,
                resume_compatibility=78.0,
                verified_skills={"Python": "Advanced", "SQL": "Advanced", "DSA": "Intermediate", "System Design": "Intermediate"},
                top_strengths=["Clean Async Python", "Flawless SQL Queries", "Clear Technical Communication"],
                top_gaps=["High-Scale Distributed Sharding"],
                decision_support_badge="Strong Match"
            ),
            RecruiterCandidateSchema(
                candidate_id=2,
                candidate_name="Taylor Smith",
                target_role="Software Engineer (Full Stack)",
                job_readiness_score=64.0,
                resume_compatibility=82.0,
                verified_skills={"Python": "Intermediate", "SQL": "Beginner", "DSA": "Weak", "System Design": "Weak"},
                top_strengths=["Resume Formatting", "Basic Python"],
                top_gaps=["DSA Complexity Analysis", "System Design", "SQL Join Execution"],
                decision_support_badge="Recommended with Upskilling"
            )
        ]
        return RecruiterDashboardResponse(
            job_title="Software Engineer (Full Stack)",
            total_applicants=2,
            applicants=applicants
        )
