from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="candidate") # candidate, recruiter, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate_profiles = relationship("CandidateProfile", back_populates="user")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="Software Engineer Candidate")
    experience_years = Column(Float, default=3.0)
    target_job_title = Column(String, default="Software Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="candidate_profiles")
    resumes = relationship("Resume", back_populates="profile")
    candidate_skills = relationship("CandidateSkill", back_populates="profile")
    projects = relationship("Project", back_populates="profile")
    interviews = relationship("Interview", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    filename = Column(String)
    raw_text = Column(Text)
    compatibility_score = Column(Float, default=78.0)
    parsed_skills = Column(JSON, default=list) # ["Python", "SQL", "DSA", "FastAPI"]
    extracted_projects = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, default="TechCorp Global")
    description = Column(Text, nullable=False)
    experience_required = Column(String, default="2-4 Years")
    created_at = Column(DateTime, default=datetime.utcnow)

    requirements = relationship("JobRequirement", back_populates="job")

class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    skill_name = Column(String, nullable=False) # e.g. DSA, Python, System Design
    category = Column(String, default="REQUIRED") # REQUIRED, PREFERRED, OPTIONAL
    importance = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    weight = Column(Float, default=1.0)

    job = relationship("Job", back_populates="requirements")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="Technical")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    skill_name = Column(String, nullable=False)
    claimed_level = Column(String, nullable=False) # Beginner, Intermediate, Advanced
    verified_level = Column(String, nullable=False) # Novice, Beginner, Intermediate, Advanced, Expert
    confidence = Column(Float, default=0.75) # 0.0 to 1.0 (75%)
    job_importance = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    evidence = Column(JSON, default=list) # Bullet points supporting verification
    weaknesses = Column(JSON, default=list) # Bullet points of discovered gaps
    recommendation = Column(Text)
    last_evaluated = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="candidate_skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    tech_stack = Column(JSON, default=list) # ["Java", "MySQL"]
    architecture_notes = Column(Text)
    security_eval = Column(String, default="Medium")
    scalability_eval = Column(String, default="Medium")

    profile = relationship("CandidateProfile", back_populates="projects")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    max_questions = Column(Integer, default=15)
    questions_asked = Column(Integer, default=0)
    status = Column(String, default="in_progress") # in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="interviews")
    questions = relationship("Question", back_populates="interview")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    sequence_num = Column(Integer, nullable=False)
    category = Column(String, default="Technical") # HR, Behavioral, Technical, DSA, Project, System Design, Coding, SQL
    target_skill = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    difficulty = Column(String, default="Medium")
    info_value_score = Column(Float, default=0.85)

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("Answer", uselist=False, back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(Text, nullable=False)
    evaluated = Column(Boolean, default=False)
    clarity_score = Column(Float, default=0.8)
    relevance_score = Column(Float, default=0.8)
    technical_depth_score = Column(Float, default=0.8)
    discovered_weakness = Column(String, nullable=True)
    feedback = Column(Text)

    question = relationship("Question", back_populates="answer")

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    problem_title = Column(String, default="Rotated Sorted Array Search")
    language = Column(String, default="python")
    code = Column(Text, nullable=False)
    correctness_score = Column(Float, default=1.0)
    time_complexity = Column(String, default="O(log N)")
    space_complexity = Column(String, default="O(1)")
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class SQLSubmission(Base):
    __tablename__ = "sql_submissions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    problem_title = Column(String, default="Find Top Customers & Total Spent")
    query = Column(Text, nullable=False)
    correctness_score = Column(Float, default=1.0)
    efficiency_score = Column(Float, default=0.9)
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    overall_score = Column(Float, default=72.0) # 0 to 100
    resume_compatibility = Column(Float, default=78.0)
    technical_skills = Column(Float, default=76.0)
    dsa_score = Column(Float, default=61.0)
    problem_solving = Column(Float, default=68.0)
    communication = Column(Float, default=84.0)
    project_knowledge = Column(Float, default=81.0)
    coding_score = Column(Float, default=74.0)
    sql_score = Column(Float, default=88.0)
    evidence_summary = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class ImprovementPlan(Base):
    __tablename__ = "improvement_plans"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    days_plan = Column(JSON, default=list) # Array of day tasks
    priority_order = Column(JSON, default=list) # Priority list with justification
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
