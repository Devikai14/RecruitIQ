import { useState, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#05050d;--card:#0c0c1a;--card2:#0f0f1e;--border:#181830;--b2:#22224a;
  --accent:#00e5ff;--adim:#00e5ff13;--text:#eeeaf8;--muted:#3d3d60;--t2:#8080bb;
  --green:#00ff88;--gdim:#00ff8811;--amber:#ffb800;--amdim:#ffb80013;
  --red:#ff4466;--rdim:#ff446611;--purple:#b388ff;--pdim:#b388ff13;
}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

/* ── Header ── */
.hdr{padding:13px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;
  justify-content:space-between;background:#070712;position:sticky;top:0;z-index:99}
.brand{font-size:21px;font-weight:800;letter-spacing:-1px}
.brand em{color:var(--accent);font-style:normal}
.brand-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);
  border:1px solid var(--border);border-radius:20px;padding:2px 9px;margin-left:10px}
.nav{display:flex;gap:2px;background:#0a0a1a;padding:3px;border-radius:10px;border:1px solid var(--border)}
.tab{padding:8px 16px;border:none;background:transparent;color:var(--muted);
  font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.8px;
  cursor:pointer;border-radius:7px;transition:all .2s;text-transform:uppercase;position:relative}
.tab.on{background:var(--accent);color:#05050d}
.tab .bdg{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;
  background:var(--green);color:#05050d;display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:700}
.hdr-r{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);text-align:right;line-height:1.9}

/* ── Page ── */
.pg{padding:28px 32px;max-width:1200px;margin:0 auto;width:100%}
.pg-h{font-family:'Instrument Serif',serif;font-size:34px;margin-bottom:4px}
.pg-s{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:22px}

/* ── Pipeline ── */
.pipe{display:flex;align-items:center;background:var(--card);border:1px solid var(--border);
  border-radius:12px;padding:14px 18px;margin-bottom:22px;gap:0;overflow-x:auto}
.ps{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:68px}
.pi{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;
  font-size:15px;border:1px solid var(--border);background:var(--card2);transition:all .4s;flex-shrink:0}
.pi.done{background:var(--gdim);border-color:var(--green)}
.pi.active{background:var(--adim);border-color:var(--accent);animation:glow 1.6s infinite}
.pi.idle{opacity:.3}
@keyframes glow{0%,100%{box-shadow:0 0 8px #00e5ff33}50%{box-shadow:0 0 18px #00e5ff88}}
.pl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);text-align:center;letter-spacing:.4px}
.pl.done{color:var(--green)}.pl.active{color:var(--accent)}
.pa{color:var(--border);font-size:13px;margin:0 3px;padding-bottom:18px;flex-shrink:0}

/* ── Cards / Inputs ── */
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:0}
.ct{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.lbl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;
  text-transform:uppercase;color:var(--muted);margin-bottom:5px;display:block}
.inp,.ta{width:100%;background:#07071c;border:1px solid var(--border);border-radius:8px;
  padding:9px 13px;color:var(--text);font-family:'Syne',sans-serif;font-size:13px;
  margin-bottom:10px;outline:none;transition:border-color .2s}
.inp:focus,.ta:focus{border-color:var(--accent)}
.ta{resize:vertical;min-height:80px;font-size:12px;line-height:1.6}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}

