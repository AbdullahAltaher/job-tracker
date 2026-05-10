import { useState, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabaseClient'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true
})

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

const sectionStyle = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1rem',
}

export default function Profile() {
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
      console.error(error)
      alert('Error saving profile: ' + error.message)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '2rem' }}>

      <div style={{ ...sectionStyle, textAlign: 'center' }}>
        <label style={{ cursor: 'pointer' }}>
          <div style={{ border: '1px dashed #333', borderRadius: '8px', padding: '2rem' }}>
            <p style={{ color: loading ? '#60a5fa' : '#888', margin: 0, fontSize: '0.9rem' }}>
              {loading ? 'Reading your CV...' : 'Click to upload your CV (PDF)'}
            </p>
          </div>
          <input type="file" accept=".pdf" onChange={handleCV} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Personal Info</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input style={inputStyle} placeholder="Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          <input style={inputStyle} placeholder="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          <input style={inputStyle} placeholder="Phone" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Education</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input style={inputStyle} placeholder="University" value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} />
          <input style={inputStyle} placeholder="Major" value={profile.major} onChange={e => setProfile({ ...profile, major: e.target.value })} />
          <input style={inputStyle} placeholder="GPA" type="number" step="0.01" min="0" max="4" value={profile.gpa} onChange={e => setProfile({ ...profile, gpa: e.target.value })} />
          <input style={inputStyle} placeholder="Graduation Year" type="number" min="2000" max="2030" value={profile.graduation_year} onChange={e => setProfile({ ...profile, graduation_year: e.target.value })} />
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Skills</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input style={inputStyle} placeholder="Technical Skills (React, Python, etc.)" value={profile.technical_skills} onChange={e => setProfile({ ...profile, technical_skills: e.target.value })} />
          <input style={inputStyle} placeholder="Languages (Arabic, English, etc.)" value={profile.languages} onChange={e => setProfile({ ...profile, languages: e.target.value })} />
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Experience</p>
        <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Your work experience..." value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} />
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Projects</p>
        <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Your projects..." value={profile.projects} onChange={e => setProfile({ ...profile, projects: e.target.value })} />
      </div>

      <div style={sectionStyle}>
        <p style={{ color: '#fff', fontWeight: '500', marginBottom: '1rem', marginTop: 0 }}>Summary</p>
        <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Your summary..." value={profile.summary} onChange={e => setProfile({ ...profile, summary: e.target.value })} />
      </div>

      {saved && <p style={{ color: '#4ade80', textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>Profile saved successfully!</p>}

      <button onClick={saveProfile} disabled={saving} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', width: '100%' }}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>

    </div>
  )
}