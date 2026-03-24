import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

function IconEye({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PasswordField({ label, value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className={[
            'w-full h-[52px] bg-iron-surface border rounded-iron pr-12',
            'font-mono text-base text-iron-text px-4',
            'placeholder:text-iron-faint focus:border-iron-accent',
            error ? 'border-iron-danger' : 'border-iron-border',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="press absolute right-3 top-1/2 -translate-y-1/2 text-iron-muted border-0 bg-transparent p-1"
        >
          <IconEye open={show} />
        </button>
      </div>
      {error && <p className="font-mono text-[12px] text-iron-danger">{error}</p>}
    </div>
  )
}

export default function UpdatePassword() {
  const { clearPasswordRecovery } = useApp()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (password.length < 8)  errs.password = 'At least 8 characters'
    if (confirm !== password)  errs.confirm  = "Passwords don't match"
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      setErrors({ form: error.message })
    } else {
      clearPasswordRecovery()
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6">
      <div className="w-full max-w-[360px]">

        <div className="text-center mb-8">
          <h1
            className="font-display font-black text-iron-text uppercase leading-none"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)' }}
          >
            Iron<span className="text-iron-accent">Room</span>
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="font-display font-black text-iron-text uppercase text-2xl leading-none mb-1">
            New Password
          </h2>
          <p className="font-mono text-[12px] text-iron-muted">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <PasswordField
            label="New Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors({}) }}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm Password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setErrors({}) }}
            error={errors.confirm}
            autoComplete="new-password"
          />
          {errors.form && (
            <p className="font-mono text-[12px] text-iron-danger">{errors.form}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50 mt-1"
          >
            {saving ? 'Saving…' : 'Set New Password'}
          </button>
        </form>

      </div>
    </div>
  )
}
