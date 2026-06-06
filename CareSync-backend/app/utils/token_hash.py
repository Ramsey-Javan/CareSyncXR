import hashlib

def hash_refresh_token(token: str) -> str:
    """Return SHA-256 hex digest of the token."""
    return hashlib.sha256(token.encode()).hexdigest()

def verify_refresh_token(token: str, token_hash: str) -> bool:
    """Verify that token matches the stored hash."""
    return hash_refresh_token(token) == token_hash