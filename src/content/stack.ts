import type { Stack } from './types'

// Groups follow the technical skills section of the resume.
export const stack: Stack = {
  groups: [
    { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'C'] },
    { group: 'AI / ML', items: ['LangChain', 'LangGraph', 'RAG', 'Vector databases', 'MCP', 'scikit-learn', 'PyTorch'] },
    { group: 'Backend & frameworks', items: ['FastAPI', 'Django', 'Spring Boot', 'Node.js', 'React', 'Next.js'] },
    { group: 'Cloud & data', items: ['AWS', 'Docker', 'GitHub Actions', 'PostgreSQL', 'MongoDB', 'Snowflake', 'Redis'] },
  ],
  draft: true,
}
