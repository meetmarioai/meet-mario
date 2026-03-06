with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add PlateCheck import
old1 = 'import { useState, useRef, useEffect, useCallback } from "react";'
new1 = 'import { useState, useRef, useEffect, useCallback } from "react";\nimport PlateCheck from "../components/PlateCheck";'
content = content.replace(old1, new1, 1)

# 2. Add tab entry to TABS array
old2 = 'const TABS = ['
new2 = 'const TABS = [\n    {id:"platecheck",label:"Plate",icon:"\U0001f4f8"},'
content = content.replace(old2, new2, 1)

# 3. Inject PlateCheck render block before meals tab
old3 = 'if(tab==="meals") return ('
new3 = '''if(tab==="platecheck") return (
      <div onClick={e=>e.stopPropagation()}>
        <PlateCheck
          patientName={P.name}
          alcat={{ severe: P.severe, moderate: P.moderate, mild: P.mild }}
          rotationDay={rotDay}
          onLogSaved={(entry) => console.log(entry)}
        />
      </div>
    );
    if(tab==="meals") return ('''
content = content.replace(old3, new3, 1)

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
