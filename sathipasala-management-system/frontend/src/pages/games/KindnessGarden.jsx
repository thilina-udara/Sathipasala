import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVolumeUp, FaVolumeMute, FaSeedling, FaHeart, FaSun, FaWater, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import soundManager from '../../utils/soundUtils';

// Sri Lankan-themed kindness actions for children
const KINDNESS_ACTIONS = [
  {
    id: 'help',
    icon: '🤝',
    nameEn: 'Help Someone',
    nameSi: 'කාටහරි උදව් කරන්න',
    descEn: 'Help someone who needs assistance',
    descSi: 'උදව් අවශ්‍ය කෙනෙකුට උපකාර කරන්න',
    points: 10,
    growthRate: 15
  },
  {
    id: 'share',
    icon: '🍎',
    nameEn: 'Share Food',
    nameSi: 'ආහාර බෙදා ගන්න',
    descEn: 'Share your food with someone',
    descSi: 'ඔබේ ආහාර වෙනත් අය සමඟ බෙදා ගන්න',
    points: 8,
    growthRate: 12
  },
  {
    id: 'kind_words',
    icon: '💬',
    nameEn: 'Say Kind Words',
    nameSi: 'හොඳ වචන කියන්න',
    descEn: 'Say something nice to someone',
    descSi: 'කාටහරි හොඳ දෙයක් කියන්න',
    points: 5,
    growthRate: 8
  },
  {
    id: 'listen',
    icon: '👂',
    nameEn: 'Listen Mindfully',
    nameSi: 'සතිමත්ව සවන් දෙන්න',
    descEn: 'Listen attentively to what others are saying',
    descSi: 'අන් අය කියන දෙයට හොඳින් සවන් දෙන්න',
    points: 7,
    growthRate: 10
  },
  {
    id: 'respect_elders',
    icon: '🙏',
    nameEn: 'Respect Elders',
    nameSi: 'වැඩිහිටියන්ට ගරු කරන්න',
    descEn: 'Show respect to elders',
    descSi: 'වැඩිහිටියන්ට ගරු කිරීම පෙන්වන්න',
    points: 10,
    growthRate: 15
  },
  {
    id: 'clean',
    icon: '🧹',
    nameEn: 'Help Clean',
    nameSi: 'පිරිසිදු කිරීමට උදව් වන්න',
    descEn: 'Help clean up without being asked',
    descSi: 'නොඉල්ලා පිරිසිදු කිරීමට උදව් වන්න',
    points: 10,
    growthRate: 15
  },
  {
    id: 'animal',
    icon: '🐾',
    nameEn: 'Be Kind to Animals',
    nameSi: 'සතුන්ට කරුණාවන්ත වන්න',
    descEn: 'Show kindness to animals',
    descSi: 'සතුන්ට කරුණාව පෙන්වන්න',
    points: 12,
    growthRate: 18
  },
  {
    id: 'temple',
    icon: '🛕',
    nameEn: 'Visit Temple',
    nameSi: 'පන්සල් යාම',
    descEn: 'Visit temple and offer flowers',
    descSi: 'පන්සලට ගොස් මල් පූජා කරන්න',
    points: 15,
    growthRate: 20
  }
];

// Sri Lankan native plants for the garden
const PLANTS = [
  { id: 'flower', nameEn: 'Flower', nameSi: 'මල', icon: '🌷', minPoints: 0 },
  { id: 'jasmine', nameEn: 'Jasmine', nameSi: 'පිච්ච මල', icon: '🌼', minPoints: 10 },
  { id: 'lotus', nameEn: 'Lotus', nameSi: 'නෙළුම්', icon: '🪷', minPoints: 20 },
  { id: 'coconut', nameEn: 'Coconut Tree', nameSi: 'පොල් ගස', icon: '🌴', minPoints: 30 },
  { id: 'naNa', nameEn: 'Na Tree', nameSi: 'නා ගස', icon: '🌳', minPoints: 50 }
];

