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
        <defs><radialGradient id={`vg-${id}`} cx="50%" cy="50%" r="75%"><stop offset="62%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#c9a37a" stopOpacity=".3" /></radialGradient></defs>
        <g><Scene /></g>
        <rect width="400" height="280" filter={`url(#grain-${id})`} opacity=".5" style={{ pointerEvents: 'none' }} />
        <rect width="400" height="280" fill={`url(#vg-${id})`} style={{ pointerEvents: 'none' }} />
        <rect x="2" y="2" width="396" height="276" rx="14" fill="none" stroke="#a88468" strokeOpacity=".75" strokeWidth="3" />
      </svg>
    </ArtId.Provider>
  )
}
