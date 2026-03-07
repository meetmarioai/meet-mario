"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const T = {
  bg: "#FAF8F4", bg2: "#F5F1EB", bg3: "#EDE9E1",
  card: "#FFFFFF", border: "#E8E4DC", borderHover: "#C4A882",
  gold: "#9A7240", goldLight: "#C4A882", goldPale: "#F0E8DC",
  rg: "#C4887A", rgPale: "#F5EAE7",
  text: "#2C2C2C", muted: "#9A9690", faint: "#C8C4BC",
  severe: "#B03030", moderate: "#C4887A", mild: "#9A7240",
  green: "#4A7A5A", greenPale: "#E8F2EC",
  blue: "#4A6A8A", bluePale: "#E8EEF5",
  purple: "#6A4A8A", purplePale: "#EEE8F5",
};
const fonts = {
  serif: "EB Garamond, Georgia, serif",
  sans: "Lato, sans-serif",
  mono: "IBM Plex Mono, monospace",
};

const CLINICIANS = ["Mario Anthis", "Christina Biri"];
const CLINICIAN_COLORS = {
  "Mario Anthis": { bg: "#E8EEF5", border: "#4A6A8A", text: "#4A6A8A" },
  "Christina Biri": { bg: "#EEE8F5", border: "#6A4A8A", text: "#6A4A8A" },
};
const STATUS_META = {
  pending:   { color: T.moderate, bg: T.rgPale,    label: "Pending" },
  confirmed: { color: T.green,    bg: T.greenPale,  label: "Confirmed" },
  completed: { color: T.gold,     bg: T.goldPale,   label: "Completed" },
  cancelled: { color: T.muted,    bg: T.bg3,        label: "Cancelled" },
};
const HOURS = Array.from({length: 13}, (_, i) => i + 7); // 07:00â€“19:00

const SERVICES = [
  { name: "Diagnostik Basic",    duration: 60,  price: 22000 },
  { name: "Diagnostik Plus",     duration: 90,  price: 32000 },
  { name: "Diagnostik Premium",  duration: 120, price: 42000 },
  { name: "Diagnostik Ultimate", duration: 120, price: 50000 },
  { name: "Konsultation",        duration: 60,  price: 4500  },
  { name: "Ã…terbesÃ¶k",           duration: 30,  price: 2500  },
  { name: "Behandling",          duration: 60,  price: 8000  },
];

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function weekDays(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({length: 5}, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}
function fmtDate(d) {
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}
function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}
function fmtFull(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// â”€â”€ Chip component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Chip({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 10,
      fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em",
      textTransform: "uppercase", color, background: bg,
    }}>{label}</span>
  );
}

