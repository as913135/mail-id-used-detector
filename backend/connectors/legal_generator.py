import urllib.parse
from datetime import datetime

def generate_legal_notice(
    framework: str,
    user_name: str,
    identifier_value: str,
    identifier_type: str,
    target_fiduciary: str,
    target_email: str = None,
    listing_url: str = None
) -> dict:
    """
    Generates customized, legally enforceable personal data erasure demand notices
    under India DPDP Act 2023, EU GDPR, or California CCPA/CPRA.
    """
    date_str = datetime.utcnow().strftime("%B %d, %Y")
    
    if framework == "DPDP_2023":
        subject = f"FORMAL NOTICE: Demand for Erasure of Personal Data under Section 12, DPDP Act 2023 - {user_name}"
        body = f"""To: The Data Protection Officer / Grievance Officer,
{target_fiduciary}

Date: {date_str}
Subject: Request for Correction and Erasure of Personal Data under Section 12 of the Digital Personal Data Protection Act, 2023 (DPDP Act)

Dear Data Protection Officer / Grievance Redressal Officer,

I, {user_name}, am writing to you in my capacity as a Data Principal under the provisions of the Digital Personal Data Protection Act, 2023 (DPDP Act, Act No. 22 of 2023).

1. IDENTITY & IDENTIFIER UNDER REFERENCE:
   - Data Principal Name: {user_name}
   - Personal Identifier: {identifier_value} ({identifier_type.upper()})
   - Public Listing / Reference: {listing_url or 'All records held within your databases and public indexes'}

2. STATUTORY BASIS:
   Pursuant to Section 12(1)(c) of the Digital Personal Data Protection Act, 2023:
   "A Data Principal shall have the right to the erasure of her personal data, in such manner as may be prescribed, in respect of which she had previously given her consent or in respect of which specified purpose is no longer being served..."

3. DEMAND:
   I hereby formally demand that {target_fiduciary}:
   a) Immediately erase and permanently delete all personal data relating to me, including but not limited to my {identifier_type} ({identifier_value}) and any associated profile or contact details, from your systems, servers, and public directories.
   b) Cease and desist from sharing, licensing, selling, indexing, or transmitting my personal data to any third-party data processors or aggregators.
   c) Notify all third-party recipients of my personal data regarding this erasure request.

4. GRIEVANCE REDRESSAL & TIMELINE:
   Under Section 13 of the DPDP Act, I request written confirmation of compliance within thirty (30) days from the receipt of this communication. In the event of non-compliance or failure to acknowledge, I reserve the right to file an official complaint before the Data Protection Board of India under Section 13(3) of the Act.

Kindly confirm receipt of this notice and provide written verification once the erasure is complete.

Yours sincerely,

{user_name}
Data Principal
Contact Email / Identifier: {identifier_value}
"""

    elif framework == "GDPR_ART17":
        subject = f"GDPR Article 17: Request for Erasure (Right to be Forgotten) - {user_name}"
        body = f"""To: The Data Protection Officer (DPO),
{target_fiduciary}

Date: {date_str}
Subject: Formal Request for Erasure of Personal Data pursuant to Article 17 of the General Data Protection Regulation (EU GDPR / UK GDPR)

Dear Data Protection Officer,

I am writing to formally exercise my right to erasure ('Right to be Forgotten') under Article 17 of the General Data Protection Regulation (GDPR) (Regulation (EU) 2016/679).

1. DATA SUBJECT DETAILS:
   - Full Legal Name: {user_name}
   - Personal Identifier: {identifier_value} ({identifier_type.upper()})
   - Source Reference: {listing_url or 'All databases and public directory indexes'}

2. GROUNDS FOR ERASURE:
   In accordance with Article 17(1) of the GDPR, my personal data must be erased without undue delay because:
   - The personal data are no longer necessary in relation to the purposes for which they were collected or otherwise processed (Article 17(1)(a)).
   - I withdraw any implied or explicit consent on which the processing may have been based, and there is no other legal ground for the processing (Article 17(1)(b)).
   - I object to the processing pursuant to Article 21(1) and there are no overriding legitimate grounds for the processing (Article 17(1)(c)).

3. SCOPE OF REQUEST:
   Please delete all personal data concerning me held by {target_fiduciary}, including backups, and ensure that any third parties or processors with whom my data was shared are instructed to erase any links to, or copy or replication of, those personal data (Article 17(2)).

4. STATUTORY TIMELINE:
   As required by Article 12(3) of the GDPR, you must provide information on action taken on this request without undue delay and in any event within one month of receipt.

I look forward to your prompt written confirmation.

Sincerely,

{user_name}
Data Subject
Email: {identifier_value}
"""

    elif framework == "CCPA_1798":
        subject = f"CCPA/CPRA Request to Delete Personal Information - {user_name}"
        body = f"""To: Privacy Compliance Department,
{target_fiduciary}

Date: {date_str}
Subject: Consumer Request to Delete Personal Information under the California Consumer Privacy Act (Cal. Civ. Code § 1798.105)

To Whom It May Concern,

I am writing to submit a verifiable consumer request pursuant to the California Consumer Privacy Act of 2018 (CCPA), as amended by the California Privacy Rights Act of 2020 (CPRA), Cal. Civ. Code § 1798.100 et seq.

1. CONSUMER IDENTIFICATION:
   - Consumer Name: {user_name}
   - Identifier to Delete: {identifier_value} ({identifier_type.upper()})
   - Reference URL / Profile: {listing_url or 'All records in company databases'}

2. REQUEST:
   Under Cal. Civ. Code § 1798.105, I have the right to request that a business delete any personal information about me which the business has collected.

   I hereby direct {target_fiduciary} to:
   - Permanently delete all personal information collected about me from your records.
   - Direct all service providers, contractors, and third-party data recipients to delete my personal information from their records.
   - Treat this communication as a formal Do Not Sell or Share My Personal Information request under Cal. Civ. Code § 1798.120.

3. STATUTORY TIMELINE:
   In accordance with CCPA regulations, please confirm receipt of this request within 10 business days and substantive completion within 45 calendar days.

Sincerely,

{user_name}
Verified Consumer
Email: {identifier_value}
"""

    else:
        # Standard Privacy Opt-Out
        subject = f"Personal Data Removal and Opt-Out Request - {user_name}"
        body = f"""To: Privacy and Support Team,
{target_fiduciary}

Date: {date_str}
Subject: Request for Removal of Personal Contact Details and Public Listings

Dear Privacy Team,

I am writing to request the permanent removal and unlisting of my personal information from your website and services.

- Name: {user_name}
- Identifier: {identifier_value} ({identifier_type.upper()})
- Target URL: {listing_url or 'All company indexes'}

I do not consent to having my personal contact details published, made searchable, or distributed through your public directories or commercial databases.

Please unlist and delete my records immediately and provide written confirmation upon completion.

Thank you for your assistance.

Sincerely,
{user_name}
Email: {identifier_value}
"""

    # Build mailto URL
    mailto_url = ""
    if target_email:
        enc_sub = urllib.parse.quote(subject)
        enc_body = urllib.parse.quote(body)
        mailto_url = f"mailto:{target_email}?subject={enc_sub}&body={enc_body}"

    return {
        "framework": framework,
        "subject": subject,
        "body": body,
        "target_email": target_email,
        "mailto_url": mailto_url
    }
