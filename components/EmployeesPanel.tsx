'use client'
// components/EmployeesPanel.tsx
// Boss-only UI: add a new employee (username + name + password) and reset
// passwords for existing ones. Talks to /api/employees and
// /api/employees/[id]/reset-password.

import { useState } from 'react'

type Employee = {
  id: string
  username: string | null
  full_name: string | null
  role: string
  created_at: string
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export default function EmployeesPanel({
  initialEmployees,
}: {
  initialEmployees: Employee[]
}) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState(generatePassword())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCreated, setLastCreated] = useState<{ username: string; password: string } | null>(null)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, password }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setEmployees((prev) => [
      {
        id: data.id,
        username: data.username,
        full_name: fullName,
        role: 'sales',
        created_at: new Date().toISOString(),
      },
      ...prev,
    ])
    setLastCreated({ username: data.username, password })
    setUsername('')
    setFullName('')
    setPassword(generatePassword())
    setShowForm(false)
  }

  async function handleResetPassword(id: string) {
    setResetMessage(null)
    const res = await fetch(`/api/employees/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPassword }),
    })
    const data = await res.json()
    if (!res.ok) {
      setResetMessage(data.error ?? 'Something went wrong')
      return
    }
    setResetMessage('Password updated. Share it with them directly.')
    setResetTarget(null)
    setResetPassword('')
  }

  return (
    <div className="space-y-6">
      {lastCreated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-medium">Account created.</p>
          <p className="mt-1">
            Username: <span className="font-mono">{lastCreated.username}</span>{' '}
            &middot; Password:{' '}
            <span className="font-mono">{lastCreated.password}</span>
          </p>
          <p className="mt-1 text-emerald-700">
            Share these with them now — the password won&apos;t be shown again.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          {employees.length} employee{employees.length === 1 ? '' : 's'}
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {showForm ? 'Cancel' : '+ Add employee'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
        >
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Username
              </label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="priya"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Full name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Password
            </label>
            <div className="flex gap-2">
              <input
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Regenerate
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Added
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-mono text-slate-900">
                  {emp.username}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {emp.full_name || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(emp.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {resetTarget === emp.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        autoFocus
                        minLength={8}
                        placeholder="New password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="w-36 rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
                      />
                      <button
                        onClick={() => handleResetPassword(emp.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setResetTarget(null)
                          setResetPassword('')
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setResetTarget(emp.id)
                        setResetPassword(generatePassword())
                        setResetMessage(null)
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Reset password
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                  No employees yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {resetMessage && (
        <p className="text-sm text-slate-600">{resetMessage}</p>
      )}
    </div>
  )
}
