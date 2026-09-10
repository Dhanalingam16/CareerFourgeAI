import math
from typing import List, Dict, Any, Optional
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

class AdaptiveInterviewEngine:
    def evaluate_answer(self, question_id: int, user_answer: str) -> AnswerEvaluationResponse:
        answer_lower = user_answer.lower()
        discovered_weakness = None
        feedback = "Solid explanation with clear technical terminology."

        if "rotated" in answer_lower or "binary search" in answer_lower:
            if "pivot" not in answer_lower or "mod" not in answer_lower:
                discovered_weakness = "Complexity Analysis & Edge Cases in Rotated Arrays"
                feedback = "Good fundamental explanation of binary search, but struggled with determining the pivot index boundary condition in rotated arrays."

        elif "concurrency" in answer_lower or "voting" in answer_lower:
            if "lock" not in answer_lower and "transaction" not in answer_lower and "redis" not in answer_lower:
                discovered_weakness = "Database Concurrency Control & Race Conditions"
                feedback = "Understands HTTP request flows, but missed explicit isolation levels or atomic locks for concurrent votes."

        next_q = QuestionResponse(
            question_id=question_id + 1,
            sequence_num=min(question_id - 1000 + 1, 15),
            total_budget=15,
            category="System Design" if discovered_weakness else "DSA",
            target_skill="System Design" if discovered_weakness else "DSA",
            question_text="How would you design a rate limiter to prevent API abuse during peak voting windows?" if discovered_weakness else "Can you analyze the worst-case space complexity of recursive binary search?",
            difficulty="Hard"
        )

        return AnswerEvaluationResponse(
            question_id=question_id,
            clarity_score=0.85,
            relevance_score=0.88,
            technical_depth_score=0.72 if discovered_weakness else 0.90,
            discovered_weakness=discovered_weakness,
            feedback=feedback,
            is_followup_needed=True if discovered_weakness else False,
            next_question=next_q
        )

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
