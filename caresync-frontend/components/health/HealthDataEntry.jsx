"use client";

import { useState, useEffect } from "react";
import PhotoCapture from "./PhotoCapture";

// ─── CareSync colour tokens (Teal Trust palette) ───────────────────────────
const T = {
  teal900: "#04342C", teal800: "#085041", teal600: "#0F6E56",
  teal400: "#1D9E75", teal200: "#5DCAA5", teal100: "#9FE1CB", teal50: "#E1F5EE",
  criticalBg: "#FCEBEB", criticalText: "#A32D2D",
  attentionBg: "#FAEEDA", attentionText: "#633806",
  stableBg: "#E1F5EE", stableText: "#085041",
  grayMid: "#888780", grayDark: "#2C2C2A", grayLight: "#F1EFE8",
};

// ─── Mock patients — replace with GET /patients when wiring up ─────────────
const MOCK_PATIENTS = [
  { id: "1", name: "Margaret Okonkwo", initials: "MO" },
  { id: "2", name: "James Kamau",       initials: "JK" },
  { id: "3", name: "Fatuma Abdi",       initials: "FA" },
  { id: "4", name: "Robert Ngugi",      initials: "RN" },
];

const OBSERVATIONS = [
  "Alert & oriented", "Confused", "Lethargic", "Agitated",
  "Good appetite", "Poor appetite", "Complained of pain", "Refused medication",
];

