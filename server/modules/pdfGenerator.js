const fs = require('fs');
const path = require('path');

/**
 * Generate a clean ATS-optimized HTML/CSS string for the resume
 */
function generateResumeHtml(tailoredResumeData) {
  const { personalInfo, summary, skills, experience, education, projects } = tailoredResumeData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${personalInfo.fullName} - Resume</title>
<style>
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1a202c;
    line-height: 1.5;
    margin: 0;
    padding: 40px;
    background: #ffffff;
  }
  .header {
    border-bottom: 2px solid #2b6cb0;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .name {
    font-size: 26px;
    font-weight: 700;
    color: #1a365d;
    margin: 0 0 5px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .contact-info {
    font-size: 13px;
    color: #4a5568;
  }
  .contact-info span {
    margin-right: 12px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #2b6cb0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin: 20px 0 10px 0;
  }
  .summary {
    font-size: 13.5px;
    color: #2d3748;
    margin-bottom: 15px;
  }
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 15px;
  }
  .skill-badge {
    background: #edf2f7;
    color: #2d3748;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .job-item {
    margin-bottom: 15px;
  }
  .job-header {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;
    color: #2d3748;
  }
  .job-sub {
    font-size: 13px;
    color: #4a5568;
    font-style: italic;
    margin-bottom: 6px;
  }
  ul {
    margin: 0;
    padding-left: 20px;
  }
  li {
    font-size: 13px;
    color: #2d3748;
    margin-bottom: 4px;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${personalInfo.fullName}</div>
    <div class="contact-info">
      <span>📧 ${personalInfo.email}</span>
      <span>📞 ${personalInfo.phone}</span>
      <span>📍 ${personalInfo.location}</span>
      ${personalInfo.linkedin ? `<span>🔗 ${personalInfo.linkedin}</span>` : ''}
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <div class="summary">${summary}</div>

  <div class="section-title">Core Competencies & Technical Skills</div>
  <div class="skills-list">
    ${(skills || []).map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
  </div>

  <div class="section-title">Professional Experience</div>
  ${(experience || []).map(exp => `
    <div class="job-item">
      <div class="job-header">
        <span>${exp.jobTitle} — ${exp.company}</span>
        <span>${exp.startDate} - ${exp.endDate}</span>
      </div>
      <div class="job-sub">${exp.location}</div>
      <ul>
        ${(exp.highlights || []).map(bullet => `<li>${bullet}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  ${education && education.length > 0 ? `
    <div class="section-title">Education</div>
    ${education.map(edu => `
      <div class="job-item">
        <div class="job-header">
          <span>${edu.degree} — ${edu.institution}</span>
          <span>${edu.graduationYear}</span>
        </div>
      </div>
    `).join('')}
  ` : ''}

  ${projects && projects.length > 0 ? `
    <div class="section-title">Key Projects</div>
    ${projects.map(proj => `
      <div class="job-item">
        <div class="job-header">
          <span>${proj.title}</span>
        </div>
        <div class="summary">${proj.description}</div>
      </div>
    `).join('')}
  ` : ''}
</body>
</html>`;
}

module.exports = {
  generateResumeHtml
};
