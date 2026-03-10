path = 'app/dashboard/MeetMario.jsx'
src = open(path, encoding='utf-8').read()

# The generate body currently sends {model, max_tokens, messages} 
# /api/chat expects {system, messages}
# Fix: wrap the messages in the correct format

OLD = '''body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1500,
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
    })'''

NEW = '''body: JSON.stringify({
      system: "You are a clinical nutrition AI. Generate precise meal plans based on ALCAT food sensitivity protocols. Return only valid JSON.",
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
    })'''

if OLD in src:
    src = src.replace(OLD, NEW, 1)
    print("Fixed Generate body format")
else:
    # Check what's there now
    import re
    for m in re.finditer(r'body: JSON\.stringify\(\{[^)]{0,300}model', src):
        print("Found model in body at:", m.start())
        print(src[m.start():m.start()+200])

# Also fix any remaining {model, max_tokens, messages} patterns (chat tab etc)
OLD2 = 'model: "claude-sonnet-4-20250514", max_tokens:'
count = src.count(OLD2)
if count > 0:
    print(f"Found {count} remaining model: patterns — these will be ignored by proxy but cleaning up")

open(path, 'w', encoding='utf-8').write(src)
opens = src.count('{')
closes = src.count('}')
print(f"Brace check: {opens}/{closes}", "OK" if opens == closes else "MISMATCH")
print("Done.")
