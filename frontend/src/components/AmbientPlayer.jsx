import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import './AmbientPlayer.css';

const SOUNDS = [
    { id: 'rain', label: '🌧️ Gentle Rain', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_638600917c.mp3' },
    { id: 'fire', label: '🔥 Fireplace', url: 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae90f.mp3' },
    { id: 'ocean', label: '🌊 Ocean Waves', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_1d4d24e30a.mp3' },
    { id: 'birds', label: '🌲 Forest Birds', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3' },
    { id: 'cafe', label: '☕ Café Chatter', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2b6bce6e0a.mp3' },
    { id: 'crickets', label: '🌙 Night Crickets', url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_54ca0ffa52.mp3' },
    { id: 'wind', label: '💨 Wind', url: 'https://cdn.pixabay.com/audio/2022/02/14/audio_e45f871997.mp3' },
    { id: 'thunder', label: '⛈️ Thunderstorm', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3' },
    { id: 'pages', label: '📖 Page Turning', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_4e4bfc1e3b.mp3' },
    { id: 'piano', label: '🎹 Soft Piano', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_ea75543e55.mp3' },
];

export default function AmbientPlayer({ isOpen, onClose }) {
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);

    // Create / replace audio element when sound changes
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const playSound = (sound) => {
        // If same sound clicked, toggle play/pause
        if (activeSound?.id === sound.id) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
            }
            return;
        }

        // Stop current audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setLoading(true);
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volume;
        audio.addEventListener('canplaythrough', () => {
            setLoading(false);
            audio.play();
            setIsPlaying(true);
        }, { once: true });
        audio.addEventListener('error', () => {
            setLoading(false);
        });
        audioRef.current = audio;
        setActiveSound(sound);
    };

    const stopAll = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setActiveSound(null);
        setIsPlaying(false);
    };

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
                                    {isActive && loading && (
                                        <div className="ambient-loading" />
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
