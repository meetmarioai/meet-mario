// app/login/page.jsx
'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const T = {
  w: "#F7F4F0", w1: "#F1EDE7", w3: "#D8D0C4", w4: "#B8ACA0",
  w5: "#8A7E72", w6: "#4A4038", w7: "#1C1510",
  rg: "#C4887A", rg2: "#9A6255", rg3: "#DEB0A4", rgBg: "#F8F0EE",
  ok: "#6A9060", err: "#B85040",
}
const fonts = {
  serif: "'Georgia','Times New Roman',serif",
  sans: "-apple-system,'Helvetica Neue','Arial',sans-serif",
  mono: "'SF Mono','Fira Mono','Courier New',monospace",
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const handleLogin = async () => {
    if (!email || loading) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"100vh",background:T.w,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fonts.sans}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>

        {/* Wordmark */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:48,justifyContent:"center"}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`}}/>
          <span style={{fontFamily:fonts.serif,fontSize:22,fontWeight:400,color:T.w7}}>meet mario</span>
        </div>

        {!sent ? (
          <div>
            <div style={{fontFamily:fonts.serif,fontSize:28,color:T.w7,marginBottom:8,fontWeight:400,lineHeight:1.2}}>
              Welcome back
            </div>
            <div style={{fontSize:13,color:T.w5,marginBottom:32,lineHeight:1.6,fontWeight:300}}>
              Enter your email. We'll send a secure login link — no password needed.
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:"0.16em",marginBottom:8}}>EMAIL</div>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="your@email.com"
                style={{width:"100%",background:T.w1,border:`1px solid ${T.w3}`,borderRadius:8,padding:"12px 14px",fontSize:14,fontFamily:fonts.sans,color:T.w7,boxSizing:"border-box",outline:"none"}}
                autoFocus
              />
            </div>

            {error && (
              <div style={{fontSize:12,color:T.err,fontFamily:fonts.mono,marginBottom:12,letterSpacing:"0.06em"}}>{error}</div>
            )}

            <button
              onClick={handleLogin}
              disabled={!email||loading}
              style={{width:"100%",background:loading?T.rg+"90":T.rg,color:"#fff",border:"none",borderRadius:9,padding:"13px",fontSize:13,fontFamily:fonts.sans,fontWeight:500,letterSpacing:"0.06em",cursor:email&&!loading?"pointer":"not-allowed",transition:"background .2s"}}
            >
              {loading?"SENDING…":"SEND LOGIN LINK"}
            </button>

            <div style={{marginTop:24,fontSize:11,color:T.w4,textAlign:"center",fontFamily:fonts.mono,letterSpacing:"0.08em"}}>
              MEDIBALANS AB · KARLAVÄGEN 89, STOCKHOLM
            </div>
          </div>
        ) : (
          <div style={{textAlign:"center"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:T.ok+"18",border:`1px solid ${T.ok}40`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:20}}>
              ✓
            </div>
            <div style={{fontFamily:fonts.serif,fontSize:24,color:T.w7,marginBottom:12,fontWeight:400}}>Check your email</div>
            <div style={{fontSize:13,color:T.w5,lineHeight:1.7,fontWeight:300,marginBottom:8}}>
              We sent a secure login link to
            </div>
            <div style={{fontFamily:fonts.mono,fontSize:12,color:T.rg2,marginBottom:32}}>{email}</div>
            <div style={{fontSize:12,color:T.w4,lineHeight:1.6}}>
              Click the link in the email to access your dashboard. The link expires in 60 minutes.
            </div>
            <button
              onClick={()=>{setSent(false);setEmail('');}}
              style={{marginTop:24,background:"none",border:`1px solid ${T.w3}`,borderRadius:7,padding:"8px 20px",fontSize:11,fontFamily:fonts.mono,color:T.w5,cursor:"pointer",letterSpacing:"0.1em"}}
            >
              USE DIFFERENT EMAIL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
