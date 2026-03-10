import re

path = r"C:\Users\TheLo\meet-mario\app\dashboard\MeetMario.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Replace static P constant with dynamic patient state ──────────────────
old_p = 'const P = {'
new_p = '// P is now dynamic — set from ALCAT upload. Default = Christina.\nconst P_DEFAULT = {'

content = content.replace(old_p, new_p, 1)

# ── 2. Add ALCAT upload state after existing state declarations ───────────────
old_state = '  const chatEnd = useRef(null);'
new_state = '''  const [patient,setPatient]           = useState(P_DEFAULT);
  const [alkatUploading,setAlcatUploading] = useState(false);
  const [alkatError,setAlcatError]     = useState(null);
  const [alkatParsed,setAlcatParsed]   = useState(false);
  const chatEnd = useRef(null);

  // Dynamic P — always reads from patient state
  const P = patient;'''

content = content.replace(old_state, new_state, 1)

# ── 3. Add ALCAT parser function before simulateMealResponse ─────────────────
old_sim = 'function simulateMealResponse(hadReactive) {'
new_sim = '''// ── ALCAT PDF PARSER ─────────────────────────────────────────────────────────
async function parseAlcatPDF(file) {
  // Convert file to base64
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

  const prompt = `You are parsing an ALCAT food sensitivity test report.
Extract ALL food items from the report and classify them by reactivity level.
Return ONLY a JSON object with this exact structure, no other text:
{
  "name": "patient full name",
  "dob": "date of birth if present",
  "testDate": "test date",
  "labId": "lab ID if present",
  "severe": ["FOOD1", "FOOD2"],
  "moderate": ["FOOD1", "FOOD2"],
  "mild": ["FOOD1", "FOOD2"],
  "markers": ["e.g. Candida mild", "Whey moderate"],
  "candida": true or false,
  "whey": true or false
}
ALL food names must be UPPERCASE. Include every food listed under each severity category.
If Candida or yeast reactivity is present, set candida: true.
If any dairy/whey reactivity is present, set whey: true.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [contentBlock, { type: "text", text: prompt }]
      }]
    })
  });

  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  // Build full patient object
  return {
    name: parsed.name || "Patient",
    dob: parsed.dob || "",
    testDate: parsed.testDate || "",
    labId: parsed.labId || "",
    age: null,
    sex: "",
    hormonalStatus: "",
    conditions: parsed.markers || [],
    severe: parsed.severe || [],
    moderate: parsed.moderate || [],
    mild: parsed.mild || [],
    alsoAvoid: {
      candida: parsed.candida ? ["SUGAR","HONEY","MAPLE SYRUP","AGAVE","MOLASSES","BAKER'S YEAST","BREWER'S YEAST","NUTRITIONAL YEAST","WINE","BEER","VINEGAR"] : [],
      whey: parsed.whey ? ["COW'S MILK","GOAT'S MILK","SHEEP'S MILK","WHEY PROTEIN"] : [],
    },
  };
}

function simulateMealResponse(hadReactive) {'''

content = content.replace(old_sim, new_sim, 1)

# ── 4. Add ALCAT tab to TABS array ────────────────────────────────────────────
old_tabs = '    {id:"chat",label:"Ask Mario"},\n  ];'
new_tabs = '    {id:"chat",label:"Ask Mario"},\n    {id:"alcat",label:"Upload ALCAT"},\n  ];'
content = content.replace(old_tabs, new_tabs, 1)

# ── 5. Add ALCAT upload tab content before the final return null ─────────────
old_return_null = '''    return null;
  };'''

