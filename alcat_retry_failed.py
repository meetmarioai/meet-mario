"""
MediBalans ALCAT Retry Failed
Retries only the failed patients from alcat_ingest_progress.json
Compresses large PDFs before sending to avoid 413 errors

Run:
    pip install anthropic pillow pymupdf
    python alcat_retry_failed.py
"""

import os, sys, json, time, base64, pathlib, io
import anthropic
import requests
from datetime import datetime, timezone

# ── CONFIG ────────────────────────────────────────────────────────────────────
PATIENTS_DIR  = r"C:\Users\TheLo\Desktop\Patients Anamnes"
ANTHROPIC_KEY = "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"
SUPABASE_URL  = "https://pofvfzbaxaqgouguoiog.supabase.co"
SUPABASE_KEY  = "sb_secret_M5p7V6P2Z2h1u5MoX_aTVg_0S8_tSLk"
RESUME_FILE   = "alcat_ingest_progress.json"
DELAY_SECS    = 0.5
MAX_B64_BYTES = 4_000_000  # 4MB limit before compression
# ─────────────────────────────────────────────────────────────────────────────

HEADERS_SB = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

PROMPT = """You are parsing an ALCAT Food Sensitivity Test Report PDF.
Extract ALL food items and their reactivity levels.
Return ONLY a valid JSON object, no markdown, no explanation:
{
  "name": "PATIENT FULL NAME",
  "dob": "date of birth string",
  "test_date": "date reported",
  "lab_id": "lab ID number string",
  "sex": "male or female",
  "severe": ["FOOD1","FOOD2"],
  "moderate": ["FOOD1","FOOD2"],
  "mild": ["FOOD1","FOOD2"],
  "acceptable": ["FOOD1","FOOD2"],
  "candida": "none|mild|moderate|severe",
  "gluten": "none|mild|moderate|severe",
  "casein": "none|mild|moderate|severe",
  "whey": "none|mild|moderate|severe",
  "conditions": ["Candida moderate", "Casein mild"]
}
Rules:
- ALL food names UPPERCASE
- severe=red column, moderate=orange, mild=yellow, acceptable=green
- Include EVERY food in each column
- Return ONLY the JSON object"""


def is_swedish_pdf(pdf_path):
    n = pdf_path.name.lower().replace('-',' ').replace('_',' ')
    return any(x in n for x in [' sw ',' swe ','sw-','swe-','-sw-'])


def find_english_alcat_pdf(folder_path):
    pdfs = list(pathlib.Path(folder_path).glob("*.pdf")) or \
           list(pathlib.Path(folder_path).glob("**/*.pdf"))
    english = [p for p in pdfs if not is_swedish_pdf(p)]
    alcat   = [p for p in english if any(x in p.name.lower() for x in ['alcat','(alc)','alc-','food sens'])]
    return alcat[0] if alcat else (english[0] if english else None)


def pdf_to_base64_compressed(pdf_path):
    """Convert PDF to base64, compressing via image conversion if too large."""
    raw = open(pdf_path, "rb").read()
    b64 = base64.b64encode(raw).decode("utf-8")
    
    if len(b64) <= MAX_B64_BYTES:
        return b64, "application/pdf"
    
    # Too large — convert first page to JPEG via fitz (pymupdf)
    try:
        import fitz
        doc = fitz.open(pdf_path)
        page = doc[0]
        mat = fitz.Matrix(1.5, 1.5)  # 1.5x zoom
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("jpeg")
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        print(f"[compressed to JPEG {len(b64)//1024}KB]", end=" ", flush=True)
        return b64, "image/jpeg"
    except ImportError:
        # pymupdf not available — try PIL
        try:
            from PIL import Image
            import fitz
            raise ImportError("use fitz")
        except:
            # Last resort — just truncate and try anyway
            print(f"[WARNING: large PDF {len(b64)//1024}KB, sending anyway]", end=" ")
            return b64, "application/pdf"


