import hashlib
import requests
import logging

logger = logging.getLogger(__name__)

def check_gravatar_profile(email: str) -> dict:
    """
    Checks if email has an active public Gravatar profile exposing real name,
    usernames, avatar, public bio, verified social accounts, and location.
    """
    clean_email = email.strip().lower()
    email_hash = hashlib.md5(clean_email.encode()).hexdigest()
    
    url = f"https://en.gravatar.com/{email_hash}.json"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=6)
        if resp.status_code == 200:
            data = resp.json()
            entry = data.get("entry", [{}])[0]
            
            preferred_username = entry.get("preferredUsername", "")
            display_name = entry.get("displayName", "")
            profile_url = entry.get("profileUrl", f"https://gravatar.com/{preferred_username}")
            about_me = entry.get("aboutMe", "")
            current_location = entry.get("currentLocation", "")
            thumbnail_url = entry.get("thumbnailUrl", "")
            
            verified_accounts = entry.get("verifiedAccounts", [])
            accounts_summary = [f"{acc.get('service_label', 'Account')}: {acc.get('url', '')}" for acc in verified_accounts if acc.get('url')]

            exposed_items = ["Public Avatar / Photo"]
            if display_name:
                exposed_items.append(f"Full Name: {display_name}")
            if preferred_username:
                exposed_items.append(f"Username: @{preferred_username}")
            if current_location:
                exposed_items.append(f"Location: {current_location}")
            if accounts_summary:
                exposed_items.append(f"{len(accounts_summary)} Linked Public Social Profiles")

            return {
                "found": True,
                "finding": {
                    "source_name": "Gravatar (Automattic / WordPress Public Directory)",
                    "source_category": "public_profile",
                    "source_url": profile_url,
                    "page_reference": f"Gravatar Profile @{preferred_username or email_hash[:8]}",
                    "match_type": "exact",
                    "confidence_level": "high",
                    "risk_level": "medium",
                    "exposed_data_types": exposed_items,
                    "detection_date": "Active Live Profile",
                    "status": "detected",
                    "details": f"Public profile actively indexed. Display Name: '{display_name or 'Not set'}'. Location: '{current_location or 'Unspecified'}'. Linked Accounts: {', '.join([a.get('service_type','') for a in verified_accounts]) or 'None'}.",
                    "raw_evidence": f"MD5 Hash: {email_hash}. Profile URL: {profile_url}. Avatar URL: {thumbnail_url}",
                    "opt_out_url": "https://gravatar.com/profiles/edit#privacy",
                    "privacy_email": "privacy@automattic.com"
                }
            }
    except Exception as e:
        logger.warning(f"Gravatar check error for {clean_email}: {e}")
        
    return {"found": False, "finding": None}
