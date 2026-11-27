import type { Role } from './types'

// Titles, orgs and dates are copied from the resume (spec 5.1). Summaries are drafts.
export const experience: Role[] = [
  {
    org: 'Introhive Services Inc.',
    title: 'Associate Machine Learning Engineer',
    start: '2026-10',
    end: null,
    kind: 'part-time',
    summary: 'Part-time on the ML/AI team, including test automation for the Introhive MCP tools.',
    draft: true,
  },
  {
    org: 'Introhive Services Inc.',
    title: 'Associate Machine Learning Engineer',
    start: '2025-05',
    end: '2026-04',
    kind: 'co-op',
    summary:
      'Built features on a production generative-AI platform and shipped its customer-data deletion pipeline.',
    draft: true,
  },
  {
    org: 'University of New Brunswick',
    title: 'Teaching Assistant, Information to Cybersecurity',
    start: '2025-01',
    end: '2025-04',
    kind: 'term',
    summary: 'Led tutorials and graded assignments on encryption, database security and access control.',
    draft: true,
  },
  {
    org: 'Sonrai Security Inc.',
    title: 'Junior Software Development Engineer in Test',
    start: '2024-09',
    end: '2024-12',
    kind: 'term',
    summary:
      'Wrote regression and Python/AWS Lambda automation tests for a cloud permission firewall.',
    draft: true,
  },
  {
    org: 'University of New Brunswick',
    title: 'Teaching Assistant, Multiple Programming Languages',
    start: '2024-01',
    end: '2024-04',
    kind: 'term',
    summary: 'Helped in labs covering Python, JavaScript, Racket and Octave, plus REST API design.',
    draft: true,
  },
]
