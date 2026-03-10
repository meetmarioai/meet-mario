"""
MediBalans ALCAT Batch Ingestion
Reads 970 patient folders from Desktop/Patients Anamnes
Parses each ALCAT PDF via Meet Mario /api/chat
Stores structured data in Supabase alcat_patients table

Run:
    pip install requests
    python alcat_ingest.py
"""

import os
import sys
import json
import time
import base64
import pathlib
import requests
from datetime import datetime

# ── CONFIG ────────────────────────────────────────────────────────────────────
PATIENTS_DIR = r"C:\Users\TheLo\Desktop\Patients Anamnes"
API_URL       = "https://meet-mario.vercel.app/api/chat"
SUPABASE_URL  = "https://pofvfzbaxaqgouguoiog.supabase.co"
SUPABASE_KEY  = "sb_secret_tMzH3n3u0_n0PdGLj7wQiw_Dq3ScMmu"
DELAY_SECS    = 0.5
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


def is_swedish_layout(pdf_path):
    name_lower = pdf_path.name.lower()
    parts = name_lower.replace('-', ' ').replace('_', ' ').split()
    return 'sw' in parts or 'swe' in parts or 'sw-' in name_lower or '-sw-' in name_lower or ' sw ' in name_lower or 'swe-' in name_lower


def find_english_alcat_pdf(folder_path):
    pdfs = list(pathlib.Path(folder_path).glob("*.pdf"))
    if not pdfs:
        pdfs = list(pathlib.Path(folder_path).glob("**/*.pdf"))
    english_pdfs = [p for p in pdfs if not is_swedish_layout(p)]
    alcat_pdfs = [p for p in english_pdfs if
                  any(x in p.name.lower() for x in ['alcat', '(alc)', 'alc-', 'food sens', 'alc '])]
    if alcat_pdfs:
        return alcat_pdfs[0]
    return english_pdfs[0] if english_pdfs else None


def pdf_to_base64(pdf_path):
    with open(pdf_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def parse_alcat_via_api(pdf_path):
    b64 = pdf_to_base64(pdf_path)
    payload = {
        "system": "You are a precise medical data extraction assistant. Return only valid JSON, no markdown.",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}},
                {"type": "text", "text": PROMPT}
            ]
        }]
    }
    resp = requests.post(API_URL, json=payload, timeout=90)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise ValueError(f"API error: {data['error']}")
    raw = data.get("text", "").replace("```json", "").replace("```", "").strip()
    parsed = json.loads(raw)
    if not all(k in parsed for k in ["severe", "moderate", "mild"]):
        raise ValueError("Incomplete parse")
    return parsed


def upsert_patient(folder_name, alcat_data, pdf_path):
    row = {
        "folder_name": folder_name,
        "name": alcat_data.get("name", folder_name),
        "dob": alcat_data.get("dob"),
        "test_date": alcat_data.get("test_date"),
        "lab_id": alcat_data.get("lab_id"),
        "sex": alcat_data.get("sex"),
        "severe": alcat_data.get("severe", []),
        "moderate": alcat_data.get("moderate", []),
        "mild": alcat_data.get("mild", []),
        "acceptable": alcat_data.get("acceptable", []),
        "candida": alcat_data.get("candida", "none"),
        "gluten": alcat_data.get("gluten", "none"),
        "casein": alcat_data.get("casein", "none"),
        "whey": alcat_data.get("whey", "none"),
        "conditions": alcat_data.get("conditions", []),
        "source_pdf": str(pdf_path.name),
        "ingested_at": datetime.utcnow().isoformat(),
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/alcat_patients",
        headers=HEADERS_SB,
        json=row,
        timeout=15
    )
    resp.raise_for_status()


def load_progress():
    if os.path.exists(RESUME_FILE):
        with open(RESUME_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": {}}


def save_progress(progress):
    with open(RESUME_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def main():
    if SUPABASE_KEY == "PASTE_YOUR_SERVICE_ROLE_KEY_HERE":
        print("ERROR: paste your Supabase service_role key into the script first")
        sys.exit(1)

    patients_dir = pathlib.Path(PATIENTS_DIR)
    folders = sorted([f for f in patients_dir.iterdir() if f.is_dir()])
    print(f"Found {len(folders)} patient folders")

    progress = load_progress()
    completed = set(progress["completed"])
    failed = progress["failed"]
    success_count = len(completed)
    fail_count = len(failed)

    for i, folder in enumerate(folders):
        folder_name = folder.name
        if folder_name in completed:
            continue

        print(f"[{i+1}/{len(folders)}] {folder_name}", end=" ... ", flush=True)

        try:
            pdf = find_english_alcat_pdf(folder)
            if not pdf:
                print("NO ENGLISH PDF — skipping")
                failed[folder_name] = "no english pdf"
                save_progress({"completed": list(completed), "failed": failed})
                fail_count += 1
                continue

            alcat = parse_alcat_via_api(pdf)
            upsert_patient(folder_name, alcat, pdf)
            completed.add(folder_name)
            save_progress({"completed": list(completed), "failed": failed})
            success_count += 1
            print(f"OK — {len(alcat['severe'])}S {len(alcat['moderate'])}M {len(alcat['mild'])}m  [{pdf.name}]")

        except Exception as e:
            failed[folder_name] = str(e)
            save_progress({"completed": list(completed), "failed": failed})
            fail_count += 1
            print(f"FAILED: {e}")

        time.sleep(DELAY_SECS)

    print(f"\n── DONE ── Success: {success_count} / Failed: {fail_count}")


if __name__ == "__main__":
    main()
