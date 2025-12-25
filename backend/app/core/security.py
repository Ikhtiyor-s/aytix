from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
import hashlib
import secrets


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash using PBKDF2."""
    try:
        # Split stored hash to get salt and hash
        parts = hashed_password.split('$')
        if len(parts) != 3 or parts[0] != 'pbkdf2_sha256':
            return False

        iterations = int(parts[1])
        stored_hash = parts[2]
        salt = bytes.fromhex(stored_hash[:64])
        hash_to_verify = stored_hash[64:]

        # Hash the provided password with the same salt
        computed_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode(),
            salt,
            iterations
        ).hex()

        return secrets.compare_digest(computed_hash, hash_to_verify)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2-SHA256."""
    # Generate random salt
    salt = secrets.token_bytes(32)
    iterations = 100000

    # Hash the password
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode(),
        salt,
        iterations
    )

    # Format: algorithm$iterations$salt+hash
    return f"pbkdf2_sha256${iterations}${salt.hex()}{hash_bytes.hex()}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None



