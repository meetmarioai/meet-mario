// ─────────────────────────────────────────────────────────────────────────────
// saveBooking.js
// app/dashboard/saveBooking.js
//
// Called once when patient clicks "Bekräfta bokning ✓" in BookingDrawer.
// Upserts patient → inserts booking → inserts anamnesis.
// Uses the Supabase browser client (anon key, RLS enforced).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * saveBooking
 *
 * @param {object} svc       - selected service object from BOKA_SERVICES
 * @param {string} date      - "YYYY-MM-DD"
 * @param {string} time      - "HH:MM"
 * @param {object} details   - { name, email, phone, personnummer, consent }
 * @param {object} anamnesis - { complaint, duration, severity, meds, supps,
 *                               allergies, diagnoses, family, labs,
 *                               sleep, stress, exercise, symptoms[] }
 * @returns {{ bookingId: string } | { error: string }}
 */
export async function saveBooking({ svc, date, time, details, anamnesis }) {
  // ── 1. Upsert patient (email is the natural key) ──────────────────────────
  const { data: patient, error: patientErr } = await supabase
    .from("patients")
    .upsert(
      {
        full_name:    details.name,
        email:        details.email.toLowerCase().trim(),
        phone:        details.phone        || null,
        personnummer: details.personnummer || null,
        gdpr_consent: details.consent,
        consent_at:   details.consent ? new Date().toISOString() : null,
      },
      { onConflict: "email", returning: "representation" }
    )
    .select("id")
    .single();

  if (patientErr) {
    console.error("[saveBooking] patient upsert failed:", patientErr);
    return { error: patientErr.message };
  }

  // ── 2. Insert booking ─────────────────────────────────────────────────────
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      patient_id:   patient.id,
      service_id:   svc.id,
      service_name: svc.name,
      service_cat:  svc.cat  || "",
      duration_min: svc.dur,
      price_sek:    svc.price || null,
      appt_date:    date,
      appt_time:    time,
      status:       "pending",
    })
    .select("id")
    .single();

  if (bookingErr) {
    console.error("[saveBooking] booking insert failed:", bookingErr);
    return { error: bookingErr.message };
  }

  // ── 3. Insert anamnesis ───────────────────────────────────────────────────
  const { error: anamErr } = await supabase
    .from("anamnesis")
    .insert({
      booking_id: booking.id,
      patient_id: patient.id,

      chief_complaint: {
        complaint: anamnesis.complaint || null,
        duration:  anamnesis.duration  || null,
        severity:  anamnesis.severity  || null,
      },

      medications: {
        meds:      anamnesis.meds      || null,
        supps:     anamnesis.supps     || null,
        allergies: anamnesis.allergies || null,
      },

      health_history: {
        diagnoses: anamnesis.diagnoses || null,
        family:    anamnesis.family    || null,
        labs:      anamnesis.labs      || null,
      },

      lifestyle: {
        sleep:    anamnesis.sleep    || null,
        stress:   anamnesis.stress   || null,
        exercise: anamnesis.exercise || null,
        symptoms: anamnesis.symptoms || [],
      },
    });

  if (anamErr) {
    // Non-fatal — booking exists, anamnesis can be re-submitted
    console.warn("[saveBooking] anamnesis insert failed:", anamErr);
  }

  return { bookingId: booking.id };
}
