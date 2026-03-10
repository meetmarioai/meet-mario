import re

path = r"C:\Users\TheLo\meet-mario\app\dashboard\MeetMario.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Replace static MARIO_SYS with dynamic function ─────────────────────────
old_mario_sys = '''const MARIO_SYS = `You are Meet Mario, clinical AI for MediBalans AB, Stockholm. Patient: Christina Wohltahrt, 64, post-menopausal. ALCAT April 2024. Markers: Candida mild (no sugar/yeast/vinegar 3mo), Whey moderate (no milk 6mo). Severe reactors (9mo): beef, coffee, garlic, onion, tomato, all rice, black tea, cauliflower, bell pepper, chickpea, cilantro, lobster, pistachio, poppy seed, capers, cumin, jalapeño, egg white, sea bass, wakame. Rules: No seed oils. CPF every meal. Respond in clear prose, no bullet points.`;'''

new_mario_sys = '''// Dynamic Mario system prompt — integrates ALCAT + CMA + WGS + wearable feedback
function buildDynamicMarioSys(patient, genetics, cma, wearableFeedback) {
  const name = patient?.name?.split(" ")[0] || "the patient";
  const severe = (patient?.severe || []).join(", ") || "none";
  const moderate = (patient?.moderate || []).join(", ") || "none";
  const mild = (patient?.mild || []).join(", ") || "none";
  const markers = (patient?.conditions || []).join(", ") || "none";

  const geneticsBlock = genetics && genetics.length > 0
    ? `\\n\\nNUTRIGENETICS (WGS variants):\\n${genetics.map(g => `- ${g.name}: ${g.interpretation}`).join("\\n")}`
    : "";

  const cmaBlock = cma && cma.length > 0
    ? `\\n\\nCELLULAR MICRONUTRIENT ASSAY (CMA):\\n${cma.map(c => `- ${c.nutrient}: ${c.status} — food priority: ${c.foodFix}`).join("\\n")}`
    : "";

  const wearableBlock = wearableFeedback && wearableFeedback.length > 0
    ? `\\n\\nRECENT BIOMETRIC FEEDBACK (wearable data):\\n${wearableFeedback.map(w => `- ${w.label}: ${w.value} ${w.trend ? "("+w.trend+")" : ""}`).join("\\n")}`
    : "";

  return \`You are Meet Mario, the precision medicine AI for MediBalans AB, Stockholm.

PATIENT: \${name}
ALCAT TEST DATE: \${patient?.testDate || "recent"}

SEVERE REACTORS — avoid 6 months minimum:
\${severe}

MODERATE REACTORS — avoid 3-6 months:
\${moderate}

MILD REACTORS — rotate every 4 days:
\${mild}

ACTIVE MARKERS: \${markers}
\${patient?.alsoAvoid?.candida?.length ? "CANDIDA: No sugar, honey, agave, yeast, molasses, vinegar." : ""}
\${patient?.alsoAvoid?.whey?.length ? "CASEIN/WHEY: No cow/goat/sheep milk." : ""}
\${geneticsBlock}
\${cmaBlock}
\${wearableBlock}

CORE CLINICAL RULES (never violate):
- No seed oils ever (canola, sunflower, soybean, corn oil)
- CPF balance (carb + protein + fat) at every main meal
- Meals every 3 hours
- Wild-caught fish only
- Cooking temp below 180°C — no charred or blackened meat
- All recommendations must respect ALCAT reactivity first, then optimise for genetics and CMA

REASONING FRAMEWORK (GCR):
You reason from the Global Constraint Rule: the primary biological constraint is innate immune activation driven by food reactivity. Removing reactive foods is always Step 1. Genetic optimisation and micronutrient correction happen within the safe food space defined by ALCAT.

When the patient asks what to eat, you give specific meal ideas using only their acceptable foods, optimised for their genetic variants and CMA insufficiencies.
When the patient asks why they feel a certain way, you reason from all three layers — immune, genomic, cellular.
When wearable data is present, you connect biometric patterns to food choices made in the last 24-48 hours.

Respond in warm, clear prose. No bullet points. You are their daily clinical companion.\`;
}
const MARIO_SYS = buildDynamicMarioSys(null, [], [], []);'''

