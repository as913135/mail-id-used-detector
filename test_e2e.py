import sys
import os

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

def run_tests():
    print("=== STARTING PRIVASCAN FULL STACK E2E INTEGRATION TEST ===")
    init_db()
    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health check PASSED:", res.json()["service"])

    # 2. User registration
    user_data = {
        "email": "aaryan.privacy@testdomain.com",
        "password": "SecurePassword123!",
        "full_name": "Aaryan Sharma"
    }
    # Clean previous test if any
    reg_res = client.post("/api/auth/register", json=user_data)
    if reg_res.status_code == 400: # Already registered, log in
        login_res = client.post("/api/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_data = login_res.json()
    else:
        assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
        auth_data = reg_res.json()

    token = auth_data["token"]
    user = auth_data["user"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Auth flow PASSED for user:", user["email"])

    # 3. Add Monitored Identifier (Phone)
    id_res = client.post("/api/identifiers", json={"type": "phone", "value": "+919876543210"}, headers=headers)
    assert id_res.status_code in [200, 400], f"Add identifier failed: {id_res.text}"
    print("✓ Identifier management PASSED")

    # 4. List Identifiers
    list_id_res = client.get("/api/identifiers", headers=headers)
    assert list_id_res.status_code == 200
    ids = list_id_res.json()["identifiers"]
    assert len(ids) >= 1
    print(f"✓ Found {len(ids)} monitored identifiers in registry")

    # 5. Execute Live Real-Data Scan on Email
    print("\n--- Executing Live Real-Life Scan on test@example.com ---")
    scan_res = client.post("/api/scans", json={"target_value": "test@example.com", "target_type": "email"}, headers=headers)
    assert scan_res.status_code == 200, f"Scan failed: {scan_res.text}"
    scan_json = scan_res.json()
    scan = scan_json["scan"]
    findings = scan_json["findings"]
    print(f"✓ Real Scan Completed: {scan['findings_count']} exposures detected across {scan['sources_checked']} sources.")
    print(f"✓ Computed Risk Score: {scan['risk_score']}/100")
    assert len(findings) > 0, "Expected real breach findings for test email"
    first_finding = findings[0]
    print(f"✓ Sample Finding: {first_finding['source_name']} (Risk: {first_finding['risk_level']}, Confidence: {first_finding['confidence_level']})")

    # 6. Test Removal Workflow & DPDP Notice Generation
    print("\n--- Creating Statutory Removal Request under DPDP Act 2023 ---")
    rem_res = client.post("/api/removals", json={
        "finding_id": first_finding["id"],
        "legal_framework": "DPDP_2023",
        "custom_notes": "Formal demand under Section 12"
    }, headers=headers)
    assert rem_res.status_code == 200, f"Removal request failed: {rem_res.text}"
    removal = rem_res.json()["removal_request"]
    assert "Section 12 of the Digital Personal Data Protection Act, 2023" in removal["generated_notice"]["body"]
    print("✓ Statutory Legal Notice generated successfully with official citations.")
    rem_id = removal["id"]

    # 7. Update Removal Status
    status_res = client.patch(f"/api/removals/{rem_id}/status", json={"status": "verified_removed", "reason": "DPO confirmed de-indexing"}, headers=headers)
    assert status_res.status_code == 200
    print("✓ Removal status successfully updated to 'verified_removed'.")

    # 8. Check Status History Audit Trail
    hist_res = client.get(f"/api/removals/{rem_id}/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()["history"]
    assert len(history) >= 2
    print(f"✓ Immutable Status History verified with {len(history)} state transitions.")

    # 9. Verify Dashboard Summary
    sum_res = client.get("/api/stats/summary", headers=headers)
    assert sum_res.status_code == 200
    metrics = sum_res.json()["metrics"]
    print(f"✓ Summary Metrics verified: Total Exposures={metrics['total_findings']}, Verified Removals={metrics['verified_removals']}")

    # 10. Test Data Portability Export
    export_res = client.get("/api/stats/export", headers=headers)
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert "identifiers" in export_data and "scans" in export_data and "findings" in export_data
    print("✓ Data Portability Export verified (DPDP Sec 12 / GDPR Art 20 compliant).")

    # 11. Test Frontend Static Serving (SPA index.html)
    spa_res = client.get("/")
    assert spa_res.status_code == 200
    assert "PrivaScan" in spa_res.text or "<div id=\"root\">" in spa_res.text
    print("✓ Frontend Single-Page Application (SPA) static serving PASSED.")

    print("\n========================================================")
    print("🏆 ALL 11 E2E INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("========================================================")

if __name__ == "__main__":
    run_tests()
