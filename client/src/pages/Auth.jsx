import { useState } from "react";
import { api } from "../api.js";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "student" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { onAuth(await api(`/api/auth/${mode}`, f)); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <main className="auth">
      <section className="pitch">
        <h1>Every student deserves a patient tutor.</h1>
        <p>Ask questions in your own language, get hints before answers, and turn any notes into a practice quiz.</p>
      </section>
      <form className="card" onSubmit={submit}>
        <h2>{mode === "login" ? "Log in" : "Create your account"}</h2>
        {mode === "signup" && (<>
          <label>Name<input value={f.name} onChange={set("name")} required /></label>
          <label>I am a
            <select value={f.role} onChange={set("role")}><option value="student">Student</option><option value="teacher">Teacher</option></select>
          </label></>)}
        <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>
        <label>Password<input type="password" minLength={6} value={f.password} onChange={set("password")} required /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="primary" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>
          {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
