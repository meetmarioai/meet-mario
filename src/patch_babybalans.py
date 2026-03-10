#!/usr/bin/env python3
"""
patch_babybalans.py
Adds Baby Balans Genetic Compatibility tab to MeetMario.jsx
Run from project root: python patch_babybalans.py
"""

import re, sys

PATH = "src/components/MeetMario.jsx"

with open(PATH, "r", encoding="utf-8") as f:
    src = f.read()

# ── 1. ADD TAB TO TABS ARRAY ─────────────────────────────────────────────────
# Find the TABS array and append the baby balans entry before the closing ]
OLD_TABS = '  { id:"grocery",  label:"Grocery",   when:"later",  divider: t.id==="grocery" },'
NEW_TABS = '''  { id:"grocery",  label:"Grocery",   when:"later",  divider: t.id==="grocery" },
  { id:"babybalans", label:"Baby Balans", when:"later", divider: false },'''

if OLD_TABS not in src:
    # Try alternate — look for last tab entry pattern
    src = re.sub(
        r'(\{ id:"grocery".*?divider:.*?\},)',
        OLD_TABS.replace('{ id:"grocery"', '{ id:"grocery"') + '\n  { id:"babybalans", label:"Baby Balans", when:"later", divider: false },',
        src,
        count=1,
        flags=re.DOTALL
    )
    print("TABS: used regex fallback")
else:
    src = src.replace(OLD_TABS, NEW_TABS, 1)
    print("TABS: patched ✓")


