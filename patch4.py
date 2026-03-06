with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages,...extra})});'

new = 'const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system,messages})});'

content = content.replace(old, new, 1)
print("API route patched:", '/api/chat' in content)
print("Direct Anthropic call removed:", 'api.anthropic.com' not in content)

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
