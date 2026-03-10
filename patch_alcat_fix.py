path = 'app/dashboard/MeetMario.jsx'
src = open(path, encoding='utf-8').read()

OLD = '''  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 2000,
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
    })
  });
  const data = await res.json();'''

NEW = '''  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: "You are a precise medical data extraction assistant. Return only valid JSON, no markdown.",
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
    })
  });
  const data = await res.json();'''

if OLD in src:
    src = src.replace(OLD, NEW, 1)
    print("Fixed: replaced direct Anthropic call with /api/chat proxy")
else:
    # Try to find the fetch call more loosely
    import re
    m = re.search(r'await fetch\("https://api\.anthropic\.com[^"]*"', src)
    if m:
        print(f"Found at {m.start()}: {m.group()}")
        print("Manual fix needed — see context below:")
        print(src[m.start()-50:m.start()+300])
    else:
        print("ERROR: Could not find the fetch call to replace")
        exit(1)

open(path, 'w', encoding='utf-8').write(src)

opens = src.count('{')
closes = src.count('}')
print(f"Brace check: {opens}/{closes}", "OK" if opens == closes else "MISMATCH")
print("Done.")
