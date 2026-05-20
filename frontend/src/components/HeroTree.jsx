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
 * Scale-invariant: uses normalized texture coordinates (uv)
 * Height² scaling: tips sway a lot, trunk remains firmly grounded
 * ═══════════════════════════════════════════════════════ */
const vertexShader = `
    uniform float uTime;
    uniform float uWindStrength;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 pos = position;
        float h = uv.y;

        float wind = sin(uTime * 0.8 + uv.y * 6.0) * 0.45
                   + sin(uTime * 1.3 + uv.y * 9.0) * 0.25
                   + sin(uTime * 0.3 + uv.x * 6.0) * 0.15;

        pos.x += wind * h * h * uWindStrength;
        pos.y -= abs(wind) * h * uWindStrength * 0.04;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

/* ═══════════════════════════════════════════════════════
 * Fragment shader — smart black-background removal
 * Border fade: replaces the oval vignette with a subtle 4% boundary
 * feathering to let tree branches expand fully to the left.
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

        // Soft border fade — only fades out the outer 4% of the texture quad to prevent hard borders
        float borderFadeX = smoothstep(0.0, 0.04, vUv.x) * (1.0 - smoothstep(0.96, 1.0, vUv.x));
        float borderFadeY = smoothstep(0.0, 0.04, vUv.y) * (1.0 - smoothstep(0.96, 1.0, vUv.y));
        float edgeFade = borderFadeX * borderFadeY;

        gl_FragColor = vec4(tex.rgb, alpha * edgeFade);
    }
`

/* ═══════════════════════════════════════════════════════
 * TreePlane — textured quad with scale-invariant wind shader
 * ═══════════════════════════════════════════════════════ */
function TreePlane({ season }) {
    const meshRef = useRef()
    const matRef  = useRef()
    const { viewport } = useThree()

    const texture = useLoader(THREE.TextureLoader, TREE_SRCS[season])
    texture.colorSpace = THREE.SRGBColorSpace

    // Check if the viewport width is in mobile/portrait range
    const isMobile = viewport.width < 2.8

    // Scale the tree plane to fit beautifully within the viewport height
    const treeScale = useMemo(() => {
        return isMobile ? viewport.height * 1.25 : viewport.height * 1.55 // Majestic scale for leftward expansion
    }, [isMobile, viewport.height])

    // Maintain aspect ratio of texture (4.0 / 4.8 = 0.833)
    const treeWidth = useMemo(() => {
        return treeScale * 0.833
    }, [treeScale])

    // Calculate responsive position offsets
    const xShift = useMemo(() => {
        if (isMobile) return 0
        // Stick the right edge of the tree plane to the right edge of the viewport
        // with a tiny organic offset (0.12) to merge it beautifully with the right border
        return (viewport.width - treeWidth) / 2 + 0.12
    }, [isMobile, viewport.width, treeWidth])

    const yShift = useMemo(() => {
        return isMobile ? -viewport.height * 0.08 : -viewport.height * 0.20 // Ground the large trunk deeply
    }, [isMobile, viewport.height])

    const windStrength = useMemo(() => {
        const map = { spring: 0.06, summer: 0.04, autumn: 0.09, winter: 0.03 }
        return map[season] || 0.05
    }, [season])

    const uniforms = useMemo(() => ({
        uTexture:      { value: texture },
        uTime:         { value: 0 },
        uWindStrength: { value: windStrength },
        uOpacity:      { value: 1.0 }, // Unlock full color vibrancy
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
        <mesh ref={meshRef} position={[xShift, yShift, 0]}>
            <planeGeometry args={[treeWidth, treeScale, 48, 64]} />
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
 * HeroTree — transparent WebGL canvas with responsive layout
 * ═══════════════════════════════════════════════════════ */
function HeroTree() {
    const { config } = useSeason()

    const responsiveSkyTint = useMemo(() => {
        // Shift the radial gradient glow to the right (76% 50%) on desktop to align behind the tree
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            return config.skyTint.replace('50% 80%', '76% 50%')
        }
        return config.skyTint
    }, [config.skyTint])

    const responsiveGroundGlow = useMemo(() => {
        // Shift ground glow to the right (76% 100%) and boost intensity slightly on desktop
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            const boostedColor = config.groundGlow.replace('0.1)', '0.18)').replace('0.12)', '0.20)')
            return `radial-gradient(ellipse at 76% 100%, ${boostedColor} 0%, transparent 60%)`
        }
        return `radial-gradient(ellipse at 50% 100%, ${config.groundGlow} 0%, transparent 55%)`
    }, [config.groundGlow])

    return (
        <div className="hero-tree-wrapper" aria-hidden="true">
            <div className="hero-tree-sky" style={{ background: responsiveSkyTint }} />
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
                style={{ background: responsiveGroundGlow }}
            />
        </div>
    )
}

export default memo(HeroTree)
