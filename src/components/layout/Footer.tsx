import { site } from '../../content'
import { GitHubIcon, LinkedInIcon } from '../icons/Brand'
import GlassButton from '../glass/GlassButton'

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 px-4 pb-32 pt-12 text-center lg:px-12 lg:py-12">
      <div className="hidden gap-3 lg:flex">
        <GlassButton as="a" href={site.github} target="_blank" rel="noopener noreferrer" icon={<GitHubIcon />}>
          GitHub
        </GlassButton>
        <GlassButton as="a" href={site.linkedin} target="_blank" rel="noopener noreferrer" icon={<LinkedInIcon />}>
          LinkedIn
        </GlassButton>
      </div>
      <p className="text-body-sm text-ink-2">© 2026 {site.name}</p>
    </footer>
  )
}
