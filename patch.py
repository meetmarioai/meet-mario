import re

with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# 1. Remove emoji property from EAT_PATS and its usage
# Replace emoji chars in EAT_PATS with nothing - keep the structure but remove emoji field display
content = re.sub(r',emoji:"[^"]*"', '', content)

# 2. Remove emoji span in generate phase selector
# {[{id:"detox",label:"...",emoji:"..."},{...}].map(ph=>( <span>{ph.emoji}</span>
content = re.sub(r'<span>\{ph\.emoji\}</span>', '', content)

# 3. Remove emoji span for eating patterns  
content = re.sub(r'<span style=\{\{fontSize:12\}\}>\{locked\?"[^"]*":ep\.emoji\}</span>', '', content)

# 4. Remove research emoji span
content = re.sub(r'<span>[^<]*</span><span style=\{\{fontSize:10,color:T\.rg2[^}]*\}\}>\{resLoad', 
                 '<span style={{fontSize:10,color:T.rg2,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>{resLoad', content)

# 5. Remove icon fields from SYMPTOM_CATS
content = re.sub(r',icon:"[^"]*"', '', content)

# 6. Add file upload section to clinical step (after hasCma section, before meds)
old_meds = '              <div style={{marginBottom:40}}>\n                <FieldLabel>Current medications'
new_upload = '''              <div style={{marginBottom:28,borderBottom:`1px solid ${T.w3}`,paddingBottom:28}}>
                <FieldLabel>Upload lab results (optional)</FieldLabel>
                <p style={{fontSize:12,fontWeight:300,color:T.w4,lineHeight:1.6,marginBottom:14,fontFamily:fonts.sans}}>ALCAT · CMA · GI-MAP · Genova · Werlabs · Unilabs · DUTCH · or any functional medicine report (PDF)</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                  {(clinical.uploadedFiles||[]).map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:6,padding:"5px 10px"}}>
                      <span style={{fontFamily:fonts.mono,fontSize:10,color:T.rg2}}>{f.name}</span>
                      <button onClick={()=>uc("uploadedFiles",(clinical.uploadedFiles||[]).filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:T.w4,fontSize:12,padding:0,lineHeight:1}}>x</button>
                    </div>
                  ))}
                </div>
                <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:9,border:`1px solid ${T.w3}`,background:T.w,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5}}>
                  <span style={{fontFamily:fonts.mono,fontSize:10,letterSpacing:"0.1em"}}>+ ADD FILE</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{display:"none"}}
                    onChange={e=>{
                      const files = Array.from(e.target.files);
                      uc("uploadedFiles",[...(clinical.uploadedFiles||[]),...files]);
                      e.target.value="";
                    }}
                  />
                </label>
              </div>
              <div style={{marginBottom:40}}>
                <FieldLabel>Current medications'''

content = content.replace(old_meds, new_upload, 1)

# Check if upload was added
upload_added = 'ADD FILE' in content
emoji_removed = 'ph.emoji' not in content

print(f"Original length: {original_len}")
print(f"New length: {len(content)}")
print(f"Upload section added: {upload_added}")
print(f"Emojis removed: {emoji_removed}")

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
