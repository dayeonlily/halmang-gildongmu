import { useId } from 'react'
import { ArtId, Defs } from './art/parts'
import { SCENES } from './art/scenes'

// 이야기의 한 줄(index)에 맞는 수채화풍 2D 그림. 이야기가 바뀌거나 줄이 넘어가면 부드럽게 바뀐다.
export default function StoryArt({ storyId, index, label }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const list = SCENES[storyId] ?? SCENES.seolmundae
  const Scene = list[Math.min(index, list.length - 1)]
  return (
    <ArtId.Provider value={id}>
      <svg key={`${storyId}-${index}`} className="story-art" viewBox="0 0 400 280" role="img" aria-label={label}>
        <Defs id={id} />
        <g filter={`url(#wc-${id})`}><Scene /></g>
        <rect width="400" height="280" filter={`url(#grain-${id})`} opacity=".32" style={{ pointerEvents: 'none' }} />
        <rect x="3" y="3" width="394" height="274" rx="10" fill="none" stroke="#e1cfae" strokeWidth="6" />
      </svg>
    </ArtId.Provider>
  )
}