// ─── Inline styles (avoids needing a separate CSS file) ────────────────────
const s = {
  wrap:        { maxWidth: 620, margin: "0 auto", padding: "0 0 40px", fontFamily: "inherit" },
  topbar:      { background: T.teal400, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  logo:        { fontSize: 15, fontWeight: 500, color: "#fff" },
  logoSub:     { opacity: 0.7, fontWeight: 400 },
  weekBadge:   { background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  patientCard: { background: T.teal50, border: `1px solid ${T.teal100}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 },
  avatar:      { width: 40, height: 40, borderRadius: "50%", background: T.teal400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#fff", flexShrink: 0 },
  patLabel:    { fontSize: 11, color: T.teal600, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
  patSelect:   { width: "100%", border: "none", background: "transparent", fontSize: 15, fontWeight: 500, color: T.teal900, padding: "2px 0", cursor: "pointer", fontFamily: "inherit", outline: "none" },
  modeWrap:    { display: "flex", gap: 6, marginBottom: 16 },
  modeBtn:     (active) => ({ flex: 1, height: 36, border: `1px solid ${active ? T.teal400 : T.teal100}`, borderRadius: 8, background: active ? T.teal400 : "#fff", color: active ? "#fff" : T.grayMid, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }),
  sectionHead: { fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: T.teal600, borderBottom: `1px solid ${T.teal100}`, paddingBottom: 6, margin: "20px 0 12px", display: "flex", alignItems: "center", gap: 6 },
  grid2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  grid3:       { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 },
  field:       { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel:  { fontSize: 12, fontWeight: 500, color: T.grayMid },
  inputWrap:   { position: "relative" },
  input:       { width: "100%", height: 40, padding: "0 36px 0 12px", border: "1px solid #DDD", borderRadius: 8, fontSize: 14, color: T.grayDark, background: "#fff", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  unit:        { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.grayMid, pointerEvents: "none" },
  badge:       (type) => {
    const map = { stable: [T.stableBg, T.stableText], attention: [T.attentionBg, T.attentionText], critical: [T.criticalBg, T.criticalText] };
    const [bg, color] = map[type] || map.stable;
    return { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: bg, color, marginTop: 4 };
  },
  obsBtn:      (sel) => ({ height: 32, padding: "0 12px", border: `1px solid ${sel ? T.teal400 : "#DDD"}`, borderRadius: 20, background: sel ? T.teal50 : "#fff", fontSize: 12, color: sel ? T.teal800 : T.grayMid, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.12s" }),
  textarea:    { width: "100%", height: 76, padding: "10px 12px", border: "1px solid #DDD", borderRadius: 8, fontSize: 14, color: T.grayDark, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" },
  photoBox:    { border: `1.5px dashed ${T.teal100}`, borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: "#fff" },
  btnGhost:    { height: 42, padding: "0 20px", border: "1px solid #DDD", borderRadius: 8, background: "#fff", fontSize: 14, color: T.grayMid, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary:  { flex: 1, height: 42, border: "none", borderRadius: 8, background: T.teal400, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" },
  toast:       (show) => ({ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: T.teal800, color: "#fff", fontSize: 13, padding: "10px 20px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 99, opacity: show ? 1 : 0, pointerEvents: "none", transition: "opacity 0.3s" }),
  timestamp:   { fontSize: 12, color: T.grayMid, textAlign: "right", marginBottom: 8 },
};

// ─── BP / Glucose status helpers ───────────────────────────────────────────
function bpStatus(sys, dia) {
  if (!sys || !dia) return null;
  if (sys >= 180 || dia >= 120) return { type: "critical", label: "Critical — notify doctor" };
  if (sys >= 140 || dia >= 90)  return { type: "attention", label: "Elevated — monitor" };
  if (sys < 90  || dia < 60)   return { type: "attention", label: "Low BP — check patient" };
  return { type: "stable", label: "Normal range" };
}
function glucoseStatus(g) {
  if (!g) return null;
  if (g < 3.9)  return { type: "critical",  label: "Hypoglycaemia — act now" };
  if (g > 10)   return { type: "attention", label: "High — log and monitor" };
  return { type: "stable", label: "Normal range" };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function HealthDataEntry({ patientId: initialPatientId }) {
  const [mode, setMode]           = useState("quick");     // "quick" | "detailed"
  const [patientId, setPatientId] = useState(initialPatientId || "1");
  const [toast, setToast]         = useState(false);
  const [toastMsg, setToastMsg]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [nowStr, setNowStr]       = useState("");
  const [selectedObs, setSelectedObs] = useState([]);
  const [photoName, setPhotoName] = useState("");

  // Vitals state
  const [bpSys, setBpSys]         = useState("");
  const [bpDia, setBpDia]         = useState("");
  const [glucose, setGlucose]     = useState("");
  const [glucosePm, setGlucosePm] = useState("");
  const [hr, setHr]               = useState("");
  const [spo2, setSpo2]           = useState("");
  const [temp, setTemp]           = useState("");
  const [weight, setWeight]       = useState("");

  // Detailed mode extras
  const [steps, setSteps]   = useState("");
  const [sleep, setSleep]   = useState("");
  const [water, setWater]   = useState("");
  const [notes, setNotes]   = useState("");

  useEffect(() => {
    if (initialPatientId) {
      setPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  useEffect(() => {
    const n = new Date();
    setNowStr(
      n.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) +
      " · " + n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  }, []);

  const patient = MOCK_PATIENTS.find((p) => p.id === patientId) || MOCK_PATIENTS[0];

  function toggleObs(obs) {
    setSelectedObs((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]
    );
  }

  function clearForm() {
    setBpSys(""); setBpDia(""); setGlucose(""); setGlucosePm("");
    setHr(""); setSpo2(""); setTemp(""); setWeight("");
    setSteps(""); setSleep(""); setWater(""); setNotes("");
    setSelectedObs([]); setPhotoName("");
  }

  async function saveEntry() {
    setLoading(true);

    // ── Payload shape matches Ramsey's health readings model ──────────────
    // POST /health-readings  (adjust base URL / endpoint to match your API)
    const payload = {
      patient_id:       patientId,
      // logged_by_user_id is set server-side from the JWT — no need to send it
      bp_systolic:      bpSys      ? Number(bpSys)      : null,
      bp_diastolic:     bpDia      ? Number(bpDia)      : null,
      glucose_fasting:  glucose    ? Number(glucose)    : null,
      glucose_post_meal:glucosePm  ? Number(glucosePm)  : null,
      heart_rate:       hr         ? Number(hr)         : null,
      spo2:             spo2       ? Number(spo2)       : null,
      temperature:      temp       ? Number(temp)       : null,
      weight:           weight     ? Number(weight)     : null,
      steps:            steps      ? Number(steps)      : null,
      sleep_hours:      sleep      ? Number(sleep)      : null,
      water_litres:     water      ? Number(water)      : null,
      caregiver_observations: selectedObs,
      notes,
      recorded_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/health-readings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // JWT is stored in httpOnly cookie by your auth setup —
            // if you're using Authorization header instead, add:
            // "Authorization": `Bearer ${token}`
          },
          credentials: "include",  // sends the httpOnly cookie
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      setToastMsg(`✓ Reading saved for ${patient.name.split(" ")[0]}`);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
      clearForm();
    } catch (err) {
      setToastMsg(`⚠ ${err.message}`);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  const bpSt  = bpStatus(Number(bpSys), Number(bpDia));
  const glySt = glucoseStatus(Number(glucose));

  return (
    <div style={s.wrap}>
      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, color: "#fff" }}>♥</span>
          <span style={s.logo}>CareSync <span style={s.logoSub}>/ Log readings</span></span>
        </div>
        <span style={s.weekBadge}>Week 3</span>
      </div>

      {/* ── Patient selector ── */}
      <div style={s.patientCard}>
        <div style={s.avatar}>{patient.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={s.patLabel}>Logging for</div>
          <select
            style={s.patSelect}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            {MOCK_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <span style={{ color: T.teal400, fontSize: 18 }}>⌄</span>
      </div>

      <p style={s.timestamp}>{nowStr}</p>

      {/* ── Mode toggle ── */}
      <div style={s.modeWrap}>
        <button style={s.modeBtn(mode === "quick")}    onClick={() => setMode("quick")}>⚡ Quick</button>
        <button style={s.modeBtn(mode === "detailed")} onClick={() => setMode("detailed")}>☰ Detailed</button>
      </div>

      {/* ── Vitals ── */}
      <div style={s.sectionHead}>♡ Vitals</div>

      <div style={s.grid2}>
        {/* BP */}
        <div style={s.field}>
          <label style={s.fieldLabel}>BP systolic / diastolic</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={s.inputWrap}>
              <input style={{ ...s.input, paddingRight: 12 }} type="number" placeholder="120" value={bpSys} onChange={(e) => setBpSys(e.target.value)} min={60} max={220} />
            </div>
            <span style={{ fontSize: 18, color: "#CCC" }}>/</span>
            <div style={s.inputWrap}>
              <input style={{ ...s.input, paddingRight: 12 }} type="number" placeholder="80"  value={bpDia} onChange={(e) => setBpDia(e.target.value)} min={40} max={140} />
            </div>
            <span style={{ fontSize: 11, color: T.grayMid, whiteSpace: "nowrap" }}>mmHg</span>
          </div>
          {bpSt && <span style={s.badge(bpSt.type)}>{bpSt.label}</span>}
        </div>

        {/* Glucose fasting */}
        <div style={s.field}>
          <label style={s.fieldLabel}>Glucose (fasting)</label>
          <div style={s.inputWrap}>
            <input style={s.input} type="number" placeholder="5.5" value={glucose} onChange={(e) => setGlucose(e.target.value)} min={1} max={30} step={0.1} />
            <span style={s.unit}>mmol/L</span>
          </div>
          {glySt && <span style={s.badge(glySt.type)}>{glySt.label}</span>}
        </div>
      </div>

      <div style={s.grid3}>
        <div style={s.field}>
          <label style={s.fieldLabel}>Heart rate</label>
          <div style={s.inputWrap}><input style={s.input} type="number" placeholder="72" value={hr} onChange={(e) => setHr(e.target.value)} /><span style={s.unit}>bpm</span></div>
        </div>
        <div style={s.field}>
          <label style={s.fieldLabel}>O₂ saturation</label>
          <div style={s.inputWrap}><input style={s.input} type="number" placeholder="98" value={spo2} onChange={(e) => setSpo2(e.target.value)} /><span style={s.unit}>%</span></div>
        </div>
        <div style={s.field}>
          <label style={s.fieldLabel}>Temperature</label>
          <div style={s.inputWrap}><input style={s.input} type="number" placeholder="36.6" value={temp} onChange={(e) => setTemp(e.target.value)} step={0.1} /><span style={s.unit}>°C</span></div>
        </div>
      </div>

      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.fieldLabel}>Weight</label>
          <div style={s.inputWrap}><input style={s.input} type="number" placeholder="68.0" value={weight} onChange={(e) => setWeight(e.target.value)} step={0.1} /><span style={s.unit}>kg</span></div>
        </div>
        <div style={s.field}>
          <label style={s.fieldLabel}>Glucose (post-meal)</label>
          <div style={s.inputWrap}><input style={s.input} type="number" placeholder="7.8" value={glucosePm} onChange={(e) => setGlucosePm(e.target.value)} step={0.1} /><span style={s.unit}>mmol/L</span></div>
        </div>
      </div>

      {/* ── Detailed extras ── */}
      {mode === "detailed" && (
        <>
          <div style={s.sectionHead}>↻ Activity & sleep</div>
          <div style={s.grid3}>
            <div style={s.field}>
              <label style={s.fieldLabel}>Steps</label>
              <div style={s.inputWrap}><input style={s.input} type="number" placeholder="4000" value={steps} onChange={(e) => setSteps(e.target.value)} /></div>
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Sleep</label>
              <div style={s.inputWrap}><input style={s.input} type="number" placeholder="7.5" value={sleep} onChange={(e) => setSleep(e.target.value)} step={0.5} /><span style={s.unit}>hrs</span></div>
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Water intake</label>
              <div style={s.inputWrap}><input style={s.input} type="number" placeholder="1.8" value={water} onChange={(e) => setWater(e.target.value)} step={0.1} /><span style={s.unit}>L</span></div>
            </div>
          </div>

          <div style={s.sectionHead}>
  📷 Photo Capture
</div>

<PhotoCapture />
          {photoName && <p style={{ fontSize: 12, color: T.teal600, marginTop: 6 }}>📎 {photoName}</p>}
        </>
      )}

      {/* ── Observations ── */}
      <div style={s.sectionHead}>👁 Caregiver observations</div>
      <div style={s.field}>
        <label style={s.fieldLabel}>Observed mood / behaviour</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {OBSERVATIONS.map((obs) => (
            <button key={obs} style={s.obsBtn(selectedObs.includes(obs))} onClick={() => toggleObs(obs)}>
              {obs}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes ── */}
      <div style={{ ...s.field, marginTop: 12 }}>
        <label style={s.fieldLabel}>Notes</label>
        <textarea
          style={s.textarea}
          placeholder="Anything else to flag — symptoms, medication changes, patient concerns…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <button style={s.btnGhost} onClick={clearForm}>Clear</button>
        <button style={s.btnPrimary} onClick={saveEntry} disabled={loading}>
          {loading ? "Saving…" : "✓ Save reading"}
        </button>
      </div>

      {/* ── Toast ── */}
      <div style={s.toast(toast)}>{toastMsg}</div>
    </div>
  );
}
