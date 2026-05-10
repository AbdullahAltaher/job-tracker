import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Profile from './Profile'
import Admin from './Admin'

const statusConfig = {
  applied:   { dark: { bg: '#1a2744', color: '#60a5fa', dot: '#3b82f6' }, light: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' } },
  interview: { dark: { bg: '#14432a', color: '#34d399', dot: '#10b981' }, light: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' } },
  rejected:  { dark: { bg: '#3b1219', color: '#f87171', dot: '#ef4444' }, light: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' } },
  offer:     { dark: { bg: '#2d2b00', color: '#fbbf24', dot: '#f59e0b' }, light: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' } },
}

export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('tracker')
  const [isAdmin, setIsAdmin] = useState(false)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ company: '', position: '', status: 'applied', applied_date: '', notes: '' })
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [adding, setAdding] = useState(false)
  const [theme, setTheme] = useState('dark')

  const d = theme === 'dark'

  const colors = {
    bg: d ? '#07070f' : '#f8fafc',
    surface: d ? '#0d0d12' : '#ffffff',
    border: d ? '#ffffff0a' : '#e2e8f0',
    text: d ? '#e2e8f0' : '#0f172a',
    muted: d ? '#475569' : '#64748b',
    subtle: d ? '#334155' : '#94a3b8',
    input: d ? '#0d0d12' : '#f8fafc',
    inputBorder: d ? '#ffffff0f' : '#e2e8f0',
    placeholder: d ? '#ffffff22' : '#94a3b8',
  }

  const input = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    color: colors.text,
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '14px',
    padding: '1.5rem',
    marginBottom: '1rem',
  }

  const btnStyle = (color = '#6366f1', bg = 'transparent') => ({
    background: bg,
    color,
    border: `1px solid ${color}33`,
    borderRadius: '10px',
    padding: '7px 16px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) {
      fetchApplications()
      checkAdmin()
    }
  }, [session])

  async function checkAdmin() {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single()
    if (data?.is_admin) setIsAdmin(true)
  }

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_date', { ascending: false })
    if (error) console.error(error)
    else setApplications(data)
  }

  async function handleAuth() {
    setAuthError('')
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword(authForm)
      if (error) setAuthError(error.message)
    } else {
      const { error } = await supabase.auth.signUp(authForm)
      if (error) setAuthError(error.message)
      else setAuthError('Check your email to confirm your account!')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setApplications([])
    setIsAdmin(false)
    setPage('tracker')
  }

  async function addApplication() {
    if (!form.company || !form.position) return
    setAdding(true)
    const { error } = await supabase.from('applications').insert([{ ...form, user_id: session.user.id }])
    if (!error) {
      setForm({ company: '', position: '', status: 'applied', applied_date: '', notes: '' })
      fetchApplications()
    }
    setAdding(false)
  }

  async function deleteApplication(id) {
    await supabase.from('applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)
    if (!error) setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: `2px solid ${colors.border}`, borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!session) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '1rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '14px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '22px' }}>✦</span>
          </div>
          <h1 style={{ color: colors.text, fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.5rem' }}>Job Tracker</h1>
          <p style={{ color: colors.muted, fontSize: '0.9rem', margin: 0 }}>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        </div>
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={input} placeholder="Email address" type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
            <input style={input} placeholder="Password" type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            {authError && <p style={{ color: authError.includes('Check') ? '#34d399' : '#f87171', fontSize: '0.8rem', margin: 0 }}>{authError}</p>}
            <button onClick={handleAuth} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', marginTop: '4px' }}>
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
          <p style={{ color: colors.muted, fontSize: '0.8rem', textAlign: 'center', margin: '1.5rem 0 0' }}>
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '500' }}>
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )

  const navbar = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px' }}>✦</span>
        </div>
        <div>
          <h1 style={{ color: colors.text, fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            {page === 'tracker' ? 'Job Tracker' : page === 'profile' ? 'My Profile' : 'Admin Dashboard'}
          </h1>
          {page === 'tracker' && <p style={{ color: colors.muted, fontSize: '0.75rem', margin: 0 }}>{applications.length} applications</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => setTheme(d ? 'light' : 'dark')} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '7px 12px', cursor: 'pointer', fontSize: '1rem' }}>
          {d ? '☀️' : '🌙'}
        </button>
        {page !== 'tracker' && <button onClick={() => setPage('tracker')} style={btnStyle(colors.muted)}>Tracker</button>}
        {page !== 'profile' && <button onClick={() => setPage('profile')} style={btnStyle(colors.muted)}>Profile</button>}
        {isAdmin && page !== 'admin' && <button onClick={() => setPage('admin')} style={btnStyle('#a78bfa', d ? '#1e1b4b' : '#ede9fe')}>Admin</button>}
        <button onClick={handleSignOut} style={btnStyle('#f87171', d ? '#1f0a0a' : '#fee2e2')}>Sign out</button>
      </div>
    </div>
  )

  const pageWrapper = (children) => (
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '2rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${colors.placeholder}; }
        input:focus, textarea:focus, select:focus { border-color: #6366f144 !important; outline: none; }
        select option { background: ${colors.surface}; color: ${colors.text}; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {navbar}
        {children}
      </div>
    </div>
  )

  if (page === 'profile') return pageWrapper(<Profile colors={colors} input={input} card={card} />)
  if (page === 'admin' && isAdmin) return pageWrapper(<Admin colors={colors} />)

  return pageWrapper(
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: applications.length, color: '#6366f1' },
          { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: '#10b981' },
          { label: 'Offers', value: applications.filter(a => a.status === 'offer').length, color: '#f59e0b' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '1.25rem' }}>
            <p style={{ color: colors.muted, fontSize: '0.75rem', margin: '0 0 6px', fontWeight: '500' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <p style={{ color: colors.muted, fontSize: '0.75rem', fontWeight: '500', marginBottom: '1rem', marginTop: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>New Application</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input style={input} placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <input style={input} placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
          <input style={input} type="date" value={form.applied_date} onChange={e => setForm({ ...form, applied_date: e.target.value })} />
          <select style={input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>
        </div>
        <input style={{ ...input, marginBottom: '12px' }} placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button onClick={addApplication} disabled={adding} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', opacity: adding ? 0.7 : 1 }}>
          {adding ? 'Adding...' : '+ Add Application'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {applications.map(app => (
          <div key={app.id} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusConfig[app.status]?.[d ? 'dark' : 'light']?.dot || '#6366f1', flexShrink: 0 }} />
              <div>
                <p style={{ color: colors.text, fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>{app.company}</p>
                <p style={{ color: colors.muted, fontSize: '0.8rem', margin: '2px 0 0' }}>{app.position}</p>
                {app.notes && <p style={{ color: colors.subtle, fontSize: '0.75rem', margin: '3px 0 0' }}>{app.notes}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <p style={{ color: colors.subtle, fontSize: '0.75rem', margin: 0 }}>{app.applied_date}</p>
              <select
                value={app.status}
                onChange={e => updateStatus(app.id, e.target.value)}
                style={{ background: statusConfig[app.status]?.[d ? 'dark' : 'light']?.bg || colors.surface, color: statusConfig[app.status]?.[d ? 'dark' : 'light']?.color || '#6366f1', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="offer">Offer</option>
              </select>
              <button onClick={() => deleteApplication(app.id)} style={{ background: 'transparent', border: `1px solid ${colors.border}`, color: colors.muted, borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}