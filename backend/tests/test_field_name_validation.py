import pytest
import os, sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import Database

@pytest.fixture
def db_instance():
    return Database(db_path=':memory:')

@pytest.mark.parametrize('name', ['camelCase', 'studentName'])
def test_validate_field_name_accepts_camel_case(db_instance, name):
    assert db_instance._validate_field_name(name) is True

@pytest.mark.parametrize('name', ['123name', 'name-with-dash', 'name with space', 'name$'])
def test_validate_field_name_rejects_invalid(db_instance, name):
    with pytest.raises(ValueError):
        db_instance._validate_field_name(name)
