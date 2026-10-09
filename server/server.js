import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "2mb" }));

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-5-5";
const SECRET = process.env.JWT_SECRET || "dev-secret";

// ---- tiny JSON "database" (swap for Supabase/MongoDB later) ----
const DB = "users.json";
const load = () => (fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : []);
const save = (u) => fs.writeFileSync(DB, JSON.stringify(u, null, 2));

// ---- auth ----
const token = (u) => jwt.sign({ id: u.id, email: u.email }, SECRET, { expiresIn: "7d" });
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: "Name, email and a 6+ character password are required." });
  const users = load();
  if (users.find((u) => u.email === email.toLowerCase()))
    return res.status(409).json({ error: "This email is already registered." });
  const user = { id: Date.now().toString(), name, email: email.toLowerCase(),
    role: role === "teacher" ? "teacher" : "student", hash: await bcrypt.hash(password, 10) };
  save([...users, user]);
  res.json({ token: token(user), user: safe(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email = "", password = "" } = req.body;
  const user = load().find((u) => u.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.hash)))
    return res.status(401).json({ error: "Wrong email or password." });
  res.json({ token: token(user), user: safe(user) });
});

const auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET); next(); }
  catch { res.status(401).json({ error: "Please log in again." }); }
};

// ---- AI helpers ----
async function ask(system, messages, max_tokens = 1200) {
  const r = await ai.messages.create({ model: MODEL, max_tokens, system, messages });
  return r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

app.post("/api/chat", auth, async (req, res) => {
  try {
    const { messages = [], level = "Class 10", subject = "General", language = "English", socratic = true } = req.body;
    const system = `You are EduMentor, a patient AI tutor. Subject: ${subject}. Student level: ${level}.
Reply in ${language}. Explain step by step in simple words with one short example.
${socratic
  ? "SOCRATIC MODE: do not give the final answer to homework straight away. Give a hint or a guiding question first, and reveal the full solution only if the student asks again or is stuck."
  : "Give clear, complete explanations."}
Keep replies under 200 words. If unsure, say so instead of guessing.`;
    res.json({ reply: await ask(system, messages.slice(-12)) });
  } catch (e) { console.error(e.message); res.status(500).json({ error: "AI is busy. Try again." }); }
});

app.post("/api/quiz", auth, async (req, res) => {
  try {
    const { topic, level = "Class 10", count = 5, language = "English" } = req.body;
    if (!topic) return res.status(400).json({ error: "Enter a topic or paste notes." });
    const system = `Create a quiz in ${language} for level ${level}. Return ONLY valid JSON, no markdown:
{"questions":[{"q":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}
"answer" is the index (0-3) of the correct option. Make exactly ${Math.min(+count || 5, 10)} questions.`;
    const text = await ask(system, [{ role: "user", content: topic.slice(0, 6000) }], 2500);
    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e) { console.error(e.message); res.status(500).json({ error: "Could not build the quiz. Try again." }); }
});

app.get("/", (_, res) => res.send("EduMentor API running"));
app.listen(process.env.PORT || 5000, () => console.log("Server on", process.env.PORT || 5000));
