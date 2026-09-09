import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, fullName);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-page">
      <form className="card auth-card stack gap-md" onSubmit={handleSubmit}>
        <div className="stack gap-sm">
          <h1 style={{ fontSize: 30 }}>Join the Vault.</h1>
          <p className="muted">Your soft life era starts here.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="fullName">Name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-gold btn-block" type="submit" disabled={submitting}>
          {submitting ? "Creating your Vault…" : "Create account"}
        </button>

        <p className="muted" style={{ fontSize: 14 }}>
          Already a member? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
