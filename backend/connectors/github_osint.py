import requests
import logging

logger = logging.getLogger(__name__)

def check_github_exposure(identifier: str, id_type: str = "email") -> list:
    """
    Checks if email or username is publicly exposed in GitHub public commit logs or public profile.
    """
    findings = []
    headers = {
        "User-Agent": "PrivaScan-OSINT/1.0",
        "Accept": "application/vnd.github.v3+json"
    }

    try:
        if id_type == "email":
            # 1. Search public commit history for author email exposure
            clean_email = identifier.strip().lower()
            url = f"https://api.github.com/search/commits?q=author-email:{clean_email}&per_page=5"
            resp = requests.get(url, headers=headers, timeout=6)
            
            if resp.status_code == 200:
                data = resp.json()
                total_commits = data.get("total_count", 0)
                items = data.get("items", [])
                
                if total_commits > 0:
                    sample_commit = items[0]
                    repo = sample_commit.get("repository", {})
                    repo_name = repo.get("full_name", "public repository")
                    repo_url = repo.get("html_url", "https://github.com")
                    commit_author = sample_commit.get("commit", {}).get("author", {})
                    author_name = commit_author.get("name", "Unknown Developer")
                    commit_date = commit_author.get("date", "Unknown Date")
                    
                    findings.append({
                        "source_name": "GitHub Public Git Commits",
                        "source_category": "code_repository",
                        "source_url": repo_url,
                        "page_reference": f"Repo: {repo_name} ({total_commits} public commits indexed)",
                        "match_type": "exact",
                        "confidence_level": "high",
                        "risk_level": "medium",
                        "exposed_data_types": ["Author Name", "Personal Email in Git Logs", "Public Code Contributions", "Timestamped Activity"],
                        "detection_date": commit_date,
                        "status": "detected",
                        "details": f"Your email address is permanently embedded in {total_commits} public Git commit headers in repository '{repo_name}'. Author name visible: '{author_name}'.",
                        "raw_evidence": f"Found in GitHub Commit Search API: repo {repo_name}, commit author {author_name} <{clean_email}>.",
                        "opt_out_url": "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address",
                        "privacy_email": "support@github.com"
                    })

        elif id_type == "username":
            clean_user = identifier.strip()
            url = f"https://api.github.com/users/{clean_user}"
            resp = requests.get(url, headers=headers, timeout=6)
            if resp.status_code == 200:
                user_data = resp.json()
                name = user_data.get("name") or clean_user
                bio = user_data.get("bio") or ""
                company = user_data.get("company") or ""
                location = user_data.get("location") or ""
                blog = user_data.get("blog") or ""
                public_repos = user_data.get("public_repos", 0)
                html_url = user_data.get("html_url", f"https://github.com/{clean_user}")

                exposed_fields = [f"Full Name: {name}", f"Public Repositories ({public_repos})"]
                if location:
                    exposed_fields.append(f"Location: {location}")
                if company:
                    exposed_fields.append(f"Company: {company}")
                if blog:
                    exposed_fields.append(f"Personal Website: {blog}")

                findings.append({
                    "source_name": "GitHub Developer Profile",
                    "source_category": "public_profile",
                    "source_url": html_url,
                    "page_reference": f"GitHub Profile: @{clean_user}",
                    "match_type": "exact",
                    "confidence_level": "high",
                    "risk_level": "low",
                    "exposed_data_types": exposed_fields,
                    "detection_date": "Active Profile",
                    "status": "detected",
                    "details": f"Public developer profile found for @{clean_user}. Repositories: {public_repos}. Bio: '{bio or 'None'}'. Location: '{location or 'None'}'.",
                    "raw_evidence": f"GitHub API user record id={user_data.get('id')}, url={html_url}",
                    "opt_out_url": f"https://github.com/settings/profile",
                    "privacy_email": "privacy@github.com"
                })

    except Exception as e:
        logger.warning(f"GitHub OSINT check error for {identifier}: {e}")

    return findings
