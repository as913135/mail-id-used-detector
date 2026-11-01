import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "privascan.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        created_at TEXT NOT NULL
    )
    """)

    # Monitored Identifiers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS identifiers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        masked_value TEXT NOT NULL,
        verified INTEGER DEFAULT 1,
        enabled INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Scans
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        identifier_id TEXT,
        status TEXT NOT NULL,
        target_value TEXT NOT NULL,
        target_type TEXT NOT NULL,
        sources_checked INTEGER DEFAULT 0,
        total_sources INTEGER DEFAULT 0,
        findings_count INTEGER DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Findings / Exposures
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        identifier_id TEXT,
        source_name TEXT NOT NULL,
        source_category TEXT NOT NULL,
        source_url TEXT,
        page_reference TEXT,
        match_type TEXT NOT NULL,
        confidence_level TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        exposed_data_types TEXT NOT NULL,
        detection_date TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        raw_evidence TEXT,
        opt_out_url TEXT,
        privacy_email TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Consent Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consent_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        finding_id TEXT,
        scope TEXT NOT NULL,
        approved_action TEXT NOT NULL,
        authorized_at TEXT NOT NULL,
        revoked INTEGER DEFAULT 0,
        revoked_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Removal Requests
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS removal_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        finding_id TEXT NOT NULL,
        request_type TEXT NOT NULL,
        target_domain TEXT NOT NULL,
        target_contact_email TEXT,
        direct_opt_out_url TEXT,
        legal_framework TEXT NOT NULL,
        generated_notice_text TEXT,
        status TEXT NOT NULL,
        submitted_at TEXT,
        verified_at TEXT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    )
    """)

    # Status History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS status_history (
        id TEXT PRIMARY KEY,
        removal_request_id TEXT NOT NULL,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        reason TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (removal_request_id) REFERENCES removal_requests(id) ON DELETE CASCADE
    )
    """)

    # Audit Events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema initialized successfully.")
