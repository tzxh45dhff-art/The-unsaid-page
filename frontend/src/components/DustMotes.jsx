import { useEffect, useRef, memo } from 'react'
import './DustMotes.css'

/*
 * DustMotes — cursor-reactive floating particles.
 *
 * Performance strategy:
 *   • All animation runs in a single rAF loop — zero React re-renders.
 *   • Positions are written directly to the DOM via transform strings.
 *   • The mouse position is tracked with a passive listener.
 *   • The component renders 20 static <div> nodes once, then never again.
 */

const MOTE_COUNT = 20
const REPEL_RADIUS = 120   // px – how close the cursor must be to push
const REPEL_STRENGTH = 0.8 // multiplier on the push vector
const DRIFT_SPEED = 0.15   // base drift velocity
const SPRING_DAMPING = 0.92 // how fast displaced motes return (0-1, higher = slower)

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

function createMotes() {
  return Array.from({ length: MOTE_COUNT }, () => ({
    // position on screen (vw / vh → converted to px on mount)
    x: 0,
    y: 0,
    // base (home) position — the mote drifts around here
    homeX: 0,
    homeY: 0,
    // velocity from repulsion
    vx: 0,
    vy: 0,
    // slow constant drift angle & speed
    driftAngle: Math.random() * Math.PI * 2,
    driftSpeed: randomBetween(0.08, DRIFT_SPEED),
    // appearance
    size: randomBetween(4, 14),
    opacity: randomBetween(0.25, 0.55),
    // gentle pulsation
    pulseSpeed: randomBetween(0.003, 0.008),
    pulsePhase: Math.random() * Math.PI * 2,
  }))
}

function DustMotes() {
  const containerRef = useRef(null)
  const moteRefs = useRef([])
  const motesData = useRef(createMotes())
  const mouse = useRef({ x: -9999, y: -9999 })
  const rafId = useRef(null)
  const frameCount = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = () => window.innerWidth
    const h = () => window.innerHeight

    // Place motes at random starting positions
    motesData.current.forEach((m) => {
      m.homeX = randomBetween(40, w() - 40)
      m.homeY = randomBetween(40, h() - 40)
      m.x = m.homeX
      m.y = m.homeY
    })

    // ── Mouse tracking (passive, no re-renders) ──
    const onPointerMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // ── Animation loop ──
    const tick = () => {
      frameCount.current++
      const mx = mouse.current.x
      const my = mouse.current.y
      const ww = w()
      const wh = h()

      motesData.current.forEach((m, i) => {
        const el = moteRefs.current[i]
        if (!el) return

        // 1 — Cursor repulsion
        const dx = m.x - mx
        const dy = m.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
          m.vx += (dx / dist) * force
          m.vy += (dy / dist) * force
        }

        // 2 — Gentle constant drift (slowly orbits home position)
        m.driftAngle += 0.002
        const driftX = Math.cos(m.driftAngle) * m.driftSpeed
        const driftY = Math.sin(m.driftAngle) * m.driftSpeed

        // 3 — Spring back toward home
        const pullX = (m.homeX - m.x) * 0.003
        const pullY = (m.homeY - m.y) * 0.003

        // 4 — Apply velocity
        m.vx = (m.vx + pullX) * SPRING_DAMPING + driftX
        m.vy = (m.vy + pullY) * SPRING_DAMPING + driftY
        m.x += m.vx
        m.y += m.vy

        // 5 — Wrap around screen edges
        if (m.x < -20) m.x = ww + 20
        if (m.x > ww + 20) m.x = -20
        if (m.y < -20) m.y = wh + 20
        if (m.y > wh + 20) m.y = -20

        // 6 — Pulsating opacity
        const pulse = Math.sin(frameCount.current * m.pulseSpeed + m.pulsePhase)
        const currentOpacity = m.opacity + pulse * 0.06

        // 7 — Write directly to DOM (no React state)
        el.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`
        el.style.opacity = currentOpacity
      })

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    // ── Cleanup ──
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="dust-motes-container" ref={containerRef} aria-hidden="true">
      {motesData.current.map((m, i) => (
        <div
          key={i}
          ref={(el) => (moteRefs.current[i] = el)}
          className="dust-mote"
          style={{
            width: m.size,
            height: m.size,
            opacity: m.opacity,
          }}
        />
      ))}
    </div>
  )
}

export default memo(DustMotes)
