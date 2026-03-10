import urllib.request, re, sys

print("Fetching from GitHub...")
url = 'https://raw.githubusercontent.com/meetmarioai/meet-mario/main/app/dashboard/MeetMario.jsx'
raw = urllib.request.urlopen(url).read()
content = raw.decode('utf-8')

# Normalize line endings to pure LF
content = content.replace('\r\n', '\n').replace('\r', '\n')

# Remove // v2 comment if present
content = content.replace('// v2\n', '', 1)

# Fix: color=S.c3 -> color="#50A060" (JSX attribute without braces is invalid for expressions)
content = content.replace('color=S.c3 label=', 'color="#50A060" label=', 1)

# Fix: all S.c1 S.c2 S.c3 S.c4 undefined refs
content = content.replace('S.c1', '"#1A1610"')
content = content.replace('S.c2', 'S.muted')
content = content.replace('S.c3', '"#50A060"')
content = content.replace('S.c4', '"#181610"')

# Fix: join with literal newline -> String.fromCharCode(10)
bad_join = '  }).join("\r\n");\r\n'
good_join = '  }).join(String.fromCharCode(10));\n'
if bad_join in content:
    content = content.replace(bad_join, good_join, 1)
    print("  Fixed: CRLF in join")
# Also handle LF version
bad_join2 = '  }).join("\n");\n'
# Check if this is actually a literal newline vs escape
idx = content.find('}).join("')
if idx >= 0:
    chunk = content[idx:idx+20]
    if '\n' in chunk[10:15]:  # literal newline inside the string
        content = content[:idx] + '}).join(String.fromCharCode(10));' + content[idx+len(chunk):]
        print("  Fixed: literal LF in join")

# Add outcomes to TABS if missing
if '{id:"outcomes"' not in content:
    content = content.replace(
        '{id:"chat",label:"Ask Mario"}];',
        '{id:"chat",label:"Ask Mario"},{id:"outcomes",label:"Outcomes"}];',
        1
    )
    print("  Added: Outcomes tab")

# Write to repo
path = 'app/dashboard/MeetMario.jsx'
with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

# Verify
errors = []
if '\r' in content: errors.append("CRLF still present")
if any(f'S.c{n}' in content for n in '1234'): errors.append("S.c refs still present")
if re.search(r'color=S\.\w+\b(?!["\s+])', content): errors.append("bare color=S. present")
opens = content.count('{')
closes = content.count('}')
if opens != closes: errors.append(f"Brace mismatch {opens}/{closes}")

print(f"\nLines: {content.count(chr(10))}")
print(f"Braces: {opens}/{closes} diff={opens-closes}")
print(f"CRLF: {chr(13) in content}")
print(f"outcomes tab: {'{id:\"outcomes\"' in content}")
print(f"BABY BALANS: {'BABY BALANS' in content}")
print(f"userRegion: {'userRegion' in content}")

if errors:
    print("\nERRORS:")
    for e in errors: print(f"  ✗ {e}")
    sys.exit(1)
else:
    print("\nALL CHECKS PASSED")
    print("Now run:")
    print("  git add app/dashboard/MeetMario.jsx")
    print('  git commit -m "fix: S.c undefined refs, color= JSX syntax"')
    print("  git push origin main")
