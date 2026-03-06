with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add skip link after the Start Assessment button on the welcome step
old = '              <BtnPrimary onClick={()=>goTo(1)}>Start Assessment \u2192</BtnPrimary>'
new = '''              <BtnPrimary onClick={()=>goTo(1)}>Start Assessment \u2192</BtnPrimary>
              <div style={{textAlign:"center",marginTop:16}}>
                <button onClick={()=>onComplete(null)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:"0.14em",textTransform:"uppercase",textDecoration:"underline"}}>Skip \u2014 go to dashboard</button>
              </div>'''

content = content.replace(old, new, 1)
print("Skip button added:", 'Skip' in content)

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
