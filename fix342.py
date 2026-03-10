raw  = open('app/dashboard/MeetMario.jsx','rb').read()
bad  = b'}).join("\r\n");\r\n'
good = b'}).join("\\n");\r\n'
if bad in raw:
    out = raw.replace(bad, good, 1)
    open('app/dashboard/MeetMario.jsx','wb').write(out)
    print('FIXED')
else:
    idx = raw.find(b'}).join(')
    print('NOT FOUND. Bytes:', repr(raw[idx:idx+25]))
