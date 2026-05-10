import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const sectionStyle = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1rem',
}

export default function Admin() {
  const [users, setUsers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function loadData() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

      const { data: apps } = await supabase
        .from('applications')
        .select('*')

      setUsers(profiles || [])
      setApplications(apps || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <p style={{ color: '#fff', padding: '2rem' }}>Loading...</p>

  const selectedUser = users.find(u => u.user_id === selected)
  const selectedApps = applications.filter(a => a.user_id === selected)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '2rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>Total Users</p>
          <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{users.length}</p>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>Total Applications</p>
          <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{applications.length}</p>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>Interviews</p>
          <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{applications.filter(a => a.status === 'interview').length}</p>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginTop: 0, marginBottom: '1rem' }}>All Users</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map(user => (
            <div
              key={user.user_id}
              onClick={() => setSelected(selected === user.user_id ? null : user.user_id)}
              style={{
                background: selected === user.user_id ? '#2a2a2a' : '#111',
                border: `1px solid ${selected === user.user_id ? '#444' : '#2a2a2a'}`,
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ color: '#fff', margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>{user.name || 'No name'}</p>
                <p style={{ color: '#888', margin: '2px 0 0', fontSize: '0.8rem' }}>{user.email} — {user.university || 'No university'}</p>
              </div>
              <span style={{ color: '#555', fontSize: '0.8rem' }}>
                {applications.filter(a => a.user_id === user.user_id).length} apps
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && selectedUser && (
        <>
          <div style={sectionStyle}>
            <p style={{ color: '#fff', fontWeight: '500', marginTop: 0, marginBottom: '1rem' }}>Profile — {selectedUser.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Email</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.email || '—'}</p>
              </div>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Phone</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.phone || '—'}</p>
              </div>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>University</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.university || '—'}</p>
              </div>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Major</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.major || '—'}</p>
              </div>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>GPA</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.gpa || '—'}</p>
              </div>
              <div>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Graduation Year</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.graduation_year || '—'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Technical Skills</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.technical_skills || '—'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Languages</p>
                <p style={{ color: '#fff', margin: 0 }}>{selectedUser.languages || '—'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Experience</p>
                <p style={{ color: '#fff', margin: 0, lineHeight: '1.6' }}>{selectedUser.experience || '—'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Projects</p>
                <p style={{ color: '#fff', margin: 0, lineHeight: '1.6' }}>{selectedUser.projects || '—'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ color: '#888', margin: '0 0 2px' }}>Summary</p>
                <p style={{ color: '#fff', margin: 0, lineHeight: '1.6' }}>{selectedUser.summary || '—'}</p>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ color: '#fff', fontWeight: '500', marginTop: 0, marginBottom: '1rem' }}>Applications — {selectedUser.name}</p>
            {selectedApps.length === 0 ? (
              <p style={{ color: '#555', fontSize: '0.875rem' }}>No applications yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedApps.map(app => (
                  <div key={app.id} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#fff', margin: 0, fontWeight: '500', fontSize: '0.875rem' }}>{app.company}</p>
                      <p style={{ color: '#888', margin: '2px 0 0', fontSize: '0.8rem' }}>{app.position}</p>
                      {app.notes && <p style={{ color: '#555', margin: '2px 0 0', fontSize: '0.8rem' }}>{app.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>{app.applied_date}</p>
                      <span style={{
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: app.status === 'offer' ? '#2a2a0a' : app.status === 'interview' ? '#1a3a2a' : app.status === 'rejected' ? '#3a1a1a' : '#1e3a5f',
                        color: app.status === 'offer' ? '#facc15' : app.status === 'interview' ? '#4ade80' : app.status === 'rejected' ? '#f87171' : '#60a5fa'
                      }}>
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