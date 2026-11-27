import { projects } from '../../content'
import { Monogram } from '../art'
import {
  AboutMini,
  CareerRuler,
  ClockCard,
  ContactCard,
  ExperienceMini,
  Hero,
  PersonalityCard,
  ProjectCard,
  ResumeBanner,
  StackCard,
  ThemeToggle,
} from '../cards'
import Reveal from './Reveal'

/** Mobile flow (<1024px). Hidden at lg+, where DesktopGrid takes over. Footer is rendered once by App. */
export default function MobileHome() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-12 px-4 lg:hidden">
      <section id="m-home" aria-label="Home" className="flex min-h-[calc(100svh-120px)] flex-col gap-4">
        <header className="flex items-center justify-between">
          <Monogram className="size-10 text-ink" />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col justify-center">
          <Hero showMonogram={false} />
        </div>
      </section>

      <section id="m-projects" aria-labelledby="m-projects-h" className="flex scroll-mt-6 flex-col gap-6">
        <h2 id="m-projects-h" className="text-h2 font-semibold">
          Selected projects
        </h2>
        {projects.map((p) => (
          <Reveal key={p.slug}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </section>

      <section id="m-about" aria-label="About" className="flex scroll-mt-6 flex-col gap-6">
        <Reveal><AboutMini /></Reveal>
        <Reveal><ExperienceMini /></Reveal>
        <Reveal><CareerRuler /></Reveal>
        <Reveal><ClockCard /></Reveal>
        <Reveal><StackCard /></Reveal>
        <Reveal><PersonalityCard /></Reveal>
      </section>

      <section id="m-contact" aria-label="Contact" className="flex min-h-[40svh] scroll-mt-6 flex-col gap-6">
        <Reveal><ContactCard /></Reveal>
        <Reveal><ResumeBanner /></Reveal>
      </section>
    </div>
  )
}
