import os
import sys
import uuid
import tempfile
import pytest

# Ensure backend root in path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT_DIR)

# Use temp DB file to share across connections
if "DATABASE_FILE" not in os.environ:
    tmp_db = tempfile.NamedTemporaryFile(prefix="test_db_", suffix=".sqlite", delete=False)
    os.environ["DATABASE_FILE"] = tmp_db.name

from simple_server import app, API_TOKEN  # type: ignore


@pytest.fixture()
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def auth_headers():
    """Return auth header if token is configured (skip otherwise)."""
    if API_TOKEN:
        return {"Authorization": f"Bearer {API_TOKEN}"}
    return {}

def test_create_and_get_student(client):
    student_id = str(uuid.uuid4())
    payload = {
        "id": student_id,
        "name": "Test Student",
        "fatherName": "Father Test",
        "mobileNumber": "01234567890",
        "district": "Testville",
        "upazila": "Test",
        "class": "প্রথম শ্রেণি",
        "rollNumber": "150",
        "registrationDate": "2025-01-01",
    }

    # Create student (may be unprotected if API_TOKEN not set)
    resp = client.post("/api/students", json=payload, headers=auth_headers())
    assert resp.status_code == 200, resp.text
    data = resp.get_json()
    assert data.get("success") is True

    # Retrieve list and confirm presence
    resp = client.get("/api/students")
    assert resp.status_code == 200
    students = resp.get_json()
    assert any(s["id"] == student_id for s in students)