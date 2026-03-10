# Read file as binary to see exact bytes
raw = open('app/dashboard/MeetMario.jsx', 'rb').read()

# The broken pattern: }).join("\n  (literal newline)  ")
# Try both CRLF and LF variants
bad_lf   = b'}).join("\\n\n");\n'
bad_crlf = b'}).join("\\n\r\n");\r\n'
good     = b'}).join("\\n");\n'

if bad_lf in raw:
    raw = raw.replace(bad_lf, good, 1)
    print("Fixed LF variant")
elif bad_crlf in raw:
    raw = raw.replace(bad_crlf, good, 1)
    print("Fixed CRLF variant")
else:
    # Find it anyway
    idx = raw.find(b'}).join(')
    print("Not found with known patterns. Bytes at join:")
    print(repr(raw[idx:idx+30]))
    exit(1)

open('app/dashboard/MeetMario.jsx', 'wb').write(raw)
print("Written. Line count:", raw.count(b'\n'))
