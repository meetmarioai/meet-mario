src = open('app/dashboard/MeetMario.jsx', encoding='utf-8').read()

bad  = '  }).join("\\n\n");\n'
good = '  }).join("\\n");\n'

if bad in src:
    src = src.replace(bad, good, 1)
    open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8').write(src)
    print("Fixed line 342")
else:
    print("Pattern not found — paste raw bytes:")
    idx = src.find('}).join(')
    print(repr(src[idx:idx+30]))
