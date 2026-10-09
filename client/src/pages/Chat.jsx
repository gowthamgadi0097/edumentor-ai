import { useState, useRef, useEffect } from "react";
import { api } from "../api.js";

const LEVELS = ["Class 6-8", "Class 9-10", "Class 11-12", "Engineering", "Beginner"];
const LANGS = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];
const LANG_CODE = { English: "en-IN", Telugu: "te-IN", Hindi: "hi-IN", Tamil: "ta-IN", Kannada: "kn-IN" };

export default function Chat() {
  const [msgs, setMsgs] = useState(() => JSON.parse(localStorage.getItem("chat") || "[]"));
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  const [opt, setOpt] = useState({ level: "Class 9-10", subject: "Science", language: "English", socratic: true });
  const end = useRef();
  useEffect(() => { localStorage.setItem("chat", JSON.stringify(msgs)); end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (q = text) => {
    if (!q.trim() || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setText(""); setBusy(true);
    try { const { reply } = await api("/api/chat", { messages: next, ...opt }); setMsgs([...next, { role: "assistant", content: reply }]); }
    catch (e) { setMsgs([...next, { role: "assistant", content: "⚠ " + e.message }]); }
    setBusy(false);
  };
  const speak = (t) => { const u = new SpeechSynthesisUtterance(t); u.lang = LANG_CODE[opt.language]; speechSynthesis.cancel(); speechSynthesis.speak(u); };
  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice input is not supported in this browser. Try Chrome.");
    const r = new SR(); r.lang = LANG_CODE[opt.language]; r.onresult = (e) => setText(e.results[0][0].transcript); r.start();
  };
  const o = (k) => (e) => setOpt({ ...opt, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <main className="page chat">
      <div className="opts">
        <select value={opt.level} onChange={o("level")}>{LEVELS.map((x) => <option key={x}>{x}</option>)}</select>
        <input value={opt.subject} onChange={o("subject")} aria-label="Subject" />
        <select value={opt.language} onChange={o("language")}>{LANGS.map((x) => <option key={x}>{x}</option>)}</select>
        <label className="chk"><input type="checkbox" checked={opt.socratic} onChange={o("socratic")} /> Hints first</label>
        <button className="ghost" onClick={() => setMsgs([])}>Clear</button>
      </div>
      <div className="log">
        {!msgs.length && <p className="empty">Ask anything you are studying. Try: “Why does ice float on water?”</p>}
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + m.role}>
            {m.content}
            {m.role === "assistant" && <button className="mini" onClick={() => speak(m.content)}>Read aloud</button>}
          </div>))}
        {busy && <div className="bubble assistant">Thinking…</div>}
        <div ref={end} />
      </div>
      <div className="composer">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your question" />
        <button className="ghost" onClick={listen}>Speak</button>
        <button className="primary" onClick={() => send()} disabled={busy}>Send</button>
      </div>
    </main>
  );
}
