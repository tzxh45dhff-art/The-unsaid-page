import { useRef, useMemo, memo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSeason } from '../context/SeasonContext'
import './HeroTree.css'

const TREE_SRCS = {
    spring: '/trees/spring.png',
    summer: '/trees/summer.png',
    autumn: '/trees/autumn.png',
    winter: '/trees/winter.png',
}

/* ═══════════════════════════════════════════════════════
 * Vertex shader — wind displacement
 * Height² scaling: tips sway a lot, trunk barely moves
 * ═══════════════════════════════════════════════════════ */
const vertexShader = `
    uniform float uTime;
    uniform float uWindStrength;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 pos = position;
        float h = clamp((pos.y + 1.0) / 2.0, 0.0, 1.0);

        float wind = sin(uTime * 0.8 + pos.y * 2.5) * 0.45
                   + sin(uTime * 1.3 + pos.y * 4.0) * 0.25
                   + sin(uTime * 0.3 + pos.x * 3.0) * 0.15;

        pos.x += wind * h * h * uWindStrength;
        pos.y -= abs(wind) * h * uWindStrength * 0.04;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

/* ═══════════════════════════════════════════════════════
 * Fragment shader — smart black-background removal
 *
 * Problem: old shader used luminance, which cut dark bark.
 * Fix: check if the pixel is "near pure black" by testing
 * that ALL channels are below a threshold AND total color
 * saturation is very low. Dark brown bark has higher R
 * channel than pure black, so it's preserved.
 * ═══════════════════════════════════════════════════════ */
const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uOpacity;
    uniform float uFadeIn;
    varying vec2 vUv;

    void main() {
        vec4 tex = texture2D(uTexture, vUv);

        // Max channel value — pure black has maxC ≈ 0
        float maxC = max(tex.r, max(tex.g, tex.b));

        // Use a soft threshold: pixels with maxC < 0.06 are background
        // Bark (even dark) has at least some channel > 0.10
        float alpha = smoothstep(0.03, 0.10, maxC) * uOpacity * uFadeIn;

        // Organic edge dissolution — very wide, radial fade
        // Aggressively dissolves edges so no rectangle is ever visible
        vec2 center = vUv - 0.5;
        // Stretch horizontally more (1.8x) to kill side edges; vertical lighter (0.9x)
        float edgeDist = length(center * vec2(1.8, 0.9));
        // Start fading very early (0.20) and be fully gone by 0.52
        float edgeFade = 1.0 - smoothstep(0.20, 0.52, edgeDist);

        gl_FragColor = vec4(tex.rgb, alpha * edgeFade);
    }
`

/* ═══════════════════════════════════════════════════════
 * TreePlane — textured quad with wind shader
 * ═══════════════════════════════════════════════════════ */
