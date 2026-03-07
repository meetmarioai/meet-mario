"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function handleLogin() {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Invalid email or password."); setLoading(false); }
    else { router.push("/dashboard"); }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FAF8F4", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:400, padding:"48px 40px", background:"#fff", borderRadius:4, boxShadow:"0 2px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ fontFamily:"EB Garamond, Georgia, serif", fontSize:22, color:"#2C2C2C", marginBottom:8 }}>meet mario</div>
        <div style={{ fontFamily:"IBM Plex Mono, monospace", fontSize:10, letterSpacing:"0.12em", color:"#9A7240", textTransform:"uppercase", marginBottom:40 }}>PRECISION MEDICINE · STOCKHOLM</div>
        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontFamily:"IBM Plex Mono, monospace", fontSize:10, letterSpacing:"0.1em", color:"#9A9690", textTransform:"uppercase", marginBottom:8 }}>EMAIL</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="you@medibalans.se" style={{ width:"100%", border:"none", borderBottom:"1px solid #E8E4DC", background:"transparent", padding:"8px 0", fontSize:15, color:"#2C2C2C", outline:"none", boxSizing:"border-box" }} />
        </div>
        <div style={{ marginBottom:32 }}>
          <label style={{ display:"block", fontFamily:"IBM Plex Mono, monospace", fontSize:10, letterSpacing:"0.1em", color:"#9A9690", textTransform:"uppercase", marginBottom:8 }}>PASSWORD</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" style={{ width:"100%", border:"none", borderBottom:"1px solid #E8E4DC", background:"transparent", padding:"8px 0", fontSize:15, color:"#2C2C2C", outline:"none", boxSizing:"border-box" }} />
        </div>
        {error && <div style={{ fontFamily:"IBM Plex Mono, monospace", fontSize:11, color:"#C4887A", marginBottom:16 }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading||!email||!password} style={{ width:"100%", padding:"14px 0", background:loading||!email||!password?"#E8E4DC":"#9A7240", color:loading||!email||!password?"#B8B4AC":"#FAF8F4", border:"none", borderRadius:2, fontFamily:"IBM Plex Mono, monospace", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", cursor:loading||!email||!password?"default":"pointer" }}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </div>
    </div>
  );
}
