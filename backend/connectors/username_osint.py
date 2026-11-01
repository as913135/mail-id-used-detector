import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

PLATFORMS = [
    {
        "name": "GitHub",
        "category": "developer_community",
        "url_pattern": "https://github.com/{}",
        "check_url": "https://github.com/{}",
        "opt_out_url": "https://github.com/settings/profile",
        "privacy_email": "privacy@github.com"
    },
    {
        "name": "Reddit",
        "category": "social_forum",
        "url_pattern": "https://www.reddit.com/user/{}",
        "check_url": "https://www.reddit.com/user/{}/about.json",
        "opt_out_url": "https://www.reddit.com/settings/privacy",
        "privacy_email": "privacy@reddit.com"
    },
    {
        "name": "Pinterest",
        "category": "social_media",
        "url_pattern": "https://www.pinterest.com/{}/",
        "check_url": "https://www.pinterest.com/{}/",
        "opt_out_url": "https://help.pinterest.com/en/article/manage-your-account-privacy",
        "privacy_email": "privacy-support@pinterest.com"
    },
    {
        "name": "Medium",
        "category": "publishing_platform",
        "url_pattern": "https://medium.com/@{}",
        "check_url": "https://medium.com/@{}",
        "opt_out_url": "https://policy.medium.com/medium-privacy-policy-f03bf92035c9",
        "privacy_email": "yourprivacy@medium.com"
    },
    {
        "name": "Dev.to",
        "category": "developer_community",
        "url_pattern": "https://dev.to/{}",
        "check_url": "https://dev.to/{}",
        "opt_out_url": "https://dev.to/settings/misc",
        "privacy_email": "yo@dev.to"
    },
    {
        "name": "GitLab",
        "category": "developer_community",
        "url_pattern": "https://gitlab.com/{}",
        "check_url": "https://gitlab.com/{}",
        "opt_out_url": "https://gitlab.com/-/profile/account",
        "privacy_email": "dpo@gitlab.com"
    },
    {
        "name": "Telegram",
        "category": "messaging_directory",
        "url_pattern": "https://t.me/{}",
        "check_url": "https://t.me/{}",
        "opt_out_url": "https://telegram.org/faq#q-how-do-i-delete-my-account",
        "privacy_email": "support@telegram.org"
    },
    {
        "name": "Linktree",
        "category": "social_landing_page",
        "url_pattern": "https://linktr.ee/{}",
        "check_url": "https://linktr.ee/{}",
        "opt_out_url": "https://linktr.ee/help/en/articles/4849318-how-to-delete-your-linktree-account",
        "privacy_email": "privacy@linktr.ee"
    },
    {
        "name": "Spotify",
        "category": "music_streaming",
        "url_pattern": "https://open.spotify.com/user/{}",
        "check_url": "https://open.spotify.com/user/{}",
        "opt_out_url": "https://www.spotify.com/account/privacy/",
        "privacy_email": "privacy@spotify.com"
    },
    {
        "name": "Vimeo",
        "category": "video_sharing",
        "url_pattern": "https://vimeo.com/{}",
        "check_url": "https://vimeo.com/{}",
        "opt_out_url": "https://vimeo.com/settings/privacy",
        "privacy_email": "privacy@vimeo.com"
    },
    {
        "name": "SoundCloud",
        "category": "audio_sharing",
        "url_pattern": "https://soundcloud.com/{}",
        "check_url": "https://soundcloud.com/{}",
        "opt_out_url": "https://soundcloud.com/pages/privacy",
        "privacy_email": "dataprotection@soundcloud.com"
    },
    {
        "name": "Flickr",
        "category": "photo_sharing",
        "url_pattern": "https://www.flickr.com/people/{}/",
        "check_url": "https://www.flickr.com/people/{}/",
        "opt_out_url": "https://www.flickr.com/account/privacy",
        "privacy_email": "privacy@flickr.com"
    },
    {
        "name": "Keybase",
        "category": "crypto_identity",
        "url_pattern": "https://keybase.io/{}",
        "check_url": "https://keybase.io/{}",
        "opt_out_url": "https://keybase.io/docs/crypto/delete_account",
        "privacy_email": "privacy@keybase.io"
    },
    {
        "name": "HackerNews",
        "category": "tech_forum",
        "url_pattern": "https://news.ycombinator.com/user?id={}",
        "check_url": "https://news.ycombinator.com/user?id={}",
        "opt_out_url": "https://news.ycombinator.com/formatdoc",
        "privacy_email": "privacy@ycombinator.com"
    },
    {
        "name": "ProductHunt",
        "category": "tech_community",
        "url_pattern": "https://www.producthunt.com/@{}",
        "check_url": "https://www.producthunt.com/@{}",
        "opt_out_url": "https://www.producthunt.com/settings",
        "privacy_email": "privacy@producthunt.com"
    },
    {
        "name": "Replit",
        "category": "developer_community",
        "url_pattern": "https://replit.com/@{}",
        "check_url": "https://replit.com/@{}",
        "opt_out_url": "https://replit.com/account#privacy",
        "privacy_email": "privacy@replit.com"
    },
    {
        "name": "Behance",
        "category": "design_portfolio",
        "url_pattern": "https://www.behance.net/{}",
        "check_url": "https://www.behance.net/{}",
        "opt_out_url": "https://help.behance.net/hc/en-us/articles/204484554-Privacy-Settings",
        "privacy_email": "privacy@adobe.com"
    },
    {
        "name": "Dribbble",
        "category": "design_portfolio",
        "url_pattern": "https://dribbble.com/{}",
        "check_url": "https://dribbble.com/{}",
        "opt_out_url": "https://dribbble.com/account/details",
        "privacy_email": "privacy@dribbble.com"
    }
]