function TreePlane({ season }) {
    const meshRef = useRef()
    const matRef  = useRef()

    const texture = useLoader(THREE.TextureLoader, TREE_SRCS[season])
    texture.colorSpace = THREE.SRGBColorSpace

    const windStrength = useMemo(() => {
        const map = { spring: 0.06, summer: 0.04, autumn: 0.09, winter: 0.03 }
        return map[season] || 0.05
    }, [season])

    const uniforms = useMemo(() => ({
        uTexture:      { value: texture },
        uTime:         { value: 0 },
        uWindStrength: { value: windStrength },
        uOpacity:      { value: 0.85 },
        uFadeIn:       { value: 0 },
    }), [texture, windStrength])

    const fadeRef = useRef(0)
    useEffect(() => {
        fadeRef.current = 0
        if (matRef.current) {
            matRef.current.uniforms.uFadeIn.value = 0
            matRef.current.uniforms.uTexture.value = texture
            matRef.current.uniforms.uWindStrength.value = windStrength
        }
    }, [season, texture, windStrength])

    useFrame(({ clock }) => {
        if (!matRef.current) return
        matRef.current.uniforms.uTime.value = clock.getElapsedTime()
        if (fadeRef.current < 1) {
            fadeRef.current += 0.016
            matRef.current.uniforms.uFadeIn.value = Math.min(1, fadeRef.current)
        }
    })

    return (
        <mesh ref={meshRef} position={[0, -0.35, 0]}>
            <planeGeometry args={[4.0, 4.8, 48, 64]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════
 * Real snowflake geometry — 6 arms with barbs
 * Built as a BufferGeometry with line segments
 * ═══════════════════════════════════════════════════════ */
function makeSnowflakeGeo() {
    const shape = new THREE.Shape()
    const armLen = 1
    const barbLen = 0.3
    const barbAngle = Math.PI / 5

    // Build a 6-arm crystal
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
        const ax = Math.cos(angle) * armLen
        const ay = Math.sin(angle) * armLen

        // Main arm (thin triangle)
        shape.moveTo(0, 0)
        const perpX = Math.cos(angle + Math.PI / 2) * 0.04
        const perpY = Math.sin(angle + Math.PI / 2) * 0.04
        shape.lineTo(ax + perpX, ay + perpY)
        shape.lineTo(ax - perpX, ay - perpY)
        shape.lineTo(0, 0)

        // Barbs at 40% and 70% of arm length
        for (const frac of [0.4, 0.7]) {
            const bx = Math.cos(angle) * armLen * frac
            const by = Math.sin(angle) * armLen * frac
            for (const dir of [1, -1]) {
                const ba = angle + barbAngle * dir
                const ex = bx + Math.cos(ba) * barbLen * (1 - frac * 0.4)
                const ey = by + Math.sin(ba) * barbLen * (1 - frac * 0.4)
                shape.moveTo(bx, by)
                shape.lineTo(ex, ey)
                shape.lineTo(bx + perpX * 0.5, by + perpY * 0.5)
                shape.lineTo(bx, by)
            }
        }
    }

    return new THREE.ShapeGeometry(shape)
}

/* ═══════════════════════════════════════════════════════
 * Petal / leaf geometry
 * ═══════════════════════════════════════════════════════ */
function makePetalGeo() {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo( 0.5, -0.15,  0.5, -0.85, 0, -1)
    shape.bezierCurveTo(-0.5, -0.85, -0.5, -0.15, 0,  0)
    return new THREE.ShapeGeometry(shape)
}

/* ═══════════════════════════════════════════════════════
 * Seasonal Particles — instanced mesh
 * ═══════════════════════════════════════════════════════ */
function Particles({ season, config }) {
    const COUNT = 50
    const meshRef = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const { viewport } = useThree()

    const particles = useMemo(() =>
        Array.from({ length: COUNT }, () => ({
            x:   (Math.random() - 0.5) * viewport.width * 1.3,
            y:    Math.random() * viewport.height * 0.7 + viewport.height * 0.15,
            z:    (Math.random() - 0.5) * 0.3,
            vy:  -(0.003 + Math.random() * 0.009),
            vx:   (Math.random() - 0.5) * 0.003,
            rot:  Math.random() * Math.PI * 2,
            rspd: (Math.random() - 0.5) * 0.02,
            swayA: 0.002 + Math.random() * 0.007,
            swayS: 0.5 + Math.random() * 1.5,
            scale: season === 'winter'
                ? 0.016 + Math.random() * 0.020
                : 0.010 + Math.random() * 0.022,
        })),
        [season, viewport]
    )

    const geo = useMemo(() => {
        return season === 'winter' ? makeSnowflakeGeo() : makePetalGeo()
    }, [season])

    const color = useMemo(() => {
        return new THREE.Color(config.particleColors[0])
    }, [config])

    useFrame(({ clock }) => {
        if (!meshRef.current) return
        const t = clock.getElapsedTime()

        particles.forEach((p, i) => {
            p.y += p.vy
            p.x += p.vx + Math.sin(t * p.swayS) * p.swayA
            p.rot += p.rspd

            if (p.y < -viewport.height * 0.6) {
                p.y = viewport.height * 0.55
                p.x = (Math.random() - 0.5) * viewport.width * 1.3
            }

            dummy.position.set(p.x, p.y, p.z)
            dummy.rotation.set(0, 0, p.rot)
            dummy.scale.setScalar(p.scale)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[geo, undefined, COUNT]}>
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.7}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}

/* ═══════════════════════════════════════════════════════
 * Scene
 * ═══════════════════════════════════════════════════════ */
function Scene() {
    const { season, config } = useSeason()
    return (
        <>
            <TreePlane season={season} />
            <Particles season={season} config={config} />
        </>
    )
}

/* ═══════════════════════════════════════════════════════
 * HeroTree — transparent WebGL canvas
 * ═══════════════════════════════════════════════════════ */
function HeroTree() {
    const { config } = useSeason()

    return (
        <div className="hero-tree-wrapper" aria-hidden="true">
            <div className="hero-tree-sky" style={{ background: config.skyTint }} />
            <Canvas
                className="hero-tree-canvas"
                gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
                camera={{ position: [0, 0, 2], fov: 50 }}
                dpr={[1, 2]}
                style={{ background: 'transparent' }}
            >
                <Scene />
            </Canvas>
            <div
                className="hero-tree-ground-glow"
                style={{ background: `radial-gradient(ellipse at 50% 100%, ${config.groundGlow} 0%, transparent 55%)` }}
            />
        </div>
    )
}

export default memo(HeroTree)
