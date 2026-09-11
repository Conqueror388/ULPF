import hashlib

class IntegrityEngine:
    @staticmethod
    def generate_sha256(raw_log: str) -> str:
        """
        Generates deterministic SHA-256 hash for raw log payload.
        """
        clean_bytes = raw_log.strip().encode('utf-8')
        return hashlib.sha256(clean_bytes).hexdigest()

    @staticmethod
    def verify_integrity(raw_log: str, expected_hash: str) -> bool:
        """
        Verifies if raw log has not been altered.
        """
        current_hash = IntegrityEngine.generate_sha256(raw_log)
        return current_hash.lower() == expected_hash.lower()
