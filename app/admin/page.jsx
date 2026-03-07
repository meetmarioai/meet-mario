"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const T = {
  bg: "#FAF8F4",
  bg2: "#F5F1EB",
  card: "#FFFFFF",
  border: "#E8E4DC",
  gold: "#9A7240",
  goldLight: "#C4A882",
  rg: "#C4887A",
  text: "#2C2C2C",
  muted: "#9A9690",
  severe: "#C04040",
  moderate: "#C4887A",
  mild: "#9A7240",
  green: "#5A8A6A",
};

const fonts = {
  serif: "EB Garamond, Georgia, serif",
  sans: "Lato, sans-serif",
  mono: "IBM Plex Mono, monospace",
};

const STATUS_COLORS = {
  pending: "#C4887A",
  confirmed: "#5A8A6A",
  cancelled: "#9A9690",
  completed: "#9A7240",
};

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [anamnesis, setAnamnesis] = useState(null);
  const [updating, setUpdating] = useState(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setSession(session);
      loadData();
    });
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from("bookings").select("*, patients(name, email, phone)").order("created_at", { ascending: false }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings(b || []);
    setPatients(p || []);
    setLoading(false);
  }

  async function loadAnamnesis(bookingId) {
    const { data } = await supabase.from("anamnesis").select("*").eq("booking_id", bookingId).single();
    setAnamnesis(data);
  }

  async function updateStatus(bookingId, status) {
    setUpdating(bookingId);
    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    setUpdating(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function formatDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
  }

  function formatTime(d) {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted, letterSpacing: "0.12em" }}>LOADING...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.sans }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.card, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: fonts.serif, fontSize: 18, color: T.text }}>meet mario</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>Clinic Admin</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>
            {bookings.filter(b => b.status === "pending").length} pending
          </div>
          <button onClick={signOut} style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 2, padding: "4px 12px", cursor: "pointer", letterSpacing: "0.1em" }}>
            SIGN OUT
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

        {/* Sidebar */}
        <div style={{ width: 200, borderRight: `1px solid ${T.border}`, background: T.card, padding: "24px 0" }}>
          {[
            { id: "bookings", label: "Bookings", count: bookings.length },
            { id: "patients", label: "Patients", count: patients.length },
            { id: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending").length },
          ].map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSelected(null); setAnamnesis(null); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 24px",
                background: tab === item.id ? T.bg2 : "none",
                border: "none", borderLeft: tab === item.id ? `2px solid ${T.gold}` : "2px solid transparent",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.1em", color: tab === item.id ? T.gold : T.muted, textTransform: "uppercase" }}>{item.label}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, background: T.bg2, padding: "1px 6px", borderRadius: 8 }}>{item.count}</span>
            </button>
          ))}

          <div style={{ margin: "24px 16px 8px", fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Quick Stats</div>
          {[
            { label: "Confirmed", val: bookings.filter(b => b.status === "confirmed").length, color: T.green },
            { label: "Completed", val: bookings.filter(b => b.status === "completed").length, color: T.gold },
            { label: "Cancelled", val: bookings.filter(b => b.status === "cancelled").length, color: T.muted },
          ].map(s => (
            <div key={s.label} style={{ padding: "6px 24px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.08em" }}>{s.label}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: s.color, fontWeight: 600 }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: 32 }}>

          {/* Bookings / Pending tab */}
          {(tab === "bookings" || tab === "pending") && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                  {tab === "pending" ? "Awaiting confirmation" : "All bookings"}
                </div>
                <div style={{ fontFamily: fonts.serif, fontSize: 28, color: T.text }}>
                  {tab === "pending" ? "Pending Bookings" : "Booking Overview"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {(tab === "pending" ? bookings.filter(b => b.status === "pending") : bookings).map(b => (
                  <div key={b.id}
                    onClick={() => { setSelected(b); loadAnamnesis(b.id); }}
                    style={{
                      background: selected?.id === b.id ? T.bg2 : T.card,
                      border: `1px solid ${selected?.id === b.id ? T.gold : T.border}`,
                      borderRadius: 3, padding: "14px 20px", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px 120px",
                      alignItems: "center", gap: 16,
                      transition: "border-color 0.15s",
                    }}>
                    <div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>{b.patients?.name || "Unknown"}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{b.patients?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.text, letterSpacing: "0.06em" }}>{b.service_name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, marginTop: 2 }}>{b.service_tier}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.text }}>{formatDate(b.appointment_date)}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{formatTime(b.appointment_date)}</div>
                    </div>
                    <div style={{
                      display: "inline-flex", padding: "3px 10px", borderRadius: 12,
                      background: (STATUS_COLORS[b.status] || T.muted) + "18",
                      fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em",
                      color: STATUS_COLORS[b.status] || T.muted, textTransform: "uppercase",
                    }}>
                      {b.status || "pending"}
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold }}>{b.total_price ? `${b.total_price.toLocaleString()} SEK` : "-"}</div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div style={{ padding: 48, textAlign: "center", fontFamily: fonts.mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em" }}>NO BOOKINGS YET</div>
                )}
              </div>
            </div>
          )}

          {/* Patients tab */}
          {tab === "patients" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Registry</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 28, color: T.text }}>Patient List</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {patients.map(p => (
                  <div key={p.id}
                    onClick={() => setSelected(p)}
                    style={{
                      background: selected?.id === p.id ? T.bg2 : T.card,
                      border: `1px solid ${selected?.id === p.id ? T.gold : T.border}`,
                      borderRadius: 3, padding: "14px 20px", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px",
                      alignItems: "center", gap: 16,
                    }}>
                    <div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{p.email}</div>
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>{p.phone || "-"}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>{formatDate(p.created_at)}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold }}>{bookings.filter(b => b.patient_id === p.id).length} booking{bookings.filter(b => b.patient_id === p.id).length !== 1 ? "s" : ""}</div>
                  </div>
                ))}
                {patients.length === 0 && (
                  <div style={{ padding: 48, textAlign: "center", fontFamily: fonts.mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em" }}>NO PATIENTS YET</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 360, borderLeft: `1px solid ${T.border}`, background: T.card, overflow: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Detail View</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: T.text }}>{selected.name || selected.patients?.name}</div>
              </div>
              <button onClick={() => { setSelected(null); setAnamnesis(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.muted, padding: 4 }}>x</button>
            </div>

            {/* Contact info */}
            <div style={{ marginBottom: 20 }}>
              {[
                ["Email", selected.email || selected.patients?.email],
                ["Phone", selected.phone || selected.patients?.phone || "-"],
                ["Registered", formatDate(selected.created_at)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em" }}>{label}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Booking details */}
            {selected.service_name && (
              <>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Booking</div>
                <div style={{ marginBottom: 20 }}>
                  {[
                    ["Service", selected.service_name],
                    ["Tier", selected.service_tier || "-"],
                    ["Date", formatDate(selected.appointment_date)],
                    ["Time", formatTime(selected.appointment_date) || "-"],
                    ["Price", selected.total_price ? `${selected.total_price.toLocaleString()} SEK` : "-"],
                    ["Status", selected.status || "pending"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em" }}>{label}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: label === "Status" ? (STATUS_COLORS[value] || T.muted) : T.text, textTransform: label === "Status" ? "uppercase" : "none" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Status actions */}
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Update Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
                  {["confirmed", "completed", "cancelled", "pending"].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      disabled={selected.status === s || updating === selected.id}
                      style={{
                        padding: "8px 0", border: `1px solid ${STATUS_COLORS[s]}`,
                        background: selected.status === s ? STATUS_COLORS[s] + "20" : "none",
                        borderRadius: 2, cursor: selected.status === s ? "default" : "pointer",
                        fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em",
                        color: STATUS_COLORS[s], textTransform: "uppercase",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Anamnesis */}
            {anamnesis && (
              <>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Clinical Intake</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(anamnesis).filter(([k]) => !["id", "booking_id", "created_at"].includes(k)).map(([key, value]) => (
                    value && (
                      <div key={key} style={{ background: T.bg2, borderRadius: 3, padding: "8px 12px" }}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{key.replace(/_/g, " ")}</div>
                        <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.text, lineHeight: 1.5 }}>
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
