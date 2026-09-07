const https = require('https');

/**
 * Extract keywords and core requirements from job text
 */
function parseJobDescription(jobText) {
  const commonTechSkills = [
    'javascript', 'typescript', 'react', 'react native', 'vue', 'angular', 'next.js',
    'node.js', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'spring',
    'c++', 'c#', '.net', 'golang', 'rust', 'ruby', 'rails', 'php', 'laravel',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'git',
    'rest api', 'graphql', 'grpc', 'microservices', 'serverless', 'unit testing',
    'playwright', 'cypress', 'selenium', 'jest', 'agile', 'scrum', 'system design'
  ];

  const lowerText = jobText.toLowerCase();
  const foundSkills = [];

  commonTechSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill.toUpperCase());
    }
  });

  return {
    rawLength: jobText.length,
    keywords: Array.from(new Set(foundSkills))
  };
}

/**
 * Calculate match score between master resume and target job keywords
 */
function calculateMatchScore(masterResume, jobKeywords) {
  if (!jobKeywords || jobKeywords.length === 0) return 100;

  const resumeSkillsUpper = (masterResume.skills || []).map(s => s.toUpperCase());
  const masterTextUpper = JSON.stringify(masterResume).toUpperCase();

  let matched = 0;
  jobKeywords.forEach(kw => {
    if (resumeSkillsUpper.includes(kw) || masterTextUpper.includes(kw)) {
      matched++;
    }
  });

  return Math.min(100, Math.round((matched / jobKeywords.length) * 100));
}

/**
 * Re-write & tailor resume based on job description
 */
async function generateTailoredResume(masterResume, jobTitle, companyName, jobDescription, apiKey = null) {
  const parsedJob = parseJobDescription(jobDescription);
  const matchScore = calculateMatchScore(masterResume, parsedJob.keywords);

  // Identify missing skills
  const resumeSkillsUpper = (masterResume.skills || []).map(s => s.toUpperCase());
  const missingKeywords = parsedJob.keywords.filter(kw => !resumeSkillsUpper.includes(kw));

  // If Gemini API key is provided, perform deep AI rewrite
  if (apiKey) {
    try {
      const aiResult = await callGeminiApi(masterResume, jobTitle, companyName, jobDescription, apiKey);
      if (aiResult) {
        return {
          ...aiResult,
          matchScore: matchScore,
          targetKeywords: parsedJob.keywords,
          missingKeywords: missingKeywords
        };
      }
    } catch (err) {
      console.error('[TAILOR] AI API Error, falling back to smart local tailor:', err.message);
    }
  }

  // Intelligent Local Rule Engine
  const tailoredSummary = `Results-driven ${jobTitle || masterResume.experience[0]?.jobTitle || 'Engineer'} with expertise in ${parsedJob.keywords.slice(0, 5).join(', ') || 'software development'}. Proven record of delivering scalable solutions, optimizing performance, and exceeding project expectations at top-tier organizations like ${companyName || 'leading tech firms'}.`;

  const tailoredSkills = Array.from(new Set([
    ...parsedJob.keywords,
    ...masterResume.skills
  ]));

  const tailoredExperience = (masterResume.experience || []).map(exp => {
    return {
      ...exp,
      highlights: exp.highlights.map(highlight => {
        // Highlight matching skills in bullet points
        let enhancedHighlight = highlight;
        parsedJob.keywords.slice(0, 3).forEach(kw => {
          if (!enhancedHighlight.toUpperCase().includes(kw) && Math.random() > 0.4) {
            enhancedHighlight += ` Utilizing ${kw} for maximum reliability.`;
          }
        });
        return enhancedHighlight;
      })
    };
  });

  const coverLetter = `Dear Hiring Manager at ${companyName || 'the Team'},\n\nI am writing to express my enthusiastic interest in the ${jobTitle || 'Role'} position. With my background in ${tailoredSkills.slice(0, 4).join(', ')}, I am confident in my ability to immediately contribute to your team's goals.\n\nIn my previous role at ${masterResume.experience[0]?.company || 'Tech Companies'}, I ${masterResume.experience[0]?.highlights[0] || 'delivered robust solutions'}. I am impressed by ${companyName || 'your company'}'s mission and would welcome the opportunity to discuss how my skill set aligns with your team.\n\nThank you for your time and consideration.\n\nSincerely,\n${masterResume.personalInfo.fullName}`;

  return {
    jobTitle: jobTitle || 'Tailored Position',
    companyName: companyName || 'Target Company',
    matchScore: matchScore,
    targetKeywords: parsedJob.keywords,
    missingKeywords: missingKeywords,
    tailoredResume: {
      personalInfo: masterResume.personalInfo,
      summary: tailoredSummary,
      skills: tailoredSkills,
      experience: tailoredExperience,
      education: masterResume.education,
      projects: masterResume.projects
    },
    coverLetter: coverLetter
  };
}

function callGeminiApi(masterResume, jobTitle, company, jdText, apiKey) {
  return new Promise((resolve, reject) => {
    const prompt = `You are an expert resume reviewer and career coach.
    Re-format and tailor the following base resume specifically for the job title "${jobTitle}" at "${company}".
    
    Job Description:
    ${jdText}
    
    Base Resume:
    ${JSON.stringify(masterResume)}
    
    Return a JSON object with keys:
    "tailoredResume": object with personalInfo, summary, skills (array), experience (array of objects with jobTitle, company, location, startDate, endDate, highlights), education, projects.
    "coverLetter": tailored cover letter text string.
    DO NOT fabricate false credentials or degrees.`;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates[0].content.parts[0].text;
          resolve(JSON.parse(text));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = {
  parseJobDescription,
  calculateMatchScore,
  generateTailoredResume
};
