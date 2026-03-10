#!/usr/bin/env python3
"""
patch_connect.py
1. Copies root MeetMario.jsx → src/components/MeetMario.jsx (overwrites)
2. Injects shared PatientContext so Baby Balans reads ALCAT + genomic data
   from the same store as the main dashboard
Run from project root: python patch_connect.py
"""

import os, shutil, re, sys

ROOT_JSX   = "MeetMario.jsx"
TARGET_JSX = os.path.join("src", "components", "MeetMario.jsx")

# ── STEP 1: copy root → src/components ──────────────────────────────────────
if not os.path.exists(ROOT_JSX):
    print(f"ERROR: {ROOT_JSX} not found in project root")
    sys.exit(1)

os.makedirs(os.path.join("src", "components"), exist_ok=True)
shutil.copy2(ROOT_JSX, TARGET_JSX)
print(f"Copied {ROOT_JSX} → {TARGET_JSX} ✓")

# ── STEP 2: read the file we just copied ────────────────────────────────────
with open(TARGET_JSX, "r", encoding="utf-8") as f:
    src = f.read()

# ── STEP 3: inject PatientContext provider + usePatientContext hook ──────────
# Insert after the last import line, before the first const/function declaration

CONTEXT_BLOCK = '''
// ─── SHARED PATIENT CONTEXT ──────────────────────────────────────────────────
// Single source of truth shared between MeetMario dashboard and Baby Balans.
// Persisted to sessionStorage so state survives tab navigation.

const PatientContext = React.createContext(null);

function loadSession() {
  try {
    const raw = sessionStorage.getItem("mm_patient");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(data) {
  try { sessionStorage.setItem("mm_patient", JSON.stringify(data)); } catch {}
}

const DEFAULT_PATIENT = {
  name:        "Christina",
  alcat:       null,   // { severe:[], moderate:[], candida:bool, whey:bool }
  genomics: {
    varsA:     [],     // mother's variant ids
    varsB:     [],     // father's variant ids
    fileA:     null,
    fileB:     null,
    results:   [],
  },
  trimester:   null,   // 1 | 2 | 3
  eddDate:     null,   // estimated due date ISO string
  wgsOrdered:  false,
};

export function PatientProvider({ children }) {
  const [patient, setPatientRaw] = React.useState(() => ({
    ...DEFAULT_PATIENT,
    ...(loadSession() || {}),
  }));

  const setPatient = React.useCallback((updater) => {
    setPatientRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveSession(next);
      return next;
    });
  }, []);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = React.useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}

'''

# Find insertion point — after all import statements
import_end = 0
for m in re.finditer(r'^import\s', src, re.MULTILINE):
    import_end = m.end()

# Find the end of the last import line
last_import_line_end = src.find('\n', import_end) + 1

# Check if context already injected
if "PatientContext" in src:
    print("PatientContext: already present, skipping injection")
else:
    src = src[:last_import_line_end] + CONTEXT_BLOCK + src[last_import_line_end:]
    print("PatientContext: injected ✓")

# ── STEP 4: wire usePatient into BabyBalansTab ───────────────────────────────
# Replace the standalone varsA/varsB state in BabyBalansTab with context-backed state

OLD_BABY_STATE = '''  const [varsA, setVarsA]         = useState(new Set());
  const [varsB, setVarsB]         = useState(new Set());'''

NEW_BABY_STATE = '''  // Pull from shared patient context so ALCAT + genomic data is unified
  const { patient, setPatient }   = usePatient();
  const varsA = new Set(patient.genomics.varsA || []);
  const varsB = new Set(patient.genomics.varsB || []);
  const setVarsA = (val) => setPatient(p => ({ ...p, genomics: { ...p.genomics, varsA: [...(typeof val === "function" ? val(new Set(p.genomics.varsA)) : val)] }}));
  const setVarsB = (val) => setPatient(p => ({ ...p, genomics: { ...p.genomics, varsB: [...(typeof val === "function" ? val(new Set(p.genomics.varsB)) : val)] }}));'''

if OLD_BABY_STATE in src:
    src = src.replace(OLD_BABY_STATE, NEW_BABY_STATE, 1)
    print("BabyBalansTab context wiring: patched ✓")
else:
    print("WARNING: BabyBalansTab state anchor not found — context wiring skipped")

