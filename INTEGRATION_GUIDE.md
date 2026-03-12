# Meet Mario — AI Avatar Integration Guide

## What This Does

Adds a video consultation feature where Dr. Mario's AI avatar speaks directly
to patients about their results. The patient selects a topic (Results Overview,
21-Day Protocol, or Genomic Insights), Claude generates a personalised spoken
script, and HeyGen's LiveAvatar delivers it with Mario's face and voice.

---

## Files Created

```
app/
  api/
    avatar/
      token/route.js    ← Server-side HeyGen token generation
      script/route.js   ← Claude generates spoken narration from patient data
components/
  AvatarConsult.jsx     ← Patient-facing video consultation UI
```

---

## Setup Steps

### 1. Install the HeyGen SDK

```bash
cd C:\Users\TheLo\meet-mario
npm install @heygen/streaming-avatar
```

### 2. Create Your Digital Twin

Go to https://labs.heygen.com/interactive-avatar
Click "Create Interactive Avatar" at the bottom.
Film yourself for 2 minutes:
  - Good lighting, neutral background
  - Look directly at camera
  - Speak naturally, as you would to a patient
  - Wear what you'd wear in a consultation

Once processed, copy your Avatar ID.

### 3. Environment Variables

Add to `.env.local` (and Vercel dashboard):

```env
# HeyGen
HEYGEN_API_KEY=your_heygen_api_key
NEXT_PUBLIC_HEYGEN_AVATAR_ID=your_custom_avatar_id
NEXT_PUBLIC_HEYGEN_VOICE_ID=your_voice_clone_id    # optional — omit to use default

# Already configured
ANTHROPIC_API_KEY=your_existing_key
```

For the API key: Go to HeyGen → Settings → API → Generate Key
Start with $5 pay-as-you-go to test.

### 4. Place the Files

Copy the three files into your project:

```
api-avatar-token-route.js   →  app/api/avatar/token/route.js
api-avatar-script-route.js  →  app/api/avatar/script/route.js
AvatarConsult.jsx            →  components/AvatarConsult.jsx
```

### 5. Integrate into page.jsx

Add the import at the top of page.jsx:

```jsx
import AvatarConsult from '../components/AvatarConsult'
```

Add state for showing/hiding the avatar overlay:

```jsx
const [showAvatar, setShowAvatar] = useState(false)
```

Add trigger button — recommended location: inside the "Ask Mario" tab,
above the chat input. Find the chat section and add before it:

```jsx
{/* Avatar consultation trigger */}
<div style={{
  background: T.rgBg, border: `1px solid ${T.rg3}`,
  borderRadius: 10, padding: '16px 20px', marginBottom: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}}>
  <div>
    <div style={{
      fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: T.w7,
      marginBottom: 3,
    }}>Video Consultation</div>
    <div style={{
      fontFamily: fonts.sans, fontSize: 11.5, fontWeight: 300, color: T.w5,
    }}>Watch Dr. Mario explain your results in a personalised video</div>
  </div>
  <button onClick={() => setShowAvatar(true)} style={{
    background: T.rg, color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 18px', cursor: 'pointer', fontFamily: fonts.sans,
    fontSize: 12, fontWeight: 500, letterSpacing: '0.04em',
  }}>Watch</button>
</div>
```

Render the overlay (add just before the closing `</div>` of the dashboard):

```jsx
{showAvatar && (
  <AvatarConsult
    patient={patient}
    onClose={() => setShowAvatar(false)}
  />
)}
```

### 6. Deploy

```bash
git add .
git commit -m "feat: AI avatar video consultation — HeyGen LiveAvatar integration"
git push origin main
```

Vercel auto-deploys. Make sure env vars are set in Vercel dashboard.

---

## Cost Breakdown

| Item | Cost |
|---|---|
| HeyGen API (pay-as-you-go) | ~$1 per 1-min video |
| Claude script generation | ~$0.003 per script |
| Custom avatar creation | Included in plan |
| Voice cloning | Enterprise plan or ElevenLabs |

At 100 patients/month using avatar: ~$100–150/month
At 1,000 patients/month: ~$1,000–1,500/month

---

## Architecture Flow

```
Patient clicks "Watch"
       │
       ▼
POST /api/avatar/script
  → Claude generates spoken narration from patient data
  → Returns clean paragraphs (no markdown, natural speech)
       │
       ▼
POST /api/avatar/token
  → Server authenticates with HeyGen
  → Returns session token (API key never exposed)
       │
       ▼
HeyGen Streaming SDK (@heygen/streaming-avatar)
  → Creates WebRTC session
  → Loads Mario's digital twin avatar
  → Feeds script paragraphs via speak() method
  → Avatar delivers with lip-sync, expressions, natural pacing
       │
       ▼
Patient sees Dr. Mario explaining their results on screen
  → Transcript available below video
  → Can choose another topic or return to dashboard
```

---

## Testing Without Custom Avatar

Before filming yourself, test with a stock HeyGen avatar:
Set `NEXT_PUBLIC_HEYGEN_AVATAR_ID` to any stock avatar ID from
https://labs.heygen.com/interactive-avatar

The full flow works the same — you just won't see your face yet.

---

## Voice Cloning (Optional but Recommended)

For the most authentic experience, clone your voice via:

Option A: HeyGen Instant Voice Clone (Enterprise plan)
  → Upload 3+ minutes of your speech
  → Get a voice ID to set as NEXT_PUBLIC_HEYGEN_VOICE_ID

Option B: ElevenLabs Voice Clone + HeyGen Custom TTS
  → Clone at elevenlabs.io (30 min of speech for best quality)
  → Connect via HeyGen's custom TTS integration

Without voice cloning, the avatar uses a default HeyGen voice.
Still impressive, but not "you."

---

## Future: Tavus Real-Time Conversation

Phase 2 upgrade path:
- Replace HeyGen one-way delivery with Tavus CVI
- Patient can ASK QUESTIONS and the avatar responds live
- Tavus supports HIPAA compliance for medical use
- Sub-600ms latency for natural conversation
- Same architecture, different streaming layer