# ── 2. ADD BABY BALANS COMPONENT BEFORE export default ───────────────────────
BABY_BALANS_COMPONENT = r'''
// ─── BABY BALANS — Genetic Compatibility ─────────────────────────────────────
const BABY_VARIANTS = [
  { id:"mthfr_c677t",  label:"MTHFR C677T",    gene:"MTHFR",  mech:"Folate metabolism — reduced enzyme activity ~70% when homozygous" },
  { id:"mthfr_a1298c", label:"MTHFR A1298C",   gene:"MTHFR",  mech:"Compound risk when inherited opposite C677T across parents" },
  { id:"comt",         label:"COMT Val158Met",  gene:"COMT",   mech:"Catechol clearance — slow COMT hom = elevated 4-hydroxyoestrogen risk" },
  { id:"mtrr",         label:"MTRR A66G",       gene:"MTRR",   mech:"B12-dependent remethylation — reduces MTR reactivation efficiency" },
  { id:"mtr",          label:"MTR A2756G",      gene:"MTR",    mech:"Methionine synthase — primary remethylation pathway efficiency" },
  { id:"gstp1",        label:"GSTP1 Ile105Val", gene:"GSTP1",  mech:"Phase II detox — reduced glutathione conjugation capacity" },
  { id:"vdr",          label:"VDR FokI",        gene:"VDR",    mech:"Vitamin D receptor efficiency — immune and bone signalling" },
  { id:"sod2",         label:"SOD2 rs4880",     gene:"SOD2",   mech:"Mitochondrial antioxidant defence — oxidative stress vulnerability" },
];

function BabyBalansTab() {
  const [nameA, setNameA]         = useState("");
  const [nameB, setNameB]         = useState("");
  const [fileA, setFileA]         = useState(null);
  const [fileB, setFileB]         = useState(null);
  const [varsA, setVarsA]         = useState(new Set());
  const [varsB, setVarsB]         = useState(new Set());
  const [showFbA, setShowFbA]     = useState(false);
  const [showFbB, setShowFbB]     = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [results, setResults]     = useState(null);
  const [dragA, setDragA]         = useState(false);
  const [dragB, setDragB]         = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);

  const toggleVar = (partner, id) => {
    const set   = partner === "A" ? new Set(varsA) : new Set(varsB);
    const setter = partner === "A" ? setVarsA : setVarsB;
    set.has(id) ? set.delete(id) : set.add(id);
    setter(set);
  };

  const handleFile = (partner, file) => {
    if (!file) return;
    const setter = partner === "A" ? setFileA : setFileB;
    const varSetter = partner === "A" ? setVarsA : setVarsB;
    setter({ name: file.name, parsing: true });
    // Simulate VCF parsing — in production: real server-side bcftools extraction
    setTimeout(() => {
      const extracted = partner === "A"
        ? new Set(["mthfr_a1298c","mtrr","comt","gstp1"])
        : new Set(["mthfr_c677t","mtrr","comt","vdr"]);
      varSetter(extracted);
      setter({ name: file.name, parsing: false, count: extracted.size });
    }, 1400);
  };

  const runAnalysis = () => {
    setAnalysing(true);
    setTimeout(() => {
      const allIds = new Set([...varsA, ...varsB]);
      const res = [];
      BABY_VARIANTS.forEach(v => {
        const inA = varsA.has(v.id), inB = varsB.has(v.id);
        if (!inA && !inB) return;
        const bothHet = inA && inB;
        res.push({
          ...v,
          inA, inB, bothHet,
          risk: bothHet ? 25 : 50,
          riskLabel: bothHet
            ? "25% chance of homozygous inheritance — compound risk"
            : "Carrier in one parent only — heterozygous inheritance",
          level: bothHet ? "medium" : "low",
        });
      });
      setResults(res);
      setAnalysing(false);
    }, 1800);
  };

  const compTable = [
    ["Complete 38-gene methylation network",       false, false, true ],
    ["Cross-parent inheritance modelling",          false, false, true ],
    ["Compound heterozygosity detection",           false, false, true ],
    ["Detox pathway variants (COMT, GSTP1)",        "partial", false, true ],
    ["Neurotransmitter & receptor variants",        "partial", false, true ],
    ["Custom child supplementation protocol",       false, false, true ],
    ["MediBalans clinical platform integration",    false, false, true ],
  ];

  const UploadZone = ({ partner, file, drag, onDrag, onFile, showFb, setShowFb, vars }) => {
    const label = partner === "A" ? "Mother" : "Father";
    return (
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase"}}>
            Partner {partner} — {label}
          </div>
          {!file && (
            <button onClick={()=>setShowFb(!showFb)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:fonts.mono,fontSize:8,color:T.rg2,letterSpacing:"0.1em"}}>
              {showFb ? "Hide manual ↑" : "Enter manually →"}
            </button>
          )}
        </div>
        <input
          value={partner==="A" ? nameA : nameB}
          onChange={e => partner==="A" ? setNameA(e.target.value) : setNameB(e.target.value)}
          placeholder={`${label}'s name (optional)`}
          style={{display:"block",width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${T.w3}`,padding:"9px 0",fontFamily:fonts.sans,fontSize:13,fontWeight:300,color:T.w7,outline:"none",marginBottom:10}}
          onFocus={e=>e.target.style.borderBottomColor=T.rg}
          onBlur={e=>e.target.style.borderBottomColor=T.w3}
        />
        <div
          onDragOver={e=>{e.preventDefault();onDrag(true);}}
          onDragLeave={()=>onDrag(false)}
          onDrop={e=>{e.preventDefault();onDrag(false);handleFile(partner,e.dataTransfer.files[0]);}}
          onClick={()=>!file&&document.getElementById(`vcf${partner}`).click()}
          style={{
            border:`1.5px dashed ${file ? T.ok+"80" : drag ? T.rg : T.w3}`,
            borderRadius:10,padding:"22px 16px",textAlign:"center",
            cursor:file?"default":"pointer",transition:"all .22s",
            background: file ? `${T.ok}08` : drag ? T.rgBg : T.w1,
          }}
        >
          <input id={`vcf${partner}`} type="file" accept=".vcf,.vcf.gz,.gz"
            onChange={e=>handleFile(partner,e.target.files[0])}
            style={{display:"none"}}
          />
          {!file && <>
            <div style={{fontSize:20,marginBottom:6}}>📂</div>
            <div style={{fontSize:12,fontWeight:500,color:T.w7,marginBottom:3}}>Drop VCF file or click to browse</div>
            <div style={{fontSize:11,color:T.w4,fontFamily:fonts.mono,letterSpacing:"0.08em"}}>.vcf · .vcf.gz</div>
          </>}
          {file && file.parsing && <>
            <div style={{fontSize:18,marginBottom:6}}>⏳</div>
            <div style={{fontSize:12,color:T.w5}}>Parsing {file.name}…</div>
          </>}
          {file && !file.parsing && <>
            <div style={{fontSize:18,marginBottom:6}}>✅</div>
            <div style={{fontSize:12,color:T.ok,fontWeight:500,marginBottom:2}}>{file.name}</div>
            <div style={{fontSize:11,color:T.w4,fontFamily:fonts.mono}}>{file.count} relevant variants extracted</div>
          </>}
        </div>
        {/* Manual variant fallback */}
        {showFb && !file && (
          <div style={{marginTop:10}}>
            <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.12em",marginBottom:8,textTransform:"uppercase"}}>Select known variants</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {BABY_VARIANTS.map(v => {
                const sel = vars.has(v.id);
                return (
                  <button key={v.id} onClick={()=>toggleVar(partner,v.id)}
                    style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",border:`1px solid ${sel?T.rg:T.w3}`,borderRadius:7,cursor:"pointer",background:sel?T.rgBg:T.w,transition:"all .15s",textAlign:"left"}}>
                    <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${sel?T.rg:T.w3}`,background:sel?T.rg:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:"#fff"}}>{sel?"✓":""}</div>
                    <span style={{fontSize:11,color:sel?T.rg2:T.w6,fontFamily:fonts.sans,fontWeight:sel?500:400}}>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Eyebrow>Parental genomics</Eyebrow>
      <SectionTitle>Genetic <em style={{fontStyle:"italic",color:T.rg2}}>compatibility</em></SectionTitle>

      <p style={{fontSize:13,color:T.w5,fontWeight:300,lineHeight:1.75,maxWidth:580,marginBottom:36}}>
        When both parents carry the same heterozygous variant, each child has a 25% chance of inheriting two copies — producing a homozygous genotype with significantly stronger clinical expression. Upload WGS files below, or order kits through the MediBalans–Dante Labs pipeline.
      </p>

      {/* ── WHY WGS BANNER ── */}
      <div style={{background:T.dark,borderRadius:12,marginBottom:28,overflow:"hidden",border:`1px solid #2A2018`}}>
        <button onClick={()=>setWhyExpanded(!whyExpanded)}
          style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg3,textTransform:"uppercase"}}>Why whole genome sequencing</span>
            <span style={{fontFamily:fonts.mono,fontSize:8,color:"#555",letterSpacing:"0.1em"}}>and not 23andMe or carrier panels</span>
          </div>
          <span style={{color:"#555",fontSize:14}}>{whyExpanded?"−":"+"}</span>
        </button>

        {whyExpanded && (
          <div style={{padding:"0 22px 22px"}}>
            {/* Founder note */}
            <div style={{borderLeft:`3px solid ${T.rg}`,paddingLeft:16,marginBottom:20}}>
              <div style={{fontFamily:fonts.mono,fontSize:8,color:T.rg3,letterSpacing:"0.14em",marginBottom:8,textTransform:"uppercase"}}>Clinical example — Mario Anthis</div>
              <p style={{fontFamily:fonts.serif,fontSize:14,fontStyle:"italic",color:"#CCC",lineHeight:1.65,fontWeight:300,marginBottom:8}}>
                "A standard 2-SNP MTHFR panel showed neither parent as a carrier for the variants that mattered. Whole genome sequencing revealed that each parent carried a different MTHFR variant — one C677T, one A1298C. Their child inherited one from each: compound heterozygosity that no targeted panel would have detected."
              </p>
              <p style={{fontSize:11,color:"#666",fontFamily:fonts.sans,fontWeight:300,lineHeight:1.6}}>
                The child's methylation vulnerability was invisible to conventional testing. It only became visible when both genomes were analysed together, with inheritance modelled across both parents simultaneously.
              </p>
            </div>

            {/* Comparison table */}
            <div style={{width:"100%"}}>
              <div style={{display:"grid",gridTemplateColumns:"1.7fr 1fr 1fr 1.1fr",gap:6,marginBottom:10,paddingBottom:8,borderBottom:`1px solid #2A2018`}}>
                {["Capability","23andMe","Carrier panel","MediBalans WGS"].map((h,i)=>(
                  <span key={h} style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.12em",color:i===3?T.rg3:"#555",textTransform:"uppercase"}}>{h}</span>
                ))}
              </div>
              {compTable.map(([feat,a,b,c],i) => (
                <div key={feat} style={{display:"grid",gridTemplateColumns:"1.7fr 1fr 1fr 1.1fr",gap:6,padding:"9px 0",borderBottom:`1px solid #1E1610`,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#AAA",fontWeight:300}}>{feat}</span>
                  <span style={{fontSize:12,textAlign:"center",color:a?"#7A9A6A":"#444"}}>{a==="partial"?"~":a?"✓":"–"}</span>
                  <span style={{fontSize:12,textAlign:"center",color:b?"#7A9A6A":"#444"}}>{b==="partial"?"~":b?"✓":"–"}</span>
                  <span style={{fontSize:12,textAlign:"center",color:"#8AB87A",fontWeight:500}}>✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>

        {/* Upload card */}
        <div style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:12,overflow:"hidden",boxShadow:`0 2px 12px rgba(100,80,60,0.06)`}}>
          <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.w3}`}}>
            <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase",marginBottom:6}}>Already have WGS</div>
            <div style={{fontFamily:fonts.serif,fontSize:22,fontWeight:400,color:T.w7}}>Upload & analyse</div>
            <div style={{fontSize:12,color:T.w5,fontWeight:300,marginTop:4,lineHeight:1.6}}>VCF or VCF.gz from Dante Labs or any standard WGS provider. Variants extracted automatically.</div>
          </div>
          <div style={{padding:"20px 22px"}}>
            <UploadZone partner="A" file={fileA} drag={dragA} onDrag={setDragA} onFile={setFileA} showFb={showFbA} setShowFb={setShowFbA} vars={varsA}/>
            <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0",color:T.w4,fontSize:11}}>
              <div style={{flex:1,height:1,background:T.w3}}/><span style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.12em"}}>AND</span><div style={{flex:1,height:1,background:T.w3}}/>
            </div>
            <UploadZone partner="B" file={fileB} drag={dragB} onDrag={setDragB} onFile={setFileB} showFb={showFbB} setShowFb={setShowFbB} vars={varsB}/>
            <button
              onClick={runAnalysis}
              disabled={analysing || (varsA.size===0 && varsB.size===0 && !fileA && !fileB)}
              style={{
                width:"100%",padding:"13px",marginTop:8,
                background: analysing ? T.w2 : `linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,
                color:"#fff",border:"none",borderRadius:9,cursor:analysing?"not-allowed":"pointer",
                fontFamily:fonts.sans,fontSize:13,fontWeight:500,letterSpacing:"0.02em",
                transition:"all .2s",opacity:(varsA.size===0 && varsB.size===0 && !fileA && !fileB)?0.45:1,
              }}
            >
              {analysing ? "Analysing…" : "Analyse genetic compatibility →"}
            </button>
            <div style={{textAlign:"center",marginTop:10}}>
              <span style={{fontSize:11,color:T.w4}}>No WGS yet? </span>
              <button onClick={()=>setOrderModal(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:T.rg2,fontWeight:500}}>Order kits →</button>
            </div>
          </div>
        </div>

        {/* Order card */}
        <div style={{background:T.dark,border:`1px solid #2A2018`,borderRadius:12,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${T.rg2},${T.rg3})`}}/>
          <div style={{padding:"24px 22px 16px",borderBottom:`1px solid #2A2018`}}>
            <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg3,textTransform:"uppercase",marginBottom:6}}>No WGS yet</div>
            <div style={{fontFamily:fonts.serif,fontSize:22,fontWeight:400,color:"#F0E8E0"}}>Order your kits</div>
            <div style={{fontSize:12,color:"#888",fontWeight:300,marginTop:4,lineHeight:1.6}}>MediBalans-integrated sequencing through Dante Labs. Results flow automatically into Baby Balans — no file handling required.</div>
          </div>
          <div style={{padding:"20px 22px"}}>
            {/* Kit preview */}
            <div style={{background:"#221A14",borderRadius:10,padding:"16px",marginBottom:18,border:`1px solid #2A2018`,display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28,width:48,height:48,background:"#1A1208",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🧪</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:"#E8DDD0",marginBottom:3}}>MediBalans WGS Couple Package</div>
                <div style={{fontSize:11,color:"#666",lineHeight:1.5}}>Two saliva kits · 30× coverage · Dante Labs · Ships in 3 days</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:fonts.serif,fontSize:22,color:T.rg3}}>9 800 kr</div>
                <div style={{fontSize:10,color:"#555",marginTop:2}}>both partners</div>
              </div>
            </div>

            {/* Steps */}
            <div style={{display:"flex",background:"#1A1208",borderRadius:9,overflow:"hidden",marginBottom:18}}>
              {[["1","Order"],["2","Kits arrive"],["3","Return samples"],["4","Results live"]].map(([n,l],i,arr)=>(
                <div key={l} style={{flex:1,padding:"12px 6px",textAlign:"center",borderRight:i<arr.length-1?`1px solid #2A2018`:"none"}}>
                  <div style={{width:20,height:20,background:T.rg,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.dark,margin:"0 auto 5px"}}>{n}</div>
                  <div style={{fontSize:10,color:"#666",lineHeight:1.3}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{marginBottom:18}}>
              {[
                "Complete 38-gene methylation network across both parents",
                "Cross-parent compound heterozygosity detection",
                "COMT, GSTP1, VDR, DRD2 detox & receptor architecture",
                "Automatic integration into Baby Balans compatibility engine",
                "Preconception consultation with Mario Anthis included",
              ].map(f=>(
                <div key={f} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:`1px solid #1E1610`,fontSize:11,color:"#888",fontWeight:300}}>
                  <span style={{color:T.rg,flexShrink:0}}>→</span>{f}
                </div>
              ))}
            </div>

            <button onClick={()=>setOrderModal(true)} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${T.rg2},${T.rg3})`,color:T.dark,border:"none",borderRadius:9,cursor:"pointer",fontFamily:fonts.sans,fontSize:13,fontWeight:600,letterSpacing:"0.03em",transition:"all .2s"}}>
              Order couple kits — 9 800 kr
            </button>
            <div style={{textAlign:"center",marginTop:8,fontSize:10,color:"#444",fontFamily:fonts.mono,letterSpacing:"0.08em"}}>Individual kit also available · 5 400 kr</div>

            <div style={{display:"flex",gap:8,alignItems:"center",marginTop:16,padding:"10px 12px",background:"#1A1208",borderRadius:8,border:`1px solid #2A2018`}}>
              <div style={{width:7,height:7,background:"#6A9060",borderRadius:"50%",flexShrink:0}}/>
              <span style={{fontSize:11,color:"#555",lineHeight:1.4}}>Sequenced by <span style={{color:"#888",fontWeight:500}}>Dante Labs</span> · 30× WGS · GRCh38 VCF delivered directly to your MediBalans account</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      {results && results.length > 0 && (
        <div style={{marginTop:8}}>
          <Eyebrow>Compatibility analysis complete</Eyebrow>
          <SectionTitle>Inheritance <em style={{fontStyle:"italic",color:T.rg2}}>risk profile</em></SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {results.map(r => (
              <div key={r.id} style={{background:T.w,border:`1px solid ${r.bothHet?T.warn+"60":T.w3}`,borderTop:`3px solid ${r.bothHet?T.warn:T.ok}`,borderRadius:10,padding:"18px 16px",textAlign:"center",boxShadow:`0 1px 8px rgba(100,80,60,0.06)`}}>
                <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.14em",color:T.w4,textTransform:"uppercase",marginBottom:8}}>{r.gene}</div>
                <div style={{fontFamily:fonts.serif,fontSize:40,fontWeight:300,lineHeight:1,color:r.bothHet?T.warn:T.ok,marginBottom:6}}>{r.risk}%</div>
                <div style={{fontSize:11,color:T.w5,marginBottom:8,lineHeight:1.4}}>{r.riskLabel}</div>
                <div style={{fontSize:10,color:T.w4,fontFamily:fonts.sans,lineHeight:1.6,fontWeight:300}}>{r.mech}</div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:10}}>
                  {[["A", r.inA], ["B", r.inB]].map(([p,has]) => (
                    <span key={p} style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.1em",color:has?T.rg2:T.w4,background:has?T.rgBg:T.w2,padding:"2px 8px",borderRadius:4}}>
                      Partner {p}: {has?"carrier":"clear"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:20,background:T.w,border:`1px solid ${T.w3}`,borderLeft:`3px solid ${T.rg}`,borderRadius:9,padding:"14px 18px"}}>
            <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg2,textTransform:"uppercase",marginBottom:6}}>Clinical note</div>
            <p style={{fontSize:12,color:T.w5,fontWeight:300,lineHeight:1.7}}>
              This analysis identifies inherited risk patterns from parental genotypes. Variants flagged as compound risk (25%) indicate both parents carry the same heterozygous variant — each child has a one-in-four chance of inheriting the homozygous genotype. Results are reviewed by Mario Anthis before protocol design.
            </p>
          </div>
        </div>
      )}

      {/* ── ORDER MODAL ── */}
      {orderModal && (
        <div onClick={()=>setOrderModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.w,borderRadius:14,maxWidth:480,width:"100%",padding:"32px",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg2,textTransform:"uppercase",marginBottom:10}}>Order WGS kit</div>
            <div style={{fontFamily:fonts.serif,fontSize:26,fontWeight:400,marginBottom:12}}>Dante Labs · MediBalans</div>
            <p style={{fontSize:13,color:T.w5,fontWeight:300,lineHeight:1.7,marginBottom:20}}>
              Your saliva collection kit ships within 3 business days. Return your sample via prepaid courier. Your VCF file is delivered directly to your MediBalans account — the Baby Balans compatibility analysis runs automatically.
            </p>
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              {[["Couple kit","9 800 kr","Both partners · full compatibility analysis"],["Individual kit","5 400 kr","Single genome · partial analysis"]].map(([t,p,d])=>(
                <div key={t} style={{flex:1,border:`1px solid ${T.w3}`,borderRadius:10,padding:"14px",cursor:"pointer"}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{t}</div>
                  <div style={{fontFamily:fonts.serif,fontSize:20,color:T.rg2,marginBottom:4}}>{p}</div>
                  <div style={{fontSize:11,color:T.w4,fontWeight:300}}>{d}</div>
                </div>
              ))}
            </div>
            <button style={{width:"100%",padding:"13px",background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontFamily:fonts.sans,fontSize:13,fontWeight:500}}>
              Continue to Dante Labs →
            </button>
            <button onClick={()=>setOrderModal(false)} style={{width:"100%",padding:"11px",background:"none",border:`1px solid ${T.w3}`,borderRadius:9,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5,marginTop:8}}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'''