// Achievement badges with bilingual support
const ACHIEVEMENTS = [
  { 
    id: 'first_act', 
    nameEn: 'First Act of Kindness', 
    nameSi: 'පළමු කරුණාවන්ත ක්‍රියාව',
    icon: '🌱', 
    requirement: 1, 
    descriptionEn: 'Performed your first act of kindness',
    descriptionSi: 'ඔබගේ පළමු කරුණාවන්ත ක්‍රියාව සිදු කළා'
  },
  { 
    id: 'helping_hand', 
    nameEn: 'Helping Hand', 
    nameSi: 'උපකාරශීලී අත',
    icon: '🤲', 
    requirement: 3, 
    descriptionEn: 'Performed 3 acts of kindness',
    descriptionSi: 'කරුණාවන්ත ක්‍රියා 3ක් සිදු කළා'
  },
  { 
    id: 'kind_heart', 
    nameEn: 'Kind Heart', 
    nameSi: 'කරුණාවන්ත හදවත',
    icon: '💖', 
    requirement: 5, 
    descriptionEn: 'Performed 5 acts of kindness',
    descriptionSi: 'කරුණාවන්ත ක්‍රියා 5ක් සිදු කළා'
  },
  { 
    id: 'garden_master', 
    nameEn: 'Garden Master', 
    nameSi: 'උද්‍යාන ශිල්පී',
    icon: '🏆', 
    requirement: 10, 
    descriptionEn: 'Grew 10 plants in your garden',
    descriptionSi: 'ඔබගේ උද්‍යානයේ පැල 10ක් වැඩුවා'
  }
];

