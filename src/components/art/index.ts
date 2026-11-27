import type { ComponentType } from 'react'
import type { ArtId } from '../../content/types'
import McpDiagram from './McpDiagram'
import Monogram, { type ArtProps } from './Monogram'
import PlantLoop from './PlantLoop'
import RagDiagram from './RagDiagram'
import SlangPair from './SlangPair'

export { McpDiagram, Monogram, PlantLoop, RagDiagram, SlangPair }
export type { ArtProps }

export const ART: Record<ArtId, ComponentType<ArtProps>> = {
  rag: RagDiagram,
  mcp: McpDiagram,
  plant: PlantLoop,
  slang: SlangPair,
}
