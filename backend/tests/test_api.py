from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "CareerFourge AI"

def test_job_analysis():
    response = client.post("/api/v1/job/analyze", json={"role_title": "Software Engineer"})
    assert response.status_code == 200
    assert "required_skills" in response.json()

def test_skill_truth():
    response = client.get("/api/v1/skills/truth")
    assert response.status_code == 200
    assert "skills" in response.json()
    assert response.json()["skills"][0]["claimed_level"] == "Advanced"

def test_job_gap():
    response = client.get("/api/v1/gap/simulate")
    assert response.status_code == 200
    assert "ready_skills" in response.json()

def test_readiness_score():
    response = client.get("/api/v1/readiness/1")
    assert response.status_code == 200
    assert response.json()["overall_score"] == 72.0

def test_interview_stt():
    files = {"file": ("test.webm", b"dummy audio content", "audio/webm")}
    response = client.post("/api/v1/interview/stt", files=files)
    assert response.status_code == 200
    assert "transcript" in response.json()

def test_resume_ats_analysis_file():
    resume_content = b"Alex Mercer\nSoftware Engineer\nSkills: Python, FastAPI, SQL, React, DSA\nExperience: Developed REST APIs and microservices using Python and FastAPI."
    files = {"file": ("resume.txt", resume_content, "text/plain")}
    response = client.post("/api/v1/resume/analyze", files=files, data={"target_role": "Backend Engineer"})
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "strengths" in data
    assert "category_scores" in data
    assert data["target_role"] == "Backend Engineer"

def test_interview_chat_flow():
    payload = {
        "interview_id": "test_sess_001",
        "message": "Technical",
        "history": [],
        "interview_config": {"interview_type": "Technical"}
    }
    response = client.post("/api/v1/interview/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "stage" in data
    assert "message" in data
    assert data["interview_id"] == "test_sess_001"


