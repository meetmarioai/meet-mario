with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: replace clinical.uploadedFiles with uploadedFiles state
# and uc("uploadedFiles",...) with setUploadedFiles(...)

old = '''                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
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
                </label>'''

new = '''                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                  {uploadedFiles.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:6,padding:"5px 10px"}}>
                      <span style={{fontFamily:fonts.mono,fontSize:10,color:T.rg2}}>{f.name}</span>
                      <button onClick={()=>setUploadedFiles(uploadedFiles.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:T.w4,fontSize:12,padding:0,lineHeight:1}}>x</button>
                    </div>
                  ))}
                </div>
                <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:9,border:`1px solid ${T.w3}`,background:T.w,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5}}>
                  <span style={{fontFamily:fonts.mono,fontSize:10,letterSpacing:"0.1em"}}>+ ADD FILE</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{display:"none"}}
                    onChange={e=>{
                      const files = Array.from(e.target.files);
                      setUploadedFiles([...uploadedFiles,...files]);
                      e.target.value="";
                    }}
                  />
                </label>'''

content = content.replace(old, new, 1)

# Add useState for uploadedFiles after existing useState declarations in Onboarding
old_state = '  const [breakdown, setBreakdown] = useState(null);'
new_state = '  const [breakdown, setBreakdown] = useState(null);\n  const [uploadedFiles, setUploadedFiles] = useState([]);'
content = content.replace(old_state, new_state, 1)

print("uploadedFiles state added:", 'setUploadedFiles] = useState' in content)
print("clinical reference removed:", 'clinical.uploadedFiles' not in content)

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
