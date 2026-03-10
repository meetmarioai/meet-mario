import re

path = 'app/dashboard/MeetMario.jsx'
src = open(path, encoding='utf-8').read()

# Fix 1: Replace ALL remaining direct api.anthropic.com calls with /api/chat proxy
count = 0
while 'api.anthropic.com/v1/messages' in src:
    # Find the full fetch block and replace
    idx = src.find('api.anthropic.com/v1/messages')
    # Get the full fetch call - find opening fetch("
    fetch_start = src.rfind('fetch(', 0, idx)
    # Find matching closing of the fetch options object
    # Replace just the URL and headers, keep the body structure
    old_url_headers = src[fetch_start:idx+31]  # up to end of URL
    # Find end of headers block
    headers_end = src.find('"Content-Type": "application/json"', idx)
    if headers_end < 0:
        headers_end = src.find("'Content-Type': 'application/json'", idx)
    
    # Simpler approach: replace the URL string directly
    src = src.replace(
        '"https://api.anthropic.com/v1/messages"',
        '"/api/chat"',
        1
    )
    # Also remove Authorization header if present (not needed for proxy)
    count += 1

print(f"Fixed {count} direct Anthropic URL(s)")

# Fix 2: Remove Authorization/x-api-key headers from fetch calls (proxy handles auth)
# Find and clean up any header blocks that include Authorization
src = re.sub(
    r'"Authorization":\s*`Bearer \$\{[^}]+\}`[,\s]*',
    '',
    src
)
src = re.sub(
    r'"x-api-key":\s*[^,\n]+[,\s]*',
    '',
    src
)
src = re.sub(
    r'"anthropic-version":\s*[^,\n]+[,\s]*',
    '',
    src
)
src = re.sub(
    r'"anthropic-dangerous-direct-browser-access":\s*[^,\n]+[,\s]*',
    '',
    src
)
print("Cleaned auth headers")

# Fix 3: For Generate tab — the body needs to use system+messages format for /api/chat
# Find the generate fetch body and check if it uses model/messages directly
idx = src.find('"/api/chat"')
if idx > 0:
    # Check what body looks like after first /api/chat
    body_idx = src.find('body: JSON.stringify', idx)
    if body_idx > 0:
        print("Generate body:", src[body_idx:body_idx+200])

# Fix 4: Add Baby Balans to TABS array
OLD_TABS_END = '{id:"loop",labe'
NEW_TABS_ENTRY = '{id:"babybalans",label:"Baby Balans"},\n    {id:"loop",labe'

if '{id:"babybalans"' not in src:
    if OLD_TABS_END in src:
        src = src.replace(OLD_TABS_END, NEW_TABS_ENTRY, 1)
        print("Added Baby Balans to TABS array")
    else:
        print("WARNING: Could not find TABS anchor for Baby Balans")
else:
    print("Baby Balans tab already in TABS")

open(path, 'w', encoding='utf-8').write(src)

opens = src.count('{')
closes = src.count('}')
print(f"Brace check: {opens}/{closes}", "OK" if opens == closes else "MISMATCH")
print("Done.")
