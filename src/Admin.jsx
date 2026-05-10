import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Admin({ colors }) {
  const [users, setUsers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const statusConfig = {
    applied:   { bg: '#1a2744', color: '#60a5fa' },
    interview: { bg: '#14432a', color: '#34d399' },
    rejected:  { bg: '#3b1219', color: '#f87171' },
    offer:     { bg: '#2d2b00', color: '#fbbf24' },
  }

  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '14px',
    padding: '1.5rem',
    marginBottom: '1rem',
  }

  const label = {
    color: colors.muted,
    fontSize: '0.75rem',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    marginTop: 0,
  }

  useEffect(() => {
    async function loadData() {
      const { data: profiles } = await supabase.from('profiles').select('*')
      const { data: apps } = await supabase.from('applications').select('*')
      setUsers(profiles || [])
      setApplications(apps || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{ width: '28px', height: '28px', border: `2px solid ${colors.border}`, borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const selectedUser = users.find(u => u.user_id === selected)
  const selectedApps = applications.filter(a => a.user_id === selected)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#6366f1' },
          { label: 'Total Applications', value: applications.length, color: '#10b981' },
          { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '1.25rem' }}>
            <p style={{ color: colors.muted, fontSize: '0.75rem', margin: '0 0 6px', fontWeight: '500' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <p style={label}>All Users</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map(user => (
            <div
              key={user.user_id}
              onClick={() => setSelected(selected === user.user_id ? null : user.user_id)}
              style={{
                background: selected === user.user_id ? (colors.surface === '#ffffff' ? '#f1f5f9' : '#13131f') : colors.input,
                border: `1px solid ${selected === user.user_id ? '#6366f144' : colors.border}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div>
                <p style={{ color: colors.text, margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{user.name || 'No name'}</p>
                <p style={{ color: colors.muted, margin: '2px 0 0', fontSize: '0.8rem' }}>{user.email} — {user.university || 'No university'}</p>
              </div>
              <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '600', background: '#6366f111', padding: '3px 10px', borderRadius: '20px' }}>
                {applications.filter(a => a.user_id === user.user_id).length} apps
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && selectedUser && (
        <>
          <div style={card}>
            <p style={label}>Profile — {selectedUser.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
              {[
                { l: 'Email', v: selectedUser.email },
                { l: 'Phone', v: selectedUser.phone },
                { l: 'University', v: selectedUser.university },
                { l: 'Major', v: selectedUser.major },
                { l: 'GPA', v: selectedUser.gpa },
                { l: 'Graduation Year', v: selectedUser.graduation_year },
              ].map(item => (
                <div key={item.l}>
                  <p style={{ color: colors.muted, margin: '0 0 2px', fontSize: '0.75rem' }}>{item.l}</p>
                  <p style={{ color: colors.text, margin: 0, fontWeight: '500' }}>{item.v || '—'}</p>
                </div>
              ))}
              {[
                { l: 'Technical Skills', v: selectedUser.technical_skills },
                { l: 'Languages', v: selectedUser.languages },
                { l: 'Experience', v: selectedUser.experience },
                { l: 'Projects', v: selectedUser.projects },
                { l: 'Summary', v: selectedUser.summary },
              ].map(item => (
                <div key={item.l} style={{ gridColumn: 'span 2' }}>
                  <p style={{ color: colors.muted, margin: '0 0 4px', fontSize: '0.75rem' }}>{item.l}</p>
                  <p style={{ color: colors.text, margin: 0, lineHeight: '1.6', fontWeight: '500' }}>{item.v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={label}>Applications — {selectedUser.name}</p>
            {selectedApps.length === 0 ? (
              <p style={{ color: colors.muted, fontSize: '0.875rem', margin: 0 }}>No applications yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedApps.map(app => (
                  <div key={app.id} style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: colors.text, margin: 0, fontWeight: '600', fontSize: '0.875rem' }}>{app.company}</p>
                      <p style={{ color: colors.muted, margin: '2px 0 0', fontSize: '0.8rem' }}>{app.position}</p>
                      {app.notes && <p style={{ color: colors.subtle, margin: '2px 0 0', fontSize: '0.75rem' }}>{app.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <p style={{ color: colors.subtle, fontSize: '0.75rem', margin: 0 }}>{app.applied_date}</p>
                      <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', background: statusConfig[app.status]?.bg || '#1a2744', color: statusConfig[app.status]?.color || '#60a5fa', fontWeight: '600' }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}