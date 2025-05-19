import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVolumeUp, FaVolumeMute, FaStar, FaPlay } from 'react-icons/fa';
import soundManager from '../../utils/soundUtils';

const SOUNDS = [
  { id: 'birds', name: { en: 'Birds Singing', si: 'කුරුල්ලන් ගී ගයනවා' }, file: 'birds.mp3', image: 'birds.jpg' },
  { id: 'water', name: { en: 'Water Flowing', si: 'ජලය ගලා යනවා' }, file: 'water.mp3', image: 'water.jpg' },
  { id: 'wind', name: { en: 'Gentle Wind', si: 'මෘදු සුළඟ' }, file: 'wind.mp3', image: 'wind.jpg' },
  { id: 'bell', name: { en: 'Temple Bell', si: 'පන්සල් සීනුව' }, file: 'bell.mp3', image: 'bell.jpg' },
  { id: 'rain', name: { en: 'Rain Drops', si: 'වැසි බිංදු' }, file: 'rain.mp3', image: 'rain.jpg' },
  { id: 'leaves', name: { en: 'Rustling Leaves', si: 'කොළ ශබ්දය' }, file: 'leaves.mp3', image: 'leaves.jpg' },
];

const MindfulListening = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language;
  
  // Game states
  const [gameState, setGameState] = useState('intro'); // intro, playing, success, finished
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.muted);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentSound, setCurrentSound] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  // Prepare game on component mount
  useEffect(() => {
    // Load all sound effects
    SOUNDS.forEach(sound => {
      soundManager.load(sound.id, `/sounds/games/mindful-listening/${sound.file}`);
    });
    
    // Load UI sounds
    soundManager.load('correct', '/sounds/correct.mp3');
    soundManager.load('incorrect', '/sounds/incorrect.mp3');
    soundManager.load('success', '/sounds/success.mp3');
    
    return () => {
      // Stop all sounds on unmount
      Object.keys(soundManager.sounds).forEach(id => {
        soundManager.stop(id);
      });
    };
  }, []);
  
  // Toggle sound on/off
  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setSoundEnabled(!newState);
  };
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setQuestionsAnswered(0);
    generateQuestion();
  };
  
  // Generate a new question with a sound and multiple choice options
  const generateQuestion = () => {
    // Select a random sound that hasn't been played yet
    const availableSounds = SOUNDS.filter(sound => 
      !questionsAnswered || 
      !options.some(option => option.id === sound.id)
    );
    
    if (availableSounds.length === 0 || questionsAnswered >= totalQuestions) {
      // Game finished
      setGameState('finished');
      if (!soundManager.muted) {
        soundManager.play('success');
      }
      return;
    }
    
    // Select target sound and generate options
    const targetSoundIndex = Math.floor(Math.random() * availableSounds.length);
    const targetSound = availableSounds[targetSoundIndex];
    setCurrentSound(targetSound);
    
    // Create options including the correct answer and distractors
    let gameOptions = [targetSound];
    
    // Add distractor options (different sounds)
    while (gameOptions.length < 3) {
      const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      if (!gameOptions.some(option => option.id === randomSound.id)) {
        gameOptions.push(randomSound);
      }
    }
    
    // Shuffle options
    gameOptions = gameOptions.sort(() => Math.random() - 0.5);
    setOptions(gameOptions);
    setSelectedOption(null);
    
    // Play the sound
    if (!soundManager.muted) {
      setTimeout(() => {
        soundManager.play(targetSound.id);
      }, 500);
    }
  };
  
  // Play the current sound
  const playCurrentSound = () => {
    if (currentSound && !soundManager.muted) {
      soundManager.play(currentSound.id);
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Check if the answer is correct
    const isCorrect = option.id === currentSound.id;
    
    if (isCorrect) {
      setFeedback(language === 'si' ? 'හරි! හොඳයි!' : 'Correct! Great job!');
      setScore(score + 1);
      if (!soundManager.muted) {
        soundManager.play('correct');
      }
    } else {
      setFeedback(
        language === 'si' 
          ? `නැහැ, ඒක ${currentSound.name.si} ශබ්දය.` 
          : `No, that was the sound of ${currentSound.name.en}.`
      );
      if (!soundManager.muted) {
        soundManager.play('incorrect');
      }
    }
    
    // Move to next question after a delay
    setQuestionsAnswered(questionsAnswered + 1);
    setTimeout(() => {
      generateQuestion();
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-900 flex flex-col">
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
            {language === 'si' ? 'මනෝසංයම් සවන්දීම' : 'Mindful Listening'}
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

      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {gameState === 'intro' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
              {language === 'si' ? 'ශබ්දයන් සෝයන්න!' : 'Find the Sounds!'}
            </h2>
            
            <div className="mb-6">
              <div className="rounded-lg w-full h-64 bg-green-100 dark:bg-green-800 mb-6 flex items-center justify-center">
                <span className="text-6xl">👂</span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {language === 'si' 
                  ? 'සෝයන්න සහ සවන් දෙන්න! විවිධ ශබ්දයන් හදුනාගන්න.' 
                  : 'Listen carefully! Identify different sounds from the world around us.'}
              </p>
              
              <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">
                {language === 'si' ? 'ක්‍රීඩා කරන ආකාරය:' : 'How to Play:'}
              </h3>
              
              <ol className="list-decimal pl-6 mb-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  {language === 'si'
                    ? 'ශබ්දයක් නිකුත් වනු ඇත.'
                    : 'You will hear a sound.'}
                </li>
                <li>
                  {language === 'si'
                    ? 'ශබ්දය නැවත ඇසීමට "Play" බොත්තම ඔබන්න.'
                    : 'You can click "Play" to hear it again.'}
                </li>
                <li>
                  {language === 'si'
                    ? 'ශබ්දය කුමක්දැයි හඳුනාගෙන එය තෝරන්න.'
                    : 'Identify what the sound is and select it.'}
                </li>
              </ol>
            </div>
            
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 px-8 rounded-lg transition shadow"
              >
                {language === 'si' ? 'පටන් ගන්න' : 'Start Game'}
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Progress */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-600 dark:text-gray-300">
                {language === 'si' ? 'ප්‍රශ්න:' : 'Question:'} {questionsAnswered + 1}/{totalQuestions}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {language === 'si' ? 'ලකුණු:' : 'Score:'} {score}
              </div>
            </div>
            
            {/* Sound player */}
            <div className="mb-8 text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {language === 'si' ? 'මෙම ශබ්දය කුමක්ද?' : 'What is this sound?'}
              </h2>
              
              <button 
                onClick={playCurrentSound}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-full transition shadow-lg transform hover:scale-105 mx-auto flex items-center justify-center"
                aria-label={language === 'si' ? 'ශබ්දය වාදනය කරන්න' : 'Play sound'}
              >
                <FaPlay size={32} />
              </button>
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectedOption === null && handleOptionSelect(option)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-lg shadow transition flex flex-col items-center 
                    ${selectedOption === option 
                      ? option.id === currentSound?.id 
                        ? 'bg-green-100 dark:bg-green-800 border-2 border-green-500' 
                        : 'bg-red-100 dark:bg-red-800 border-2 border-red-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'
                    }`
                  }
                >
                  {/* Use emoji placeholder instead of external image */}
                  <div className={`w-full h-36 flex items-center justify-center rounded bg-${index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'yellow'}-100 dark:bg-${index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'yellow'}-900 mb-3`}>
                    <span className="text-6xl">
                      {option.id === 'birds' ? '🐦' : 
                       option.id === 'water' ? '💧' : 
                       option.id === 'wind' ? '💨' : 
                       option.id === 'bell' ? '🔔' : 
                       option.id === 'rain' ? '🌧️' : 
                       option.id === 'leaves' ? '🍃' : '🎵'}
                    </span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                    {option.name[language]}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Feedback */}
            {feedback && (
              <div className={`mt-6 p-3 rounded text-center font-medium
                ${feedback.includes('Correct') || feedback.includes('හරි') 
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' 
                  : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                }`
              }>
                {feedback}
              </div>
            )}
          </div>
        )}
        
        {gameState === 'finished' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {language === 'si' ? 'සුබ පැතුම්!' : 'Congratulations!'}
            </h2>
            
            <div className="flex justify-center mb-6">
              {Array.from({ length: Math.min(5, Math.ceil(score / (totalQuestions / 5))) }).map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-4xl mx-1" />
              ))}
            </div>
            
            <p className="text-xl mb-6 text-gray-600 dark:text-gray-300">
              {language === 'si'
                ? `ඔබ ${totalQuestions} ප්‍රශ්න වලින් ${score} ක් නිවැරදිව ලබා ගත්තා!`
                : `You got ${score} out of ${totalQuestions} correct!`}
            </p>
            
            <div className="space-x-4">
              <button
                onClick={() => startGame()}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition shadow"
              >
                {language === 'si' ? 'නැවත ක්‍රීඩා කරන්න' : 'Play Again'}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition shadow"
              >
                {language === 'si' ? 'මුල් පිටුවට' : 'Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindfulListening;
