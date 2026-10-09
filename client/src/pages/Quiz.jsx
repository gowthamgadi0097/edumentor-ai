import { useState } from "react";
import { api } from "../api.js";

export default function Quiz() {
  const [topic, setTopic] = useState(""); const [level, setLevel] = useState("Class 9-10");
  const [qs, setQs] = useState([]); const [picked, setPicked] = useState({});
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");

  const make = async () => {
    setBusy(true); setErr(""); setPicked({}); setQs([]);
    try { setQs((await api("/api/quiz", { topic, level, count: 5 })).questions); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const done = qs.length && Object.keys(picked).length === qs.length;
  const score = qs.filter((q, i) => picked[i] === q.answer).length;

  return (
    <main className="page">
      <h2>Quiz maker</h2>
      <textarea rows={4} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic (Photosynthesis) or paste your notes" />
      <div className="opts">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          {["Class 6-8", "Class 9-10", "Class 11-12", "Engineering"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <button className="primary" onClick={make} disabled={busy}>{busy ? "Building quiz…" : "Make 5 questions"}</button>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      {qs.map((q, i) => (
        <fieldset key={i} className="card q">
          <legend>{i + 1}. {q.q}</legend>
          {q.options.map((op, j) => {
            const shown = picked[i] !== undefined;
            const cls = shown ? (j === q.answer ? "opt right" : j === picked[i] ? "opt wrong" : "opt") : "opt";
            return <button key={j} className={cls} disabled={shown} onClick={() => setPicked({ ...picked, [i]: j })}>{op}</button>;
          })}
          {picked[i] !== undefined && <p className="why">{q.explanation}</p>}
        </fieldset>))}
      {done && <p className="score">You scored {score} out of {qs.length}.</p>}
    </main>
  );
}
