import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Download, Send, Eye } from 'lucide-react';

export default function JobAnalyzer({ onStartAutomation, onSaveApplication }) {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Indeed Partner Inc');
  const [jobUrl, setJobUrl] = useState('https://www.indeed.com/viewjob?jk=example123');
  const [jobDescription, setJobDescription] = useState(`We are seeking a Senior Full Stack Engineer with strong proficiency in React, Node.js, Python, PostgreSQL, and AWS. Responsibilities include building scalable REST APIs, microservices, and leading frontend web performance initiatives. Experience with Docker, automated testing with Playwright or Cypress, and CI/CD pipelines is highly preferred.`);
  const [apiKey, setApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobDescription,
          apiKey
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Error tailoring resume: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewHtml = async () => {
    if (!result?.tailoredResume) return;
    try {
      const res = await fetch('/api/resume/preview-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.tailoredResume)
      });
      const html = await res.text();
      setPreviewHtml(html);
      setShowPreviewModal(true);
    } catch (e) {
      alert('Failed to generate preview: ' + e.message);
    }
  };

  const handleSendToAutomator = async () => {
    if (!result) return;

    // Save record to applications history
    await onSaveApplication({
      jobTitle,
      companyName,
      jobUrl,
      matchScore: result.matchScore,
      status: 'Ready to Apply'
    });

    // Send payload to auto-fill assistant tab
    onStartAutomation({
      jobUrl,
      jobTitle,
      companyName,
      tailoredResume: result.tailoredResume
    });
  };

  return (
    <div className="glass-panel">
      <div style={{ marginBottom: '24px' }}>
        <h3>Job Description & AI Resume Re-former</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Paste a job posting below to instantly match keywords, re-write your resume summary, and tailor your experience bullet points.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Column */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="form-input"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Indeed / Job Application URL</label>
            <input
              type="url"
              className="form-input"
              value={jobUrl}
              onChange={e => setJobUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description Text</label>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste full job posting requirements here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gemini API Key (Optional for Deep AI Rewrite)</label>
            <input
              type="password"
              className="form-input"
              placeholder="AI API Key (Leave blank to use Smart Engine)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            onClick={handleTailor}
            disabled={loading}
          >
            <Sparkles size={20} />
            {loading ? 'Analyzing & Re-writing Resume...' : 'Re-form Resume for this Job'}
          </button>
        </div>

        {/* Results Column */}
        <div>
          {!result ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <Sparkles size={48} style={{ color: '#4facfe', marginBottom: '16px', opacity: 0.5 }} />
              <h4>Ready to Tailor</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Fill out the job details on the left and click "Re-form Resume" to see your tailored match report.
              </p>
            </div>
          ) : (
            <div>
              {/* Match Score Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 242, 254, 0.1)',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                marginBottom: '20px'
              }}>
                <div>
                  <h4 style={{ margin: 0 }}>Keyword Match Score</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Targeted against {result.targetKeywords?.length || 0} core requirements
                  </p>
                </div>
                <div style={{
                  fontSize: '2.2rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: result.matchScore >= 75 ? '#10b981' : '#f59e0b'
                }}>
                  {result.matchScore}%
                </div>
              </div>

              {/* Keyword Badges */}
              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Extracted Job Keywords:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {(result.targetKeywords || []).map((kw, i) => (
                    <span key={i} className="badge badge-cyan">
                      <CheckCircle2 size={12} /> {kw}
                    </span>
                  ))}
                </div>
              </div>

              {result.missingKeywords?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span className="form-label" style={{ color: '#f59e0b' }}>Suggested Additions:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} className="badge badge-amber">
                        <AlertTriangle size={12} /> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailored Summary Box */}
              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Re-written Professional Summary:</span>
                <div style={{
                  background: 'rgba(11, 15, 23, 0.6)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem'
                }}>
                  {result.tailoredResume?.summary}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePreviewHtml}>
                  <Eye size={18} /> Preview PDF
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSendToAutomator}>
                  <Send size={18} /> Launch Auto-Fill <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HTML Preview Modal */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: '#1a202c',
              padding: '14px 20px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              color: '#ffffff'
            }}>
              <strong>Tailored Resume ATS Preview</strong>
              <button
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              style={{ width: '100%', height: '75vh', border: 'none' }}
              title="Resume Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
