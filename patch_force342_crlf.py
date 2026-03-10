raw = open('app/dashboard/MeetMario.jsx', 'rb').read()

# The broken pattern with CRLF inside the string
bad = b'}).join("\\r\n");\r\n'
good = b'}).join("\\n");\r\n'

if bad in raw:
    raw = raw.replace(bad, good, 1)
    open('app/dashboard/MeetMario.jsx', 'wb').write(raw)
    print("FIXED — CRLF inside string removed")
else:
    # Show what's actually there
    idx = raw.find(b'}).join(')
    print("Pattern not found. Actual bytes:")
    print(repr(raw[idx:idx+30]))
