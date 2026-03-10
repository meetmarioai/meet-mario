import re

path = 'app/dashboard/MeetMario.jsx'
src = open(path, encoding='utf-8', errors='ignore').read()

# The function to inject — reads file, base64 encodes, sends to /api/chat vision, parses JSON response
NEW_FN = r"""
async function parseAlcatPDF(file) {
  // Convert file to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mediaType = file.type === 'application/pdf' ? 'application/pdf' : file.type || 'image/jpeg';

  const prompt = `You are parsing an ALCAT Food Sensitivity Test Report. Extract ALL food items and their reactivity levels.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "PATIENT NAME from report",
  "dob": "DOB from report",
  "testDate": "date reported",
  "labId": "lab ID number",
  "age": 0,
  "sex": "male or female",
  "hormonalStatus": "infer from age/sex or leave empty string",
  "conditions": ["Candida (moderate)" if candida positive, "Whey (mild)" if whey positive, etc],
  "severe": ["FOOD1", "FOOD2"],
  "moderate": ["FOOD1", "FOOD2"],
  "mild": ["FOOD1", "FOOD2"],
  "alsoAvoid": {
    "candida": ["AGAVE","CANE SUGAR","HONEY","MAPLE SUGAR","MOLASSES"],
    "casein": ["COW'S MILK","GOAT'S MILK","SHEEP'S MILK"]
  }
}

Rules:
- ALL food names in UPPERCASE
- severe = red column, moderate = orange column, mild = yellow column
- Include every food listed in each column
- conditions array: include "Candida (severe/moderate/mild)" and "Casein (mild)" etc only if those panels show a reaction
- alsoAvoid.candida only if Candida is reactive, alsoAvoid.casein only if Casein is reactive
- age: calculate from DOB if possible, else 0
- Return ONLY the JSON object, nothing else`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: 'You are a precise medical data extraction assistant. You extract structured data from lab reports and return only valid JSON.',
      messages: [{
        role: 'user',
        content: [
          {
            type: mediaType === 'application/pdf' ? 'document' : 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            }
          },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });

  if (!response.ok) throw new Error('API error: ' + response.status);
  const data = await response.json();
  if (data.error) throw new Error(data.error);

  // Strip any markdown fences if present
  const raw = (data.text || '').replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(raw);

  // Validate minimum structure
  if (!parsed.severe || !parsed.moderate || !parsed.mild) {
    throw new Error('Incomplete parse result');
  }

  return parsed;
}

"""

# Find anchor — inject before the first component function or export default
# Look for "function buildDynamicMarioSys" or "export default function"
anchor = 'async function parseAlcatPDF'
if anchor in src:
    print("parseAlcatPDF already exists — skipping injection")
else:
    # Inject before buildDynamicMarioSys
    target = 'function buildDynamicMarioSys('
    if target in src:
        src = src.replace(target, NEW_FN + target, 1)
        print("Injected parseAlcatPDF before buildDynamicMarioSys")
    else:
        # Fallback: inject before export default
        target2 = 'export default function'
        if target2 in src:
            src = src.replace(target2, NEW_FN + target2, 1)
            print("Injected parseAlcatPDF before export default")
        else:
            print("ERROR: Could not find injection anchor")
            exit(1)

# Also fix the API route to support vision/document content (max_tokens bump)
# Check if we need to update the chat route for larger responses
route_path = 'app/api/chat/route.js'
route_src = open(route_path, encoding='utf-8').read()
if 'max_tokens: 1024' in route_src:
    route_src = route_src.replace('max_tokens: 1024', 'max_tokens: 4096')
    open(route_path, 'w', encoding='utf-8').write(route_src)
    print("Bumped chat route max_tokens to 4096")

# Write patched file
open(path, 'w', encoding='utf-8').write(src)

# Brace check
opens = src.count('{')
closes = src.count('}')
print(f"Brace check: {opens} open / {closes} close")
if opens != closes:
    print("WARNING: brace mismatch — check file")
else:
    print("Brace check OK")

print("Done.")
