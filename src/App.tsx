import { useEffect, useState } from 'react'
import DesktopGrid from './components/layout/DesktopGrid'
import BottomBlur from './components/layout/BottomBlur'
import Footer from './components/layout/Footer'
import MobileDock from './components/layout/MobileDock'
import MobileHome from './components/layout/MobileHome'
import Overlay from './components/overlay/Overlay'
import About from './components/pages/About'
import CaseStudy from './components/pages/CaseStudy'
import { getProject, site, type Project } from './content'
import { useLenis } from './lib/motion'
import { RouterProvider, useRoute } from './lib/router'

function Routes() {
  const route = useRoute()
  const project = route.name === 'project' ? getProject(route.slug) : undefined

  // Keep the last project so its overlay can animate out after the route leaves it.
  const [shown, setShown] = useState<Project | undefined>(project)
  if (project && project !== shown) setShown(project)

  useEffect(() => {
    if (route.name === 'home') document.title = site.name
  }, [route.name])

  return (
    <>
      <main className="min-h-svh bg-page py-6 lg:py-12">
        <DesktopGrid />
        <MobileHome />
        <Footer />
      </main>
      {route.name === 'home' && (
        <>
          <BottomBlur />
          <MobileDock />
        </>
      )}
      <Overlay open={project !== undefined} label={shown?.title ?? ''}>
        {shown && <CaseStudy project={shown} />}
      </Overlay>
      <Overlay open={route.name === 'about'} label="About">
        <About />
      </Overlay>
    </>
  )
}

export default function App() {
  // Smooth scroll on desktop only; useLenis skips touch, narrow viewports and reduced motion.
  useLenis()
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  )
}