const KindnessGarden = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'en';
  
  // Game state
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.muted);
  const [gameState, setGameState] = useState('intro'); // intro, garden, action, complete
  const [points, setPoints] = useState(0); 
  const [completedActions, setCompletedActions] = useState([]);
  const [garden, setGarden] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [actionText, setActionText] = useState('');
  const [wateringPlant, setWateringPlant] = useState(null);
  
  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  const plantVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500,
        damping: 25,
        mass: 1
      }
    },
    watering: {
      y: [0, -5, 0],
      scale: [1, 1.1, 1],
      transition: { 
        duration: 0.5,
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }
    },
    grow: {
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
      transition: { 
        duration: 0.7,
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }
    }
  };
  
  const achievementVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
    }
  };
  
  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('kindnessGarden');
      if (savedData) {
        const data = JSON.parse(savedData);
        setPoints(data.points || 0);
        setCompletedActions(data.completedActions || []);
        setGarden(data.garden || []);
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading saved garden data:', error);
    }
    
    // Load sounds
    soundManager.load('plant', '/sounds/games/kindness-garden/plant.mp3'); 
    soundManager.load('water', '/sounds/games/kindness-garden/water.mp3');
    soundManager.load('grow', '/sounds/games/kindness-garden/grow.mp3');
    soundManager.load('achievement', '/sounds/games/kindness-garden/achievement.mp3');
    
    return () => {
      // Stop all sounds when component unmounts
      Object.keys(soundManager.sounds).forEach(id => soundManager.stop(id));
    };
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (points > 0 || completedActions.length > 0 || garden.length > 0) {
      localStorage.setItem('kindnessGarden', JSON.stringify({
        points, completedActions, garden, achievements
      }));
    }
  }, [points, completedActions, garden, achievements]);
  
  // Check for achievements whenever actions change
  useEffect(() => {
    const checkAchievements = () => {
      ACHIEVEMENTS.forEach(achievement => {
        // Skip if already earned
        if (achievements.some(a => a.id === achievement.id)) return;
        
        let earned = false;
        
        if (achievement.id === 'first_act' && completedActions.length >= 1) {
          earned = true;
        } else if (achievement.id === 'helping_hand' && completedActions.length >= 3) {
          earned = true;
        } else if (achievement.id === 'kind_heart' && completedActions.length >= 5) {
          earned = true;
        } else if (achievement.id === 'garden_master' && garden.length >= 10) {
          earned = true;
        }
        
        if (earned) {
          const newAchievements = [...achievements, achievement];
          setAchievements(newAchievements);
          setNewAchievement(achievement);
          if (!soundManager.muted) soundManager.play('achievement');
          
          // Show achievement for 3 seconds
          setTimeout(() => setNewAchievement(null), 3000);
        }
      });
    };
    
    checkAchievements();
  }, [completedActions, garden]);
  
  // Toggle sound 
  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setSoundEnabled(!newState);
  };
  
  // Start the game - go to garden view
  const startGame = () => {
    setGameState('garden');
  };
  
  // Open add kindness action form
  const openAddAction = () => {
    setGameState('action');
  };
  
  // Record a new kindness action
  const recordAction = (action) => {
    // Create new action record with timestamp
    const newAction = {
      ...action,
      date: new Date().toISOString(),
      text: actionText || action[language === 'si' ? 'nameSi' : 'nameEn']
    };
    
    // Update points and completed actions
    setPoints(prev => prev + action.points);
    setCompletedActions(prev => [newAction, ...prev]);
    
    // Plant a new plant in garden
    const availablePlants = PLANTS.filter(plant => plant.minPoints <= points + action.points);
    const randomIndex = Math.floor(Math.random() * availablePlants.length);
    const newPlant = {
      ...availablePlants[randomIndex],
      growthStage: 0,
      maxGrowth: 100,
      growthPoints: action.growthRate,
      plantedAt: new Date().toISOString()
    };
    
    setGarden(prev => [...prev, newPlant]);
    if (!soundManager.muted) soundManager.play('plant');
    
    // Clear action text and return to garden
    setActionText('');
    setGameState('garden');
  };
  
  // Water/nurture plants to help them grow
  const waterPlant = (index) => {
    // Set wateringPlant to trigger animation
    setWateringPlant(index);
    
    const updatedGarden = [...garden];
    const plant = updatedGarden[index];
    
    // Increase growth stage if not fully grown
    if (plant.growthStage < plant.maxGrowth) {
      if (!soundManager.muted) soundManager.play('water');
      
      // After water animation completes
      setTimeout(() => {
        // Update the growth
        updatedGarden[index] = {
          ...plant,
          growthStage: Math.min(plant.maxGrowth, plant.growthStage + plant.growthPoints)
        };
        
        setGarden(updatedGarden);
        setWateringPlant(null);
        
        // If fully grown now, play grow sound
        if (updatedGarden[index].growthStage >= plant.maxGrowth && !soundManager.muted) {
          setTimeout(() => soundManager.play('grow'), 500);
        }
      }, 600);
    }
  };
  
  // Get a plant element with appropriate growth stage
  const renderPlant = (plant, index) => {
    const growthPercentage = (plant.growthStage / plant.maxGrowth) * 100;
    const isFullyGrown = growthPercentage >= 100;
    const isWatering = wateringPlant === index;
    
    return (
      <motion.div 
        key={index} 
        className="flex flex-col items-center mx-2 mb-4 cursor-pointer"
        variants={plantVariants}
        initial="hidden"
        animate={isWatering ? "watering" : isFullyGrown && isWatering ? "grow" : "visible"}
        whileHover={{ scale: 1.1 }}
        onClick={() => waterPlant(index)}
        title={language === 'si' 
          ? isFullyGrown ? 'සම්පූර්ණයෙන් වැඩුණු ' + (plant.nameSi || 'පැළය') : 'ජලය දෙන්න' 
          : isFullyGrown ? 'Fully grown ' + (plant.nameEn || 'plant') : 'Water this plant'}
      >
        <div className="mb-1">
          <motion.div
            animate={isFullyGrown ? { 
              y: [0, -5, 0], 
              transition: { 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              } 
            } : {}}
          >
            <span className="text-4xl">{plant.icon}</span>
          </motion.div>
        </div>
        <p className="text-xs text-center text-gray-600 dark:text-gray-300">
          {language === 'si' ? plant.nameSi || 'පැළය' : plant.nameEn || 'Plant'}
        </p>
        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
          <motion.div 
            className={`h-full ${isFullyGrown ? 'bg-green-500' : 'bg-blue-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${growthPercentage}%` }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              duration: 0.8
            }}
          />
        </div>
        
        {/* Water drop animation */}
        <AnimatePresence>
          {isWatering && (
            <motion.div 
              className="absolute"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 20, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-blue-500 text-2xl">💧</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Define the steps for the instructions
  const instructionSteps = [
    language === 'si' ? 'කරුණාවන්ත ක්‍රියාවක් තෝරන්න' : 'Choose an act of kindness',
    language === 'si' ? 'ඔබ එය සිදු කළ බවට සටහන් කරන්න' : 'Record that you did it',
    language === 'si' ? 'ඔබේ උද්‍යානයේ නව පැළයක් වැවෙනු ඇත' : 'A new plant will grow in your garden',
    language === 'si' ? 'පැළ වලට ජලය දී ඒවා වර්ධනය වීමට උපකාර කරන්න' : 'Water your plants to help them grow'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 dark:from-blue-900 dark:to-green-900 flex flex-col">
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
            {language === 'si' ? 'කරුණාවේ උද්‍යානය' : 'Kindness Garden'}
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

      {/* Game Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Introduction Screen */}
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-2xl font-bold mb-4 text-center text-green-700 dark:text-green-400"
                variants={itemVariants}
              >
                {language === 'si' ? 'ඔබගේ කරුණාවේ උද්‍යානය වවන්න!' : 'Grow Your Kindness Garden!'}
              </motion.h2>
              
              <motion.div 
                className="mb-6 text-center py-8"
                variants={itemVariants}
              >
                <motion.div 
                  className="flex justify-center space-x-4 mb-8"
                  variants={containerVariants}
                >
                  {['🌱', '🌼', '🪷', '🌴'].map((icon, index) => (
                    <motion.span 
                      key={index}
                      className="text-5xl"
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: index * 0.1
                        }
                      }}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: [-5, 5, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      {icon}
                    </motion.span>
                  ))}
                </motion.div>
                
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 mb-4"
                  variants={itemVariants}
                >
                  {language === 'si' 
                    ? 'කරුණාවන්ත ක්‍රියාවන් තුළින් ඔබේම විශේෂ උද්‍යානයක් වවන්න. එක් එක් හොඳ ක්‍රියාව අලුත් පැළයක් වවයි!'
                    : 'Grow your own special garden through acts of kindness. Each kind deed plants a new seed!'}
                </motion.p>
                
                <motion.h3 
                  className="font-bold mb-2 text-gray-800 dark:text-gray-100"
                  variants={itemVariants}
                >
                  {language === 'si' ? 'ක්‍රීඩා කරන ආකාරය:' : 'How to Play:'}
                </motion.h3>
                
                <motion.ol 
                  className="list-decimal pl-6 mb-6 text-gray-600 dark:text-gray-300 space-y-2 text-left max-w-md mx-auto"
                  variants={containerVariants}
                >
                  {instructionSteps.map((step, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      custom={index}
                    >
                      {step}
                    </motion.li>
                  ))}
                </motion.ol>
              </motion.div>
              
              <motion.div 
                className="text-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 px-8 rounded-lg shadow"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.2)"
                  }}
                >
                  {language === 'si' ? 'උද්‍යානය අරඹන්න' : 'Start Garden'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Garden View */}
          {gameState === 'garden' && (
            <motion.div 
              key="garden"
              className="max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Garden Stats & Controls */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <FaHeart className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {language === 'si' ? 'කරුණාවේ ලකුණු' : 'Kindness Points'}
                    </h3>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{points}</p>
                  </div>
                </div>
                
                <div className="flex items-center my-2 sm:my-0">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <FaSeedling className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {language === 'si' ? 'පැළෑටි' : 'Plants'}
                    </h3>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{garden.length}</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={openAddAction}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaHeart className="mr-2" />
                  {language === 'si' ? 'කරුණාවන්ත ක්‍රියාවක් එකතු කරන්න' : 'Add Kind Action'}
                </motion.button>
              </motion.div>
              
              {/* Achievements Banner - Shown when a new achievement is earned */}
              <AnimatePresence>
                {newAchievement && (
                  <motion.div 
                    className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        transition: {
                          duration: 1,
                          repeat: Infinity,
                          repeatType: "loop",
                          repeatDelay: 1
                        }
                      }}
                    >
                      {newAchievement.icon}
                    </motion.div>
                    <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-300">
                      {language === 'si' ? 'නව ජයග්‍රහණය!' : 'New Achievement!'}
                    </h3>
                    <p>{language === 'si' ? newAchievement.nameSi : newAchievement.nameEn}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {language === 'si' ? newAchievement.descriptionSi : newAchievement.descriptionEn}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Garden Area */}
              <motion.div 
                className="bg-green-50 dark:bg-green-900 rounded-xl shadow-lg p-6 min-h-[300px] relative overflow-hidden"
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute top-3 right-6 text-4xl"
                  animate={{ 
                    rotate: [0, 360],
                    transition: { 
                      duration: 80, 
                      ease: "linear", 
                      repeat: Infinity 
                    }
                  }}
                >
                  ☀️
                </motion.div>
                
                {/* Garden Title */}
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-8 text-center">
                  {language === 'si' ? 'ඔබගේ උද්‍යානය' : 'Your Garden'}
                </h2>
                
                {/* Empty Garden State */}
                <AnimatePresence>
                  {garden.length === 0 && (
                    <motion.div 
                      className="text-center py-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className="text-6xl mb-4"
                        animate={{ 
                          y: [0, -10, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity
                          }
                        }}
                      >
                        🌱
                      </motion.div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'si' 
                          ? 'ඔබගේ උද්‍යානය තවම හිස්ය. කරුණාවන්ත ක්‍රියාවක් එකතු කරන්න!'
                          : 'Your garden is empty. Add a kind action to plant your first seed!'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Garden Plants */}
                {garden.length > 0 && (
                  <motion.div 
                    className="flex flex-wrap justify-center items-end pt-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {garden.map((plant, index) => renderPlant(plant, index))}
                  </motion.div>
                )}
                
                {/* Ground/Grass */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-10 bg-green-700 dark:bg-green-800"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
              
              {/* Recent Kind Actions */}
              <motion.div 
                className="mt-6"
                variants={itemVariants}
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {language === 'si' ? 'මෑත කරුණාවන්ත ක්‍රියා' : 'Recent Kind Actions'}
                </h3>
                
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-hidden"
                  variants={itemVariants}
                >
                  {completedActions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {language === 'si' 
                        ? 'තවම කරුණාවන්ත ක්‍රියා නැත. දැන් එකක් එකතු කරන්න!'
                        : 'No kind actions yet. Add one now!'}
                    </p>
                  ) : (
                    <motion.div 
                      className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto"
                      variants={containerVariants}
                    >
                      {completedActions.slice(0, 10).map((action, index) => (
                        <motion.div 
                          key={index} 
                          className="py-3 flex items-start"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          transition={{ 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                          }}
                          whileHover={{ 
                            backgroundColor: "rgba(0,0,0,0.05)", 
                            scale: 1.01 
                          }}
                        >
                          <div className="text-2xl mr-3">{action.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {action.text || (language === 'si' ? action.nameSi : action.nameEn)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(action.date).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US')} • +{action.points} {language === 'si' ? 'ලකුණු' : 'points'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
              
              {/* Achievements Section */}
              {achievements.length > 0 && (
                <motion.div 
                  className="mt-6"
                  variants={itemVariants}
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {language === 'si' ? 'ජයග්‍රහණ' : 'Achievements'}
                  </h3>
                  
                  <motion.div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="flex flex-wrap gap-4"
                      variants={containerVariants}
                    >
                      {achievements.map((achievement, index) => (
                        <motion.div 
                          key={index} 
                          className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3 flex items-center space-x-3"
                          variants={achievementVariants}
                          whileHover="hover"
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-300">
                              {language === 'si' ? achievement.nameSi : achievement.nameEn}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {language === 'si' ? achievement.descriptionSi : achievement.descriptionEn}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Add Kindness Action Screen */}
          {gameState === 'action' && (
            <motion.div 
              key="action"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-2xl font-bold mb-6 text-center text-green-700 dark:text-green-400"
                variants={itemVariants}
              >
                {language === 'si' ? 'කරුණාවන්ත ක්‍රියාවක් එකතු කරන්න' : 'Add a Kind Action'}
              </motion.h2>
              
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <label htmlFor="actionText" className="block text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'si' ? 'ඔබ කළ හොඳ දේ විස්තර කරන්න (විකල්ප)' : 'Describe what you did (optional)'}
                </label>
                <motion.textarea
                  id="actionText"
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={language === 'si' ? 'උදාහරණයක්: මම අද මගේ මිතුරෙකුට උදව් කළා...' : 'Example: Today I helped my friend...'}
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                />
              </motion.div>
              
              <motion.div 
                className="text-center mb-6"
                variants={itemVariants}
              >
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {language === 'si' ? 'කරුණාවන්ත ක්‍රියාවක් තෝරන්න' : 'Choose a Kind Action'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {language === 'si' ? 'ඔබ සිදු කළ කරුණාවන්ත ක්‍රියාව තෝරන්න' : 'Select the kind action you performed'}
                </p>
              </motion.div>
              
              {/* Kind Actions Grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6"
                variants={containerVariants}
              >
                {KINDNESS_ACTIONS.map((action, index) => (
                  <motion.button 
                    key={action.id}
                    onClick={() => recordAction(action)}
                    className="bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg p-4 text-center"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        transition: { 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: index * 0.5
                        }
                      }}
                    >
                      {action.icon}
                    </motion.div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {language === 'si' ? action.nameSi : action.nameEn}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'si' ? action.descSi : action.descEn}
                    </p>
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                      +{action.points} {language === 'si' ? 'ලකුණු' : 'points'}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Cancel Button */}
              <motion.div 
                className="text-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setGameState('garden')}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {language === 'si' ? 'ආපසු' : 'Cancel'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KindnessGarden;
