import { createContext, useState, useContext, useMemo } from 'react'

const SeasonContext = createContext()

/**
 * Season configurations — each season defines its palette, particle style,
 * and tree foliage colors for the Glass Forest hero.
 *
 * canopyColors: array of 3 colors used for the layered glass canopy (back → mid → front)
 * particleColors: colors of the seasonal falling particles
 * particleShape: 'petal' | 'leaf' | 'snowflake' — drives the particle geometry
 * skyTint: subtle radial gradient overlay behind the tree
 * trunkColor: the trunk/branch stroke color
 */
const SEASON_CONFIG = {
    spring: {
        label: '🌸 Spring',
        canopyColors: ['#f5c6d0', '#e8a5b3', '#f0d4db'],
        particleColors: ['#f8b4c8', '#f5d0db', '#fce4ec', '#f48fb1'],
        particleShape: 'petal',
        skyTint: 'radial-gradient(ellipse at 50% 80%, rgba(252,228,236,0.25) 0%, transparent 70%)',
        trunkColor: '#6d4c41',
        groundGlow: 'rgba(245,198,208,0.12)',
    },
    summer: {
        label: '🌿 Summer',
        canopyColors: ['#81c784', '#4caf50', '#a5d6a7'],
        particleColors: ['#a5d6a7', '#c8e6c9', '#81c784', '#66bb6a'],
        particleShape: 'leaf',
        skyTint: 'radial-gradient(ellipse at 50% 80%, rgba(200,230,201,0.2) 0%, transparent 70%)',
        trunkColor: '#5d4037',
        groundGlow: 'rgba(129,199,132,0.1)',
    },
    autumn: {
        label: '🍂 Autumn',
        canopyColors: ['#e6a23c', '#d4763a', '#edc66e'],
        particleColors: ['#e6a23c', '#d4763a', '#c0653a', '#edc66e', '#b71c1c'],
        particleShape: 'leaf',
        skyTint: 'radial-gradient(ellipse at 50% 80%, rgba(230,162,60,0.18) 0%, transparent 70%)',
        trunkColor: '#4e342e',
        groundGlow: 'rgba(230,162,60,0.1)',
    },
    winter: {
        label: '❄️ Winter',
        canopyColors: ['#b0bec5', '#90a4ae', '#cfd8dc'],
        particleColors: ['#eceff1', '#cfd8dc', '#ffffff', '#b0bec5'],
        particleShape: 'snowflake',
        skyTint: 'radial-gradient(ellipse at 50% 80%, rgba(207,216,220,0.2) 0%, transparent 70%)',
        trunkColor: '#616161',
        groundGlow: 'rgba(176,190,197,0.1)',
    },
}

const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter']

export const SeasonProvider = ({ children }) => {
    const [season, setSeason] = useState(() => {
        const saved = localStorage.getItem('unsaid-season')
        return saved && SEASON_CONFIG[saved] ? saved : 'autumn'
    })

    const cycleSeason = () => {
        setSeason((prev) => {
            const idx = SEASON_ORDER.indexOf(prev)
            const next = SEASON_ORDER[(idx + 1) % SEASON_ORDER.length]
            localStorage.setItem('unsaid-season', next)
            return next
        })
    }

    const setSeasonTo = (s) => {
        if (SEASON_CONFIG[s]) {
            localStorage.setItem('unsaid-season', s)
            setSeason(s)
        }
    }

    const config = useMemo(() => SEASON_CONFIG[season], [season])

    return (
        <SeasonContext.Provider value={{ season, config, cycleSeason, setSeasonTo, SEASON_ORDER, SEASON_CONFIG }}>
            {children}
        </SeasonContext.Provider>
    )
}

export const useSeason = () => useContext(SeasonContext)
