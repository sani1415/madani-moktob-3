import os, sys
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simple_server import app, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_add_and_get_book_progress(client):
    data = {
        'class': 'Class 1',
        'book_name': 'Math',
        'total_pages': 100,
        'completed_pages': 10
    }
    resp = client.post('/api/book_progress', json=data)
    assert resp.status_code == 200
    out = resp.get_json()
    assert out.get('success') is True

    resp = client.get('/api/book_progress', query_string={'class': 'Class 1'})
    assert resp.status_code == 200
    progress = resp.get_json()
    assert any(p['book_name'] == 'Math' for p in progress)


def test_book_progress_history(client):
    data1 = {
        'class': 'Class 2',
        'book_name': 'Science',
        'total_pages': 80,
        'completed_pages': 5
    }
    data2 = dict(data1)
    data2['completed_pages'] = 15
    client.post('/api/book_progress', json=data1)
    client.post('/api/book_progress', json=data2)

    resp = client.get('/api/book_progress/history', query_string={'class': 'Class 2', 'book_name': 'Science'})
    assert resp.status_code == 200
    history = resp.get_json()
    assert len(history) >= 2
    assert history[0]['completed_pages'] == 15