# ── STEP 5: wire usePatient into main MeetMario component ───────────────────
# Add patient context destructure at top of MeetMario function body
OLD_FIRST_STATE = '  const [tab,setTab]                   = useState("monitor");'
NEW_FIRST_STATE = '''  // Shared patient context
  const { patient, setPatient } = usePatient();

  const [tab,setTab]                   = useState("monitor");'''

if OLD_FIRST_STATE in src:
    src = src.replace(OLD_FIRST_STATE, NEW_FIRST_STATE, 1)
    print("MeetMario usePatient hook: injected ✓")
else:
    print("WARNING: MeetMario first state anchor not found — skipping")

# ── STEP 6: wrap export default with PatientProvider ────────────────────────
# Find the export default and wrap the returned JSX

OLD_EXPORT = 'export default function MeetMario() {'
NEW_EXPORT = '''function MeetMarioInner() {'''

PROVIDER_WRAPPER = '''
export default function MeetMario() {
  return (
    <PatientProvider>
      <MeetMarioInner />
    </PatientProvider>
  );
}
'''

if "MeetMarioInner" not in src:
    src = src.replace(OLD_EXPORT, NEW_EXPORT, 1)
    # Append provider wrapper before the very last line
    src = src.rstrip() + "\n" + PROVIDER_WRAPPER
    print("PatientProvider wrapper: injected ✓")
else:
    print("PatientProvider wrapper: already present, skipping")

# ── STEP 7: add cross-link from Genetic Compatibility card in Baby Balans ───
# When results are saved, also persist to patient context
OLD_SET_RESULTS = '      setResults(res);'
NEW_SET_RESULTS = '''      setResults(res);
      // Persist to shared patient context
      setPatient(p => ({ ...p, genomics: { ...p.genomics, results: res }}));'''

if OLD_SET_RESULTS in src and "Persist to shared patient context" not in src:
    src = src.replace(OLD_SET_RESULTS, NEW_SET_RESULTS, 1)
    print("Results persistence to context: patched ✓")
else:
    print("Results persistence: already present or anchor not found, skipping")

# ── STEP 8: add trimester bridge in Baby Balans order modal ─────────────────
# Surface trimester selector so Trimester nutrition tab stays in sync
OLD_ORDER_CANCEL = '''            <button onClick={()=>setOrderModal(false)} style={{width:"100%",padding:"11px",background:"none",border:`1px solid ${T.w3}`,borderRadius:9,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5,marginTop:8}}>
              Cancel
            </button>'''

NEW_ORDER_CANCEL = '''            <div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${T.w3}`}}>
              <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Current trimester</div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3].map(t=>(
                  <button key={t} onClick={()=>setPatient(p=>({...p,trimester:t}))}
                    style={{flex:1,padding:"8px",border:`1px solid ${patient.trimester===t?T.rg:T.w3}`,borderRadius:7,cursor:"pointer",background:patient.trimester===t?T.rgBg:T.w,fontFamily:fonts.sans,fontSize:12,color:patient.trimester===t?T.rg2:T.w5}}>
                    T{t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={()=>setOrderModal(false)} style={{width:"100%",padding:"11px",background:"none",border:`1px solid ${T.w3}`,borderRadius:9,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5,marginTop:8}}>
              Cancel
            </button>'''

if OLD_ORDER_CANCEL in src and "Current trimester" not in src:
    src = src.replace(OLD_ORDER_CANCEL, NEW_ORDER_CANCEL, 1)
    print("Trimester bridge in order modal: patched ✓")
else:
    print("Trimester bridge: already present or anchor not found, skipping")

# ── STEP 9: write ────────────────────────────────────────────────────────────
with open(TARGET_JSX, "w", encoding="utf-8") as f:
    f.write(src)

# Also update the root copy to stay in sync
shutil.copy2(TARGET_JSX, ROOT_JSX)
print(f"Root copy synced ✓")

# Brace check
opens  = src.count('{')
closes = src.count('}')
print(f"\nBrace check: {{ {opens} · }} {closes} · delta {opens-closes}")
if abs(opens - closes) > 20:
    print("WARNING: brace imbalance — review file before pushing")
else:
    print("Brace balance: OK ✓")

print("""
✓ patch_connect.py complete

Next steps:
  git add MeetMario.jsx src/components/MeetMario.jsx
  git commit -m "feat: shared PatientContext — Baby Balans + dashboard unified"
  git push
""")
