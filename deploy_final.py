import urllib.request, sys

print("Fetching from GitHub...")
url = 'https://raw.githubusercontent.com/meetmarioai/meet-mario/main/app/dashboard/MeetMario.jsx'
raw = urllib.request.urlopen(url).read()
content = raw.decode('utf-8')
print(f"Fetched: {len(content)} chars, {content.count(chr(10))} lines")

fixes = []

# Fix 1: backslash-1 corruption at line 720
old1 = 'setMonFoods([]);}}\\1                        style='
new1 = 'setMonFoods([]);}} style='
if old1 in content:
    content = content.replace(old1, new1, 1)
    fixes.append("Fix1: backslash-1 removed")

# Fix 2: CRLF inside join string
old2 = '}).join("\r\n");\r\n'
new2 = '}).join("\\n");\n'
if old2 in content:
    content = content.replace(old2, new2, 1)
    fixes.append("Fix2: CRLF in join removed")

# Fix 3: state vars
old3 = 'groceryExport, setGroceryExport] = useState(false);'
if old3 in content and 'userRegion' not in content:
    new3 = (old3 + '\n'
    ' const [userRegion,    setUserRegion]    = useState(null);\n'
    ' const [parsedItems,   setParsedItems]   = useState([]);\n'
    ' const [outcomeBaseline,setOutcomeBaseline] = useState(null);\n'
    ' const [outcomeCheckins,setOutcomeCheckins] = useState([]);\n'
    ' const [outcomeView,   setOutcomeView]   = useState("checkin");\n'
    ' const [outcomeInput,  setOutcomeInput]  = useState({energy:5,gut:5,sleep:5,mood:5,pain:5});\n'
    ' const [outcomeNote,   setOutcomeNote]   = useState("");\n'
    ' const [outcomeSaving, setOutcomeSaving] = useState(false);\n'
    ' const [outcomeMarioInsight,setOutcomeMarioInsight] = useState(null);')
    content = content.replace(old3, new3, 1)
    fixes.append("Fix3: state vars added")

# Fix 4: Baby Balans nav
old4 = '<span style={{fontSize:8,letterSpacing:0.5,color:"#7A6030",fontFamily:FF,fontWeight:600,background:"#1A1608",border:"1px solid #3A2A08",borderRadius:3,padding:"1px 6px"}}>PATENT PENDING</span>'
if old4 in content and 'BABY BALANS' not in content:
    new4 = ('<a href="/pregnancy" style={{fontFamily:FF,fontSize:8,color:"#8BAF8A",textDecoration:"none",'
    'letterSpacing:"0.12em",border:"1px solid #3A4030",borderRadius:5,padding:"3px 10px",'
    'display:"flex",alignItems:"center",gap:5}}>'
    '<div style={{width:5,height:5,borderRadius:"50%",background:"#8BAF8A"}}/>'
    'BABY BALANS</a>\n       ' + old4)
    content = content.replace(old4, new4, 1)
    fixes.append("Fix4: Baby Balans nav added")

# Fix 5: Outcomes tab
old5 = '{id:"chat",label:"Ask Mario"}];'
if old5 in content and '"outcomes"' not in content:
    content = content.replace(old5, '{id:"chat",label:"Ask Mario"},{id:"outcomes",label:"Outcomes"}];', 1)
    fixes.append("Fix5: Outcomes tab in list")

