import os
import sys
import tempfile
import pytest

# Ensure we import the backend package root
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT_DIR)

# Configure the app to use a temporary SQLite DB file for tests
tmp_db = tempfile.NamedTemporaryFile(prefix="test_db_", suffix=".sqlite", delete=False)
os.environ["DATABASE_FILE"] = tmp_db.name

from simple_server import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get('status') == 'healthy'