content = content.replace(old_mario_sys, new_mario_sys, 1)

# ── 2. Add genetics, CMA, wearable state after existing state declarations ─────
old_state_end = '''  const [patient,setPatient]           = useState(P_DEFAULT);
  const [alkatUploading,setAlcatUploading] = useState(false);
  const [alkatError,setAlcatError]     = useState(null);
  const [alkatParsed,setAlcatParsed]   = useState(false);'''

new_state_end = '''  const [patient,setPatient]           = useState(P_DEFAULT);
  const [alkatUploading,setAlcatUploading] = useState(false);
  const [alkatError,setAlcatError]     = useState(null);
  const [alkatParsed,setAlcatParsed]   = useState(false);
  const [genetics,setGenetics]         = useState([]);
  const [geneticsParsed,setGeneticsParsed] = useState(false);
  const [geneticsLoading,setGeneticsLoading] = useState(false);
  const [cma,setCma]                   = useState([]);
  const [cmaParsed,setCmaParsed]       = useState(false);
  const [cmaLoading,setCmaLoading]     = useState(false);
  const [wearableData,setWearableData] = useState([]);
  const [feedbackLog,setFeedbackLog]   = useState([]);
  const [loopScore,setLoopScore]       = useState(null);'''

content = content.replace(old_state_end, new_state_end, 1)

# ── 3. Make all callClaude calls use dynamic system prompt ─────────────────────
# Update chat to use dynamic MARIO_SYS
old_chat_call = 'try{const r=await callClaude(msgs,MARIO_SYS);setChatMsgs([...msgs,{role:"assistant",content:r}]);}catch{setChatMsgs(m=>[...m,{role:"assistant",content:"Connection error."}]);}'
new_chat_call = 'try{const dynamicSys=buildDynamicMarioSys(patient,genetics,cma,wearableData);const r=await callClaude(msgs,dynamicSys);setChatMsgs([...msgs,{role:"assistant",content:r}]);}catch{setChatMsgs(m=>[...m,{role:"assistant",content:"Connection error."}]);}'
content = content.replace(old_chat_call, new_chat_call, 1)

# ── 4. Add CMA PDF parser function before simulateMealResponse ────────────────
old_sim2 = '// ── ALCAT PDF PARSER'
new_sim2 = '''// ── CMA PDF PARSER ───────────────────────────────────────────────────────────
async function parseCmaPDF(file) {
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
  const isImage = file.type.startsWith("image/");
  const mediaType = isImage ? file.type : "application/pdf";
  const contentBlock = isImage
    ? { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }
    : { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } };

  const prompt = `You are parsing a Cellular Micronutrient Assay (CMA) report from Cell Science Systems.
Extract all nutrients that are Borderline or Insufficient, and all antioxidants that are Protective or Highly Protective from the APA section.
Return ONLY a JSON array, no other text:
[
  {"nutrient": "Vitamin D", "status": "Borderline 112%", "foodFix": "sardines, salmon, egg yolk, mackerel"},
  {"nutrient": "CoQ10", "status": "Highly Protective 137%", "foodFix": "sardines, beef, mackerel, organ meat"},
  {"nutrient": "Piperine", "status": "Highly Protective 140%", "foodFix": "black pepper — check ALCAT first"}
]
Include redoxScore as a separate entry: {"nutrient": "Redox Score", "status": "81", "foodFix": "increase polyphenol-rich foods daily"}
Only include items that are flagged (borderline, insufficient, protective, or highly protective). Skip all sufficient items.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
    })
  });
  const data = await res.json();
  const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  const clean = text.replace(/```json|```/g,"").trim();
  return JSON.parse(clean);
}

// ── GENETICS TEXT PARSER ──────────────────────────────────────────────────────
async function parseGeneticsText(variantList) {
  // variantList = array of {name, ref, alt, gt} from VCF extraction
  const prompt = `You are a clinical nutrigenetics interpreter.
Given these WGS variants found in a patient's genome, provide a brief clinical interpretation for each.
Return ONLY a JSON array, no other text:
[
  {"name": "MTHFR C677T heterozygous", "interpretation": "Methylation at ~65% efficiency. Needs 5-MTHF, methylcobalamin B12, egg yolk daily for BHMT bypass, dark leafy greens for natural folate. Avoid synthetic folic acid in fortified foods."},
  ...
]
Variants to interpret: ${JSON.stringify(variantList)}
Keep each interpretation to 2 sentences max. Focus on food and lifestyle implications only.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  const clean = text.replace(/```json|```/g,"").trim();
  return JSON.parse(clean);
}

// ── ALCAT PDF PARSER'''

