import { site } from '../../content'
import GlassButton from '../glass/GlassButton'
import { GitHubIcon, LinkedInIcon } from '../icons/Brand'
import { cardClass } from './card'
import CopyEmail from './CopyEmail'

/** Contact options for the mobile flow: email text, copy control and profile links. */
export default function ContactCard() {
  return (
    <div data-card="contact" className={`${cardClass} flex flex-col gap-4`}>
      <h2 className="text-title font-semibold">Get in touch</h2>
      <p className="text-body break-all">{site.email}</p>
      <div className="flex flex-wrap gap-3">
        <CopyEmail />
        <GlassButton as="a" href={site.linkedin} target="_blank" rel="noopener noreferrer" icon={<LinkedInIcon />}>
          LinkedIn
        </GlassButton>
        <GlassButton as="a" href={site.github} target="_blank" rel="noopener noreferrer" icon={<GitHubIcon />}>
          GitHub
        </GlassButton>
      </div>
    </div>
  )
}
