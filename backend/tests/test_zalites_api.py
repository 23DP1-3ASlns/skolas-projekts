"""Backend API tests for Zalites Pamatskola."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://campus-central-21.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@zalitespamatskola.lv"
ADMIN_PASSWORD = "admin123"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    # Verify cookie set
    cookies = r.cookies
    assert "access_token" in cookies, "access_token cookie not set on login"
    return data["token"]


@pytest.fixture(scope="session")
def admin_id(session, admin_token):
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    return r.json()["id"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Health ----------
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_auth(self, session):
        r = requests.get(f"{API}/auth/me")  # fresh - no cookies
        assert r.status_code == 401

    def test_me_with_token(self, session, admin_token):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert "id" in d

    def test_logout(self, session, admin_token):
        r = requests.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- News ----------
class TestNews:
    def test_list_news_public(self, session):
        r = requests.get(f"{API}/news")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 3
        for it in items:
            assert "_id" not in it
            assert "id" in it
            assert "title" in it
            assert "content" in it

    def test_create_news_requires_auth(self, session):
        r = requests.post(f"{API}/news", json={"title": "x", "content": "y"})
        assert r.status_code == 401

    def test_news_crud(self, session, auth_headers):
        title = f"TEST_{uuid.uuid4().hex[:8]}"
        # CREATE
        r = requests.post(f"{API}/news", headers=auth_headers, json={"title": title, "content": "body"})
        assert r.status_code == 201
        created = r.json()
        nid = created["id"]
        assert created["title"] == title
        # GET single
        r = requests.get(f"{API}/news/{nid}")
        assert r.status_code == 200
        assert r.json()["title"] == title
        # UPDATE
        r = requests.put(f"{API}/news/{nid}", headers=auth_headers, json={"title": title + "_upd", "content": "body2"})
        assert r.status_code == 200
        assert r.json()["title"] == title + "_upd"
        # GET to verify
        r = requests.get(f"{API}/news/{nid}")
        assert r.json()["content"] == "body2"
        # DELETE
        r = requests.delete(f"{API}/news/{nid}", headers=auth_headers)
        assert r.status_code == 200
        # Verify gone
        r = requests.get(f"{API}/news/{nid}")
        assert r.status_code == 404


# ---------- Schedule ----------
class TestSchedule:
    def test_list_schedule(self, session):
        r = requests.get(f"{API}/schedule")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 5
        for it in items:
            assert "_id" not in it

    def test_groups(self, session):
        r = requests.get(f"{API}/schedule/groups")
        assert r.status_code == 200
        groups = r.json()
        assert isinstance(groups, list)
        assert "5.a" in groups
        assert "5.b" in groups
        assert "6.a" in groups

    def test_filter_by_group(self, session):
        r = requests.get(f"{API}/schedule", params={"group": "5.a"})
        assert r.status_code == 200
        items = r.json()
        for it in items:
            assert it["group"] == "5.a"

    def test_conflicts_endpoint_requires_admin(self, session):
        r = requests.get(f"{API}/schedule/conflicts")
        assert r.status_code == 401

    def test_create_schedule_with_conflict(self, session, auth_headers):
        # Create entry
        e1 = {
            "group": "TEST_G1",
            "subject": "TEST_Subj",
            "teacher": "TEST_Teacher_X",
            "day": "Pirmdiena",
            "start_time": "13:00",
            "end_time": "13:45",
            "room": "T1",
        }
        r = requests.post(f"{API}/schedule", headers=auth_headers, json=e1)
        assert r.status_code == 201
        d1 = r.json()
        assert "entry" in d1 and "conflicts" in d1
        id1 = d1["entry"]["id"]
        assert isinstance(d1["conflicts"], list)

        # Same teacher overlap -> conflict
        e2 = {**e1, "group": "TEST_G2", "start_time": "13:15", "end_time": "14:00"}
        r = requests.post(f"{API}/schedule", headers=auth_headers, json=e2)
        assert r.status_code == 201
        d2 = r.json()
        id2 = d2["entry"]["id"]
        assert len(d2["conflicts"]) >= 1
        assert any(c["id"] == id1 for c in d2["conflicts"])
        assert d2["conflicts"][0]["reason"] in ("teacher", "group")

        # Conflicts list endpoint
        r = requests.get(f"{API}/schedule/conflicts", headers=auth_headers)
        assert r.status_code == 200
        ids = r.json()
        assert id1 in ids and id2 in ids

        # Update id2 to non-conflicting time
        upd = {**e2, "start_time": "15:00", "end_time": "15:45"}
        r = requests.put(f"{API}/schedule/{id2}", headers=auth_headers, json=upd)
        assert r.status_code == 200
        assert r.json()["entry"]["start_time"] == "15:00"

        # Delete both
        for sid in (id1, id2):
            r = requests.delete(f"{API}/schedule/{sid}", headers=auth_headers)
            assert r.status_code == 200


# ---------- Pages ----------
class TestPages:
    def test_get_history(self, session):
        r = requests.get(f"{API}/pages/history")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "history"
        assert d["title"]
        assert d["body"]

    def test_get_invalid_slug(self, session):
        r = requests.get(f"{API}/pages/nonexistent")
        assert r.status_code == 404

    def test_update_page_requires_auth(self, session):
        r = requests.put(f"{API}/pages/history", json={"title": "x", "body": "y"})
        assert r.status_code == 401

    def test_update_page(self, session, auth_headers):
        # Save original
        orig = requests.get(f"{API}/pages/history").json()
        new_body = orig["body"] + "\n\nTEST_UPDATE"
        r = requests.put(f"{API}/pages/history", headers=auth_headers, json={"title": orig["title"], "body": new_body})
        assert r.status_code == 200
        assert r.json()["body"] == new_body
        # Verify persisted
        r = requests.get(f"{API}/pages/history")
        assert r.json()["body"] == new_body
        # Restore
        requests.put(f"{API}/pages/history", headers=auth_headers, json={"title": orig["title"], "body": orig["body"]})


# ---------- Users ----------
class TestUsers:
    def test_list_requires_auth(self, session):
        r = requests.get(f"{API}/users")
        assert r.status_code == 401

    def test_list_users(self, session, auth_headers):
        r = requests.get(f"{API}/users", headers=auth_headers)
        assert r.status_code == 200
        users = r.json()
        assert any(u["email"] == ADMIN_EMAIL for u in users)
        for u in users:
            assert "password_hash" not in u
            assert "_id" not in u

    def test_create_user_and_delete(self, session, auth_headers):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/users", headers=auth_headers, json={"email": email, "password": "secret123", "name": "T"})
        assert r.status_code == 201
        u = r.json()
        uid = u["id"]
        assert u["email"] == email
        # Duplicate -> 409
        r = requests.post(f"{API}/users", headers=auth_headers, json={"email": email, "password": "secret123", "name": "T"})
        assert r.status_code == 409
        # Delete
        r = requests.delete(f"{API}/users/{uid}", headers=auth_headers)
        assert r.status_code == 200

    def test_cannot_delete_self(self, session, auth_headers, admin_id):
        r = requests.delete(f"{API}/users/{admin_id}", headers=auth_headers)
        assert r.status_code == 400