def parse_alcat_direct(pdf_path, client):
    b64, media_type = pdf_to_base64_compressed(pdf_path)
    
    content_type = "document" if media_type == "application/pdf" else "image"
    
    msg = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system="You are a precise medical data extraction assistant. Return only valid JSON, no markdown.",
        messages=[{
            "role": "user",
            "content": [
                {"type": content_type, "source": {"type": "base64", "media_type": media_type, "data": b64}},
                {"type": "text", "text": PROMPT}
            ]
        }]
    )
    raw = msg.content[0].text.replace("```json","").replace("```","").strip()
    parsed = json.loads(raw)
    if not all(k in parsed for k in ["severe","moderate","mild"]):
        raise ValueError("Incomplete parse")
    return parsed


def upsert_patient(folder_name, alcat, pdf_path):
    row = {
        "folder_name": folder_name,
        "name": alcat.get("name", folder_name),
        "dob": alcat.get("dob"),
        "test_date": alcat.get("test_date"),
        "lab_id": alcat.get("lab_id"),
        "sex": alcat.get("sex"),
        "severe": alcat.get("severe", []),
        "moderate": alcat.get("moderate", []),
        "mild": alcat.get("mild", []),
        "acceptable": alcat.get("acceptable", []),
        "candida": alcat.get("candida", "none"),
        "gluten": alcat.get("gluten", "none"),
        "casein": alcat.get("casein", "none"),
        "whey": alcat.get("whey", "none"),
        "conditions": alcat.get("conditions", []),
        "source_pdf": pdf_path.name,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }
    r = requests.post(f"{SUPABASE_URL}/rest/v1/alcat_patients", headers=HEADERS_SB, json=row, timeout=15)
    r.raise_for_status()


def main():
    if "PASTE_YOUR" in ANTHROPIC_KEY or "PASTE_YOUR" in SUPABASE_KEY:
        print("ERROR: paste your API keys into the script first")
        sys.exit(1)

    # Load progress and find failed patients
    if not os.path.exists(RESUME_FILE):
        print("ERROR: alcat_ingest_progress.json not found")
        sys.exit(1)

    with open(RESUME_FILE) as f:
        progress = json.load(f)

    completed = set(progress["completed"])
    failed = progress["failed"]

    # Filter out "no english pdf" — those can't be fixed
    retryable = {k: v for k, v in failed.items() 
                 if v != "no english pdf" and v != "Incomplete parse — Swedish layout"}
    
    print(f"Failed total: {len(failed)}")
    print(f"Retryable (excluding no-english-pdf): {len(retryable)}")
    print()

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    ok = 0
    fail = 0
    new_failed = {}

    for i, (folder_name, prev_error) in enumerate(retryable.items()):
        folder = pathlib.Path(PATIENTS_DIR) / folder_name
        if not folder.exists():
            print(f"[{i+1}/{len(retryable)}] {folder_name} ... FOLDER NOT FOUND")
            new_failed[folder_name] = "folder not found"
            continue

        print(f"[{i+1}/{len(retryable)}] {folder_name}", end=" ... ", flush=True)

        try:
            pdf = find_english_alcat_pdf(folder)
            if not pdf:
                print("NO ENGLISH PDF — skipping")
                new_failed[folder_name] = "no english pdf"
                fail += 1
                continue

            alcat = parse_alcat_direct(pdf, client)
            upsert_patient(folder_name, alcat, pdf)
            completed.add(folder_name)
            # Remove from failed
            if folder_name in failed:
                del failed[folder_name]
            # Save progress
            with open(RESUME_FILE, "w") as f:
                json.dump({"completed": list(completed), "failed": failed}, f, indent=2)
            ok += 1
            print(f"OK — {len(alcat['severe'])}S {len(alcat['moderate'])}M {len(alcat['mild'])}m")

        except Exception as e:
            new_failed[folder_name] = str(e)
            failed[folder_name] = str(e)
            with open(RESUME_FILE, "w") as f:
                json.dump({"completed": list(completed), "failed": failed}, f, indent=2)
            fail += 1
            print(f"FAILED: {e}")

        time.sleep(DELAY_SECS)

    print(f"\n── RETRY DONE ── Recovered: {ok} / Still failing: {fail}")
    print(f"Total in database: {len(completed)}")


if __name__ == "__main__":
    main()
