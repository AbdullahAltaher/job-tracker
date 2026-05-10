import { useState, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabaseClient'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true
})

export default function Profile({ colors, input, card }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '',
    university: '', major: '',
    gpa: '', graduation_year: '',
    technical_skills: '', languages: '',
    experience: '', projects: '', summary: ''
  })

  const label = {
    color: colors.muted,
    fontSize: '0.75rem',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    marginTop: 0,
    display: 'block',
  }

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          university: data.university || '',
          major: data.major || '',
          gpa: data.gpa || '',
          graduation_year: data.graduation_year || '',
          technical_skills: data.technical_skills || '',
          languages: data.languages || '',
          experience: data.experience || '',
          projects: data.projects || '',
          summary: data.summary || ''
        })
      }
    }
    loadProfile()
  }, [])

  async function handleCV(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]

      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 }
            },
            {
              type: 'text',
              text: `Extract information from this CV and return ONLY a JSON object with these exact fields:
              {
                "name": "",
                "email": "",
                "phone": "",
                "university": "",
                "major": "",
                "gpa": 0.0,
                "graduation_year": 0,
                "technical_skills": "",
                "languages": "",
                "experience": "",
                "projects": "",
                "summary": ""
              }
              Rules:
              - gpa must be a number like 3.75 not a string
              - graduation_year must be a number like 2024 not a string
              - Return only the JSON, no explanation`
            }
          ]
        }]
      })

      try {
        const text = response.content[0].text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0])
          setProfile({
            name: json.name || '',
            email: json.email || '',
            phone: json.phone || '',
            university: json.university || '',
            major: json.major || '',
            gpa: json.gpa || '',
            graduation_year: json.graduation_year || '',
            technical_skills: json.technical_skills || '',
            languages: json.languages || '',
            experience: json.experience || '',
            projects: json.projects || '',
            summary: json.summary || ''
          })
        } else {
          alert('Could not parse CV. Try again.')
        }
      } catch (err) {
        console.error('Parse error:', err)
        alert('Could not read CV. Make sure it is a PDF.')
      }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        university: profile.university,
        major: profile.major,
        gpa: parseFloat(profile.gpa) || null,
        graduation_year: parseInt(profile.graduation_year) || null,
        technical_skills: profile.technical_skills,
        languages: profile.languages,
        experience: profile.experience,
        projects: profile.projects,
        summary: profile.summary
      })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Error saving profile: ' + error.message)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>

      <label style={{ display: 'block', background: colors.surface, border: `1px dashed ${colors.border}`, borderRadius: '14px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.2s' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{loading ? '⏳' : '📄'}</div>
        <p style={{ color: loading ? '#6366f1' : colors.muted, margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
          {loading ? 'Reading your CV with AI...' : 'Upload CV to auto-fill profile'}
        </p>
        <p style={{ color: colors.subtle, margin: '4px 0 0', fontSize: '0.75rem' }}>PDF files only</p>
        <input type="file" accept=".pdf" onChange={handleCV} style={{ display: 'none' }} />
      </label>

      <div style={card}>
        <p style={label}>Personal Info</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input style={input} placeholder="Full name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          <input style={input} placeholder="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          <input style={input} placeholder="Phone" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
        </div>
      </div>

      <div style={card}>
        <p style={label}>Education</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input style={input} placeholder="University" value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} />
          <input style={input} placeholder="Major" value={profile.major} onChange={e => setProfile({ ...profile, major: e.target.value })} />
          <input style={input} placeholder="GPA" type="number" step="0.01" min="0" max="4" value={profile.gpa} onChange={e => setProfile({ ...profile, gpa: e.target.value })} />
          <input style={input} placeholder="Graduation Year" type="number" min="2000" max="2030" value={profile.graduation_year} onChange={e => setProfile({ ...profile, graduation_year: e.target.value })} />
        </div>
      </div>

      <div style={card}>
        <p style={label}>Skills</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input style={input} placeholder="Technical skills (React, Python, etc.)" value={profile.technical_skills} onChange={e => setProfile({ ...profile, technical_skills: e.target.value })} />
          <input style={input} placeholder="Languages (Arabic, English, etc.)" value={profile.languages} onChange={e => setProfile({ ...profile, languages: e.target.value })} />
        </div>
      </div>

      <div style={card}>
        <p style={label}>Experience</p>
        <textarea style={{ ...input, minHeight: '100px', resize: 'vertical' }} placeholder="Your work experience..." value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} />
      </div>

      <div style={card}>
        <p style={label}>Projects</p>
        <textarea style={{ ...input, minHeight: '100px', resize: 'vertical' }} placeholder="Your projects..." value={profile.projects} onChange={e => setProfile({ ...profile, projects: e.target.value })} />
      </div>

      <div style={card}>
        <p style={label}>Summary</p>
        <textarea style={{ ...input, minHeight: '100px', resize: 'vertical' }} placeholder="A short bio..." value={profile.summary} onChange={e => setProfile({ ...profile, summary: e.target.value })} />
      </div>

      {saved && (
        <div style={{ background: '#0a2818', border: '1px solid #10b98133', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#34d399' }}>✓</span>
          <p style={{ color: '#34d399', margin: 0, fontSize: '0.875rem' }}>Profile saved successfully</p>
        </div>
      )}

      <button onClick={saveProfile} disabled={saving} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', width: '100%', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>

    </div>
  )
}