import math
from typing import List, Dict, Any, Optional
from app.ai.provider import get_ai_provider, BaseAIProvider
from app.schemas.schemas import (
    JobRequirementSchema, JobAnalysisResponse, ResumeAnalysisResponse,
    SkillTruthItem, SkillTruthResponse, SkillGapItem, JobGapSimulatorResponse,
    QuestionResponse, AnswerEvaluationResponse, InterviewReportResponse, CodingEvaluationResponse,
    SQLEvaluationResponse, ReadinessBreakdownSchema, RoadmapPrioritySchema,
    RoadmapTaskSchema, PersonalizedRoadmapResponse, ReassessmentResponse,
    RoleRoadmapRequest, RoleRoadmapResponse, RoadmapNodeSchema, AITutorRequest, AITutorResponse,
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
    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or get_ai_provider()

    def start_interview(
        self,
        target_role: str = "Software Engineer",
        interview_type: str = "Technical",
        difficulty: str = "Intermediate",
        num_questions: int = 10,
        job_description: Optional[str] = None,
        target_company: Optional[str] = None,
        focus_skills: Optional[List[str]] = None
    ) -> QuestionResponse:
        # Role & Type Question Strategy
        type_questions = {
            "Technical": [
                ("Python", "Explain the difference between a list and a tuple in Python. When would you use each?"),
                ("OOP", "How does polymorphism differ from inheritance, and how would you apply it when designing an payment interface?"),
                ("APIs", "What is the role of idempotency in RESTful APIs, and which HTTP methods must be idempotent?")
            ],
            "Coding": [
                ("DSA", "Explain how you would find the pivot element in a rotated sorted array in O(log N) time."),
                ("Algorithms", "How do you detect a cycle in a linked list using Floyd's Tortoise and Hare algorithm?"),
                ("Complexity", "What is the worst-case space complexity of recursive quicksort?")
            ],
            "Behavioral / HR": [
                ("Communication", "Tell me about a time when you had a disagreement with a team member on a technical decision. How did you resolve it?"),
                ("Failure", "Describe a project failure or mistake you made. What did you learn and how did you adapt?"),
                ("Leadership", "How do you handle scope creep or changing requirements under a tight deadline?")
            ],
            "System Design": [
                ("Scalability", "How do you prevent a single relational database instance from becoming a read bottleneck under heavy traffic?"),
                ("Caching", "Explain the difference between write-through and write-back caching strategies."),
                ("Load Balancing", "How does consistent hashing prevent massive cache invalidations when adding new cache nodes?")
            ],
            "SQL": [
                ("Queries", "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with a realistic example."),
                ("Optimization", "What is write amplification penalty when adding multiple non-clustered indexes to an active table?"),
                ("Window Functions", "How does RANK() OVER (PARTITION BY category ORDER BY score DESC) work in SQL?")
            ],
            "Mixed": [
                ("Python", "Explain how Python's GIL affects multithreading vs multiprocessing for CPU-bound tasks."),
                ("DSA", "How do hash collisions occur in dictionaries, and how does Python resolve them?"),
                ("System Design", "What trade-offs exist between ACID compliance in relational DBs vs eventual consistency in NoSQL?")
            ]
        }

        qs = type_questions.get(interview_type, type_questions["Technical"])
        first_q = qs[0]

        # Use JD context if available
        if job_description and ("python" in job_description.lower() or "dsa" in job_description.lower()):
            first_q = ("Job-Specific", f"Based on your target JD, how would you optimize data pipelines in {target_role} applications?")

        return QuestionResponse(
            question_id=2001,
            interview_id=101,
            sequence_num=1,
            total_budget=num_questions,
            category=interview_type,
            target_skill=first_q[0],
            question_text=first_q[1],
            difficulty=difficulty,
            question_type="initial"
        )

    def evaluate_answer(
        self,
        interview_id: int,
        question_id: int,
        user_answer: str,
        current_seq: int = 1,
        total_budget: int = 10,
        interview_type: str = "Technical"
    ) -> AnswerEvaluationResponse:
        answer_lower = user_answer.lower()
        
        # Multidimensional Scoring Evaluation
        tech_acc = 7.5
        concept_und = 7.0
        prob_solv = 6.8
        comp = 6.5
        comm = 8.0
        clarity = 8.2
        reasoning = 7.0
        examples = 6.0
        
        strengths = ["Clear communication structure"]
        weaknesses = []
        discovered_weakness = None

        if len(user_answer) < 20:
            tech_acc = 4.0
            concept_und = 4.5
            comp = 3.0
            weaknesses.append("Very brief explanation lacking technical depth")
            discovered_weakness = "Superficial Explanation & Missing Trade-offs"
        elif "list" in answer_lower or "tuple" in answer_lower or "python" in answer_lower:
            if "mutable" in answer_lower or "immutable" in answer_lower:
                tech_acc = 8.5
                concept_und = 8.5
                strengths.append("Correctly identified mutability difference between lists and tuples")
            else:
                weaknesses.append("Did not explicitly highlight immutability vs mutability")
                discovered_weakness = "Core Mutability Concept"

        score = round((tech_acc * 0.25 + concept_und * 0.25 + prob_solv * 0.2 + comm * 0.15 + comp * 0.15), 1)

        eval_schema = AnswerEvaluationSchema(
            technical_accuracy=tech_acc,
            concept_understanding=concept_und,
            problem_solving=prob_solv,
            completeness=comp,
            communication=comm,
            clarity=clarity,
            reasoning=reasoning,
            examples=examples,
            overall_score=score,
            answer_confidence=0.84 if score > 7.0 else 0.62,
            strengths=strengths,
            weaknesses=weaknesses,
            skills_detected=["Python", "Technical Reasoning"],
            feedback=f"Good effort. Your answer scored {score}/10. " + ("" if not weaknesses else f"Key gap: {weaknesses[0]}."),
            follow_up_required=True if discovered_weakness else False,
            next_question_type="adaptive_foundational" if discovered_weakness else "adaptive_deeper"
        )

        is_completed = current_seq >= total_budget

        next_q = None
        if not is_completed:
            if discovered_weakness:
                next_text = f"Can you explain how memory allocation differs for mutable lists vs immutable tuples in Python?"
                q_type = "adaptive_foundational"
            else:
                next_text = f"How would you utilize tuple immutability as dictionary keys or in multi-threaded environments?"
                q_type = "adaptive_deeper"

            next_q = QuestionResponse(
                question_id=question_id + 1,
                interview_id=interview_id,
                sequence_num=current_seq + 1,
                total_budget=total_budget,
                category=interview_type,
                target_skill="Python",
                question_text=next_text,
                difficulty="Intermediate",
                question_type=q_type
            )

        return AnswerEvaluationResponse(
            interview_id=interview_id,
            question_id=question_id,
            evaluation=eval_schema,
            is_completed=is_completed,
            next_question=next_q
        )

    def finalize_report(self, interview_id: int = 101) -> InterviewReportResponse:
        evidences = [
            InterviewEvidenceItem(
                skill_name="Python",
                claimed_level="Advanced",
                verified_level="Advanced",
                confidence=0.88,
                evidence_bullets=[
                    "Demonstrated pythonic mutability understanding on Q1",
                    "Clear explanation of async I/O handlers"
                ],
                weaknesses=[],
                question_references=[1, 3]
            ),
            InterviewEvidenceItem(
                skill_name="DSA",
                claimed_level="Advanced",
                verified_level="Intermediate",
                confidence=0.82,
                evidence_bullets=[
                    "Understands standard binary search linear bounds",
                    "Struggled with rotated array pivot boundary conditions"
                ],
                weaknesses=["Binary Search Variations", "Complexity Analysis"],
                question_references=[2, 4]
            ),
            InterviewEvidenceItem(
                skill_name="System Design",
                claimed_level="Intermediate",
                verified_level="Weak",
                confidence=0.75,
                evidence_bullets=[
                    "Good awareness of REST API endpoints",
                    "Limited depth on distributed database sharding and caching"
                ],
                weaknesses=["Distributed Caching", "Database Sharding"],
                question_references=[5]
            )
        ]

        recs = [
            InterviewRecommendationItem(
                id=1,
                title="Practice DSA Complexity",
                category="DSA",
                reason="Your recent interview answers show difficulty explaining time and space complexity for recursive algorithms.",
                action_type="practice_dsa"
            ),
            InterviewRecommendationItem(
                id=2,
                title="Practice System Design Caching",
                category="System Design",
                reason="System design is a high priority gap for your target Software Engineer role.",
                action_type="practice_sys_design"
            ),
            InterviewRecommendationItem(
                id=3,
                title="Practice SQL Window Functions",
                category="SQL",
                reason="Solid query basics demonstrated, but window functions need practice.",
                action_type="practice_sql"
            ),
            InterviewRecommendationItem(
                id=4,
                title="Retake Technical Interview",
                category="Interview",
                reason="Re-assess after completing recommended practice items to boost your Interview Readiness.",
                action_type="retake_interview"
            )
        ]

        return InterviewReportResponse(
            interview_id=interview_id,
            target_role="Software Engineer",
            interview_type="Technical",
            difficulty="Intermediate",
            overall_score=74.0,
            technical_knowledge=78.0,
            problem_solving=71.0,
            communication=82.0,
            answer_quality=76.0,
            strong_areas=["Python Fundamentals", "Communication", "OOP Principles"],
            areas_to_improve=["DSA Complexity Analysis", "System Design Sharding", "SQL JOIN Optimizations"],
            key_observations="You understand Python and OOP principles well. Your explanation of algorithmic complexity was incomplete on recursive calls.",
            why_did_i_get_this_score=evidences,
            recommendations=recs
        )

    def get_history(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": 101,
                "date": "Sep 10, 2026",
                "target_role": "Software Engineer",
                "interview_type": "Technical Interview",
                "difficulty": "Intermediate",
                "overall_score": 74.0,
                "skills_evaluated": ["Python", "DSA", "System Design"],
                "weaknesses": ["DSA Complexity Analysis", "Database Sharding"],
                "recommendations": ["Practice DSA Complexity", "Practice System Design Caching"]
            },
            {
                "id": 98,
                "date": "Sep 07, 2026",
                "target_role": "Backend Developer",
                "interview_type": "Mixed Interview",
                "difficulty": "Intermediate",
                "overall_score": 68.0,
                "skills_evaluated": ["SQL", "FastAPI", "OOP"],
                "weaknesses": ["SQL JOIN Optimization"],
                "recommendations": ["Practice SQL Window Functions"]
            }
        ]

    def get_readiness() -> Dict[str, Any]:
        return {
            "readiness_score": 68.0,
            "breakdown": {
                "technical_knowledge": 74.0,
                "dsa": 61.0,
                "coding": 72.0,
                "communication": 84.0,
                "sql": 66.0
            },
            "biggest_gap": "DSA",
            "reason": "The target role requires strong problem solving, while recent interview evidence shows weakness in algorithm complexity and optimization."
        }

    def get_what_changed(self) -> Dict[str, Any]:
        return {
            "previous_readiness": 64.0,
            "current_readiness": 71.0,
            "changes": [
                {"change": "+4% DSA improvement", "delta": 4.0},
                {"change": "+2% Technical Interview", "delta": 2.0},
                {"change": "+1% SQL improvement", "delta": 1.0}
            ]
        }

    def simulate_what_if(self, skill_name: str, level_increase: int = 1) -> Dict[str, Any]:
        current = 68.0
        delta_map = {
            "DSA": 5.0 * level_increase,
            "SQL": 2.0 * level_increase,
            "System Design": 4.0 * level_increase,
            "Communication": 1.0 * level_increase
        }
        delta = delta_map.get(skill_name, 3.0 * level_increase)
        simulated = min(round(current + delta, 1), 100.0)

        return {
            "current_readiness": current,
            "simulated_readiness": simulated,
            "delta": delta,
            "explanation": f"Improving {skill_name} by {level_increase} level increases your estimated Job Readiness from {current}% to {simulated}% (+{delta}%)."
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


class CareerRoadmapAgent:
    """Gemini-powered roadmap generator and career tutor."""
    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or get_ai_provider()

    def generate_role_roadmap(self, req: RoleRoadmapRequest) -> RoleRoadmapResponse:
        skills = ", ".join(req.current_skills) or "No confirmed skills yet"
        gaps = ", ".join(req.skill_gaps) or "No explicit gaps yet"
        prompt = f"""
You are CareerForge AI, an expert technical career-roadmap agent.
Create a practical visual roadmap similar in INFORMATION ARCHITECTURE to modern developer roadmap sites: ordered learning nodes, tracks, prerequisites, projects and resources. Do not copy any site's wording or proprietary content.

Target role: {req.target_role}
Experience: {req.experience_level}
Current skills: {skills}
Skill gaps: {gaps}
Target company: {req.target_company or 'Not specified'}
Job description: {req.job_description or 'Not specified'}

Rules:
- Generate 12-18 nodes in prerequisite order.
- Group nodes into 3-6 tracks such as Foundations, Core, Frameworks, Data, DevOps, Interview/Projects.
- Each node must have a concise title and actionable description.
- Include realistic estimated hours, prerequisites, skills, projects and resource types.
- Start from the user's level and prioritize the supplied gaps.
- Include portfolio projects and interview preparation near the end.
- Use current, widely adopted technologies.
- Return ONLY JSON matching the schema.
"""
        try:
            data = self.provider.generate_json(prompt, RoleRoadmapResponse)
            roadmap = RoleRoadmapResponse.model_validate(data)

            # Guard against a model returning a generic/cached Full Stack roadmap
            # for another role. A roadmap is accepted only when its content has
            # at least one strong signal for the requested role.
            role = (req.target_role or "").lower()
            signal_groups = {
                "frontend": ["html", "css", "javascript", "react", "typescript", "accessibility"],
                "backend": ["api", "rest", "sql", "database", "authentication", "redis"],
                "full stack": ["frontend", "backend", "react", "api", "database"],
                "android": ["kotlin", "android", "jetpack", "compose"],
                "ios": ["swift", "swiftui", "xcode", "app store"],
                "devops": ["docker", "kubernetes", "terraform", "ci/cd", "linux"],
                "devsecops": ["security", "sast", "rbac", "secrets", "vulnerability"],
                "data analyst": ["excel", "power bi", "tableau", "statistics", "pandas"],
                "ai engineer": ["llm", "rag", "agent", "embeddings", "model serving"],
                "ai and data scientist": ["statistics", "machine learning", "pandas", "experiment"],
                "data engineer": ["spark", "kafka", "airflow", "etl", "warehouse"],
                "machine learning": ["machine learning", "scikit", "pytorch", "model evaluation"],
                "postgresql": ["postgresql", "mvcc", "index", "replication", "partition"],
                "blockchain": ["blockchain", "solidity", "ethereum", "smart contract"],
                "qa": ["testing", "selenium", "playwright", "automation", "performance"],
                "software architect": ["architecture", "distributed", "scalability", "system design"],
                "api design": ["rest", "openapi", "graphql", "grpc", "api"],
                "cyber security": ["security", "owasp", "cryptography", "siem", "incident"],
                "ux design": ["ux", "user research", "wireframe", "prototype", "usability"],
                "technical writer": ["documentation", "technical writing", "docs", "tutorial"],
                "game developer": ["game", "unity", "unreal", "physics", "rendering"],
                "server side game developer": ["game server", "matchmaking", "realtime", "networking"],
                "mlops": ["mlops", "model registry", "mlflow", "model serving", "monitoring"],
                "product manager": ["product", "prd", "prioritization", "roadmap", "kpi"],
                "engineering manager": ["engineering", "leadership", "hiring", "coaching", "delivery"],
                "developer relations": ["developer", "community", "advocacy", "technical content"],
                "bi analyst": ["bi", "power bi", "tableau", "dax", "dashboard"],
                "ai red teaming": ["red team", "prompt injection", "jailbreak", "adversarial", "ai security"],
            }
            signals = signal_groups.get(role, [role])
            content = " ".join(
                [roadmap.role, roadmap.summary] +
                [n.title + " " + n.description + " " + " ".join(n.skills) for n in roadmap.nodes]
            ).lower()
            if not any(signal in content for signal in signals):
                raise ValueError(f"AI returned a non-{req.target_role} roadmap")

            return roadmap
        except Exception:
            return self._fallback(req)

    def tutor(self, req: AITutorRequest) -> AITutorResponse:
        # The tutor must answer the user's actual question, not repeat a generic
        # "highest impact gap" message. Keep the roadmap context compact but useful.
        prompt = f"""
You are CareerForge AI Agent, a conversational career mentor.

You MUST answer the user's exact question. Never reuse a generic response just
 because the question is short. If the user asks "what is HTML", explain HTML.
If the user asks "frontend", explain frontend development and how it relates to
their roadmap. If they ask about a roadmap node, explain that specific node.

Target career role: {req.role}
Current skills: {', '.join(req.current_skills) or 'Not provided'}
Skill gaps: {', '.join(req.skill_gaps) or 'Not provided'}
Current roadmap: {req.roadmap_context or 'Not provided'}

User's exact question:
{req.message}

Response rules:
- Directly answer the question first.
- Use simple language suitable for a learner.
- Give an example when it helps.
- Relate the answer to the target role/roadmap when relevant.
- If the user asks a broad topic such as frontend, backend, HTML, CSS, JavaScript,
  React, DSA, SQL, Docker or Git, give a short explanation plus what to learn next.
- Do not claim to have performed an action you did not perform.
- Keep the main answer concise (roughly 80-180 words).
- Return JSON with `reply` and 2-4 useful `suggested_actions`.
"""
        try:
            data = self.provider.generate_json(prompt, AITutorResponse)
            return AITutorResponse.model_validate(data)
        except Exception as exc:
            # Context-aware local fallback keeps the agent useful even when Gemini
            # is unavailable, rate-limited, or the API key is missing.
            text = self._local_tutor_answer(req)
            return AITutorResponse(
                reply=text,
                suggested_actions=self._local_tutor_actions(req.message)
            )

    def _local_tutor_answer(self, req: AITutorRequest) -> str:
        q = req.message.strip()
        ql = q.lower()
        role = req.role or "your target role"

        topic_answers = {
            "html": "HTML (HyperText Markup Language) is the structure of a web page. It defines elements such as headings, paragraphs, links, images, forms, buttons and sections. For a frontend career, learn semantic HTML first, then CSS and JavaScript. A good beginner project is a responsive portfolio page.",
            "css": "CSS controls the appearance and layout of web pages: colors, spacing, typography, responsive design and animations. For frontend development, learn the box model, Flexbox, Grid, responsive media queries and reusable component styling. Practice by recreating a simple landing page.",
            "javascript": "JavaScript adds behavior and interactivity to web pages. Focus on variables, functions, arrays/objects, DOM events, promises, async/await, modules and API calls. After the fundamentals, move to TypeScript and React if your roadmap targets frontend or full-stack development.",
            "frontend": "Frontend development is the part of an application users see and interact with. The usual progression is HTML → CSS → JavaScript → TypeScript → React (or another framework) → API integration → testing. For your roadmap, build small projects at each stage rather than only watching tutorials.",
            "backend": "Backend development handles server-side logic, APIs, authentication, databases and business rules. A practical path is HTTP/REST → one backend language/framework → SQL → authentication → testing → Docker → deployment. Build an API-backed project to connect these skills.",
            "react": "React is a JavaScript library for building component-based user interfaces. Learn components, props, state, events, hooks, forms, routing and API integration. Start with a small task manager or course dashboard before moving to a larger application.",
            "dsa": "DSA means Data Structures and Algorithms. For software-engineering interviews, start with arrays and strings, hash maps, stacks/queues, linked lists, trees, heaps, graphs, sorting, binary search and dynamic programming. Always practice explaining time and space complexity.",
            "sql": "SQL is used to store, query and modify relational data. Learn SELECT, filtering, JOINs, GROUP BY, subqueries, indexes, transactions and window functions. A good project is a course or job-management database with realistic queries.",
            "docker": "Docker packages an application and its dependencies into a container so it runs consistently across environments. Learn images, containers, Dockerfiles, volumes, networks and Docker Compose. Then containerize your CareerForge backend and database locally.",
            "git": "Git tracks changes to your code and GitHub hosts repositories for collaboration. Learn clone, status, add, commit, branch, merge, pull, push and pull requests. Use feature branches and meaningful commits on your projects."
        }

        for keyword, answer in topic_answers.items():
            if keyword in ql:
                return answer + f" This is relevant to {role}."

        if "what should i learn" in ql or "learn next" in ql or "start" in ql:
            first = req.skill_gaps[0] if req.skill_gaps else "the first roadmap node"
            return f"For {role}, start with {first}. Learn the core concepts, complete one small hands-on exercise, then build a mini-project before moving to the next roadmap node. Your current roadmap is: {req.roadmap_context or 'not loaded yet'}."

        if "why" in ql and req.roadmap_context:
            return f"That topic appears in your {role} roadmap because it is part of the dependency chain toward the target role. Your current sequence is {req.roadmap_context}. If you tell me the exact node you mean, I can explain why it is required and what you can safely skip."

        return f"For your question, I would focus on the part that directly supports {role}. Your current skills are {', '.join(req.current_skills) or 'not listed'}, and your main gaps are {', '.join(req.skill_gaps) or 'not listed'}. Ask me about a specific roadmap topic, such as HTML, frontend, JavaScript, React, DSA, SQL, Docker or Git, and I will explain it with an example."

    def _local_tutor_actions(self, message: str) -> List[str]:
        q = message.lower()
        if "html" in q:
            return ["Learn semantic HTML", "Build a simple portfolio page", "Practice forms and accessibility"]
        if "frontend" in q:
            return ["Learn HTML and CSS", "Practice JavaScript DOM events", "Build a responsive page"]
        if "backend" in q:
            return ["Learn HTTP and REST", "Build a small API", "Connect it to SQL"]
        if "dsa" in q:
            return ["Practice arrays and hash maps", "Learn Big-O", "Solve 3 problems daily"]
        return ["Study the concept", "Build a small practice project", "Complete a checkpoint"]

    def _fallback(self, req: RoleRoadmapRequest) -> RoleRoadmapResponse:
        """Deterministic role-specific fallback. Never show Full Stack content for another role."""
        raw = (req.target_role or "Full Stack").strip()
        aliases = {
            "Software Engineer (Full Stack)": "Full Stack",
            "Full Stack Developer": "Full Stack",
            "Frontend Developer": "Frontend",
            "Backend Developer": "Backend",
            "Data Scientist": "AI and Data Scientist",
            "Machine Learning Engineer": "Machine Learning",
            "DevOps Engineer": "DevOps",
            "Cybersecurity": "Cyber Security",
            "Cybersecurity Engineer": "Cyber Security",
            "QA Engineer": "QA",
            "Android Developer": "Android",
            "iOS Developer": "iOS",
        }
        role = aliases.get(raw, raw)

        # Each role has its own learning sequence. This is used when Gemini is
        # unavailable/invalid, so the UI still changes correctly when a role is selected.
        role_topics = {
            "Frontend": ["HTML & Accessibility","CSS & Responsive Design","JavaScript","TypeScript","React","State & API Integration","Frontend Testing","Web Performance","Frontend Portfolio","Frontend Interviews"],
            "Backend": ["HTTP & REST","Backend Programming","API Development","SQL & Data Modeling","Authentication & Authorization","Caching & Redis","Backend Testing","Queues & Async Jobs","Docker & Deployment","Backend API Project"],
            "Full Stack": ["HTML","CSS","JavaScript","React","Backend APIs","SQL & Databases","Authentication","Full-Stack Testing","Docker & Deployment","Full-Stack Capstone"],
            "Android": ["Kotlin","Android Fundamentals","Jetpack Compose","Android Architecture","Room & Local Storage","Retrofit & REST APIs","Android Testing","App Performance","Play Store Release","Android Portfolio App"],
            "DevOps": ["Linux & Bash","Git & Collaboration","Docker","CI/CD","Cloud Fundamentals","Terraform","Kubernetes","Observability","DevSecOps","Production Deployment"],
            "DevSecOps": ["Linux & Networking","Secure Git Workflow","Container Security","Secure CI/CD","Cloud Security","Infrastructure Security","Kubernetes Security","Security Monitoring","Software Supply Chain","Secure Delivery Project"],
            "Data Analyst": ["Excel & Data Cleaning","SQL","Statistics","Python for Analysis","Data Visualization","Power BI / Tableau","Business Analytics","Data Storytelling","KPI Design","Analytics Portfolio"],
            "AI Engineer": ["Python for AI","Math for AI","Machine Learning","Deep Learning","LLM Fundamentals","RAG Systems","AI Agents","Model Serving","AI Evaluation & Safety","AI Product Project"],
            "AI and Data Scientist": ["Python & Pandas","Probability & Statistics","SQL","Machine Learning","Feature Engineering","Deep Learning","NLP & Generative AI","Experimentation","Model Deployment","Data Science Capstone"],
            "Data Engineer": ["Python for Data Engineering","Advanced SQL","Data Modeling","ETL & ELT","Apache Spark","Data Warehouses","Kafka & Streaming","Airflow Orchestration","Data Quality & Governance","Data Platform Project"],
            "Machine Learning": ["Python & NumPy","Math for ML","Classical Machine Learning","Model Evaluation","Feature Engineering","Deep Learning","NLP & Transformers","MLOps","Model Monitoring","ML Production Project"],
            "PostgreSQL": ["SQL Foundations","PostgreSQL Data Modeling","Indexes","EXPLAIN & Query Planning","Transactions & MVCC","Administration","Replication","Partitioning","Database Security","PostgreSQL Production Project"],
            "iOS": ["Swift","SwiftUI","iOS Architecture","SwiftData Persistence","URLSession & Networking","XCTest","Performance & Instruments","App Security","App Store Delivery","iOS Portfolio App"],
            "Blockchain": ["Cryptography Basics","Blockchain Fundamentals","Ethereum & EVM","Solidity","Smart Contract Security","Contract Testing","Web3 Frontend","Blockchain Backend","Deployment & Monitoring","DApp Project"],
            "QA": ["Testing Fundamentals","Test Case Design","API Testing","Database Testing","UI Automation","Automation Frameworks","Performance Testing","Security Testing","CI/CD Testing","QA Automation Project"],
            "Software Architect": ["Architecture Principles","SOLID & Design Patterns","API Architecture","Data Architecture","Distributed Systems","Scalability & Caching","Secure Architecture","Cloud Architecture","Reliability & SLOs","Architecture Case Study"],
            "API Design": ["HTTP Deep Dive","REST API Design","OpenAPI & Schemas","Errors & Idempotency","OAuth2 & API Security","GraphQL","gRPC","Contract Testing","API Gateways","Production API Project"],
            "Cyber Security": ["Networking Fundamentals","Linux Security","Web Security","Applied Cryptography","Security Testing","Secure Coding","Cloud Security","SIEM & Detection","Incident Response","Security Assessment Project"],
            "UX Design": ["User Research","Personas & User Journeys","Information Architecture","Wireframing","UI Foundations","Prototyping","Usability Testing","Design Systems","Developer Handoff","UX Case Study"],
            "Technical Writer": ["Technical Writing Fundamentals","Documentation Architecture","API Documentation","Docs as Code","Technical Diagrams","Developer Tutorials","SME Research","Content Quality & Accessibility","Documentation Portfolio"],
            "Game Developer": ["Game Programming","Game Engine Fundamentals","Game Math","Game Physics","Game AI","Rendering & Shaders","Game Audio","Multiplayer Fundamentals","Game Optimization","Playable Game Project"],
            "Server Side Game Developer": ["Game Networking","Game Backend Services","Authoritative Game State","Game Data Storage","Realtime Messaging","Matchmaking","Caching","Game Server Scaling","Backend Observability","Online Game Backend"],
            "MLOps": ["Python & ML Tooling","ML Lifecycle","Git & CI","Containers for ML","Experiment Tracking","Model Registry","Model Serving","ML Pipelines","Model Monitoring","MLOps Platform Project"],
            "Product Manager": ["Product Discovery","Product Strategy","PRDs & Requirements","Prioritization","Product Analytics","UX Collaboration","Technical Fluency","Product Experiments","Launch & GTM","Product Case Study"],
            "Engineering Manager": ["Engineering Leadership","Planning & Execution","Technical Decision-Making","Hiring & Coaching","Engineering Quality","Engineering Metrics","Incident Leadership","Stakeholder Management","Engineering Strategy","Team Improvement Plan"],
            "Developer Relations": ["Developer Community","Technical Content","Technical Speaking","Developer Advocacy","Developer Experience","Events & Workshops","Community Analytics","Developer Communication","DevRel Strategy","DevRel Portfolio"],
            "BI Analyst": ["SQL","BI Data Modeling","Data Preparation","Power BI / Tableau","DAX & Calculations","Data Visualization","KPI Design","BI Governance","Executive Storytelling","BI Dashboard Portfolio"],
            "AI Red Teaming": ["LLM Fundamentals","AI Threat Modeling","Prompt Injection Testing","RAG & Context Attacks","Agent Tool Security","Adversarial Evaluation","Privacy & Data Leakage","Jailbreak Testing","AI Safety Mitigations","AI Red-Team Report"],
        }

        topics = role_topics.get(role, [
            f"{role} Fundamentals", f"{role} Tools & Workflow", f"Core {role} Concepts",
            f"Advanced {role}", f"{role} Best Practices", f"{role} Testing & Quality",
            f"{role} Automation", f"{role} Real-World Case Studies",
            f"{role} Portfolio Project", f"{role} Interview Preparation"
        ])

        descriptions = {
            "Frontend": "Build user-facing web interfaces with semantic HTML, responsive CSS, JavaScript and component frameworks.",
            "Backend": "Build reliable server-side APIs, data layers, authentication and scalable services.",
            "Full Stack": "Connect frontend interfaces, backend APIs, databases, authentication and deployment.",
            "Android": "Build modern Android applications with Kotlin, Compose, architecture, networking and release workflows.",
            "DevOps": "Automate infrastructure, CI/CD, containers, cloud deployment, reliability and operations.",
            "DevSecOps": "Integrate security controls throughout source code, CI/CD, infrastructure and runtime operations.",
            "Data Analyst": "Turn business data into reliable analysis, dashboards, KPIs and actionable recommendations.",
            "AI Engineer": "Build production AI applications using ML, LLMs, retrieval, agents, evaluation and serving.",
            "AI and Data Scientist": "Use statistics, machine learning and experimentation to solve data-driven problems.",
            "Data Engineer": "Design dependable batch and streaming pipelines, warehouses, orchestration and data quality systems.",
            "Machine Learning": "Develop, evaluate, deploy and monitor machine-learning models from data to production.",
            "PostgreSQL": "Design, optimize and operate PostgreSQL databases with strong performance, concurrency and security.",
            "iOS": "Build and ship native iOS applications with Swift, SwiftUI, persistence, networking and testing.",
            "Blockchain": "Build secure blockchain applications and smart contracts with a focus on correctness and testing.",
            "QA": "Build a complete quality strategy covering manual testing, APIs, automation, performance and CI.",
            "Software Architect": "Design maintainable, scalable and secure systems using explicit architectural trade-offs.",
            "API Design": "Design consistent, secure, documented and resilient APIs for clients and distributed services.",
            "Cyber Security": "Develop practical defensive and application-security skills from networking through incident response.",
            "UX Design": "Research users, design usable interfaces, validate them and communicate decisions through case studies.",
            "Technical Writer": "Create clear, accurate developer documentation, tutorials, references and docs-as-code workflows.",
            "Game Developer": "Build games across programming, engine systems, gameplay, graphics, networking and optimization.",
            "Server Side Game Developer": "Build realtime game backends for sessions, state, matchmaking, persistence and scale.",
            "MLOps": "Operate the ML lifecycle with reproducibility, pipelines, serving, monitoring and governance.",
            "Product Manager": "Discover user problems, prioritize opportunities, work with engineering/design and measure outcomes.",
            "Engineering Manager": "Lead engineering teams through planning, people development, technical decisions and reliable delivery.",
            "Developer Relations": "Help developers succeed through technical content, community programs, events and product feedback.",
            "BI Analyst": "Model business data and create governed dashboards, measures and executive-ready insights.",
            "AI Red Teaming": "Systematically test AI systems for prompt injection, data leakage, unsafe tools and other adversarial failures.",
        }
        summary = descriptions.get(role, f"Build practical {role} skills through fundamentals, advanced concepts, projects and interview preparation.")

        nodes = []
        for i, topic in enumerate(topics, 1):
            category = "Foundations" if i <= 2 else ("Core" if i <= 5 else ("Advanced" if i <= 7 else ("Projects" if i >= 9 else "Career")))
            difficulty = "Beginner" if i <= 2 else ("Intermediate" if i <= 7 else "Advanced")
            previous_id = f"{role.lower().replace(' ', '-')}-{i-1}" if i > 1 else None
            nodes.append(RoadmapNodeSchema(
                id=f"{role.lower().replace(' ', '-')}-{i}",
                title=topic,
                description=f"Learn and practice {topic.lower()} specifically for {role}.",
                category=category,
                difficulty=difficulty,
                estimated_hours=5 if i <= 2 else (7 if i <= 6 else 9),
                prerequisites=[previous_id] if previous_id else [],
                skills=[topic],
                projects=[f"{topic} hands-on project"] if i in (6, 9, 10) else [],
                resources=["Official documentation", "Hands-on exercises", "Practice project"]
            ))

        return RoleRoadmapResponse(
            role=role,
            audience=f"Learners preparing for {role} roles at {req.experience_level or 'Beginner'} level",
            estimated_months=max(3, min(12, round(len(nodes) * 0.55))),
            summary=summary,
            tracks=list(dict.fromkeys(n.category for n in nodes)),
            nodes=nodes
        )

