import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('sound_enabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [audioCtx, setAudioCtx] = useState(null);

    // Initialize Audio Context on first interaction to comply with browser policies
    const initAudio = useCallback(() => {
        if (!audioCtx) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioCtx(ctx);
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }, [audioCtx]);

    const playGlassSound = useCallback(() => {
        if (!isSoundEnabled || !audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        // A high-pitched "glassy" frequency
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }, [isSoundEnabled, audioCtx]);

    useEffect(() => {
        localStorage.setItem('sound_enabled', JSON.stringify(isSoundEnabled));
    }, [isSoundEnabled]);

    // Global click listener - Only for mobile
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Check if on mobile and sound is enabled
            const isMobile = window.innerWidth < 768;
            if (!isMobile) return;

            // Check if user clicked a button, link, or something interactive
            const target = e.target.closest('button, a, [role="button"]');

            if (target) {
                initAudio();
                playGlassSound();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('touchstart', initAudio, { once: true });

        return () => {
            window.removeEventListener('click', handleGlobalClick);
        };
    }, [initAudio, playGlassSound]);

    return (
        <SoundContext.Provider value={{ isSoundEnabled, setIsSoundEnabled, playGlassSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
