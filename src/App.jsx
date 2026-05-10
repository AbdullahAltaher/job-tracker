import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Profile from './Profile'
import Admin from './Admin'

const statusColors = {
  applied:   { bg: '#1e3a5f', color: '#60a5fa' },
  interview: { bg: '#1a3a2a', color: '#4ade80' },
  rejected:  { bg: '#3a1a1a', color: '#f87171' },
  offer:     { bg: '#2a2a0a', color: '#facc15' },
}

const inputStyle = {
  background: '#111',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '0.6rem 1rem',
  color: '#fff',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
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
    const { error } = await supabase.from('applications').insert([{
      ...form,
      user_id: session.user.id
    }])
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

  if (loading) return <p style={{ color: '#fff', padding: '2rem' }}>Loading...</p>

  if (!session) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', marginTop: 0 }}>Job Tracker</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{authMode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} placeholder="Email" type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
          <input style={inputStyle} placeholder="Password" type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
          {authError && <p style={{ color: authError.includes('Check') ? '#4ade80' : '#f87171', fontSize: '0.8rem', margin: 0 }}>{authError}</p>}
          <button onClick={handleAuth} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '0.7rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
          <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ color: '#60a5fa', cursor: 'pointer' }}>
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )

  const navbar = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '600', margin: 0 }}>
        {page === 'tracker' ? 'Job Tracker' : page === 'profile' ? 'My Profile' : 'Admin Dashboard'}
      </h1>
      <div style={{ display: 'flex', gap: '8px' }}>
        {page !== 'tracker' && (
          <button onClick={() => setPage('tracker')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Job Tracker
          </button>
        )}
        {page !== 'profile' && (
          <button onClick={() => setPage('profile')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            My Profile
          </button>
        )}
        {isAdmin && page !== 'admin' && (
          <button onClick={() => setPage('admin')} style={{ background: 'transparent', border: '1px solid #534AB7', color: '#7F77DD', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Admin
          </button>
        )}
        <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Sign Out
        </button>
      </div>
    </div>
  )

  if (page === 'profile') return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif', padding: '2rem', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {navbar}
        <Profile />
      </div>
    </div>
  )

  if (page === 'admin' && isAdmin) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif', padding: '2rem', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {navbar}
        <Admin />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '2rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {navbar}
        <p style={{ color: '#666', marginBottom: '2rem', marginTop: '-1.5rem' }}>{applications.length} applications total</p>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Add new application</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input style={inputStyle} placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input style={inputStyle} placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
            <input style={inputStyle} type="date" value={form.applied_date} onChange={e => setForm({ ...form, applied_date: e.target.value })} />
            <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="offer">Offer</option>
            </select>
          </div>
          <input style={{ ...inputStyle, marginBottom: '12px' }} placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={addApplication} disabled={adding} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
            {adding ? 'Adding...' : 'Add Application'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#fff', fontWeight: '500', fontSize: '1rem', margin: 0 }}>{app.company}</p>
                <p style={{ color: '#888', fontSize: '0.875rem', margin: '2px 0 0' }}>{app.position}</p>
                {app.notes && <p style={{ color: '#555', fontSize: '0.8rem', margin: '4px 0 0' }}>{app.notes}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>{app.applied_date}</p>
                <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)} style={{ background: statusColors[app.status]?.bg || '#222', color: statusColors[app.status]?.color || '#fff', border: 'none', borderRadius: '999px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', outline: 'none' }}>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
                <button onClick={() => deleteApplication(app.id)} style={{ background: 'transparent', border: '1px solid #3a1a1a', color: '#f87171', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}