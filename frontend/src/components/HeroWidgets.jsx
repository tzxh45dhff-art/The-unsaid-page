import { useState, useEffect } from 'react'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    ChevronDown,
    ChevronUp,
    Music
} from 'lucide-react'
import './HeroWidgets.css'

// ═══════════════════════════════════════════════════════
// Ambient Sound Synthesis Engine using Web Audio API
// ═══════════════════════════════════════════════════════
class AmbientSynth {
    constructor() {
        this.ctx = null;
        this.activeType = null;
        this.nodes = [];
        this.isPlaying = false;
        this.volume = 0.5;
        this.masterVolumeNode = null;
        this.interval = null;
    }
    
    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterVolumeNode = this.ctx.createGain();
        this.masterVolumeNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterVolumeNode.connect(this.ctx.destination);
    }
    
    setVolume(val) {
        this.volume = val;
        if (this.masterVolumeNode && this.ctx) {
            this.masterVolumeNode.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.1);
        }
    }
    
    play(type) {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        this.stop();
        this.activeType = type;
        this.isPlaying = true;
        
        if (type === 'piano') {
            this.startPiano();
        } else if (type === 'rain') {
            this.startRain();
        } else if (type === 'wind') {
            this.startWind();
        } else if (type === 'focus') {
            this.startFocus();
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.nodes.forEach(node => {
            try {
                node.stop();
            } catch(e) {}
            try {
                node.disconnect();
            } catch(e) {}
        });
        this.nodes = [];
        
        if (this.interval) {
            clearTimeout(this.interval);
            this.interval = null;
        }
    }
    
    createNoiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }
    
    createPinkNoiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        return noiseBuffer;
    }
    
    startRain() {
        const source = this.ctx.createBufferSource();
        source.buffer = this.createNoiseBuffer();
        source.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        
        const hpFilter = this.ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.28, this.ctx.currentTime);
        
        source.connect(filter);
        filter.connect(hpFilter);
        hpFilter.connect(gainNode);
        gainNode.connect(this.masterVolumeNode);
        
        source.start(0);
        this.nodes.push(source, filter, hpFilter, gainNode);
    }
    
    startWind() {
        const source = this.ctx.createBufferSource();
        source.buffer = this.createPinkNoiseBuffer();
        source.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
        filter.frequency.setValueAtTime(350, this.ctx.currentTime);
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
        
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterVolumeNode);
        
        source.start(0);
        lfo.start(0);
        
        this.nodes.push(source, filter, gainNode, lfo, lfoGain);
    }
    
    startFocus() {
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
        
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(110.5, this.ctx.currentTime);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, this.ctx.currentTime);
        
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.04, this.ctx.currentTime);
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(70, this.ctx.currentTime);
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.10, this.ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterVolumeNode);
        
        osc1.start(0);
        osc2.start(0);
        lfo.start(0);
        
        this.nodes.push(osc1, osc2, filter, lfo, lfoGain, gainNode);
    }
    
    startPiano() {
        const scale = [110.0, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
        
        const delay = this.ctx.createDelay();
        delay.delayTime.setValueAtTime(0.85, this.ctx.currentTime);
        
        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.setValueAtTime(0.48, this.ctx.currentTime);
        
        const delayGain = this.ctx.createGain();
        delayGain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        
        const dryNode = this.ctx.createGain();
        dryNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
        
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        
        const playNote = () => {
            if (!this.isPlaying) return;
            const now = this.ctx.currentTime;
            const freq = scale[Math.floor(Math.random() * scale.length)];
            
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            const oscDetune = this.ctx.createOscillator();
            oscDetune.frequency.setValueAtTime(1.8, now);
            const detuneGain = this.ctx.createGain();
            detuneGain.gain.setValueAtTime(3, now);
            oscDetune.connect(detuneGain);
            detuneGain.connect(osc.detune);
            
            const envelope = this.ctx.createGain();
            envelope.gain.setValueAtTime(0.001, now);
            envelope.gain.linearRampToValueAtTime(0.22, now + 0.08);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, now);
            filter.frequency.exponentialRampToValueAtTime(180, now + 2.3);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(dryNode);
            envelope.connect(delay);
            
            oscDetune.start(now);
            osc.start(now);
            
            oscDetune.stop(now + 3.0);
            osc.stop(now + 3.0);
            
            setTimeout(() => {
                try {
                    osc.disconnect();
                    oscDetune.disconnect();
                    detuneGain.disconnect();
                    filter.disconnect();
                    envelope.disconnect();
                } catch(e) {}
            }, 3500);
        };
        
        const triggerNext = () => {
            if (!this.isPlaying) return;
            playNote();
            const delayTime = 1400 + Math.random() * 2200;
            this.interval = setTimeout(triggerNext, delayTime);
        };
        
        triggerNext();
        
        dryNode.connect(this.masterVolumeNode);
        delay.connect(delayGain);
        delayGain.connect(this.masterVolumeNode);
        
        this.nodes.push(dryNode, delay, delayFeedback, delayGain);
    }
}

