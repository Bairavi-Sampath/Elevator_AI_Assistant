"""
Pytest configuration and shared fixtures for Elevator FDIR backend testing.
Provides:
- Dedicated test database isolation (protects production elevator.db)
- FastAPI TestClient fixture for REST and WebSocket integration testing
- Async test environment support via pytest-asyncio
"""

import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure TESTING environment variable is set
os.environ["TESTING"] = "1"

# Configure isolated test database
TEST_DB_PATH = BACKEND_DIR / "database" / "test_elevator.db"
os.environ["ELEVATOR_DB_PATH"] = str(TEST_DB_PATH)

import database.db as db
from main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Session-level fixture that isolates all database operations into a test database.
    Guarantees that the production application database ('elevator.db') is never modified or deleted.
    """
    # Point db module to test database
    db.set_db_path(TEST_DB_PATH)
    db.init_db()

    yield TEST_DB_PATH

    # Teardown: Remove temporary test database file if desired
    try:
        if TEST_DB_PATH.exists():
            # Close any connections and clean up
            pass
    except Exception:
        pass

    # Restore production database path
    PROD_DB_PATH = BACKEND_DIR / "database" / "elevator.db"
    db.set_db_path(PROD_DB_PATH)


@pytest.fixture(scope="session")
def client():
    """
    FastAPI TestClient fixture configured for application integration testing.
    Supports in-process REST API requests and WebSocket connections via client.websocket_connect().
    """
    with TestClient(app, base_url="http://127.0.0.1:8000") as test_client:
        yield test_client

