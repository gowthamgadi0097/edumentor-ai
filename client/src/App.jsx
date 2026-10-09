import { useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Chat from "./pages/Chat.jsx";
import Quiz from "./pages/Quiz.jsx";

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const nav = useNavigate();
  const login = ({ token, user }) => {
    localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(user));
    setUser(user); nav("/tutor");
  };
  const logout = () => { localStorage.clear(); setUser(null); nav("/"); };
  const guard = (el) => (user ? el : <Navigate to="/" />);

  return (
    <>
      {user && (
        <header className="bar">
          <strong className="brand">EduMentor</strong>
          <nav>
            <NavLink to="/tutor">AI tutor</NavLink>
            <NavLink to="/quiz">Quiz maker</NavLink>
          </nav>
          <span className="who">{user.name} ({user.role})</span>
          <button className="ghost" onClick={logout}>Log out</button>
        </header>
      )}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/tutor" /> : <Auth onAuth={login} />} />
        <Route path="/tutor" element={guard(<Chat />)} />
        <Route path="/quiz" element={guard(<Quiz />)} />
      </Routes>
    </>
  );
}