// â”€â”€ Booking card in calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CalBooking({ booking, top, height, onClick }) {
  const c = CLINICIAN_COLORS[booking.clinician] || CLINICIAN_COLORS["Mario Anthis"];
  const sm = STATUS_META[booking.status] || STATUS_META.pending;
  return (
    <div onClick={() => onClick(booking)} style={{
      position: "absolute", top, left: 2, right: 2, height: Math.max(height - 2, 20),
      background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.border}`,
      borderRadius: 3, padding: "3px 6px", cursor: "pointer", overflow: "hidden",
      transition: "filter 0.1s",
    }}
    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.96)"}
    onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
    >
      <div style={{ fontFamily: fonts.sans, fontSize: 11, fontWeight: 600, color: c.text, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {booking.patient_name || "Patient"}
      </div>
      {height > 30 && (
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: c.text, opacity: 0.7, marginTop: 1 }}>
          {booking.service_name}
        </div>
      )}
    </div>
  );
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Auth
  const [user, setUser] = useState(null);

  // Navigation
  const [view, setView] = useState("calendar"); // calendar | patients | analytics
  const [anchor, setAnchor] = useState(new Date());

  // Data
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection / panels
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientBookings, setPatientBookings] = useState([]);

  // New booking modal
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newSlot, setNewSlot] = useState(null); // { date, hour, clinician }
  const [newForm, setNewForm] = useState({ patient_name: "", patient_email: "", patient_phone: "", service_name: "", clinician: "Mario Anthis", notes: "", price: "" });

  // Updating
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      loadAll();
    });
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from("bookings").select("*, patients(name, email, phone)").order("appointment_date"),
      supabase.from("patients").select("*").order("name"),
    ]);
    const mapped = (b || []).map(bk => ({
      ...bk,
      patient_name: bk.patients?.full_name || bk.patient_name || "Unknown",
      patient_email: bk.patients?.email,
      patient_phone: bk.patients?.phone,
    }));
    setBookings(mapped);
    setPatients(p || []);
    setLoading(false);
  }

  async function loadPatientBookings(patientId) {
    const { data } = await supabase.from("bookings").select("*").eq("patient_id", patientId).order("appointment_date", { ascending: false });
    setPatientBookings(data || []);
  }

  async function updateBookingStatus(id, status) {
    setSaving(true);
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status }));
    setSaving(false);
  }

  async function saveNewBooking() {
    if (!newForm.patient_name || !newForm.service_name) return;
    setSaving(true);
    const apptDate = new Date(newSlot.date);
    apptDate.setHours(newSlot.hour, 0, 0, 0);
    const svc = SERVICES.find(s => s.name === newForm.service_name);

    // Upsert patient
    let patientId = null;
    if (newForm.patient_email) {
      const { data: existing } = await supabase.from("patients").select("id").eq("email", newForm.patient_email).single().then(r => r).catch(() => ({ data: null }));
      if (existing) {
        patientId = existing.id;
      } else {
        const { data: np } = await supabase.from("patients").insert({ name: newForm.patient_name, email: newForm.patient_email, phone: newForm.patient_phone }).select().single();
        patientId = np?.id;
      }
    }

    const { data: nb } = await supabase.from("bookings").insert({
      patient_id: patientId,
      patient_name: newForm.patient_name,
      service_name: newForm.service_name,
      clinician: newForm.clinician,
      appointment_date: apptDate.toISOString(),
      duration_minutes: svc?.duration || 60,
      total_price: parseInt(newForm.price) || svc?.price || 0,
      status: "confirmed",
      notes: newForm.notes,
    }).select().single();

    if (nb) {
      setBookings(prev => [...prev, { ...nb, patient_name: newForm.patient_name }]);
    }
    setShowNewBooking(false);
    setNewForm({ patient_name: "", patient_email: "", patient_phone: "", service_name: "", clinician: "Mario Anthis", notes: "", price: "" });
    setSaving(false);
  }

  async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    setBookings(prev => prev.filter(b => b.id !== id));
    setSelectedBooking(null);
  }

  // â”€â”€ Calendar helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const days = weekDays(anchor);
  const HOUR_H = 56; // px per hour
  const CAL_TOP = 48; // header height

  function bookingsForDayAndClinician(day, clinician) {
    return bookings.filter(b => {
      if (!b.appointment_date) return false;
      const d = new Date(b.appointment_date);
      return isSameDay(d, day) && (b.clinician === clinician || (!b.clinician && clinician === "Mario Anthis"));
    });
  }

  function bookingTop(b) {
    const d = new Date(b.appointment_date);
    const h = d.getHours() + d.getMinutes() / 60;
    return (h - 7) * HOUR_H;
  }

  function bookingHeight(b) {
    return ((b.duration_minutes || 60) / 60) * HOUR_H;
  }

  function handleSlotClick(day, hour, clinician) {
    setNewSlot({ date: day, hour, clinician });
    setNewForm(f => ({ ...f, clinician }));
    setShowNewBooking(true);
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, fontFamily: fonts.sans }}>

      {/* â”€â”€ Top bar â”€â”€ */}
      <div style={{ height: 52, borderBottom: `1px solid ${T.border}`, background: T.card, display: "flex", alignItems: "center", padding: "0 24px", gap: 24, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: fonts.serif, fontSize: 18, color: T.text }}>meet mario</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.gold, letterSpacing: "0.14em", textTransform: "uppercase", background: T.goldPale, padding: "2px 8px", borderRadius: 2 }}>Clinic OS</span>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
          {[["calendar", "Schedule"], ["patients", "Patients"], ["analytics", "Analytics"]].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} style={{
              padding: "5px 14px", border: "none", borderRadius: 2, cursor: "pointer",
              fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              background: view === id ? T.gold : "none",
              color: view === id ? "#FFF" : T.muted,
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Pending badge */}
          {bookings.filter(b => b.status === "pending").length > 0 && (
            <div style={{ background: T.rgPale, border: `1px solid ${T.rg}`, borderRadius: 12, padding: "2px 10px", fontFamily: fonts.mono, fontSize: 10, color: T.rg }}>
              {bookings.filter(b => b.status === "pending").length} pending
            </div>
          )}
          <button onClick={() => { setSelectedBooking(null); setShowNewBooking(true); setNewSlot({ date: new Date(), hour: 9, clinician: "Mario Anthis" }); }}
            style={{ background: T.gold, color: "#FFF", border: "none", borderRadius: 2, padding: "6px 16px", cursor: "pointer", fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.1em" }}>
            + BOOKING
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, padding: "5px 12px", cursor: "pointer", fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em" }}>
            SIGN OUT
          </button>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CALENDAR VIEW
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {view === "calendar" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Week nav */}
            <div style={{ height: 44, borderBottom: `1px solid ${T.border}`, background: T.card, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
              <button onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); }} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, padding: "3px 10px", cursor: "pointer", fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>â†</button>
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.text, letterSpacing: "0.06em" }}>
                {days[0] && fmtDate(days[0])} â€“ {days[4] && fmtDate(days[4])} {anchor.getFullYear()}
              </span>
              <button onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); }} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, padding: "3px 10px", cursor: "pointer", fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>â†’</button>
              <button onClick={() => setAnchor(new Date())} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, padding: "3px 10px", cursor: "pointer", fontFamily: fonts.mono, fontSize: 10, color: T.gold, letterSpacing: "0.08em" }}>TODAY</button>
              <div style={{ marginLeft: "auto", fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>
                {bookings.filter(b => days.some(d => b.appointment_date && isSameDay(d, new Date(b.appointment_date)))).length} appts this week
              </div>
            </div>

            {/* Calendar grid */}
            <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
              {/* Time gutter */}
              <div style={{ width: 52, flexShrink: 0, borderRight: `1px solid ${T.border}`, paddingTop: CAL_TOP }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_H, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.faint }}>{String(h).padStart(2,"0")}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
                {days.map((day, di) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={di} style={{ flex: 1, borderRight: `1px solid ${T.border}`, minWidth: 0 }}>
                      {/* Day header */}
                      <div style={{ height: CAL_TOP, borderBottom: `1px solid ${T.border}`, background: isToday ? T.goldPale : T.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, position: "sticky", top: 0, zIndex: 2 }}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: isToday ? T.gold : T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {day.toLocaleDateString("sv-SE", { weekday: "short" })}
                        </div>
                        <div style={{ fontFamily: fonts.serif, fontSize: 20, color: isToday ? T.gold : T.text, lineHeight: 1 }}>{day.getDate()}</div>
                      </div>

                      {/* Clinician sub-columns */}
                      <div style={{ display: "flex", height: HOURS.length * HOUR_H }}>
                        {CLINICIANS.map((cl, ci) => {
                          const clBookings = bookingsForDayAndClinician(day, cl);
                          const clColor = CLINICIAN_COLORS[cl];
                          return (
                            <div key={ci} style={{ flex: 1, position: "relative", borderRight: ci === 0 ? `1px dashed ${T.border}` : "none" }}>
                              {/* Hour slots */}
                              {HOURS.map(h => (
                                <div key={h} onClick={() => handleSlotClick(day, h, cl)}
                                  style={{ height: HOUR_H, borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.1s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = T.bg2}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                />
                              ))}
                              {/* Bookings */}
                              {clBookings.map(b => (
                                <CalBooking key={b.id} booking={b}
                                  top={bookingTop(b)}
                                  height={bookingHeight(b)}
                                  onClick={bk => { setSelectedBooking(bk); setSelectedPatient(null); }}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinician legend */}
            <div style={{ height: 32, borderTop: `1px solid ${T.border}`, background: T.card, display: "flex", alignItems: "center", padding: "0 20px", gap: 20 }}>
              {CLINICIANS.map(cl => {
                const c = CLINICIAN_COLORS[cl];
                return (
                  <div key={cl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1px solid ${c.border}` }} />
                    <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.08em" }}>{cl}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            PATIENTS VIEW
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {view === "patients" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Patient list */}
            <div style={{ width: 320, borderRight: `1px solid ${T.border}`, overflow: "auto", background: T.card }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Registry</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: T.text }}>{patients.length} Patients</div>
              </div>
              {patients.map(p => {
                const pBookings = bookings.filter(b => b.patient_id === p.id);
                const last = pBookings[0];
                return (
                  <div key={p.id} onClick={() => { setSelectedPatient(p); loadPatientBookings(p.id); setSelectedBooking(null); }}
                    style={{
                      padding: "12px 20px", borderBottom: `1px solid ${T.border}`, cursor: "pointer",
                      background: selectedPatient?.id === p.id ? T.bg2 : "none",
                      borderLeft: selectedPatient?.id === p.id ? `2px solid ${T.gold}` : "2px solid transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.background = T.bg; }}
                    onMouseLeave={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.background = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>{p.full_name}</div>
                      <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted }}>{pBookings.length} appts</span>
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{p.email}</div>
                    {last && <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.faint, marginTop: 4 }}>Last: {fmtFull(last.appointment_date)}</div>}
                  </div>
                );
              })}
              {patients.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", fontFamily: fonts.mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em" }}>NO PATIENTS YET</div>
              )}
            </div>

            {/* Patient 360 */}
            {selectedPatient ? (
              <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
                <div style={{ maxWidth: 800 }}>
                  {/* Header */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Patient 360</div>
                    <div style={{ fontFamily: fonts.serif, fontSize: 32, color: T.text }}>{selectedPatient.full_name}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted, marginTop: 4 }}>{selectedPatient.email}</div>
                  </div>

                  {/* Info cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {[
                      { label: "Phone", value: selectedPatient.phone || "-" },
                      { label: "Registered", value: fmtFull(selectedPatient.created_at) },
                      { label: "Total bookings", value: patientBookings.length },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: "14px 16px" }}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                        <div style={{ fontFamily: fonts.serif, fontSize: 18, color: T.text }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Booking history */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Booking History
                    </div>
                    {patientBookings.map(b => {
                      const sm = STATUS_META[b.status] || STATUS_META.pending;
                      return (
                        <div key={b.id} onClick={() => setSelectedBooking(b)}
                          style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", gap: 16, alignItems: "center", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = T.bg}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.text }}>{b.service_name}</div>
                          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>{fmtFull(b.appointment_date)}</div>
                          <Chip label={sm.label} color={sm.color} bg={sm.bg} />
                          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold, textAlign: "right" }}>{b.total_price ? `${b.total_price.toLocaleString()} kr` : "-"}</div>
                        </div>
                      );
                    })}
                    {patientBookings.length === 0 && (
                      <div style={{ padding: 24, textAlign: "center", fontFamily: fonts.mono, fontSize: 10, color: T.muted }}>No bookings</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.faint, letterSpacing: "0.12em" }}>SELECT A PATIENT</div>
              </div>
            )}
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            ANALYTICS VIEW
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {view === "analytics" && (
          <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Overview</div>
              <div style={{ fontFamily: fonts.serif, fontSize: 32, color: T.text }}>Analytics</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Bookings",  value: bookings.length,                                               color: T.text  },
                { label: "Confirmed",       value: bookings.filter(b => b.status === "confirmed").length,         color: T.green },
                { label: "Pending",         value: bookings.filter(b => b.status === "pending").length,           color: T.rg    },
                { label: "Revenue (SEK)",   value: bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + (b.total_price || 0), 0).toLocaleString(), color: T.gold },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: "20px 20px" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: fonts.serif, fontSize: 36, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Service breakdown */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Service Breakdown</div>
              {SERVICES.map(svc => {
                const count = bookings.filter(b => b.service_name === svc.name).length;
                const revenue = bookings.filter(b => b.service_name === svc.name && b.status !== "cancelled").reduce((s, b) => s + (b.total_price || 0), 0);
                const maxCount = Math.max(...SERVICES.map(s => bookings.filter(b => b.service_name === s.name).length), 1);
                return (
                  <div key={svc.name} style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "180px 1fr 80px 100px", gap: 16, alignItems: "center" }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.text }}>{svc.name}</div>
                    <div style={{ height: 4, background: T.bg3, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: T.gold, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted, textAlign: "right" }}>{count} appts</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold, textAlign: "right" }}>{revenue.toLocaleString()} kr</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            BOOKING DETAIL PANEL
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {selectedBooking && (
          <div style={{ width: 340, borderLeft: `1px solid ${T.border}`, background: T.card, overflow: "auto", flexShrink: 0 }}>
            <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Booking</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: T.text }}>{selectedBooking.patient_name}</div>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted, padding: 4, lineHeight: 1 }}>x</button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* Service + time */}
              <div style={{ background: T.bg2, borderRadius: 4, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: fonts.serif, fontSize: 16, color: T.text, marginBottom: 4 }}>{selectedBooking.service_name}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>{fmtFull(selectedBooking.appointment_date)} {fmtTime(selectedBooking.appointment_date)}</div>
                {selectedBooking.clinician && <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold, marginTop: 4 }}>{selectedBooking.clinician}</div>}
              </div>

              {/* Details */}
              {[
                ["Email", selectedBooking.patient_email || "-"],
                ["Phone", selectedBooking.patient_phone || "-"],
                ["Duration", `${selectedBooking.duration_minutes || 60} min`],
                ["Price", selectedBooking.total_price ? `${selectedBooking.total_price.toLocaleString()} SEK` : "-"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em" }}>{label}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.text }}>{value}</span>
                </div>
              ))}

              {/* Status */}
              <div style={{ marginTop: 20, marginBottom: 10, fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Status</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
                {["confirmed", "completed", "pending", "cancelled"].map(s => {
                  const sm = STATUS_META[s];
                  const active = selectedBooking.status === s;
                  return (
                    <button key={s} onClick={() => updateBookingStatus(selectedBooking.id, s)} disabled={saving}
                      style={{
                        padding: "8px 0", border: `1px solid ${sm.color}`,
                        background: active ? sm.bg : "none",
                        borderRadius: 2, cursor: "pointer",
                        fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em",
                        color: sm.color, textTransform: "uppercase",
                        fontWeight: active ? 700 : 400,
                      }}>
                      {sm.label}
                    </button>
                  );
                })}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div style={{ background: T.bg2, borderRadius: 4, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.text, lineHeight: 1.5 }}>{selectedBooking.notes}</div>
                </div>
              )}

              {/* Delete */}
              <button onClick={() => deleteBooking(selectedBooking.id)}
                style={{ width: "100%", marginTop: 8, padding: "8px 0", border: `1px solid ${T.border}`, background: "none", borderRadius: 2, cursor: "pointer", fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Delete Booking
              </button>
            </div>
          </div>
        )}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NEW BOOKING MODAL
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showNewBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,44,44,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: T.card, borderRadius: 6, width: 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>New Booking</div>
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: T.text }}>
                  {newSlot ? `${fmtDate(newSlot.date)} at ${String(newSlot.hour).padStart(2,"0")}:00` : "Schedule"}
                </div>
              </div>
              <button onClick={() => setShowNewBooking(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.muted }}>x</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {/* Patient */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Patient Name *</label>
                <input value={newForm.patient_name} onChange={e => setNewForm(f => ({ ...f, patient_name: e.target.value }))}
                  placeholder="Full name"
                  style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 2, fontFamily: fonts.sans, fontSize: 13, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Email</label>
                  <input value={newForm.patient_email} onChange={e => setNewForm(f => ({ ...f, patient_email: e.target.value }))}
                    placeholder="patient@email.com"
                    style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 2, fontFamily: fonts.sans, fontSize: 13, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Phone</label>
                  <input value={newForm.patient_phone} onChange={e => setNewForm(f => ({ ...f, patient_phone: e.target.value }))}
                    placeholder="+46..."
                    style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 2, fontFamily: fonts.sans, fontSize: 13, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Service */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Service *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SERVICES.map(svc => (
                    <button key={svc.name} onClick={() => setNewForm(f => ({ ...f, service_name: svc.name, price: svc.price }))}
                      style={{
                        padding: "5px 12px", border: `1px solid ${newForm.service_name === svc.name ? T.gold : T.border}`,
                        background: newForm.service_name === svc.name ? T.goldPale : "none",
                        borderRadius: 2, cursor: "pointer", fontFamily: fonts.mono, fontSize: 9,
                        color: newForm.service_name === svc.name ? T.gold : T.muted, letterSpacing: "0.08em",
                      }}>
                      {svc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinician */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Clinician</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {CLINICIANS.map(cl => (
                    <button key={cl} onClick={() => setNewForm(f => ({ ...f, clinician: cl }))}
                      style={{
                        padding: "6px 14px", border: `1px solid ${newForm.clinician === cl ? T.gold : T.border}`,
                        background: newForm.clinician === cl ? T.goldPale : "none",
                        borderRadius: 2, cursor: "pointer", fontFamily: fonts.mono, fontSize: 10,
                        color: newForm.clinician === cl ? T.gold : T.muted,
                      }}>
                      {cl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + Notes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Price (SEK)</label>
                  <input value={newForm.price} onChange={e => setNewForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Auto from service"
                    style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 2, fontFamily: fonts.sans, fontSize: 13, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Notes</label>
                  <input value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Internal notes..."
                    style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 2, fontFamily: fonts.sans, fontSize: 13, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <button onClick={saveNewBooking} disabled={saving || !newForm.patient_name || !newForm.service_name}
                style={{
                  width: "100%", padding: "12px 0", background: (!newForm.patient_name || !newForm.service_name) ? T.bg3 : T.gold,
                  color: (!newForm.patient_name || !newForm.service_name) ? T.muted : "#FFF",
                  border: "none", borderRadius: 2, cursor: "pointer",
                  fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  transition: "background 0.15s",
                }}>
                {saving ? "Saving..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