const GLOBAL_SYNTH = new AmbientSynth();

// ═══════════════════════════════════════════════════════
// HeroWidgets Main Component
// ═══════════════════════════════════════════════════════
export default function HeroWidgets() {


    // Sound Options State
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSoundIdx, setActiveSoundIdx] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const sounds = [
        { id: 'piano', name: 'Soft Piano', category: 'Ambient', artwork: '🌸', color: 'from-[#f5c6d0] to-[#e8a5b3]' },
        { id: 'rain', name: 'Rainy Night', category: 'Nature', artwork: '🌧️', color: 'from-[#90a4ae] to-[#cfd8dc]' },
        { id: 'wind', name: 'Forest Wind', category: 'Breeze', artwork: '🍃', color: 'from-[#a5d6a7] to-[#81c784]' },
        { id: 'focus', name: 'Deep Focus', category: 'Analog Pad', artwork: '🌌', color: 'from-[#a78baf] to-[#c9956b]' }
    ];

    const activeSound = sounds[activeSoundIdx];

    // Handle Play / Pause
    const togglePlay = () => {
        if (isPlaying) {
            GLOBAL_SYNTH.stop();
            setIsPlaying(false);
        } else {
            GLOBAL_SYNTH.play(activeSound.id);
            setIsPlaying(true);
        }
    };

    // Change Sound Track
    const selectSound = (idx) => {
        setActiveSoundIdx(idx);
        setShowOptions(false);
        if (isPlaying) {
            GLOBAL_SYNTH.play(sounds[idx].id);
        }
    };

    // Volume Handle
    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        GLOBAL_SYNTH.setVolume(val);
    };

    const toggleMute = () => {
        if (isMuted) {
            GLOBAL_SYNTH.setVolume(volume || 0.5);
            setVolume(volume || 0.5);
            setIsMuted(false);
        } else {
            GLOBAL_SYNTH.setVolume(0);
            setIsMuted(true);
        }
    };

    // Clean up synth when component unmounts
    useEffect(() => {
        return () => {
            GLOBAL_SYNTH.stop();
        };
    }, []);

    return (
        <div className="hero-widgets">

            {/* ── Ambient Sound Player Card ── */}
            <div className={`brutal-card widget-card player-card ${isPlaying ? 'playing' : ''}`}>
                <div className="player-main-row">
                    {/* Album Artwork with dynamic seasonal aesthetics */}
                    <div className={`player-artwork bg-gradient-to-br ${activeSound.color}`}>
                        <span className="artwork-emoji">{activeSound.artwork}</span>
                        {isPlaying && <div className="pulse-ring" />}
                    </div>

                    <div className="player-meta-container">
                        <span className="widget-eyebrow">{activeSound.category}</span>
                        <button
                            className="player-selector-trigger"
                            onClick={() => setShowOptions(!showOptions)}
                        >
                            <span>{activeSound.name}</span>
                            {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    <div className="player-controls">
                        <button
                            className={`play-btn-circle ${isPlaying ? 'active' : ''}`}
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        <div className="volume-control-wrapper">
                            <button
                                className="volume-btn"
                                onClick={toggleMute}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                                aria-label="Volume"
                            />
                        </div>
                    </div>
                </div>

                {/* Multiple Options Dropdown Drawer */}
                {showOptions && (
                    <div className="player-options-drawer">
                        <div className="drawer-header">
                            <Music size={14} /> Choose Soundscape
                        </div>
                        <div className="options-list">
                            {sounds.map((sound, idx) => {
                                const isActive = activeSoundIdx === idx;
                                return (
                                    <button
                                        key={sound.id}
                                        className={`sound-option-btn ${isActive ? 'active' : ''}`}
                                        onClick={() => selectSound(idx)}
                                    >
                                        <span className="option-emoji">{sound.artwork}</span>
                                        <div className="option-meta">
                                            <span className="option-name">{sound.name}</span>
                                            <span className="option-cat">{sound.category}</span>
                                        </div>
                                        {isActive && isPlaying && (
                                            <div className="playing-bars">
                                                <div className="bar bar1" />
                                                <div className="bar bar2" />
                                                <div className="bar bar3" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
