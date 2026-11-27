import { getProject } from '../../content'
import {
  AboutMini,
  CareerRuler,
  ClockCard,
  ExperienceMini,
  Hero,
  PersonalityCard,
  ProjectCard,
  ResumeBanner,
  StackCard,
  ThemeCard,
} from '../cards'
import Reveal from './Reveal'

/**
 * `grow` marks the one slot per column that absorbs leftover column height, so column bottoms
 * line up. The natural column heights are tuned (card order, the tall card's aspect ratio, hero
 * type size) so the absorbed amount stays small: art panels stay roughly square and the About
 * card (avatar top, text bottom) only gains a little air. tests/e2e/layout.spec.ts checks it.
 */
const grow = 'flex flex-1 flex-col [&>*]:flex-1'

function P({ slug, absorb = false }: { slug: string; absorb?: boolean }) {
  const project = getProject(slug)
  if (!project) return null
  return (
    <Reveal className={absorb ? grow : undefined}>
      <ProjectCard project={project} />
    </Reveal>
  )
}

const col = 'flex min-w-0 flex-col gap-8'

/** Desktop bento (>=1024px): hero top-centre, Ask Introhive tall top-left. Hidden below lg. */
export default function DesktopGrid() {
  return (
    <div className="mx-auto hidden w-full max-w-[1440px] px-12 lg:grid lg:grid-cols-3 lg:gap-8">
      <div data-testid="grid-col-1" className={col}>
        <P slug="ask-introhive" />
        <P slug="slang-or-not" absorb />
        <Reveal><CareerRuler /></Reveal>
        <Reveal><ClockCard /></Reveal>
      </div>
      <div data-testid="grid-col-2" className={col}>
        <Hero />
        <Reveal className={grow}><AboutMini /></Reveal>
        <Reveal><ExperienceMini /></Reveal>
        <Reveal><ResumeBanner /></Reveal>
        <Reveal><PersonalityCard /></Reveal>
      </div>
      <div data-testid="grid-col-3" className={col}>
        <Reveal><ThemeCard /></Reveal>
        <P slug="plant-as-battery" absorb />
        <P slug="introhive-mcp" />
        <Reveal><StackCard /></Reveal>
      </div>
    </div>
  )
}