content = content.replace(old_sim2, new_sim2, 1)

# ── 5. Add "Biomarkers" tab to TABS ───────────────────────────────────────────
old_tabs2 = '    {id:"alcat",label:"Upload ALCAT"},\n  ];'
new_tabs2 = '    {id:"alcat",label:"Upload ALCAT"},\n    {id:"biomarkers",label:"Biomarkers"},\n    {id:"loop",label:"Loop"},\n  ];'
content = content.replace(old_tabs2, new_tabs2, 1)

# ── 6. Add Biomarkers + Loop tab content before final return null ──────────────
old_final = '''    // -- ALCAT UPLOAD --'''
new_final = '''    // -- BIOMARKERS (CMA + GENETICS) --
    if(tab==="biomarkers") return (
      <div>
        <Eyebrow>Precision layers</Eyebrow>
        <div style={{fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",marginBottom:8}}>
          Your <em style={{fontStyle:"italic",color:T.rg2}}>biological blueprint</em>
        </div>
        <p style={{fontSize:13,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7,marginBottom:32,maxWidth:520}}>
          Upload your CMA (Cellular Micronutrient Assay) report and enter your WGS variants. Mario will integrate all layers and reason from your complete biological picture.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>

          {/* CMA Upload */}
          <Panel>
            <FieldLabel>Cellular Micronutrient Assay (CMA)</FieldLabel>
            {!cmaParsed ? (
              <div>
                <p style={{fontSize:12,color:T.w4,fontFamily:fonts.sans,marginBottom:12,lineHeight:1.6}}>Upload your CMA PDF. Mario will extract all borderline/insufficient nutrients and protective antioxidants.</p>
                <label style={{cursor:"pointer",display:"block",border:`2px dashed ${T.w3}`,borderRadius:8,padding:"20px",textAlign:"center"}}>
                  <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={async e=>{
                    const file=e.target.files[0]; if(!file)return;
                    setCmaLoading(true);
                    try{ const parsed=await parseCmaPDF(file); setCma(parsed); setCmaParsed(true); }
                    catch(err){ console.error(err); }
                    setCmaLoading(false);
                  }}/>
                  <div style={{fontSize:11,fontFamily:fonts.mono,color:T.w4,letterSpacing:"0.12em"}}>{cmaLoading?"PARSING…":"UPLOAD CMA PDF"}</div>
                </label>
              </div>
            ) : (
              <div>
                <div style={{fontSize:11,color:T.ok,fontFamily:fonts.mono,marginBottom:10}}>✓ {cma.length} MARKERS LOADED</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
                  {cma.map((c,i)=>(
                    <div key={i} style={{background:T.w1,borderRadius:6,padding:"8px 12px",borderLeft:`3px solid ${c.status?.includes("Highly")||c.status?.includes("Insufficient")? T.err : T.warn}`}}>
                      <div style={{fontSize:11,fontFamily:fonts.sans,color:T.w7,fontWeight:500}}>{c.nutrient} <span style={{color:T.w4,fontWeight:300}}>— {c.status}</span></div>
                      <div style={{fontSize:10,fontFamily:fonts.sans,color:T.w4,marginTop:2}}>{c.foodFix}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{setCma([]);setCmaParsed(false);}} style={{marginTop:8,fontSize:10,fontFamily:fonts.mono,color:T.w4,background:"none",border:"none",cursor:"pointer"}}>RESET</button>
              </div>
            )}
          </Panel>

          {/* Genetics Input */}
          <Panel>
            <FieldLabel>Nutrigenetics (WGS variants)</FieldLabel>
            {!geneticsParsed ? (
              <div>
                <p style={{fontSize:12,color:T.w4,fontFamily:fonts.sans,marginBottom:12,lineHeight:1.6}}>Enter your key variants from WGS analysis. Mario will interpret each and integrate into your daily protocol.</p>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                  {[
                    {name:"MTHFR C677T",default:"heterozygous"},
                    {name:"APOE genotype",default:"ε3/ε2"},
                    {name:"VDR rs2228570",default:"heterozygous"},
                    {name:"NAT2",default:"slow acetylator"},
                    {name:"SOD2 rs4880",default:"heterozygous"},
                  ].map((v,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{fontSize:11,fontFamily:fonts.mono,color:T.w5,width:130,flexShrink:0}}>{v.name}</div>
                      <input defaultValue={v.default} id={`gene_${i}`} style={{flex:1,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:5,padding:"4px 8px",fontSize:11,fontFamily:fonts.mono,color:T.w6}} />
                    </div>
                  ))}
                </div>
                <button onClick={async ()=>{
                  setGeneticsLoading(true);
                  const variants=[
                    {name:"MTHFR C677T",gt:document.getElementById("gene_0")?.value||"heterozygous"},
                    {name:"APOE genotype",gt:document.getElementById("gene_1")?.value||"ε3/ε2"},
                    {name:"VDR rs2228570",gt:document.getElementById("gene_2")?.value||"heterozygous"},
                    {name:"NAT2",gt:document.getElementById("gene_3")?.value||"slow acetylator"},
                    {name:"SOD2 rs4880",gt:document.getElementById("gene_4")?.value||"heterozygous"},
                  ];
                  try{ const interpreted=await parseGeneticsText(variants); setGenetics(interpreted); setGeneticsParsed(true); }
                  catch(err){ console.error(err); }
                  setGeneticsLoading(false);
                }} style={{background:T.rg,color:"#fff",borderRadius:7,padding:"8px 20px",fontSize:11,fontFamily:fonts.sans,fontWeight:500,border:"none",cursor:"pointer"}}>
                  {geneticsLoading?"Interpreting…":"Interpret variants"}
                </button>
              </div>
            ) : (
              <div>
                <div style={{fontSize:11,color:T.ok,fontFamily:fonts.mono,marginBottom:10}}>✓ {genetics.length} VARIANTS INTERPRETED</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
                  {genetics.map((g,i)=>(
                    <div key={i} style={{background:T.w1,borderRadius:6,padding:"8px 12px",borderLeft:`3px solid ${T.rg}`}}>
                      <div style={{fontSize:11,fontFamily:fonts.mono,color:T.rg2,marginBottom:3}}>{g.name}</div>
                      <div style={{fontSize:11,fontFamily:fonts.sans,color:T.w5,lineHeight:1.5}}>{g.interpretation}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{setGenetics([]);setGeneticsParsed(false);}} style={{marginTop:8,fontSize:10,fontFamily:fonts.mono,color:T.w4,background:"none",border:"none",cursor:"pointer"}}>RESET</button>
              </div>
            )}
          </Panel>
        </div>

        {/* Integration status */}
        {(cmaParsed||geneticsParsed) && (
          <Panel>
            <FieldLabel>Integration status</FieldLabel>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {[
                {label:"ALCAT",active:alkatParsed,count:`${(patient?.severe?.length||0)+(patient?.moderate?.length||0)+(patient?.mild?.length||0)} foods`},
                {label:"CMA",active:cmaParsed,count:`${cma.length} markers`},
                {label:"GENETICS",active:geneticsParsed,count:`${genetics.length} variants`},
                {label:"WEARABLES",active:wearableData.length>0,count:`${wearableData.length} signals`},
              ].map(({label,active,count})=>(
                <div key={label} style={{background:active?`${T.ok}12`:T.w1,border:`1px solid ${active?T.ok:T.w3}`,borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:active?T.ok:T.w3}}/>
                  <div>
                    <div style={{fontSize:10,fontFamily:fonts.mono,letterSpacing:"0.12em",color:active?T.ok:T.w4}}>{label}</div>
                    <div style={{fontSize:11,fontFamily:fonts.sans,color:T.w5}}>{active?count:"not loaded"}</div>
                  </div>
                </div>
              ))}
            </div>
            {cmaParsed && geneticsParsed && alkatParsed && (
              <div style={{marginTop:12,fontSize:12,color:T.ok,fontFamily:fonts.sans,fontWeight:500}}>
                ✓ Full precision profile active — Mario is now reasoning from all three layers
              </div>
            )}
          </Panel>
        )}
      </div>
    );

    // -- CLOSED LOOP --
    if(tab==="loop") return (
      <div>
        <Eyebrow>Closed loop</Eyebrow>
        <div style={{fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",marginBottom:8}}>
          Eat → <em style={{fontStyle:"italic",color:T.rg2}}>measure</em> → learn → adjust
        </div>
        <p style={{fontSize:13,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7,marginBottom:32,maxWidth:540}}>
          The loop closes when biometric response to food feeds back into the protocol. Log what you ate, enter your wearable data, and Mario recalibrates your recommendations.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>

          {/* Meal feedback */}
          <Panel>
            <FieldLabel>What did you eat?</FieldLabel>
            <textarea
              placeholder="e.g. Salmon with broccoli and white potato, cooked in coconut oil. Blueberries after."
              style={{width:"100%",minHeight:80,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:8,padding:"10px 12px",fontSize:12,fontFamily:fonts.sans,color:T.w6,resize:"vertical",boxSizing:"border-box"}}
              id="meal_log_input"
            />
            <div style={{marginTop:8,display:"flex",gap:8}}>
              {["Breakfast","Lunch","Dinner","Snack"].map(m=>(
                <button key={m} onClick={()=>{}} style={{fontSize:10,fontFamily:fonts.mono,letterSpacing:"0.08em",color:T.w5,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:5,padding:"4px 10px",cursor:"pointer"}}>{m}</button>
              ))}
            </div>
          </Panel>

          {/* Biometric input */}
          <Panel>
            <FieldLabel>Biometric response (2h post-meal)</FieldLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:"HRV",unit:"ms",id:"hrv_input",placeholder:"55"},
                {label:"Resting HR",unit:"bpm",id:"hr_input",placeholder:"62"},
                {label:"Energy",unit:"1-10",id:"energy_input",placeholder:"7"},
                {label:"Gut comfort",unit:"1-10",id:"gut_input",placeholder:"8"},
                {label:"Focus",unit:"1-10",id:"focus_input",placeholder:"8"},
                {label:"Sleep score",unit:"%",id:"sleep_input",placeholder:"82"},
              ].map(({label,unit,id,placeholder})=>(
                <div key={id}>
                  <div style={{fontSize:10,fontFamily:fonts.mono,color:T.w4,letterSpacing:"0.1em",marginBottom:3}}>{label} ({unit})</div>
                  <input id={id} placeholder={placeholder} style={{width:"100%",background:T.w1,border:`1px solid ${T.w3}`,borderRadius:5,padding:"5px 8px",fontSize:12,fontFamily:fonts.mono,color:T.w6,boxSizing:"border-box"}} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Log + Analyse */}
        <button onClick={async ()=>{
          const meal = document.getElementById("meal_log_input")?.value || "";
          const hrv = document.getElementById("hrv_input")?.value;
          const hr = document.getElementById("hr_input")?.value;
          const energy = document.getElementById("energy_input")?.value;
          const gut = document.getElementById("gut_input")?.value;
          const focus = document.getElementById("focus_input")?.value;
          const sleep = document.getElementById("sleep_input")?.value;

          const newWearable = [
            ...(hrv?[{label:"HRV",value:`${hrv}ms`,trend:parseInt(hrv)>50?"good":"low"}]:[]),
            ...(hr?[{label:"Resting HR",value:`${hr}bpm`}]:[]),
            ...(energy?[{label:"Energy",value:`${energy}/10`}]:[]),
            ...(gut?[{label:"Gut comfort",value:`${gut}/10`}]:[]),
            ...(focus?[{label:"Focus",value:`${focus}/10`}]:[]),
            ...(sleep?[{label:"Sleep",value:`${sleep}%`}]:[]),
          ];
          setWearableData(newWearable);

          const entry = {time: new Date().toLocaleTimeString(), meal, biometrics: newWearable};
          setFeedbackLog(prev=>[entry,...prev.slice(0,9)]);

          // Get Mario's loop analysis
          const dynamicSys = buildDynamicMarioSys(patient, genetics, cma, newWearable);
          const prompt = `The patient just logged this meal: "${meal}"\n\nBiometric readings 2h post-meal:\n${newWearable.map(w=>`${w.label}: ${w.value}`).join(", ")}\n\nAnalyse whether this meal was appropriate for their ALCAT profile, genetic variants, and CMA status. Note any reactive foods eaten. Explain the biometric response in context of their biology. Suggest one specific adjustment for the next meal. Keep it under 120 words, warm and direct.`;
          try {
            const analysis = await callClaude([{role:"user",content:prompt}], dynamicSys);
            setLoopScore(analysis);
          } catch(e) { setLoopScore("Analysis unavailable."); }
        }} style={{background:T.rg,color:"#fff",borderRadius:9,padding:"12px 32px",fontSize:12,fontFamily:fonts.sans,fontWeight:500,letterSpacing:"0.08em",border:"none",cursor:"pointer",marginBottom:20}}>
          LOG & ANALYSE WITH MARIO
        </button>

        {/* Mario's loop analysis */}
        {loopScore && (
          <Panel>
            <FieldLabel>Mario's analysis</FieldLabel>
            <div style={{fontSize:13,fontFamily:fonts.sans,color:T.w6,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{loopScore}</div>
          </Panel>
        )}

        {/* Feedback history */}
        {feedbackLog.length > 0 && (
          <Panel>
            <FieldLabel>Feedback log</FieldLabel>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {feedbackLog.map((entry,i)=>(
                <div key={i} style={{background:T.w1,borderRadius:7,padding:"10px 14px",borderLeft:`3px solid ${T.rg}`}}>
                  <div style={{fontSize:10,fontFamily:fonts.mono,color:T.w4,marginBottom:4}}>{entry.time}</div>
                  <div style={{fontSize:12,fontFamily:fonts.sans,color:T.w6,marginBottom:4}}>{entry.meal}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {entry.biometrics.map((b,j)=>(
                      <span key={j} style={{fontSize:10,fontFamily:fonts.mono,background:T.w,border:`1px solid ${T.w3}`,borderRadius:4,padding:"2px 7px",color:T.w5}}>{b.label}: {b.value}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    );

    // -- ALCAT UPLOAD --'''

content = content.replace(old_final, new_final, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("CLOSED LOOP PATCH OK")
