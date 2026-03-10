"""
MediBalans ALCAT Batch Ingestion v2
Calls Anthropic API directly — no Vercel middleman
Skips already-completed patients from v1 progress file

Run:
    pip install anthropic
    python alcat_ingest_v2.py
"""

import os, sys, json, time, base64, pathlib
import anthropic
from datetime import datetime, timezone
import requests

# ── CONFIG ────────────────────────────────────────────────────────────────────
PATIENTS_DIR  = r"C:\Users\TheLo\Desktop\Patients Anamnes"
ANTHROPIC_KEY = "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"
SUPABASE_URL  = "https://pofvfzbaxaqgouguoiog.supabase.co"
SUPABASE_KEY  = "sb_secret_M5p7V6P2Z2h1u5MoX_aTVg_0S8_tSLk"
DELAY_SECS    = 0.3
RESUME_FILE   = "alcat_ingest_progress.json"
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
- candida/gluten/casein/whey: extract reactivity level from blue panel boxes
- conditions: only include markers that show a reaction
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


def parse_alcat_direct(pdf_path, client):
    with open(pdf_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    msg = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system="You are a precise medical data extraction assistant. Return only valid JSON, no markdown.",
        messages=[{
            "role": "user",
            "content": [
                {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}},
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


def load_progress():
    if os.path.exists(RESUME_FILE):
        with open(RESUME_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": {}}


def save_progress(progress):
    with open(RESUME_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def main():
    if "PASTE_YOUR" in ANTHROPIC_KEY or "PASTE_YOUR" in SUPABASE_KEY:
        print("ERROR: paste your API keys into the script first")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    folders = sorted([f for f in pathlib.Path(PATIENTS_DIR).iterdir() if f.is_dir()])
    print(f"Found {len(folders)} patient folders")

    progress  = load_progress()
    completed = set(progress["completed"])
    failed    = progress["failed"]
    ok = len(completed)
    fail = 0

    for i, folder in enumerate(folders):
        name = folder.name
        if name in completed:
            continue

        print(f"[{i+1}/{len(folders)}] {name}", end=" ... ", flush=True)

        try:
            pdf = find_english_alcat_pdf(folder)
            if not pdf:
                print("NO ENGLISH PDF — skipping")
                failed[name] = "no english pdf"
                save_progress({"completed": list(completed), "failed": failed})
                fail += 1
                continue

            alcat = parse_alcat_direct(pdf, client)
            upsert_patient(name, alcat, pdf)
            completed.add(name)
            save_progress({"completed": list(completed), "failed": failed})
            ok += 1
            print(f"OK — {len(alcat['severe'])}S {len(alcat['moderate'])}M {len(alcat['mild'])}m")

        except Exception as e:
            failed[name] = str(e)
            save_progress({"completed": list(completed), "failed": failed})
            fail += 1
            print(f"FAILED: {e}")

        time.sleep(DELAY_SECS)

    print(f"\n── DONE ── Success: {ok} / Failed: {fail}")


if __name__ == "__main__":
    main()
