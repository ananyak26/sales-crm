"use client";
// Boss-only UI: add a new employee (username + name + password) and reset
// passwords for existing ones. Talks to /api/employees and
// /api/employees/[id]/reset-password.

import { useState } from "react";

type Employee = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function EmployeesPanel({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ username: string; password: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, fullName, password }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setEmployees((prev) => [
      { id: data.id, username: data.username, full_name: fullName, role: "sales", created_at: new Date().toISOString() },
      ...prev,
    ]);
    setLastCreated({ username: data.username, password });
    setUsername("");
    setFullName("");
    setPassword(generatePassword());
    setShowForm(false);
  }

  async function handleResetPassword(id: string) {
    setResetMessage(null);
    const res = await fetch(`/api/employees/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResetMessage(data.error ?? "Something went wrong");
      return;
    }
    setResetMessage("Password updated. Share it with them directly.");
    setResetTarget(null);
    setResetPassword("");
  }

  return (
    <div className="space-y-6">
      {lastCreated && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Account created.</p>
          <p className="mt-1">
            Username: <span className="font-mono">{lastCreated.username}</span> &middot; Password:{" "}
            <span className="font-mono">{lastCreated.password}</span>
          </p>
          <p className="mt-1 text-emerald-700">Share these with them now — the password won&apos;t be shown again.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">
          {employees.length} employee{employees.length === 1 ? "" : "s"}
        </h2>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary btn-sm">
          {showForm ? "Cancel" : "+ Add employee"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="priya" className="input" />
            </div>
            <div>
              <label className="label">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Priya Sharma" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="flex gap-2">
              <input
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input font-mono"
              />
              <button type="button" onClick={() => setPassword(generatePassword())} className="btn-secondary whitespace-nowrap">
                Regenerate
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Added</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="font-mono text-ink-900">{emp.username}</td>
                <td>{emp.full_name || "—"}</td>
                <td>{new Date(emp.created_at).toLocaleDateString("en-IN")}</td>
                <td className="text-right">
                  {resetTarget === emp.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        autoFocus
                        minLength={8}
                        placeholder="New password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="input w-36 py-1.5 text-xs font-mono"
                      />
                      <button onClick={() => handleResetPassword(emp.id)} className="btn-primary btn-sm">
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setResetTarget(null);
                          setResetPassword("");
                        }}
                        className="text-xs text-gray-400 hover:text-ink-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setResetTarget(emp.id);
                        setResetPassword(generatePassword());
                        setResetMessage(null);
                      }}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Reset password
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">
                  No employees yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {resetMessage && <p className="text-sm text-gray-500">{resetMessage}</p>}
    </div>
  );
}
