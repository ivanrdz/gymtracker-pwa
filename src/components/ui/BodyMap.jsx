import { MUSCLE_GROUPS } from '../../data/exercises'

const MUSCLE_PATHS = {
  pecho:   { front: 'M 140,130 C 130,120 110,115 95,125 L 90,170 C 105,175 130,170 145,160 Z M 160,130 C 170,120 190,115 205,125 L 210,170 C 195,175 170,170 155,160 Z' },
  hombros: { front: 'M 85,115 C 70,105 60,115 58,130 L 70,140 C 80,130 88,120 95,115 Z M 215,115 C 230,105 240,115 242,130 L 230,140 C 220,130 212,120 205,115 Z' },
  biceps:  { front: 'M 60,140 C 50,145 45,160 48,175 L 62,175 C 60,165 60,152 70,142 Z M 240,140 C 250,145 255,160 252,175 L 238,175 C 240,165 240,152 230,142 Z' },
  triceps: { back:  'M 60,140 C 50,145 45,160 48,175 L 62,175 C 60,165 60,152 70,142 Z M 240,140 C 250,145 255,160 252,175 L 238,175 C 240,165 240,152 230,142 Z' },
  espalda: { back:  'M 105,115 C 120,110 150,108 165,108 C 180,108 210,110 195,115 L 200,185 C 185,195 165,198 150,198 C 135,198 115,195 100,185 Z' },
  abdomen: { front: 'M 130,170 L 170,170 L 175,225 L 125,225 Z' },
  piernas: {
    front: 'M 107,238 C 100,245 96,280 98,320 C 100,350 106,368 112,378 L 138,378 C 134,365 126,348 124,315 C 121,278 126,248 132,238 Z M 193,238 C 200,245 204,280 202,320 C 200,350 194,368 188,378 L 162,378 C 166,365 174,348 176,315 C 179,278 174,248 168,238 Z',
    back:  'M 107,238 C 100,248 97,280 99,315 L 128,315 C 126,278 128,248 133,238 Z M 193,238 C 200,248 203,280 201,315 L 172,315 C 174,278 172,248 167,238 Z'
  },
}

function HumanSVG({ activeMuscles = [], view = 'front', size = 160 }) {
  return (
    <svg viewBox="0 0 300 420" width={size} height={size * 1.4} style={{ display:'block', margin:'0 auto' }}>
      <g fill="var(--body-fill)" stroke="var(--body-stroke)" strokeWidth="1.5">
        <ellipse cx="150" cy="65" rx="30" ry="38" />
        <rect x="138" y="100" width="24" height="18" rx="4" />
        <path d="M 95,115 C 100,108 130,103 150,103 C 170,103 200,108 205,115 L 210,225 C 195,235 170,240 150,240 C 130,240 105,235 90,225 Z" />
        <path d="M 88,115 C 75,118 60,130 55,145 L 50,200 C 55,205 70,205 75,200 L 80,155 C 85,140 90,128 95,118 Z" />
        <path d="M 212,115 C 225,118 240,130 245,145 L 250,200 C 245,205 230,205 225,200 L 220,155 C 215,140 210,128 205,118 Z" />
        <path d="M 50,198 C 44,210 42,230 44,250 L 58,250 C 57,233 57,212 62,200 Z" />
        <path d="M 250,198 C 256,210 258,230 256,250 L 242,250 C 243,233 243,212 238,200 Z" />
        <path d="M 107,238 C 100,245 96,280 98,320 C 100,352 106,368 112,378 L 138,378 C 134,365 126,348 124,315 C 121,278 126,248 132,238 Z" />
        <path d="M 193,238 C 200,245 204,280 202,320 C 200,352 194,368 188,378 L 162,378 C 166,365 174,348 176,315 C 179,278 174,248 168,238 Z" />
        <path d="M 98,318 C 96,340 97,365 100,385 L 126,385 C 124,365 122,340 124,318 Z" />
        <path d="M 202,318 C 204,340 203,365 200,385 L 174,385 C 176,365 178,340 176,318 Z" />
        <ellipse cx="113" cy="392" rx="20" ry="8" />
        <ellipse cx="187" cy="392" rx="20" ry="8" />
      </g>
      {activeMuscles.map(muscle => {
        const paths = MUSCLE_PATHS[muscle]
        if (!paths) return null
        const pathD = paths[view] || paths.front || paths.back
        if (!pathD) return null
        return (
          <path key={muscle} d={pathD}
            fill={MUSCLE_GROUPS[muscle]?.color || '#ef4444'} fillOpacity="0.65"
            stroke={MUSCLE_GROUPS[muscle]?.color || '#ef4444'} strokeWidth="1" />
        )
      })}
      <text x="150" y="412" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
        {view === 'front' ? 'Frontal' : 'Posterior'}
      </text>
    </svg>
  )
}

export default function BodyMap({ activeMuscles = [], title = '' }) {
  return (
    <div className="body-map-container">
      {title && <p className="body-map-title">{title}</p>}
      <div className="body-map-views">
        <HumanSVG activeMuscles={activeMuscles} view="front" size={130} />
        <HumanSVG activeMuscles={activeMuscles} view="back"  size={130} />
      </div>
      {activeMuscles.length > 0 && (
        <div className="muscle-legend">
          {activeMuscles.map(m => (
            <span key={m} className="muscle-chip"
              style={{ background: MUSCLE_GROUPS[m]?.color+'22', borderColor: MUSCLE_GROUPS[m]?.color, color: MUSCLE_GROUPS[m]?.color }}>
              {MUSCLE_GROUPS[m]?.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
