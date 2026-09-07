import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function MasterResumeEditor({ resumeData, onSave }) {
  const [formData, setFormData] = useState(resumeData || {});
  const [skillInput, setSkillInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(resumeData || {});
  }, [resumeData]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const newSkills = [...(formData.skills || []), skillInput.trim()];
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setSkillInput('');
  };

  const handleRemoveSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleAddExperience = () => {
    const newExp = {
      id: 'exp-' + Date.now(),
      jobTitle: 'Software Engineer',
      company: 'Company Name',
      location: 'Location',
      startDate: '2023-01',
      endDate: 'Present',
      highlights: ['Achieved core target metric by implementing efficient solution.']
    };
    setFormData(prev => ({ ...prev, experience: [...(prev.experience || []), newExp] }));
  };

  const handleRemoveExperience = (index) => {
    const newExp = formData.experience.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const handleSave = async () => {
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3>Master Resume Storage</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            This baseline data will be dynamically re-written and reformatted to match each job description you target.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {savedSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          {savedSuccess ? 'Saved!' : 'Save Master Resume'}
        </button>
      </div>

      <div className="grid-2">
        {/* Personal Info */}
        <div>
          <h4 style={{ marginBottom: '14px', color: '#00f2fe' }}>Contact Information</h4>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.personalInfo?.fullName || ''}
              onChange={e => handleChange('personalInfo', 'fullName', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.personalInfo?.email || ''}
                onChange={e => handleChange('personalInfo', 'email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.personalInfo?.phone || ''}
                onChange={e => handleChange('personalInfo', 'phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.personalInfo?.location || ''}
              onChange={e => handleChange('personalInfo', 'location', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professional Summary</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.summary || ''}
              onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            />
          </div>
        </div>

        {/* Skills & Experience */}
        <div>
          <h4 style={{ marginBottom: '14px', color: '#00f2fe' }}>Master Skillset Keywords</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add skill (e.g. React, Python, Playwright)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
            />
            <button className="btn btn-secondary" onClick={handleAddSkill}>
              <Plus size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {(formData.skills || []).map((skill, index) => (
              <span key={index} className="badge badge-cyan" style={{ fontSize: '0.85rem' }}>
                {skill}
                <Trash2
                  size={12}
                  style={{ marginLeft: '6px', cursor: 'pointer' }}
                  onClick={() => handleRemoveSkill(index)}
                />
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#00f2fe' }}>Work Experience</h4>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={handleAddExperience}>
              <Plus size={14} /> Add Role
            </button>
          </div>

          {(formData.experience || []).map((exp, index) => (
            <div key={exp.id || index} style={{
              background: 'rgba(11, 15, 23, 0.5)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{exp.jobTitle} @ {exp.company}</strong>
                <Trash2 size={16} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleRemoveExperience(index)} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{exp.startDate} - {exp.endDate} ({exp.location})</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
