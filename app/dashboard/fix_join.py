import urllib.request

url = 'https://raw.githubusercontent.com/meetmarioai/meet-mario/main/app/dashboard/MeetMario.jsx'
raw = urllib.request.urlopen(url).read()

# The corrupted join string with literal CRLF inside
bad = b'  }).join("\r\n");\r\n'
good = b'  }).join(String.fromCharCode(10));\r\n'

if bad in raw:
    raw = raw.replace(bad, good, 1)
    print("Fixed: join CRLF replaced with String.fromCharCode(10)")
else:
    print("ERROR: pattern not found")
    import sys; sys.exit(1)

# Write to repo
with open('app/dashboard/MeetMario.jsx', 'wb') as f:
    f.write(raw)

# Verify
print("Verify:", b'String.fromCharCode(10)' in raw)
print("Lines:", raw.count(b'\n'))