new_alcat_tab = '''    // -- ALCAT UPLOAD --
    if(tab==="alcat") return (
      <div>
        <Eyebrow>ALCAT import</Eyebrow>
        <div style={{fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",marginBottom:8}}>
          Upload <em style={{fontStyle:"italic",color:T.rg2}}>ALCAT report</em>
        </div>
        <p style={{fontSize:13,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7,marginBottom:32,maxWidth:520}}>
          Upload any patient's ALCAT PDF or image. The engine will parse all reactive foods and instantly recalibrate every tab — rotation days, meals, food checker, grocery list, and Mario's chat.
        </p>

        {/* Upload zone */}
        {!alkatParsed && (
          <Panel>
            <div
              onDragOver={e=>e.preventDefault()}
              onDrop={async e=>{
                e.preventDefault();
                const file=e.dataTransfer.files[0];
                if(!file)return;
                setAlcatUploading(true);setAlcatError(null);
                try{
                  const parsed=await parseAlcatPDF(file);
                  setPatient(parsed);
                  setAlcatParsed(true);
                  setChatMsgs([{role:"assistant",content:`Good day, ${parsed.name.split(" ")[0]}. Your ALCAT results have been loaded. I can see ${parsed.severe.length} severe, ${parsed.moderate.length} moderate, and ${parsed.mild.length} mild reactive foods. ${parsed.conditions.length>0?"Active markers: "+parsed.conditions.join(", ")+".":""} Where would you like to start?`}]);
                }catch(err){setAlcatError("Could not parse this file. Please upload a clear ALCAT PDF or image.");}
                setAlcatUploading(false);
              }}
              style={{border:`2px dashed ${T.w3}`,borderRadius:12,padding:"48px 32px",textAlign:"center",background:T.w,cursor:"pointer",transition:"border-color .2s"}}
            >
              <div style={{fontSize:32,marginBottom:12}}>⬆</div>
              <div style={{fontFamily:fonts.sans,fontSize:14,color:T.w6,marginBottom:6}}>Drag & drop ALCAT report here</div>
              <div style={{fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:"0.12em",marginBottom:20}}>PDF OR IMAGE . ANY ALCAT FORMAT</div>
              <label style={{cursor:"pointer"}}>
                <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={async e=>{
                  const file=e.target.files[0];
                  if(!file)return;
                  setAlcatUploading(true);setAlcatError(null);
                  try{
                    const parsed=await parseAlcatPDF(file);
                    setPatient(parsed);
                    setAlcatParsed(true);
                    setChatMsgs([{role:"assistant",content:`Good day, ${parsed.name.split(" ")[0]}. Your ALCAT results have been loaded. I can see ${parsed.severe.length} severe, ${parsed.moderate.length} moderate, and ${parsed.mild.length} mild reactive foods. ${parsed.conditions.length>0?"Active markers: "+parsed.conditions.join(", ")+".":""} Where would you like to start?`}]);
                  }catch(err){setAlcatError("Could not parse this file. Please upload a clear ALCAT PDF or image.");}
                  setAlcatUploading(false);
                }}/>
                <span style={{background:T.rg,color:"#fff",borderRadius:8,padding:"10px 28px",fontSize:12,fontFamily:fonts.sans,fontWeight:500,letterSpacing:"0.08em"}}>
                  {alkatUploading?"Parsing with Claude AI...":"Choose file"}
                </span>
              </label>
              {alkatError&&<div style={{marginTop:16,fontSize:12,color:T.err,fontFamily:fonts.sans}}>{alkatError}</div>}
            </div>
          </Panel>
        )}

        {/* Parsed result */}
        {alkatParsed && (
          <div>
            <div style={{background:`${T.ok}0F`,border:`1px solid ${T.ok}30`,borderRadius:10,padding:"14px 18px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:T.ok,fontFamily:fonts.sans,fontWeight:500,marginBottom:2}}>✓ ALCAT loaded — engine recalibrated</div>
                <div style={{fontSize:11,color:T.w4,fontFamily:fonts.mono}}>{P.name} · {P.testDate} · {P.severe.length} severe · {P.moderate.length} moderate · {P.mild.length} mild</div>
              </div>
              <button onClick={()=>{setPatient(P_DEFAULT);setAlcatParsed(false);setChatMsgs([{role:"assistant",content:"Good day, Christina. Your ALCAT results from April 2024 are loaded. Where would you like to start?"}]);}} style={{background:T.w1,border:`1px solid ${T.w3}`,borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono,color:T.w5,letterSpacing:"0.1em"}}>RESET TO DEFAULT</button>
            </div>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {label:"SEVERE — 9 MONTHS",color:T.err,foods:P.severe},
                {label:"MODERATE — 6 MONTHS",color:T.warn,foods:P.moderate},
                {label:"MILD — 3 MONTHS",color:T.ok,foods:P.mild},
              ].map(({label,color,foods})=>(
                <div key={label} style={{background:T.w,border:`1px solid ${T.w3}`,borderLeft:`3px solid ${color}`,borderRadius:9,padding:"14px 16px"}}>
                  <div style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.18em",color,marginBottom:8,textTransform:"uppercase"}}>{label} ({foods.length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,maxHeight:120,overflowY:"auto"}}>
                    {foods.map(f=>(
                      <span key={f} style={{background:color+"12",border:`1px solid ${color}30`,borderRadius:3,padding:"2px 7px",fontSize:9.5,fontFamily:fonts.sans,color:T.w6}}>{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {P.conditions.length>0&&<Panel>
              <FieldLabel>Active markers</FieldLabel>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {P.conditions.map(c=>(
                  <span key={c} style={{background:T.rgBg,border:`1px solid ${T.rg}40`,borderRadius:5,padding:"4px 12px",fontSize:11,fontFamily:fonts.sans,color:T.rg2}}>{c}</span>
                ))}
              </div>
            </Panel>}

            <p style={{fontSize:12,color:T.w4,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7}}>
              All tabs now reflect this patient's data. Go to <strong style={{color:T.w6}}>Rotation</strong> to see their green list, <strong style={{color:T.w6}}>Food Check</strong> to look up any food, or <strong style={{color:T.w6}}>Ask Mario</strong> to begin clinical consultation.
            </p>
          </div>
        )}
      </div>
    );

    return null;
  };'''

content = content.replace(old_return_null, new_alcat_tab, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("PATCHED OK")
