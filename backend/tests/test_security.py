import pytest
from datetime import timedelta

from backend.core import security
from backend.core.config import settings
from jose import jwt


def test_get_password_hash_and_verify_password():
    password = "StrongPass#123"
    hashed_password = security.get_password_hash(password)

    assert isinstance(hashed_password, str)
    assert hashed_password != password
    assert security.verify_password(password, hashed_password)


def test_verify_password_rejects_wrong_password():
    hashed_password = security.get_password_hash("CorrectHorseBatteryStaple")

    assert not security.verify_password("incorrect-password", hashed_password)


def test_create_access_token_includes_subject(monkeypatch):
    monkeypatch.setattr(settings, "secret_key", "test-secret")

    token = security.create_access_token(subject="user_42", expires_delta=timedelta(minutes=1))
    decoded = jwt.decode(token, settings.secret_key, algorithms=["HS256"])

    assert decoded["sub"] == "user_42"
