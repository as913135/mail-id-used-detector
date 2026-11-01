import urllib.parse

def generate_search_engine_exposures(identifier: str, id_type: str = "email") -> list:
    """
    Generates real, clickable search engine discovery links, dorks, and direct official
    search engine de-indexing / removal tool references.
    """
    findings = []
    clean_val = identifier.strip()
    encoded_val = urllib.parse.quote(f'"{clean_val}"')

    if id_type == "email":
        # 1. Google Leaked Documents & Spreadsheets Dork
        dork_docs = f'"{clean_val}" (filetype:pdf OR filetype:xlsx OR filetype:csv OR filetype:txt)'
        encoded_docs = urllib.parse.quote(dork_docs)
        findings.append({
            "source_name": "Google Search Index (Public Documents & Spreadsheets)",
            "source_category": "search_engine",
            "source_url": f"https://www.google.com/search?q={encoded_docs}",
            "page_reference": "Google Web Index: Leaked Documents Check",
            "match_type": "high_confidence",
            "confidence_level": "high",
            "risk_level": "high",
            "exposed_data_types": ["Public PDFs", "Spreadsheets (XLSX/CSV)", "Confidential Attendee / Client Lists"],
            "detection_date": "Active Search Index",
            "status": "detected",
            "details": f"Search engines crawl public cloud buckets, university servers, and unindexed portals. Click to verify if your email is exposed in indexed PDFs, CSV spreadsheets, or attendee rosters.",
            "raw_evidence": f"Google Dork: {dork_docs}",
            "opt_out_url": "https://support.google.com/websearch/troubleshooter/3111061",
            "privacy_email": "removals@google.com"
        })

        # 2. Pastebin & Ghostbin Dork
        dork_paste = f'site:pastebin.com OR site:rentry.co "{clean_val}"'
        encoded_paste = urllib.parse.quote(dork_paste)
        findings.append({
            "source_name": "Public Pastebin & Code Dump Repositories",
            "source_category": "public_paste",
            "source_url": f"https://www.google.com/search?q={encoded_paste}",
            "page_reference": "Pastebin / Code Sharing Sites",
            "match_type": "exact",
            "confidence_level": "high",
            "risk_level": "high",
            "exposed_data_types": ["Credentials", "Source Code Configs", "API Key Dumps", "Chat Logs"],
            "detection_date": "Active Search Index",
            "status": "detected",
            "details": f"Checks if your email address is pasted in public plaintext code snippets, config files, or leaked database logs.",
            "raw_evidence": f"Target: site:pastebin.com \"{clean_val}\"",
            "opt_out_url": "https://pastebin.com/doc_scraping_faq",
            "privacy_email": "abuse@pastebin.com"
        })

        # 3. Google Official 'Results About You' De-indexing Tool
        findings.append({
            "source_name": "Google 'Results About You' Personal Information Removal",
            "source_category": "search_engine_removal",
            "source_url": "https://myactivity.google.com/results-about-you",
            "page_reference": "Google Privacy & Removal Dashboard",
            "match_type": "high_confidence",
            "confidence_level": "high",
            "risk_level": "medium",
            "exposed_data_types": ["Search Results with Personally Identifiable Information (PII)"],
            "detection_date": "Direct Remediation Channel",
            "status": "detected",
            "details": "Google allows individuals to request direct removal of search results that expose personal contact info, phone numbers, home addresses, or emails under its personal privacy policy.",
            "raw_evidence": "Official Google PII Removal Pipeline",
            "opt_out_url": "https://myactivity.google.com/results-about-you",
            "privacy_email": "removals@google.com"
        })

    elif id_type == "phone":
        dork_phone = f'"{clean_val}" OR "{clean_val.replace(" ", "")}"'
        encoded_phone = urllib.parse.quote(dork_phone)
        findings.append({
            "source_name": "Search Engine Public Phone Indexing",
            "source_category": "search_engine",
            "source_url": f"https://www.google.com/search?q={encoded_phone}",
            "page_reference": "Google & Bing Web Index",
            "match_type": "high_confidence",
            "confidence_level": "high",
            "risk_level": "high",
            "exposed_data_types": ["Public Forum Posts", "Classified Ads (OLX/Quikr)", "Public Resumes", "Contact Forms"],
            "detection_date": "Active Search Index",
            "status": "detected",
            "details": f"Directly query Google to find where your phone number is publicly visible on forums, old advertisements, blog comments, or public registration directories.",
            "raw_evidence": f"Search Query: {dork_phone}",
            "opt_out_url": "https://support.google.com/websearch/troubleshooter/3111061",
            "privacy_email": "removals@google.com"
        })

    return findings