/* ── Buttons ── */
.btn{padding:9px 18px;border-radius:8px;border:none;font-family:'Syne',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.8px;cursor:pointer;transition:all .2s;
  text-transform:uppercase;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-a{background:var(--accent);color:#05050d}.btn-a:hover{background:#22eeff;transform:translateY(-1px)}
.btn-g{background:transparent;color:var(--muted);border:1px solid var(--border)}.btn-g:hover{border-color:var(--accent);color:var(--accent)}
.btn-gr{background:var(--green);color:#05050d}.btn-gr:hover{background:#33ffaa}
.btn-p{background:var(--purple);color:#05050d}.btn-p:hover{background:#c8a8ff}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important}
.btn-w{width:100%;padding:12px}

/* ── Skills ── */
.sk-wrap{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
.sk{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;
  font-family:'JetBrains Mono',monospace;font-size:10px;background:var(--border);color:var(--muted);border:1px solid var(--b2)}
.sk.hit{background:var(--adim);color:var(--accent);border-color:var(--accent)}
.sk.miss{background:var(--rdim);color:var(--red);border-color:var(--red)}
.sk.pass{background:var(--gdim);color:var(--green);border-color:var(--green)}

/* ── File Upload ── */
.dz{border:2px dashed var(--border);border-radius:12px;padding:28px 20px;text-align:center;
  cursor:pointer;transition:all .2s;background:#07071c}
.dz:hover,.dz.drag{border-color:var(--accent);background:var(--adim)}
.fc{display:flex;align-items:center;gap:10px;padding:10px 13px;background:#07071c;
  border:1px solid var(--border);border-radius:10px;margin-top:7px}
.fc.ready{border-color:#00ff8822}
.fc-name{flex:1;font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fc-sub{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-top:2px}

/* ── Rings ── */
.ring{position:relative;width:64px;height:64px;flex-shrink:0}
.ring svg{transform:rotate(-90deg)}
.ring-n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700}
.ring-sm{position:relative;width:46px;height:46px;flex-shrink:0}
.ring-sm svg{transform:rotate(-90deg)}
.ring-sm-n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700}

/* ── Candidate rows ── */
.crow{background:var(--card);border:1px solid var(--border);border-radius:13px;
  padding:15px 20px;display:flex;align-items:flex-start;gap:13px;cursor:pointer;
  position:relative;overflow:hidden;transition:border-color .2s;margin-bottom:8px}
.crow:hover{border-color:var(--b2)}
.crow-bar{position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px}
.crk{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px}
.cn{font-family:'Instrument Serif',serif;font-size:18px;margin-bottom:2px}
.cs{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted)}
.bdge{padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace;
  font-size:10px;font-weight:700;flex-shrink:0;white-space:nowrap}

/* ── Score breakdown bars ── */
.bkd{background:#07071c;border:1px solid var(--border);border-radius:9px;padding:13px;margin-top:10px}
.br{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.bl{width:160px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted)}
.bb{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.bf{height:100%;border-radius:2px;transition:width 1s cubic-bezier(.23,1,.32,1)}
.bv{width:36px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:10px}

/* ── Quality score specific ── */
.q-panel{background:#07071c;border:1px solid var(--b2);border-radius:10px;padding:14px;margin-top:12px}
.q-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.q-grade{padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700}
.q-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.q-item{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:10px;padding:4px 0}
.q-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.q-tips{background:#ffb80009;border:1px solid #ffb80022;border-radius:8px;padding:10px 13px;margin-top:8px}
.q-tip{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--amber);line-height:1.9;display:flex;gap:8px}

/* ── Stats bar ── */
.stats{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.sb{flex:1;min-width:100px;background:var(--card);border:1px solid var(--border);border-radius:11px;padding:14px;text-align:center}
.sn{font-family:'Instrument Serif',serif;font-size:32px;line-height:1;margin-bottom:3px}
.sl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1.5px}

/* ── Tags ── */
.slot-tag{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--accent);
  font-weight:700;background:var(--adim);border:1px solid #00e5ff22;
  border-radius:6px;padding:3px 9px;margin-top:5px;display:inline-block}
.q-tag{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
  border-radius:6px;padding:2px 8px;display:inline-block;margin-left:6px}

/* ── Weight bar ── */
.wt-bar{display:flex;gap:8px;margin-bottom:14px;padding:10px 14px;background:#07071c;
  border:1px solid var(--border);border-radius:9px;align-items:center;flex-wrap:wrap}
.wt-pill{padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700}

/* ── Email card ── */
.ec{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:9px}
.ec-h{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;transition:background .2s}
.ec-h:hover{background:#0f0f1e}
.ec-b{padding:0 16px 16px}
.ep{background:#07071c;border:1px solid var(--border);border-radius:9px;padding:13px;
  font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--t2);line-height:1.9;
  white-space:pre-wrap;max-height:240px;overflow-y:auto;margin-bottom:11px}

/* ── Summary box ── */
.sum-box{background:#07071c;border:1px solid var(--b2);border-radius:8px;padding:10px 13px;
  font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--t2);line-height:1.8;
  margin-top:8px;font-style:italic}

/* ── Misc ── */
.prog-wrap{background:var(--border);border-radius:4px;height:5px;overflow:hidden;margin:6px 0 12px}
.prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--accent),#0099cc);transition:width .5s ease}
@keyframes spin{to{transform:rotate(360deg)}}
.sp{width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);
  border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.fi{animation:fi .35s ease}
hr.dv{border:none;border-top:1px solid var(--border);margin:14px 0}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
  margin-bottom:12px;display:flex;align-items:center;gap:10px}
.sec-hdr::after{content:'';flex:1;height:1px;background:var(--border)}
.err-box{background:var(--rdim);border:1px solid var(--red);border-radius:9px;padding:12px 14px;
  font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--red);margin-bottom:14px}

/* ── Modal ── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:200;display:flex;
  align-items:center;justify-content:center;backdrop-filter:blur(8px)}
.mo{background:var(--card);border:1px solid #00e5ff33;border-radius:16px;padding:34px;
  max-width:480px;width:92%;text-align:center;animation:fi .3s ease}
.mi{width:62px;height:62px;border-radius:50%;background:var(--adim);border:2px solid var(--accent);
  display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 14px}
.mt{font-family:'Instrument Serif',serif;font-size:26px;margin-bottom:8px}
.md{background:#07071c;border:1px solid var(--border);border-radius:9px;padding:13px;
  text-align:left;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--t2);
  line-height:2.2;margin-bottom:18px}
`;

/* ─── Quality grade helpers ──────────────────────────────────────────────── */
function gradeColor(grade) {
  return { Excellent: "var(--green)", Good: "var(--amber)", Fair: "#ff8800", Poor: "var(--red)" }[grade] || "var(--muted)";
}
function gradeBg(grade) {
  return { Excellent: "var(--gdim)", Good: "var(--amdim)", Fair: "#ff880013", Poor: "var(--rdim)" }[grade] || "var(--border)";
}
function gradeEmoji(grade) {
  return { Excellent: "🟢", Good: "🟡", Fair: "🟠", Poor: "🔴" }[grade] || "⚪";
}

/* ─── Ring component ─────────────────────────────────────────────────────── */
function Ring({ score, color, small = false }) {
  const r = small ? 18 : 27;
  const c = 2 * Math.PI * r;
  const p = Math.min(Math.max(score, 0), 100);
  const size = small ? 46 : 64;
  return (
    <div className={small ? "ring-sm" : "ring"}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle fill="none" stroke="var(--border)" strokeWidth={small ? 4 : 5}
          cx={size / 2} cy={size / 2} r={r} />
        <circle fill="none" stroke={color} strokeWidth={small ? 4 : 5} strokeLinecap="round"
          cx={size / 2} cy={size / 2} r={r} strokeDasharray={c}
          strokeDashoffset={c - (p / 100) * c}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.23,1,.32,1)" }} />
      </svg>
      <div className={small ? "ring-sm-n" : "ring-n"} style={{ color, fontSize: small ? 10 : 13 }}>
        {Math.round(p)}
      </div>
    </div>
  );
}

/* ─── Quality Score Panel ────────────────────────────────────────────────── */
function QualityPanel({ candidate }) {
  const qs   = candidate.quality_score;
  const qg   = candidate.quality_grade;
  const bd   = candidate.quality_breakdown || {};
  const tips = candidate.quality_tips || [];
  const passed = candidate.quality_passed || [];
  const failed = candidate.quality_failed || [];

  if (qs == null) return null;

  const maxBd = {
    "Email Address": 10, "Phone Number": 5, "LinkedIn / GitHub": 5,
    "Projects Section": 15, "Education Section": 10, "Summary / Objective": 5,
    "Quantified Achievements": 20, "Action Verbs": 5, "Resume Length": 10,
    "Certifications": 5, "Awards / Publications": 5,
  };

  const col = gradeColor(qg);
  const bg  = gradeBg(qg);

  return (
    <div className="q-panel">
      <div className="q-header">
        <Ring score={qs} color={col} small={true} />
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
            RESUME QUALITY SCORE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: col }}>{qs}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)" }}>/100</span>
            <span className="q-grade" style={{ background: bg, color: col, border: `1px solid ${col}33` }}>
              {gradeEmoji(qg)} {qg}
            </span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--muted)", marginTop: 3 }}>
            Independent of job requirements · rates document structure
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ marginBottom: 10 }}>
        {Object.entries(bd).map(([label, val]) => {
          const max = maxBd[label] || 10;
          const pct = Math.round((val / max) * 100);
          const barCol = val > 0 ? (pct === 100 ? "var(--green)" : "var(--amber)") : "var(--red)";
          return (
            <div className="br" key={label}>
              <div className="bl" style={{ color: val > 0 ? "var(--t2)" : "var(--muted)", width: 180 }}>{label}</div>
              <div className="bb"><div className="bf" style={{ width: `${pct}%`, background: barCol }} /></div>
              <div className="bv" style={{ color: barCol }}>{val}/{max}</div>
            </div>
          );
        })}
      </div>

      {/* Passed / Failed chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: tips.length ? 8 : 0 }}>
        {passed.map(p => <span key={p} className="sk pass">✓ {p}</span>)}
        {failed.map(f => <span key={f} className="sk miss">✗ {f}</span>)}
      </div>

      {/* Improvement tips */}
      {tips.length > 0 && (
        <div className="q-tips">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--amber)", fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>
            IMPROVEMENT TIPS
          </div>
          {tips.map((tip, i) => (
            <div key={i} className="q-tip">
              <span>→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Email Card ─────────────────────────────────────────────────────────── */
function EC({ icon, name, subject, body, to, color, label }) {
  const [open, setOpen] = useState(false);
  const mailto = `mailto:${to || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return (
    <div className="ec">
      <div className="ec-h" onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            To: {to || "⚠ No email found in resume"}
          </div>
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, background: `${color}14`, color, border: `1px solid ${color}30` }}>{label}</span>
        <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 6 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="ec-b fi">
          <div className="ep">
            <span style={{ color: "var(--amber)" }}>To: {to || "—"}{"\n"}</span>
            <span style={{ color: "var(--accent)" }}>Subject: {subject}{"\n\n"}</span>
            {body}
          </div>
          {to
            ? <a href={mailto} target="_blank" rel="noreferrer"><button className="btn btn-a" style={{ fontSize: 11 }}>📧 Open in Email Client</button></a>
            : <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--red)" }}>⚠ No email found — contact manually</div>
          }
        </div>
      )}
    </div>
  );
}

/* ─── Pipeline steps ─────────────────────────────────────────────────────── */
const PIPE = [
  { icon: "📤", lbl: "UPLOAD" },
  { icon: "📝", lbl: "PARSE" },
  { icon: "🔍", lbl: "SKILLS" },
  { icon: "📅", lbl: "EXPERIENCE" },
  { icon: "🧠", lbl: "SEMANTIC" },
  { icon: "📊", lbl: "SCORE" },
  { icon: "📋", lbl: "QUALITY" },
  { icon: "🗓", lbl: "SLOTS" },
  { icon: "📧", lbl: "EMAIL" },
];

const STEP_LABELS = [
  "Uploading resumes...",
  "Parsing resume content...",
  "Extracting matched skills...",
  "Estimating experience...",
  "Computing semantic similarity...",
  "Calculating match scores...",
  "Scoring resume quality...",
  "Allocating interview slots...",
  "Sending emails & calendar...",
];

/* ════════════════════════════ MAIN APP ════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("setup");
  const fileRef = useRef();

  const [requiredSkills, setRequiredSkills]   = useState("");
  const [jobDescription, setJobDescription]   = useState("");
  const [minExperience,  setMinExperience]    = useState(2);
  const [interviewDate,  setInterviewDate]    = useState("");
  const [startTime,      setStartTime]        = useState("09:00");
  const [totalDuration,  setTotalDuration]    = useState(150);
  const [senderName,     setSenderName]       = useState("RecruitIQ System");
  const [senderEmail,    setSenderEmail]      = useState("asn87884@gmail.com");
  const [hrName,         setHrName]           = useState("HR Manager");
  const [hrEmailAddr,    setHrEmailAddr]      = useState("devikaindu04@gmail.com");

  const [files,      setFiles]      = useState([]);
  const [drag,       setDrag]       = useState(false);
  const [results,    setResults]    = useState(null);
  const [processing, setProcessing] = useState(false);
  const [pStep,      setPStep]      = useState(0);
  const [expanded,   setExpanded]   = useState(null);
  const [modal,      setModal]      = useState(null);
  const [apiError,   setApiError]   = useState("");

  const skillList = requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
  const top      = results?.top_candidates      || [];
  const rejected = results?.rejected_candidates || [];
  const weights  = results?.weights;

  function handleFiles(incoming) {
    const valid = Array.from(incoming).filter(f => /\.(pdf|docx)$/i.test(f.name));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  }

  function fmtDate(d) {
    if (!d) return "";
    return new Date(d + "T00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
  }

  async function processCandidates() {
    if (!requiredSkills.trim()) { setModal({ type: "err", msg: "Enter required skills." }); return; }
    if (!interviewDate)         { setModal({ type: "err", msg: "Select an interview date." }); return; }
    if (!files.length)          { setModal({ type: "err", msg: "Upload at least one resume." }); return; }

    setApiError("");
    setProcessing(true);
    setPStep(0);

    const interval = setInterval(() => {
      setPStep(p => (p < PIPE.length - 1 ? p + 1 : p));
    }, 600);

    try {
      const form = new FormData();
      form.append("required_skills", requiredSkills);
      form.append("min_experience",  minExperience);
      form.append("interview_date",  interviewDate);
      form.append("start_time",      startTime);
      form.append("total_duration",  totalDuration);
      form.append("job_description", jobDescription);
      form.append("sender_name",     senderName);
      form.append("sender_email",    senderEmail);
      form.append("hr_name",         hrName);
      form.append("hr_email",        hrEmailAddr);
      files.forEach(f => form.append("files", f));

      const res = await fetch("http://localhost:8000/process", { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error ${res.status}: ${txt}`);
      }
      const data = await res.json();

      clearInterval(interval);
      setPStep(PIPE.length - 1);
      setResults(data);
      setModal({ type: "done", top: data.top_candidates.length, rej: data.rejected_candidates.length, weights: data.weights });
      setTab("results");
    } catch (e) {
      clearInterval(interval);
      setApiError(e.message);
      setModal({ type: "err", msg: e.message });
    } finally {
      setProcessing(false);
    }
  }

  /* ── Email body builders ── */
  function makeSelectedEmail(c) {
    const rolePart = jobDescription ? ` for the role of ${jobDescription.slice(0, 80)}` : "";
    return {
      sub: `Interview Invitation — ${c.name} | RecruitIQ`,
      body: `Dear ${c.name},\n\nWe are pleased to inform you that you have been shortlisted${rolePart}.\nCongratulations!\n\nInterview Details:\n\n  Date  :  ${fmtDate(interviewDate)}\n  Time  :  ${c.slot}\n  Mode  :  To be confirmed by the HR team\n\nPlease reply to confirm your availability.\n\nWarm regards,\n${senderName}\nRecruitIQ Hiring Team\n${senderEmail}`
    };
  }

  function makeRejectedEmail(c) {
    const tips = c.quality_tips?.length
      ? `\nResume Structure Feedback (${c.quality_grade} — ${c.quality_score}/100):\n` +
        c.quality_tips.slice(0, 4).map(t => `  • ${t}`).join("\n")
      : "";
    return {
      sub: `Application Update — ${c.name} | RecruitIQ`,
      body: `Dear ${c.name},\n\nThank you for your application. After careful review, we will not be moving forward at this time.\n${tips}\n\nWe encourage you to keep developing your profile and apply again in the future.\n\nBest regards,\n${senderName}`
    };
  }

  function makeHrEmail() {
    const dateStr = fmtDate(interviewDate);
    const lines = top.map((c, i) =>
      `${i + 1}. ${c.name} — Match: ${c.score} | Quality: ${c.quality_score ?? "—"}/100 (${c.quality_grade ?? "—"}) | Skills: ${c.matched_skills?.length}/${c.total_skills} | Slot: ${c.slot}`
    ).join("\n");
    return {
      sub: `Interview Schedule for ${dateStr} – RecruitIQ`,
      body: `Hi ${hrName},\n\nScreening complete. ${top.length} candidate(s) scheduled for ${dateStr}:\n\n${lines}\n\nNote: Quality Score rates resume structure (independent of job fit). Low quality score = candidate may need resume coaching.\n\nProfiles DOCX + .ics calendar attached.\n\nThanks,\n${senderName}`
    };
  }

  const hrEmail = results ? makeHrEmail() : null;

  /* ── Average quality score across all candidates ── */
  const allCandidates = [...top, ...rejected];
  const avgQuality = allCandidates.length
    ? Math.round(allCandidates.reduce((a, c) => a + (c.quality_score || 0), 0) / allCandidates.length)
    : 0;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="hdr">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="brand">Recruit<em>IQ</em></div>
            <div className="brand-sub">LangGraph · Sentence-BERT · Quality Score</div>
          </div>
          <div className="nav">
            {[["setup","⚙ Setup"],["results","📊 Results"],["emails","📧 Emails"]].map(([v, l]) => (
              <button key={v} className={`tab ${tab === v ? "on" : ""}`} onClick={() => setTab(v)}>
                {l}
                {v === "results" && results && <span className="bdg">{top.length + rejected.length}</span>}
              </button>
            ))}
          </div>
          <div className="hdr-r">
            <span style={{ color: "var(--accent)" }}>{files.length}</span> resumes&nbsp;·&nbsp;
            <span style={{ color: "var(--green)" }}>{top.length}</span> shortlisted&nbsp;·&nbsp;
            <span style={{ color: "var(--red)" }}>{rejected.length}</span> rejected
          </div>
        </div>

        {/* ══ SETUP ════════════════════════════════════════════════════════════ */}
        {tab === "setup" && (
          <div className="pg fi">
            <div className="pg-h">RecruitIQ – Autonomous Hiring System</div>
            <div className="pg-s">LangGraph pipeline · Dynamic scoring · Resume Quality Score · Auto calendar · SMTP</div>

            {/* Pipeline */}
            <div className="pipe">
              {PIPE.map((p, i) => {
                const st = processing
                  ? (i < pStep ? "done" : i === pStep ? "active" : "idle")
                  : results ? "done" : "idle";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div className="ps">
                      <div className={`pi ${st}`}>{st === "done" ? "✓" : p.icon}</div>
                      <div className={`pl ${st}`}>{p.lbl}</div>
                    </div>
                    {i < PIPE.length - 1 && <div className="pa">→</div>}
                  </div>
                );
              })}
            </div>

            {apiError && (
              <div className="err-box">
                ⚠ {apiError}<br />
                <span style={{ color: "var(--muted)" }}>Make sure backend is running: <strong style={{ color: "var(--accent)" }}>python -m uvicorn app:app --reload</strong> in /backend</span>
              </div>
            )}

            <div className="g2" style={{ gap: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Job Details */}
                <div className="card">
                  <div className="ct">Job Details</div>
                  <label className="lbl">Required Skills</label>
                  <input className="inp" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="Python, Machine Learning, SQL" />
                  {skillList.length > 0 && <div className="sk-wrap">{skillList.map(s => <span key={s} className="sk">{s}</span>)}</div>}
                  <label className="lbl">Job Description <span style={{ color: "var(--accent)", fontSize: 9 }}>auto-tunes scoring weights</span></label>
                  <textarea className="ta" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." />
                  <label className="lbl">Minimum Experience (years)</label>
                  <input className="inp" type="number" min={0} step={1} value={minExperience} onChange={e => setMinExperience(parseInt(e.target.value) || 0)} />
                </div>

                {/* Interview Details */}
                <div className="card">
                  <div className="ct">Interview Details</div>
                  <label className="lbl">Interview Date</label>
                  <input className="inp" type="date" value={interviewDate} min={new Date().toISOString().split("T")[0]} onChange={e => setInterviewDate(e.target.value)} />
                  <div className="g2">
                    <div>
                      <label className="lbl">Start Time</label>
                      <input className="inp" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div>
                      <label className="lbl">Total Duration (min)</label>
                      <input className="inp" type="number" min={30} step={30} value={totalDuration} onChange={e => setTotalDuration(parseInt(e.target.value) || 30)} />
                    </div>
                  </div>
                  {interviewDate && files.length > 0 && (
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                      {fmtDate(interviewDate)} · {startTime} · ~{Math.floor(totalDuration / Math.min(5, files.length))} min/candidate
                    </div>
                  )}
                </div>

                {/* Email Config */}
                <div className="card">
                  <div className="ct">Email Config</div>
                  <div className="g2">
                    <div><label className="lbl">Sender Name</label><input className="inp" value={senderName} onChange={e => setSenderName(e.target.value)} /></div>
                    <div><label className="lbl">Sender Email</label><input className="inp" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} /></div>
                    <div><label className="lbl">HR Manager Name</label><input className="inp" value={hrName} onChange={e => setHrName(e.target.value)} /></div>
                    <div><label className="lbl">HR Email</label><input className="inp" type="email" value={hrEmailAddr} onChange={e => setHrEmailAddr(e.target.value)} /></div>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div className="card">
                <div className="ct">Upload Resumes</div>

                {/* Quality score explainer */}
                <div style={{ background: "var(--pdim)", border: "1px solid #b388ff22", borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--purple)", fontWeight: 700, marginBottom: 4 }}>📋 NEW — Resume Quality Score</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--t2)", lineHeight: 1.9 }}>
                    Each resume is now rated 0–100 on structure quality<br />
                    (email, phone, projects, quantified achievements, etc.)<br />
                    <span style={{ color: "var(--purple)" }}>Independent of job fit</span> · shown in results + rejection emails
                  </div>
                </div>

                <div
                  className={`dz ${drag ? "drag" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileRef.current.click()}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Drop Resumes Here</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)" }}>PDF · DOCX</div>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.docx" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
                </div>

                <div style={{ marginTop: 10 }}>
                  {files.map((f, i) => (
                    <div key={i} className="fc ready">
                      <span style={{ fontSize: 15 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fc-name">{f.name}</div>
                        <div className="fc-sub">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--green)" }}>Ready ✓</span>
                      <button className="btn btn-g" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>

                <hr className="dv" />

                {processing && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", marginBottom: 4 }}>
                      {STEP_LABELS[Math.min(pStep, STEP_LABELS.length - 1)]}
                    </div>
                    <div className="prog-wrap"><div className="prog-fill" style={{ width: `${((pStep + 1) / PIPE.length) * 100}%` }} /></div>
                  </div>
                )}

                <button className="btn btn-a btn-w" disabled={!files.length || processing || !interviewDate || !requiredSkills.trim()} onClick={processCandidates}>
                  {processing ? <><span className="sp" /> Running Pipeline...</> : `⚡ Process ${files.length || ""} Candidate${files.length !== 1 ? "s" : ""}`}
                </button>
                {!interviewDate && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>Select interview date to enable</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══ RESULTS ══════════════════════════════════════════════════════════ */}
        {tab === "results" && (
          <div className="pg fi">
            <div className="pg-h">Screening Results</div>
            <div className="pg-s">Match Score = job fit · Quality Score = resume structure · click to expand</div>

            {!results ? (
              <div style={{ textAlign: "center", padding: "60px 40px", color: "var(--muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 16 }}>Process candidates from Setup first</div>
                <button className="btn btn-a" onClick={() => setTab("setup")}>Go to Setup</button>
              </div>
            ) : (
              <>
                {/* Dynamic weights */}
                {weights && (
                  <div className="wt-bar">
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", marginRight: 4 }}>Scoring Weights:</span>
                    <span className="wt-pill" style={{ background: "var(--adim)", color: "var(--accent)", border: "1px solid #00e5ff33" }}>🧠 Semantic {Math.round(weights.semantic * 100)}%</span>
                    <span className="wt-pill" style={{ background: "var(--gdim)", color: "var(--green)", border: "1px solid #00ff8833" }}>🔍 Skill {Math.round(weights.skill * 100)}%</span>
                    <span className="wt-pill" style={{ background: "var(--amdim)", color: "var(--amber)", border: "1px solid #ffb80033" }}>📅 Experience {Math.round(weights.experience * 100)}%</span>
                  </div>
                )}

                {/* Stats */}
                <div className="stats">
                  {[
                    { n: top.length + rejected.length, l: "SCREENED",     c: "var(--text)" },
                    { n: top.length,                   l: "SHORTLISTED",  c: "var(--green)" },
                    { n: rejected.length,              l: "REJECTED",     c: "var(--red)" },
                    { n: parseFloat(([...top, ...rejected].reduce((a, c) => a + (c.score || 0), 0) / ([...top, ...rejected].length || 1)).toFixed(1)), l: "AVG MATCH",  c: "var(--accent)" },
                    { n: avgQuality,                   l: "AVG QUALITY",  c: "var(--purple)" },
                  ].map(s => (
                    <div className="sb" key={s.l}>
                      <div className="sn" style={{ color: s.c }}>{s.n}</div>
                      <div className="sl">{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* ── Shortlisted ── */}
                <div style={{ marginBottom: 24 }}>
                  <div className="sec-hdr" style={{ color: "var(--green)" }}>✅ Shortlisted — Top {top.length}</div>
                  {top.map((c, i) => {
                    const isOpen = expanded === `top-${i}`;
                    const qs     = c.quality_score;
                    const qg     = c.quality_grade;
                    return (
                      <div key={i} className="crow" onClick={() => setExpanded(isOpen ? null : `top-${i}`)}>
                        <div className="crow-bar" style={{ background: "var(--green)" }} />
                        <div className="crk" style={{ background: "var(--gdim)", color: "var(--green)", border: "1px solid var(--green)" }}>#{i + 1}</div>
                        {/* Match ring */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <Ring score={c.score} color="var(--green)" />
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--muted)" }}>MATCH</div>
                        </div>
                        {/* Quality ring */}
                        {qs != null && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <Ring score={qs} color={gradeColor(qg)} small={true} />
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--muted)" }}>QUALITY</div>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="cn">{c.name}</div>
                          <div className="cs">
                            {c.matched_skills?.slice(0, 4).join(" · ")} · {c.experience}yr
                            {c.email ? <span style={{ color: "#5555aa", marginLeft: 6 }}>{c.email}</span> : <span style={{ color: "var(--red)", marginLeft: 6 }}>⚠ no email</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                            <span className="slot-tag">🗓 {c.slot} · {fmtDate(interviewDate)}</span>
                            {qg && <span className="q-tag" style={{ background: gradeBg(qg), color: gradeColor(qg), border: `1px solid ${gradeColor(qg)}33` }}>{gradeEmoji(qg)} {qg} Resume</span>}
                          </div>

                          {isOpen && (
                            <div className="fi" onClick={e => e.stopPropagation()}>
                              {/* Match score breakdown */}
                              <div className="bkd" style={{ marginTop: 12 }}>
                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", marginBottom: 10, fontWeight: 700 }}>Match Score Breakdown</div>
                                {[
                                  ["Semantic Score",  c.semantic_score,   "var(--accent)"],
                                  ["Skill Match",     c.skill_score,      "var(--green)"],
                                  ["Experience",      c.experience_score, "var(--amber)"],
                                  ["Final Score",     c.score,            "var(--green)"],
                                ].map(([l, v, col]) => (
                                  <div className="br" key={l}>
                                    <div className="bl" style={{ color: l === "Final Score" ? "var(--text)" : "var(--muted)", fontWeight: l === "Final Score" ? 700 : 400 }}>{l}</div>
                                    <div className="bb"><div className="bf" style={{ width: `${Math.min(v || 0, 100)}%`, background: col }} /></div>
                                    <div className="bv" style={{ color: col }}>{(v || 0).toFixed(1)}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Skills */}
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--muted)", marginBottom: 6 }}>Matched Skills</div>
                                <div className="sk-wrap">{c.matched_skills?.map(sk => <span key={sk} className="sk hit">{sk}</span>)}</div>
                              </div>

                              {/* AI summary */}
                              {c.ai_summary && <div className="sum-box">💡 {c.ai_summary}</div>}

                              {/* Quality panel */}
                              <QualityPanel candidate={c} />
                            </div>
                          )}
                        </div>
                        <span className="bdge" style={{ background: "var(--gdim)", color: "var(--green)", border: "1px solid #00ff8830" }}>✓ Shortlisted</span>
                      </div>
                    );
                  })}
                </div>

                {/* ── Rejected ── */}
                {rejected.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div className="sec-hdr" style={{ color: "var(--red)" }}>❌ Not Selected — {rejected.length}</div>
                    {rejected.map((c, i) => {
                      const isOpen = expanded === `rej-${i}`;
                      const qs     = c.quality_score;
                      const qg     = c.quality_grade;
                      return (
                        <div key={i} className="crow" onClick={() => setExpanded(isOpen ? null : `rej-${i}`)}>
                          <div className="crow-bar" style={{ background: "var(--red)" }} />
                          <div className="crk" style={{ background: "var(--rdim)", color: "var(--red)", border: "1px solid var(--red)" }}>#{top.length + i + 1}</div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <Ring score={c.score} color="var(--red)" />
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--muted)" }}>MATCH</div>
                          </div>
                          {qs != null && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <Ring score={qs} color={gradeColor(qg)} small={true} />
                              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--muted)" }}>QUALITY</div>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="cn">{c.name}</div>
                            <div className="cs">
                              {c.matched_skills?.slice(0, 4).join(" · ")} · {c.experience}yr
                              {c.email ? <span style={{ color: "#5555aa", marginLeft: 6 }}>{c.email}</span> : <span style={{ color: "var(--red)", marginLeft: 6 }}>⚠ no email</span>}
                            </div>
                            {qg && <span className="q-tag" style={{ background: gradeBg(qg), color: gradeColor(qg), border: `1px solid ${gradeColor(qg)}33`, marginTop: 4 }}>{gradeEmoji(qg)} {qg} Resume</span>}
                            {isOpen && (
                              <div className="fi" onClick={e => e.stopPropagation()}>
                                <div className="bkd" style={{ marginTop: 10 }}>
                                  <div className="sk-wrap">{c.matched_skills?.map(sk => <span key={sk} className="sk hit">{sk}</span>)}</div>
                                </div>
                                {c.ai_summary && <div className="sum-box">💡 {c.ai_summary}</div>}
                                <QualityPanel candidate={c} />
                              </div>
                            )}
                          </div>
                          <span className="bdge" style={{ background: "var(--rdim)", color: "var(--red)", border: "1px solid #ff446630" }}>✗ Rejected</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button className="btn btn-gr" style={{ padding: "11px 26px" }} onClick={() => setTab("emails")}>
                  📧 Go to Email Center →
                </button>
              </>
            )}
          </div>
        )}

        {/* ══ EMAILS ═══════════════════════════════════════════════════════════ */}
        {tab === "emails" && (
          <div className="pg fi">
            <div className="pg-h">Email Center</div>
            <div className="pg-s">All emails auto-generated · rejection emails include quality feedback · click to preview</div>

            {!results ? (
              <div style={{ textAlign: "center", padding: "60px 40px", color: "var(--muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📧</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 16 }}>Process candidates from Setup first</div>
                <button className="btn btn-a" onClick={() => setTab("setup")}>Go to Setup</button>
              </div>
            ) : (
              <>
                <div className="stats" style={{ marginBottom: 20 }}>
                  {[
                    { n: top.length,                   l: "INVITATIONS", c: "var(--green)" },
                    { n: rejected.length,              l: "REJECTIONS",  c: "var(--red)" },
                    { n: 1,                            l: "HR REPORT",   c: "var(--amber)" },
                    { n: top.length + rejected.length + 1, l: "TOTAL",  c: "var(--accent)" },
                  ].map(s => (
                    <div className="sb" key={s.l}><div className="sn" style={{ color: s.c }}>{s.n}</div><div className="sl">{s.l}</div></div>
                  ))}
                </div>

                {/* Quality feedback note */}
                <div style={{ background: "var(--pdim)", border: "1px solid #b388ff22", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--t2)", lineHeight: 2 }}>
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>📋 Quality-Enhanced Rejections</span><br />
                  Rejection emails for candidates with Fair or Poor quality scores include specific resume improvement tips based on what the quality checker detected was missing.
                </div>

                {/* Invitations */}
                <div style={{ marginBottom: 20 }}>
                  <div className="sec-hdr" style={{ color: "var(--green)" }}>✅ Interview Invitations</div>
                  {top.map((c, i) => {
                    const em = makeSelectedEmail(c);
                    return <EC key={i} icon="✅" name={c.name} subject={em.sub} body={em.body} to={c.email} color="var(--green)" label="Invitation" />;
                  })}
                </div>

                {/* Rejections */}
                {rejected.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div className="sec-hdr" style={{ color: "var(--red)" }}>❌ Rejection Emails</div>
                    {rejected.map((c, i) => {
                      const em = makeRejectedEmail(c);
                      const hasQuality = c.quality_score != null && c.quality_score < 60;
                      return (
                        <div key={i} style={{ position: "relative" }}>
                          {hasQuality && (
                            <span style={{ position: "absolute", top: 12, right: 120, zIndex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--purple)", background: "var(--pdim)", border: "1px solid #b388ff33", borderRadius: 20, padding: "2px 8px" }}>
                              📋 +Quality Feedback
                            </span>
                          )}
                          <EC icon="❌" name={c.name} subject={em.sub} body={em.body} to={c.email} color="var(--red)" label="Rejection" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* HR Report */}
                {hrEmail && (
                  <div>
                    <div className="sec-hdr" style={{ color: "var(--amber)" }}>📋 HR Manager Report</div>
                    <EC icon="📋" name={`Summary → ${hrName}`} subject={hrEmail.sub} body={hrEmail.body} to={hrEmailAddr} color="var(--amber)" label="HR Report" />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            {modal.type === "done" && (
              <>
                <div className="mi">🎯</div>
                <div className="mt">Pipeline Complete!</div>
                <div className="md">
                  <div>✅ Shortlisted       : <span style={{ color: "var(--green)" }}>{modal.top}</span></div>
                  <div>❌ Rejected          : <span style={{ color: "var(--red)" }}>{modal.rej}</span></div>
                  <div>📧 Emails sent       : <span style={{ color: "var(--accent)" }}>{modal.top + modal.rej + 1}</span></div>
                  <div>🗓 Calendar (.ics)   : <span style={{ color: "var(--amber)" }}>sent to HR</span></div>
                  <div>📋 Resume Quality    : <span style={{ color: "var(--purple)" }}>scored for all {modal.top + modal.rej} candidates</span></div>
                  <div>📄 DOCX Report       : <span style={{ color: "var(--amber)" }}>includes quality section · sent to HR</span></div>
                  {modal.weights && (
                    <div style={{ marginTop: 6, color: "var(--muted)" }}>
                      Weights → Semantic {Math.round(modal.weights.semantic * 100)}% · Skill {Math.round(modal.weights.skill * 100)}% · Exp {Math.round(modal.weights.experience * 100)}%
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-a" style={{ flex: 1 }} onClick={() => { setModal(null); setTab("results"); }}>View Results →</button>
                  <button className="btn btn-gr" style={{ flex: 1 }} onClick={() => { setModal(null); setTab("emails"); }}>Email Center →</button>
                </div>
              </>
            )}
            {modal.type === "err" && (
              <>
                <div className="mi" style={{ borderColor: "var(--red)", background: "var(--rdim)" }}>⚠</div>
                <div className="mt" style={{ color: "var(--red)" }}>Error</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>{modal.msg}</div>
                <button className="btn btn-a btn-w" onClick={() => setModal(null)}>OK</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