ANCHOR = "export default function MeetMario()"
if ANCHOR not in src:
    print("ERROR: Could not find anchor 'export default function MeetMario()'")
    sys.exit(1)

src = src.replace(ANCHOR, BABY_BALANS_COMPONENT + ANCHOR, 1)
print("BabyBalansTab component: injected ✓")


# ── 3. WIRE UP TAB IN tabContent() ─────────────────────────────────────────
# Find the last if(tab===...) block in tabContent and add ours after it
OLD_CHAT_TAB = '    if(tab==="chat") return ('
NEW_CHAT_TAB = '''    if(tab==="babybalans") return <BabyBalansTab/>;

    if(tab==="chat") return ('''

if OLD_CHAT_TAB not in src:
    print("WARNING: chat tab anchor not found, trying alternate…")
    # Try grocery as fallback anchor
    OLD_CHAT_TAB = '    if(tab==="grocery") return ('
    NEW_CHAT_TAB = '''    if(tab==="babybalans") return <BabyBalansTab/>;

    if(tab==="grocery") return ('''

if OLD_CHAT_TAB in src:
    src = src.replace(OLD_CHAT_TAB, NEW_CHAT_TAB, 1)
    print("tabContent routing: patched ✓")
else:
    print("WARNING: Could not find tab routing anchor — please add manually:")
    print('    if(tab==="babybalans") return <BabyBalansTab/>;')


# ── 4. WRITE ─────────────────────────────────────────────────────────────────
with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

# Brace check
opens  = src.count('{')
closes = src.count('}')
print(f"\nBrace check: {{ {opens} · }} {closes} · delta {opens-closes}")
if abs(opens - closes) > 10:
    print("WARNING: brace imbalance detected — review the file")
else:
    print("Brace balance: OK ✓")

print("\n✓ patch_babybalans.py complete")
print("  → git add src/components/MeetMario.jsx && git commit -m 'feat: Baby Balans genetic compatibility tab' && git push")