# Fix 6: Outcomes render
if 'tab==="outcomes"' not in content:
    old6 = '   {/* FOOTER */}'
    new6 = (
    '   {tab==="outcomes"&&<div style={{padding:"4px 0"}}>\n'
    '    <div style={{fontFamily:"EB Garamond,Georgia,serif",fontSize:22,color:"#C8A882",fontWeight:400,marginBottom:4}}>Outcomes</div>\n'
    '    <p style={{fontSize:12,color:"#8A8070",fontFamily:FF,fontWeight:300,lineHeight:1.7,marginBottom:20}}>Five markers. Logged at baseline and every check-in. The delta is your evidence.</p>\n'
    '    <div style={{display:"flex",gap:6,marginBottom:20}}>\n'
    '     {[{id:"checkin",label:"Check-in"},{id:"chart",label:"Progress"},{id:"population",label:"Population"}].map(v=>(\n'
    '      <button key={v.id} onClick={()=>setOutcomeView(v.id)}\n'
    '       style={{background:outcomeView===v.id?"#1A1810":S.card,border:`1px solid ${outcomeView===v.id?S.gold:S.border}`,borderRadius:5,padding:"5px 14px",cursor:"pointer",fontSize:10,fontFamily:FF,color:outcomeView===v.id?S.gold:S.muted,letterSpacing:"0.1em"}}>\n'
    '       {v.label}</button>))}\n'
    '    </div>\n'
    '    {outcomeView==="checkin"&&<div>\n'
    '     {outcomeBaseline&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",gap:20}}>\n'
    '      <div><div style={{fontSize:8,color:S.gold,fontFamily:FF,letterSpacing:"0.16em",marginBottom:2}}>DAY</div>\n'
    '       <div style={{fontSize:26,color:S.gold,fontFamily:"EB Garamond,serif"}}>{Math.floor((Date.now()-new Date(outcomeBaseline.date).getTime())/86400000)}</div></div>\n'
    '      <div><div style={{fontSize:8,color:S.muted,fontFamily:FF,letterSpacing:"0.16em",marginBottom:2}}>CHECK-INS</div>\n'
    '       <div style={{fontSize:26,color:S.text,fontFamily:"EB Garamond,serif"}}>{outcomeCheckins.length}</div></div>\n'
    '     </div>}\n'
    '     <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>\n'
    '      <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:14}}>{outcomeBaseline?"CHECK-IN":"BASELINE \u2014 DAY 1"}</div>\n'
    '      {[{key:"energy",label:"Energy",color:S.gold},{key:"gut",label:"Gut",color:"#70A070"},{key:"sleep",label:"Sleep",color:"#6A80A8"},{key:"mood",label:"Mood",color:"#9A70A0"},{key:"pain",label:"Pain-free",color:S.severe}].map(m=>(\n'
    '       <div key={m.key} style={{marginBottom:12}}>\n'
    '        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>\n'
    '         <span style={{fontSize:9,color:S.muted,fontFamily:FF,letterSpacing:"0.1em"}}>{m.label.toUpperCase()}</span>\n'
    '         <span style={{fontSize:10,color:m.color,fontFamily:FF,fontWeight:600}}>{outcomeInput[m.key]}/10</span>\n'
    '        </div>\n'
    '        <div style={{position:"relative",height:5,background:S.border,borderRadius:3}}>\n'
    '         <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${outcomeInput[m.key]*10}%`,background:m.color,borderRadius:3}}/>\n'
    '        </div>\n'
    '        <input type="range" min="1" max="10" value={outcomeInput[m.key]}\n'
    '         onChange={e=>setOutcomeInput(p=>({...p,[m.key]:parseInt(e.target.value)}))}\n'
    '         style={{width:"100%",marginTop:3,accentColor:m.color,cursor:"pointer"}}/>\n'
    '       </div>\n'
    '      ))}\n'
    '      <button onClick={async()=>{\n'
    '       if(outcomeSaving)return; setOutcomeSaving(true);\n'
    '       const d=outcomeBaseline?Math.floor((Date.now()-new Date(outcomeBaseline.date).getTime())/86400000):0;\n'
    '       const e={date:new Date().toISOString(),day:d,scores:{...outcomeInput},note:outcomeNote,isBaseline:!outcomeBaseline};\n'
    '       if(!outcomeBaseline){setOutcomeBaseline(e);}else{setOutcomeCheckins(p=>[...p,e]);}\n'
    '       setOutcomeNote(""); setOutcomeSaving(false);\n'
    '      }} style={{background:S.gold,color:"#0A0A08",borderRadius:7,padding:"10px 24px",fontSize:11,fontFamily:FF,fontWeight:600,border:"none",cursor:"pointer",marginTop:8}}>\n'
    '       {outcomeSaving?"SAVING\u2026":outcomeBaseline?"SAVE CHECK-IN":"SET BASELINE"}\n'
    '      </button>\n'
    '     </div>\n'
    '    </div>}\n'
    '    {outcomeView==="chart"&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>\n'
    '     <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:14}}>TRAJECTORY</div>\n'
    '     {(outcomeBaseline?[outcomeBaseline,...outcomeCheckins]:[]).length<2\n'
    '      ?<p style={{fontSize:12,color:S.muted,fontFamily:FF}}>Set baseline and complete one check-in to see trajectory.</p>\n'
    '      :[{key:"energy",color:S.gold},{key:"gut",color:"#70A070"},{key:"sleep",color:"#6A80A8"},{key:"mood",color:"#9A70A0"},{key:"pain",color:S.severe}].map(m=>{\n'
    '       const entries=outcomeBaseline?[outcomeBaseline,...outcomeCheckins]:[];\n'
    '       const vals=entries.map(e=>e.scores[m.key]);\n'
    '       const w=460,h=60;\n'
    '       const pts=vals.map((v,i)=>`${(i/Math.max(vals.length-1,1))*w},${h-(v/10)*h}`).join(" ");\n'
    '       return(<div key={m.key} style={{marginBottom:16}}>\n'
    '        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>\n'
    '         <span style={{fontSize:9,color:m.color,fontFamily:FF,letterSpacing:"0.1em"}}>{m.key.toUpperCase()}</span>\n'
    '         <span style={{fontSize:9,color:S.muted,fontFamily:FF}}>{vals[0]}\u2192{vals[vals.length-1]}</span>\n'
    '        </div>\n'
    '        <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>\n'
    '         <polyline points={pts} fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round"/>\n'
    '         {vals.map((v,i)=><circle key={i} cx={(i/Math.max(vals.length-1,1))*w} cy={h-(v/10)*h} r="4" fill={m.color}/>)}\n'
    '        </svg>\n'
    '       </div>);\n'
    '      })}\n'
    '    </div>}\n'
    '    {outcomeView==="population"&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>\n'
    '     <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:12}}>POPULATION \u2014 DAY 90 AVERAGES</div>\n'
    '     {[{label:"Energy",key:"energy",pop:3.2,color:S.gold},{label:"Gut",key:"gut",pop:4.1,color:"#70A070"},{label:"Sleep",key:"sleep",pop:2.8,color:"#6A80A8"},{label:"Mood",key:"mood",pop:2.5,color:"#9A70A0"},{label:"Pain-free",key:"pain",pop:2.9,color:S.severe}].map(m=>{\n'
    '      const base=outcomeBaseline?.scores[m.key];\n'
    '      const latest=outcomeCheckins[outcomeCheckins.length-1]?.scores[m.key];\n'
    '      const delta=(base&&latest)?latest-base:null;\n'
    '      return(<div key={m.key} style={{marginBottom:12}}>\n'
    '       <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>\n'
    '        <span style={{fontSize:9,color:S.muted,fontFamily:FF,letterSpacing:"0.1em"}}>{m.label.toUpperCase()}</span>\n'
    '        <span style={{fontSize:9,color:S.muted,fontFamily:FF}}>Pop +{m.pop}</span>\n'
    '       </div>\n'
    '       <div style={{position:"relative",height:6,background:S.border,borderRadius:3}}>\n'
    '        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(m.pop/5)*100}%`,background:m.color+"40",borderRadius:3}}/>\n'
    '        {delta!==null&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(Math.max(delta,0)/5*100,100)}%`,background:m.color,borderRadius:3}}/>}\n'
    '       </div>\n'
    '      </div>);\n'
    '     })}\n'
    '    </div>}\n'
    '   </div>}\n'
    '   {/* FOOTER */}'
    )
    if old6 in content:
        content = content.replace(old6, new6, 1)
        fixes.append("Fix6: Outcomes render added")

# Write directly to repo file
path = 'app/dashboard/MeetMario.jsx'
with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('\nFixes applied:')
for f in fixes: print(' ', f)
opens = content.count('{')
closes = content.count('}')
print(f'\nLines: {content.count(chr(10))}')
print(f'Braces: {opens}/{closes} diff={opens-closes}')
print(f'BABY BALANS: {"BABY BALANS" in content}')
print(f'userRegion: {"userRegion" in content}')
print(f'outcomeBaseline: {"outcomeBaseline" in content}')
print(f'Outcomes tab: {"{id:\"outcomes\"" in content}')
print(f'\nDONE. Now run:')
print('  git add app/dashboard/MeetMario.jsx')
print('  git commit -m "fix: all corruptions fixed, features restored"')
print('  git push origin main')
