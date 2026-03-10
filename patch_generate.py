import re

path = r"C:\Users\TheLo\meet-mario\app\dashboard\MeetMario.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = """          <div style={{fontSize:12,lineHeight:1.9,color:T.w6,fontFamily:fonts.sans,fontWeight:300}}>
            {genResult.split("\\n").map((line,i)=>{
              if(!line.trim())return<div key={i} style={{height:5}}/>;
              const bm=line.match(/^\\*\\*(.+)\\*\\*(.*)$/);
              if(bm)return<div key={i} style={{marginTop:i>0?12:0}}><span style={{color:T.rg2,fontWeight:600,fontFamily:fonts.serif,fontSize:15}}>{bm[1]}</span>{bm[2]&&<span style={{color:T.w6}}>{bm[2]}</span>}</div>;
              if(line.match(/^Notes/i))return<div key={i} style={{marginTop:14,borderTop:`1px solid ${T.w3}`,paddingTop:10,fontSize:11,color:T.w4,fontFamily:fonts.sans,fontStyle:"italic"}}>{line.replace(/^Notes[\\s:]*/i,"")}</div>;
              return<div key={i} style={{color:T.w5,fontSize:11,fontFamily:fonts.sans}}>{line}</div>;
            })}
          </div>"""

new = """          <div style={{fontSize:12,lineHeight:1.9,color:T.w6,fontFamily:fonts.sans,fontWeight:300}}>
            {genResult.split("\\n").map((line,i)=>{
              if(!line.trim())return<div key={i} style={{height:6}}/>;
              // ## Meal heading
              const h2=line.match(/^##\\s+(.+)$/);
              if(h2)return<div key={i} style={{marginTop:18,marginBottom:4,color:T.rg2,fontFamily:fonts.serif,fontSize:16,fontWeight:600,borderBottom:`1px solid ${T.w2}`,paddingBottom:4}}>{h2[1]}</div>;
              // # Day heading
              const h1=line.match(/^#\\s+(.+)$/);
              if(h1)return<div key={i} style={{marginTop:10,marginBottom:8,color:T.w7,fontFamily:fonts.serif,fontSize:18,fontWeight:600}}>{h1[1]}</div>;
              // Meal time line e.g. "## Meal 1 (6:00 AM)" already caught above
              // **bold** inline
              const bm=line.match(/^\\*\\*(.+?)\\*\\*(.*)$/);
              if(bm)return<div key={i} style={{marginTop:i>0?10:0}}><span style={{color:T.rg2,fontWeight:600,fontFamily:fonts.serif,fontSize:14}}>{bm[1]}</span>{bm[2]&&<span style={{color:T.w6,fontSize:12}}>{bm[2]}</span>}</div>;
              // Notes footer
              if(line.match(/^Notes/i))return<div key={i} style={{marginTop:14,borderTop:`1px solid ${T.w3}`,paddingTop:10,fontSize:11,color:T.w4,fontFamily:fonts.sans,fontStyle:"italic"}}>{line.replace(/^Notes[\\s:]*/i,"")}</div>;
              // Ingredient / description line
              return<div key={i} style={{color:T.w5,fontSize:11.5,fontFamily:fonts.sans,lineHeight:1.7,paddingLeft:line.startsWith("-")?12:0}}>{line.startsWith("-")?line.slice(1).trim():line}</div>;
            })}
          </div>"""

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("PATCHED OK")
else:
    print("NOT FOUND — check whitespace")
