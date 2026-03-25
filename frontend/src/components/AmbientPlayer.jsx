import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Volume2, VolumeX } from 'lucide-react';
import './AmbientPlayer.css';

// ══════════════════════════════════════════════════
//  Web Audio API Procedural Sound Generators
//  No external URLs — 100% synthesized in-browser
// ══════════════════════════════════════════════════

function createRain(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
            // Subtle low-pass feel via averaging
            if (i > 0) data[i] = data[i] * 0.3 + data[i - 1] * 0.7;
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    // Shape into rain-like sound with bandpass
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createFire(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
            // Crackling noise — irregular amplitude
            const crackle = Math.random() > 0.97 ? Math.random() * 0.6 : 0;
            data[i] = (Math.random() * 2 - 1) * 0.15 + crackle;
            if (i > 0) data[i] = data[i] * 0.2 + data[i - 1] * 0.8;
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createOcean(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            // Slow wave envelope
            const wave = Math.sin(t * 0.4 * Math.PI * 2) * 0.5 + 0.5;
            data[i] = (Math.random() * 2 - 1) * 0.25 * wave;
            if (i > 0) data[i] = data[i] * 0.15 + data[i - 1] * 0.85;
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createBirds(ctx, gainNode) {
    // Multiple chirps layered with forest ambience
    const bufferSize = ctx.sampleRate * 8;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        // Gentle forest background
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.04;
            if (i > 0) data[i] = data[i] * 0.1 + data[i - 1] * 0.9;
        }
        // Scattered chirps
        for (let c = 0; c < 20; c++) {
            const start = Math.floor(Math.random() * (bufferSize - ctx.sampleRate * 0.3));
            const freq = 2000 + Math.random() * 3000;
            const len = Math.floor(ctx.sampleRate * (0.05 + Math.random() * 0.15));
            for (let i = 0; i < len && (start + i) < bufferSize; i++) {
                const env = Math.sin((i / len) * Math.PI);
                data[start + i] += Math.sin(i / ctx.sampleRate * freq * Math.PI * 2) * env * 0.08;
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    return source;
}

function createCafe(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
            // Muffled chatter simulation
            data[i] = (Math.random() * 2 - 1) * 0.18;
            if (i > 0) data[i] = data[i] * 0.08 + data[i - 1] * 0.92;
        }
        // Add occasional clinks
        for (let c = 0; c < 8; c++) {
            const start = Math.floor(Math.random() * (bufferSize - 1000));
            const freq = 3000 + Math.random() * 2000;
            for (let i = 0; i < 800; i++) {
                const env = Math.exp(-i / 200);
                data[start + i] += Math.sin(i / ctx.sampleRate * freq * Math.PI * 2) * env * 0.04;
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createCrickets(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        // Night background
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.02;
            if (i > 0) data[i] = data[i] * 0.05 + data[i - 1] * 0.95;
        }
        // Cricket chirps — fast oscillation bursts
        for (let c = 0; c < 30; c++) {
            const start = Math.floor(Math.random() * (bufferSize - ctx.sampleRate * 0.5));
            const freq = 4000 + Math.random() * 1500;
            const pulses = 3 + Math.floor(Math.random() * 5);
            for (let p = 0; p < pulses; p++) {
                const pStart = start + p * Math.floor(ctx.sampleRate * 0.04);
                const pLen = Math.floor(ctx.sampleRate * 0.02);
                for (let i = 0; i < pLen && (pStart + i) < bufferSize; i++) {
                    const env = Math.sin((i / pLen) * Math.PI);
                    data[pStart + i] += Math.sin(i / ctx.sampleRate * freq * Math.PI * 2) * env * 0.06;
                }
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    return source;
}

function createWind(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const swell = Math.sin(t * 0.3 * Math.PI * 2) * 0.4 + 0.6;
            data[i] = (Math.random() * 2 - 1) * 0.2 * swell;
            if (i > 0) data[i] = data[i] * 0.05 + data[i - 1] * 0.95;
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.3;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createThunder(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 8;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        // Rain background
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.2;
            if (i > 0) data[i] = data[i] * 0.25 + data[i - 1] * 0.75;
        }
        // Thunder rumbles
        for (let t = 0; t < 3; t++) {
            const start = Math.floor(Math.random() * (bufferSize - ctx.sampleRate * 2));
            const len = Math.floor(ctx.sampleRate * (1 + Math.random()));
            for (let i = 0; i < len; i++) {
                const env = Math.exp(-i / (len * 0.3));
                data[start + i] += (Math.random() * 2 - 1) * 0.35 * env;
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createPages(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        // Quiet room ambience
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.01;
        }
        // Page turn swooshes
        for (let p = 0; p < 6; p++) {
            const start = Math.floor(ctx.sampleRate * (0.5 + p * 0.9 + Math.random() * 0.3));
            const len = Math.floor(ctx.sampleRate * (0.15 + Math.random() * 0.1));
            for (let i = 0; i < len && (start + i) < bufferSize; i++) {
                const env = Math.sin((i / len) * Math.PI);
                data[start + i] += (Math.random() * 2 - 1) * 0.12 * env;
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    source.connect(filter);
    filter.connect(gainNode);
    return source;
}

function createPiano(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    // Gentle piano-like tones (pentatonic scale)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let n = 0; n < 12; n++) {
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const start = Math.floor(Math.random() * (bufferSize - ctx.sampleRate * 2));
            const len = Math.floor(ctx.sampleRate * (1 + Math.random()));
            for (let i = 0; i < len && (start + i) < bufferSize; i++) {
                const env = Math.exp(-i / (len * 0.35));
                const tone = Math.sin(i / ctx.sampleRate * freq * Math.PI * 2);
                const harmonic = Math.sin(i / ctx.sampleRate * freq * 2 * Math.PI * 2) * 0.3;
                data[start + i] += (tone + harmonic) * env * 0.06;
            }
        }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    return source;
}

const GENERATORS = {
    rain: createRain,
    fire: createFire,
    ocean: createOcean,
    birds: createBirds,
    cafe: createCafe,
    crickets: createCrickets,
    wind: createWind,
    thunder: createThunder,
    pages: createPages,
    piano: createPiano,
};

const SOUNDS = [
    { id: 'rain', label: '🌧️ Gentle Rain' },
    { id: 'fire', label: '🔥 Fireplace' },
    { id: 'ocean', label: '🌊 Ocean Waves' },
    { id: 'birds', label: '🌲 Forest Birds' },
    { id: 'cafe', label: '☕ Café Chatter' },
    { id: 'crickets', label: '🌙 Night Crickets' },
    { id: 'wind', label: '💨 Wind' },
    { id: 'thunder', label: '⛈️ Thunderstorm' },
    { id: 'pages', label: '📖 Page Turning' },
    { id: 'piano', label: '🎹 Soft Piano' },
];

export default function AmbientPlayer({ isOpen, onClose }) {
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState('');
    const audioCtxRef = useRef(null);
    const sourceRef = useRef(null);
    const gainRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch { /* ignore */ }
                sourceRef.current = null;
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        };
    }, []);

    // Update volume
    useEffect(() => {
        if (gainRef.current) {
            gainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
        }
    }, [volume]);

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playSound = useCallback((sound) => {
        setError('');

        // If same sound, toggle play/pause
        if (activeSound?.id === sound.id) {
            if (isPlaying) {
                audioCtxRef.current?.suspend();
                setIsPlaying(false);
            } else {
                audioCtxRef.current?.resume();
                setIsPlaying(true);
            }
            return;
        }

        // Stop current
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch { /* ignore */ }
            sourceRef.current = null;
        }

        try {
            const ctx = getAudioContext();
            const gain = ctx.createGain();
            gain.gain.value = volume;
            gain.connect(ctx.destination);
            gainRef.current = gain;

            const generator = GENERATORS[sound.id];
            if (!generator) {
                setError('Sound not available');
                return;
            }

            const source = generator(ctx, gain);
            source.start(0);
            sourceRef.current = source;
            setActiveSound(sound);
            setIsPlaying(true);
        } catch (e) {
            setError('Audio not supported in this browser');
            console.error('Audio error:', e);
        }
    }, [activeSound, isPlaying, volume, getAudioContext]);

    const stopAll = useCallback(() => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch { /* ignore */ }
            sourceRef.current = null;
        }
        setActiveSound(null);
        setIsPlaying(false);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ambient-panel"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    <div className="ambient-header">
                        <div className="ambient-title">
                            <Headphones size={18} />
                            <span>Ambient Sounds</span>
                        </div>
                        <button className="ambient-close" onClick={onClose} aria-label="Close">
                            <X size={16} />
                        </button>
                    </div>

                    {error && (
                        <div className="ambient-error">{error}</div>
                    )}

                    <div className="ambient-grid">
                        {SOUNDS.map((sound) => {
                            const isActive = activeSound?.id === sound.id;
                            const isCurrentlyPlaying = isActive && isPlaying;
                            return (
                                <button
                                    key={sound.id}
                                    className={`ambient-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => playSound(sound)}
                                    aria-label={sound.label}
                                >
                                    <span className="ambient-emoji">{sound.label.split(' ')[0]}</span>
                                    <span className="ambient-label">{sound.label.split(' ').slice(1).join(' ')}</span>
                                    {isCurrentlyPlaying && (
                                        <div className="equalizer">
                                            <span /><span /><span /><span />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="ambient-controls">
                        <button
                            className="ambient-volume-icon"
                            onClick={() => setVolume(v => v > 0 ? 0 : 0.5)}
                            aria-label="Toggle mute"
                        >
                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="ambient-slider"
                        />
                        {activeSound && (
                            <button className="ambient-stop" onClick={stopAll}>
                                Stop
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
