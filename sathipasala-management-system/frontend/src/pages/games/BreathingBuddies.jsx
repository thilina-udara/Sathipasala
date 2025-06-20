import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import soundManager from '../../utils/soundUtils';

const BreathingBuddies = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language;
  
  // Game state
  const [breathingState, setBreathingState] = useState('idle'); // idle, inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedTime, setCompletedTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.muted);
  
  // Refs for handling timers and state
  const timerRef = useRef(null);
  const breathingTimersRef = useRef([]);
  const isPlayingRef = useRef(false); // Use ref to access current state in timeouts

  // Initialize sounds
  useEffect(() => {
    // Load sounds
    soundManager.load('bell', '/sounds/bell.mp3');
    soundManager.load('inhale', '/sounds/inhale.mp3');
    soundManager.load('exhale', '/sounds/exhale.mp3');
    soundManager.load('ambient', '/sounds/ambient.mp3');
    
    // Set up ambient sound to loop
    const ambientSound = soundManager.sounds['ambient'];
    if (ambientSound) {
      ambientSound.loop = true;
    }
    
    return () => {
      // Stop all sounds on unmount
      Object.keys(soundManager.sounds).forEach(id => {
        soundManager.stop(id);
      });
    };
  }, []);
  
  // Handle sound toggle
  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setSoundEnabled(!newState);
  };
  
  // Handle start/stop breathing exercise
  const toggleBreathing = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    isPlayingRef.current = newPlayingState;
    
    if (newPlayingState) {
      setShowInstructions(false);
      
      // Play ambient sound if enabled
      if (!soundManager.muted) {
        soundManager.play('ambient');
      }
      
      // Start timer for counting seconds
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setCompletedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      // Start first breathing cycle
      startBreathingCycle();
    } else {
      // Stop everything
      clearInterval(timerRef.current);
      clearAllBreathingTimers();
      setBreathingState('idle');
      
      // Stop ambient sound
      soundManager.stop('ambient');
    }
  };
  
  // Function to clear all breathing timers
  const clearAllBreathingTimers = () => {
    breathingTimersRef.current.forEach(timer => clearTimeout(timer));
    breathingTimersRef.current = [];
  };
  
  // Start a breathing cycle
  const startBreathingCycle = () => {
    clearAllBreathingTimers(); // Clear any existing timers
    
    // Set to inhale state
    setBreathingState('inhale');
    // Play inhale sound
    if (!soundManager.muted) {
      soundManager.play('bell');
      setTimeout(() => soundManager.play('inhale'), 100);
    }
    
    // Schedule hold state after inhale (4 seconds)
    const holdTimer = setTimeout(() => {
      if (!isPlayingRef.current) return;
      setBreathingState('hold');
      // Play bell sound for hold
      if (!soundManager.muted) {
        soundManager.play('bell');
      }
      
      // Schedule exhale state after hold (2 seconds)
      const exhaleTimer = setTimeout(() => {
        if (!isPlayingRef.current) return;
        setBreathingState('exhale');
        // Play exhale sound
        if (!soundManager.muted) {
          soundManager.play('bell');
          setTimeout(() => soundManager.play('exhale'), 100);
        }
        
        // Schedule next cycle after exhale (4 seconds)
        const nextCycleTimer = setTimeout(() => {
          if (!isPlayingRef.current) return;
          setBreathCount(prevCount => prevCount + 1);
          startBreathingCycle(); // Start next cycle
        }, 4000);
        
        breathingTimersRef.current.push(nextCycleTimer);
      }, 2000);
      
      breathingTimersRef.current.push(exhaleTimer);
    }, 4000);
    
    breathingTimersRef.current.push(holdTimer);
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearAllBreathingTimers();
      Object.keys(soundManager.sounds).forEach(id => {
        soundManager.stop(id);
      });
    };
  }, []);

  // Get message based on breathing state
  const getBreathingMessage = () => {
    if (breathingState === 'inhale') {
      return language === 'si' ? 'ආශ්වාසය ගන්න...' : 'Breathe in...';
    } else if (breathingState === 'hold') {
      return language === 'si' ? 'අල්ලා ගන්න...' : 'Hold...';
    } else if (breathingState === 'exhale') {
      return language === 'si' ? 'ප්‍රශ්වාසය කරන්න...' : 'Breathe out...';
    }
    return language === 'si' ? 'අපි පටන් ගනිමු!' : 'Let\'s start!';
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-900 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-2" />
            <span>{language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
          </button>
          <h1 className="text-2xl font-bold text-center">
            {language === 'si' ? 'හුස්ම ගන්න මිතුරෝ' : 'Breathing Buddies'}
          </h1>
          <button
            onClick={toggleSound}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
        {/* Instructions */}
        {showInstructions && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 text-center">
            <h2 className="text-xl font-bold mb-4">
              {language === 'si' ? 'උපදෙස්' : 'Instructions'}
            </h2>
            <p className="mb-4">
              {language === 'si' 
                ? 'මෙම ක්‍රීඩාව ඔබට සාමකාමීව හුස්ම ගැනීමට උදව් වේ. හුස්ම ගැනීම සඳහා වෘත්තය අනුගමනය කරන්න.' 
                : 'This game helps you breathe peacefully. Follow the circle for breathing.'}
            </p>
            <p className="mb-4">
              {language === 'si'
                ? '1. වටය විශාල වන විට හුස්ම ගන්න.\n2. වටය නතර වන විට හුස්ම අල්ලාගෙන සිටින්න.\n3. වටය කුඩා වන විට හුස්ම පිට කරන්න.'
                : '1. Breathe in when the circle grows.\n2. Hold your breath when the circle pauses.\n3. Breathe out when the circle shrinks.'}
            </p>
            <button 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
              onClick={() => setShowInstructions(false)}
            >
              {language === 'si' ? 'තේරුණා' : 'Got it!'}
            </button>
          </div>
        )}

        {/* Breathing circle */}
        <div className="flex flex-col items-center relative">
          <div 
            className={`relative flex items-center justify-center rounded-full transition-transform breathing-duration
              ${breathingState === 'inhale' ? 'scale-150' : 
                breathingState === 'exhale' ? 'scale-100' : 
                breathingState === 'hold' ? 'scale-150' : 'scale-100'} 
              bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg`}
            style={{ 
              width: '250px', 
              height: '250px'
            }}
          >
            <img 
              src="/images/games/character.png" 
              alt="Breathing Buddy" 
              className="w-3/4 h-3/4 object-contain"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='%234A90E2'/%3E%3Ccircle cx='70' cy='80' r='10' fill='white'/%3E%3Ccircle cx='130' cy='80' r='10' fill='white'/%3E%3Cpath d='M60 120 Q100 150 140 120' stroke='white' stroke-width='5' fill='none'/%3E%3C/svg%3E";
              }}
            />
          </div>
          
          <div className="absolute bottom-[-60px] text-center">
            <p className="text-xl font-medium mt-4">
              {getBreathingMessage()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-24 flex flex-col items-center">
          <button 
            className={`px-8 py-3 rounded-lg text-white font-medium text-lg ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={toggleBreathing}
          >
            {isPlaying ? 
              (language === 'si' ? 'නවත්වන්න' : 'Stop') : 
              (language === 'si' ? 'පටන් ගන්න' : 'Start')}
          </button>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-6 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'si' ? 'හුස්ම ගණන' : 'Breaths'}
              </p>
              <p className="text-3xl font-bold">{breathCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'si' ? 'කාලය (තත්පර)' : 'Time (sec)'}
              </p>
              <p className="text-3xl font-bold">{completedTime}</p>
            </div>
          </div>
          
          {/* Awards */}
          {breathCount >= 5 && (
            <div className="mt-8 text-center">
              <div className="flex justify-center space-x-2">
                {Array.from({ length: Math.min(5, Math.floor(breathCount / 5)) }).map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-3xl" />
                ))}
              </div>
              <p className="mt-2 font-medium">
                {language === 'si' ? 'හොඳයි!' : 'Great job!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add volume control */}
      {soundEnabled && (
        <div className="absolute top-20 right-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
          <label htmlFor="volume-control" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            {language === 'si' ? 'හඬ පාලනය' : 'Volume'}
          </label>
          <input
            id="volume-control"
            type="range"
            min="0"
            max="100"
            value={soundManager.volume * 100}
            onChange={(e) => soundManager.setVolume(parseInt(e.target.value) / 100)}
            className="w-32"
          />
        </div>
      )}
    </div>
  );
};

export default BreathingBuddies;
