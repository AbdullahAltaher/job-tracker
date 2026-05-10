import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ company: '', position: '', status: 'applied', applied_date: '', notes: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchApplications() }, [])

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_date', { ascending: false })
    if (error) console.error(error)
    else setApplications(data)
    setLoading(false)
  }

  async function addApplication() {
    if (!form.company || !form.position) return
    setAdding(true)
    const { error } = await supabase.from('applications').insert([form])
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
    if (!error) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } else {
      console.error(error)
    }
  }

  if (loading) return <p style={{ color: '#fff', padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '2rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.25rem', textAlign: 'left' }}>
          Job Tracker
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'left' }}>
          {applications.length} applications total
        </p>

        {/* Add Form */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0, textAlign: 'left' }}>
            Add new application
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              style={inputStyle}
              placeholder="Company"
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
            />
            <input
              style={inputStyle}
              placeholder="Position"
              value={form.position}
              onChange={e => setForm({ ...form, position: e.target.value })}
            />
            <input
              style={inputStyle}
              type="date"
              value={form.applied_date}
              onChange={e => setForm({ ...form, applied_date: e.target.value })}
            />
            <select
              style={inputStyle}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="offer">Offer</option>
            </select>
          </div>
          <input
            style={{ ...inputStyle, marginBottom: '12px' }}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <div style={{ textAlign: 'left' }}>
            <button
              onClick={addApplication}
              disabled={adding}
              style={{
                background: '#fff', color: '#000', border: 'none', borderRadius: '8px',
                padding: '0.6rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem'
              }}
            >
              {adding ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applications.map(app => (
            <div key={app.id} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#fff', fontWeight: '500', fontSize: '1rem', margin: 0 }}>{app.company}</p>
                <p style={{ color: '#888', fontSize: '0.875rem', margin: '2px 0 0' }}>{app.position}</p>
                {app.notes && <p style={{ color: '#555', fontSize: '0.8rem', margin: '4px 0 0' }}>{app.notes}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>{app.applied_date}</p>
                <select
                  value={app.status}
                  onChange={e => updateStatus(app.id, e.target.value)}
                  style={{
                    background: statusColors[app.status]?.bg || '#222',
                    color: statusColors[app.status]?.color || '#fff',
                    border: 'none', borderRadius: '999px',
                    padding: '4px 12px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
                <button
                  onClick={() => deleteApplication(app.id)}
                  style={{
                    background: 'transparent', border: '1px solid #3a1a1a', color: '#f87171',
                    borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
                  }}
                >
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