def check_single_platform(platform: dict, username: str) -> dict:
    url = platform["check_url"].format(username)
    profile_url = platform["url_pattern"].format(username)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        # Platform-specific heuristics
        name = platform["name"]
        is_found = False

        if name == "Reddit":
            if resp.status_code == 200:
                data = resp.json()
                if "data" in data and not data.get("data", {}).get("is_suspended", False):
                    is_found = True
        elif name == "GitHub":
            is_found = (resp.status_code == 200)
        elif name == "Telegram":
            if resp.status_code == 200 and "tgme_page_title" in resp.text and "If you have Telegram, you can contact" in resp.text:
                is_found = True
        elif name == "HackerNews":
            if resp.status_code == 200 and f"user: {username}" in resp.text:
                is_found = True
        elif name == "Medium":
            if resp.status_code == 200 and "404" not in resp.text and username in resp.text:
                is_found = True
        elif name == "Linktree":
            if resp.status_code == 200 and "Page not found" not in resp.text:
                is_found = True
        else:
            if resp.status_code == 200 and "not found" not in resp.text.lower() and "doesn't exist" not in resp.text.lower():
                is_found = True

        if is_found:
            return {
                "source_name": f"{name} Public Profile",
                "source_category": platform["category"],
                "source_url": profile_url,
                "page_reference": f"@{username} on {name}",
                "match_type": "exact",
                "confidence_level": "high",
                "risk_level": "low",
                "exposed_data_types": [f"Public {name} Account", "Username Association", "Public Activity / Posts"],
                "detection_date": "Active Live Profile",
                "status": "detected",
                "details": f"Public active account detected for '{username}' on {name}. Publicly discoverable by search engines and identity correlation tools.",
                "raw_evidence": f"HTTP status 200 at {url}",
                "opt_out_url": platform["opt_out_url"],
                "privacy_email": platform["privacy_email"]
            }
    except Exception:
        pass
    return None

def check_username_exposure(username: str) -> list:
    """
    Scans top 18 public platforms concurrently with real HTTP checks.
    Returns only verified, active profiles.
    """
    clean_user = username.strip()
    if not clean_user or len(clean_user) < 3:
        return []

    active_findings = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(check_single_platform, p, clean_user) for p in PLATFORMS]
        for f in as_completed(futures):
            res = f.result()
            if res:
                active_findings.append(res)

    return active_findings
