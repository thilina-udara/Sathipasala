import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaVolumeUp, FaVolumeMute, FaStar, FaCheck, FaPlay } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import soundManager from '../../utils/soundUtils';

// Five Precepts data with enhanced bilingual support
const PRECEPTS = [
  {
    id: 1,
    nameEn: "Refrain from Harming",
    nameSi: "පාණාතිපාතා වේරමණී",
    descriptionEn: "I undertake the training rule to abstain from killing.",
    descriptionSi: "පාණාතිපාතා වේරමණී සික්ඛාපදං සමාදියාමි",
    explanationEn: "This precept emphasizes respect for all living beings and not causing harm.",
    explanationSi: "මෙම සීලය සියලු සත්වයින්ට ගරු කිරීම සහ හිංසා නොකිරීම අවධාරණය කරයි.",
    color: "#FF6B6B", // red
    icon: "🕊️",
    examples: [
      { en: "Being kind to animals", si: "සතුන්ට කරුණාවන්ත වීම" },
      { en: "Not hurting insects", si: "කෘමීන්ට හානි නොකිරීම" },
      { en: "Protecting nature", si: "ස්වභාව ධර්මය ආරක්ෂා කිරීම" }
    ]
  },
  {
    id: 2,
    nameEn: "Refrain from Taking What is Not Given",
    nameSi: "අදින්නාදානා වේරමණී",
    descriptionEn: "I undertake the training rule to abstain from stealing.",
    descriptionSi: "අදින්නාදානා වේරමණී සික්ඛාපදං සමාදියාමි",
    explanationEn: "This precept teaches us to respect others' belongings and only take what is freely given.",
    explanationSi: "මෙම සීලය අන් අයගේ දේපළ වලට ගරු කිරීම සහ නිදහසේ දෙන දේ පමණක් ගැනීම ගැන උගන්වයි.",
    color: "#FFD93D", // yellow
    icon: "🤲",
    examples: [
      { en: "Asking before borrowing", si: "ණයට ගැනීමට පෙර ඉල්ලීම" },
      { en: "Returning things you borrow", si: "ඔබ ණයට ගන්නා දේ ආපසු දීම" },
      { en: "Not taking others' belongings", si: "අන් අයගේ දේපළ නොගැනීම" }
    ]
  },
  {
    id: 3,
    nameEn: "Refrain from Sexual Misconduct",
    nameSi: "කාමෙසුමිච්ඡාචාරා වේරමණී",
    descriptionEn: "I undertake the training rule to avoid improper behavior.",
    descriptionSi: "කාමෙසුමිච්ඡාචාරා වේරමණී සික්ඛාපදං සමාදියාමි",
    explanationEn: "This precept guides us to behave in a respectful and appropriate way.",
    explanationSi: "මෙම සීලය ගෞරවනීය සහ සුදුසු ආකාරයෙන් හැසිරීමට අපට මග පෙන්වයි.",
    color: "#6BCB77", // green
    icon: "❤️",
    examples: [
      { en: "Being respectful to others", si: "අන් අයට ගෞරව කිරීම" },
      { en: "Using good manners", si: "හොඳ චර්යාවන් භාවිතා කිරීම" },
      { en: "Being mindful of your actions", si: "ඔබේ ක්‍රියා ගැන සිහිබුද්ධියෙන් සිටීම" }
    ]
  },
  {
    id: 4,
    nameEn: "Refrain from False Speech",
    nameSi: "මුසාවාදා වේරමණී",
    descriptionEn: "I undertake the training rule to refrain from false speech.",
    descriptionSi: "මුසාවාදා වේරමණී සික්ඛාපදං සමාදියාමි",
    explanationEn: "This precept teaches us to speak truthfully and kindly.",
    explanationSi: "මෙම සීලය සත්‍ය ලෙස සහ කරුණාවෙන් කථා කිරීමට අපට උගන්වයි.",
    color: "#4D96FF", // blue
    icon: "🗣️",
    examples: [
      { en: "Telling the truth", si: "සත්‍යය පැවසීම" },
      { en: "Not spreading rumors", si: "කටකථා නොපැතිරවීම" },
      { en: "Speaking kindly to others", si: "අන් අයට කරුණාවෙන් කථා කිරීම" }
    ]
  },
  {
    id: 5,
    nameEn: "Refrain from Intoxication",
    nameSi: "සුරාමේරය වේරමණී",
    descriptionEn: "I undertake the training rule to abstain from intoxicants.",
    descriptionSi: "සුරාමේරයමජ්ජපමාදට්ඨානා වේරමණී සික්ඛාපදං සමාදියාමි",
    explanationEn: "This precept helps us keep our mind clear and make good decisions.",
    explanationSi: "මෙම සීලය අපේ මනස පැහැදිලිව තබා ගැනීමට සහ හොඳ තීරණ ගැනීමට උපකාර වේ.",
    color: "#9D65C9", // purple
    icon: "🧠",
    examples: [
      { en: "Eating healthy food", si: "සෞඛ්‍ය සම්පන්න ආහාර ගැනීම" },
      { en: "Avoiding harmful substances", si: "හානිකර ද්‍රව්‍යයන්ගෙන් වැළකීම" },
      { en: "Keeping your mind clear", si: "ඔබේ මනස පැහැදිලිව තබා ගැනීම" }
    ]
  }
];

// Create questions with enhanced bilingual support
const createQuestions = (precepts) => {
  const questions = [];
  
  // Create multiple choice questions for each precept
  precepts.forEach(precept => {
    questions.push({
      type: 'multipleChoice',
      questionEn: `Which precept teaches us: "${precept.descriptionEn}"?`,
      questionSi: `කුමන සීලයෙන් අපට උගන්වන්නේ: "${precept.descriptionSi}"?`,
      options: PRECEPTS.map(p => ({ textEn: p.nameEn, textSi: p.nameSi, id: p.id })),
      correctAnswer: precept.id,
      preceptId: precept.id
    });
    
    // Create matching questions
    questions.push({
      type: 'matching',
      questionEn: `Match this example with the correct precept: "${precept.examples[0].en}"`,
      questionSi: `මෙම උදාහරණය නිවැරදි සීලය සමඟ ගළපන්න: "${precept.examples[0].si}"`,
      options: PRECEPTS.map(p => ({ textEn: p.nameEn, textSi: p.nameSi, id: p.id })),
      correctAnswer: precept.id,
      preceptId: precept.id
    });
  });
  
  // Create scenario-based questions
  questions.push({
    type: 'scenario',
    questionEn: "If you see someone dropping trash in a park, which precept guides your action?",
    questionSi: "ඔබ උද්‍යානයක කුණු දමන කෙනෙකු දුටුවොත්, කුමන සීලයෙන් ඔබේ ක්‍රියාව මග පෙන්වන්නේ?",
    options: PRECEPTS.map(p => ({ textEn: p.nameEn, textSi: p.nameSi, id: p.id })),
    correctAnswer: 1, // 1st precept - harm to environment
    explanationEn: "The first precept teaches us to respect all living beings, including the environment.",
    explanationSi: "පළමු සීලය පරිසරය ඇතුළුව සියලු ජීවීන්ට ගරු කිරීමට අපට උගන්වයි."
  });
  
  questions.push({
    type: 'scenario',
    questionEn: "If your friend asks for help with homework, which precept relates most to how you respond?",
    questionSi: "ඔබේ මිතුරා ගෙදර වැඩ සඳහා උදව් ඉල්ලුවොත්, ඔබ ප්‍රතිචාර දක්වන ආකාරයට වඩාත්ම සම්බන්ධ සීලය කුමක්ද?",
    options: PRECEPTS.map(p => ({ textEn: p.nameEn, textSi: p.nameSi, id: p.id })),
    correctAnswer: 4, // 4th precept - truthful speech
    explanationEn: "The fourth precept guides us to be honest in our communications.",
    explanationSi: "සිව්වන සීලය අපගේ සන්නිවේදනයේදී අවංක වීමට අපට මග පෙන්වයි."
  });
  
  return questions.sort(() => Math.random() - 0.5); // Shuffle questions
};

const FivePrecepts = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'en';
  
  // Game state
  const [gameState, setGameState] = useState('intro'); // intro, learning, quiz, completed
  const [currentPreceptIndex, setCurrentPreceptIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.muted);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Initialize questions
  useEffect(() => {
    setQuestions(createQuestions(PRECEPTS).slice(0, 10)); // Limit to 10 questions for better experience
  }, []);

  // Load sounds
  useEffect(() => {
    soundManager.load('correct', '/sounds/correct.mp3');
    soundManager.load('incorrect', '/sounds/incorrect.mp3');
    soundManager.load('success', '/sounds/success.mp3');
    
    return () => {
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
  
  // Start the learning phase
  const startLearning = () => {
    setGameState('learning');
    if (!soundManager.muted) {
      soundManager.play('click');
    }
  };
  
  // Go to next precept in learning phase
  const nextPrecept = () => {
    if (currentPreceptIndex < PRECEPTS.length - 1) {
      setCurrentPreceptIndex(currentPreceptIndex + 1);
      if (!soundManager.muted) {
        soundManager.play('click');
      }
    } else {
      // All precepts learned, start quiz
      setGameState('quiz');
      setCurrentQuestionIndex(0);
      if (!soundManager.muted) {
        soundManager.play('success');
      }
    }
  };
  
  // Previous precept in learning phase
  const prevPrecept = () => {
    if (currentPreceptIndex > 0) {
      setCurrentPreceptIndex(currentPreceptIndex - 1);
      if (!soundManager.muted) {
        soundManager.play('click');
      }
    }
  };
  
  // Handle answer selection in quiz
  const handleAnswerSelect = (answerId) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answerId);
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answerId === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      if (!soundManager.muted) {
        soundManager.play('correct');
      }
    } else {
      if (!soundManager.muted) {
        soundManager.play('incorrect');
      }
    }
    
    // Show explanation
    setShowExplanation(true);
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);
      } else {
        // Quiz completed
        setGameState('completed');
        if (!soundManager.muted) {
          soundManager.play('success');
        }
      }
    }, 3000);
  };
  
  // Calculate stars based on score
  const getStars = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 3;
    if (percentage >= 60) return 2;
    return 1;
  };
  
  // Restart the game
  const restartGame = () => {
    setGameState('intro');
    setCurrentPreceptIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setQuestions(createQuestions(PRECEPTS).slice(0, 10));
  };

  // Get current precept
  const currentPrecept = PRECEPTS[currentPreceptIndex];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-2" />
            <span>{language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
          </button>
          <h1 className="text-2xl font-bold text-center">
            {language === 'si' ? 'පංචසීල ගමන' : 'Five Precepts Journey'}
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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4 text-center text-purple-700 dark:text-purple-400">
                  {language === 'si' ? 'පංචසීලය ඉගෙනගනිමු!' : 'Learn the Five Precepts!'}
                </h2>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex justify-center space-x-4 mb-6">
                  {PRECEPTS.map((precept, index) => (
                    <motion.div 
                      key={precept.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ backgroundColor: precept.color }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
                    >
                      {precept.icon}
                    </motion.div>
                  ))}
                </div>
                
                <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-4">
                  {language === 'si' 
                    ? 'මෙම ගමනේදී, බුද්ධාගමේ පංච සීලය ගැන ඉගෙනගන්න. සරල විස්තර සහ උදාහරණ තුළින් පංච සීලය තේරුම් ගන්න.'
                    : 'In this journey, learn about the Five Precepts of Buddhism. Understand the precepts through simple explanations and examples.'}
                </motion.p>
                
                <motion.div variants={itemVariants} className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">
                    {language === 'si' ? 'මෙහි ඇතුළත් දේ:' : 'What\'s included:'}
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                    <motion.li variants={itemVariants}>
                      {language === 'si' ? 'පංච සීලයේ සම්පූර්ණ පාලි පාඨ සහ සිංහල අර්ථය' : 'Complete Pali text and meaning of the Five Precepts'}
                    </motion.li>
                    <motion.li variants={itemVariants}>
                      {language === 'si' ? 'එක් එක් සීලයේ සරල පැහැදිලි කිරීම්' : 'Simple explanations for each precept'}
                    </motion.li>
                    <motion.li variants={itemVariants}>
                      {language === 'si' ? 'එදිනෙදා ජීවිතයේ උදාහරණ' : 'Examples from everyday life'}
                    </motion.li>
                    <motion.li variants={itemVariants}>
                      {language === 'si' ? 'ඔබේ දැනුම පරීක්ෂා කිරීමට විනෝදජනක ප්‍රශ්නාවලියක්' : 'A fun quiz to test your knowledge'}
                    </motion.li>
                  </ul>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex justify-center">
                <button 
                  onClick={startLearning}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition shadow font-medium flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay />
                  <span>{language === 'si' ? 'ඉගැනීම ආරම්භ කරන්න' : 'Start Learning'}</span>
                </button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Learning Phase */}
          {gameState === 'learning' && (
            <motion.div 
              key="learning"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
            >
              {/* Progress indicator */}
              <div className="flex mb-4">
                {PRECEPTS.map((precept, index) => (
                  <div 
                    key={index} 
                    className={`h-2 flex-1 mx-1 rounded-full ${
                      index === currentPreceptIndex 
                        ? 'bg-purple-500' 
                        : index < currentPreceptIndex 
                          ? 'bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              {/* Precept Content */}
              <motion.div
                key={currentPreceptIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row mb-6">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 md:mb-0 md:mr-6 shadow-md"
                    style={{ backgroundColor: currentPrecept.color }}
                  >
                    {currentPrecept.icon}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {currentPrecept.nameEn}
                    </h2>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      {currentPrecept.nameSi}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                      {currentPrecept.descriptionEn}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 font-semibold">
                      {currentPrecept.descriptionSi}
                    </p>
                    <div className="mb-2">
                      <p className="text-gray-700 dark:text-gray-300">
                        {language === 'si' ? currentPrecept.explanationSi : currentPrecept.explanationEn}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Examples */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {language === 'si' ? 'උදාහරණ:' : 'Examples:'}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentPrecept.examples.map((example, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {language === 'si' ? example.si : example.en}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={prevPrecept}
                  disabled={currentPreceptIndex === 0}
                  className={`px-4 py-2 rounded ${
                    currentPreceptIndex === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {language === 'si' ? 'පෙර' : 'Previous'}
                </button>
                
                <button
                  onClick={nextPrecept}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
                >
                  {currentPreceptIndex < PRECEPTS.length - 1 
                    ? (language === 'si' ? 'ඊළඟ' : 'Next') 
                    : (language === 'si' ? 'ප්‍රශ්නාවලිය ආරම්භ කරන්න' : 'Start Quiz')}
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Quiz Phase */}
          {gameState === 'quiz' && questions.length > 0 && (
            <motion.div 
              key="quiz"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
            >
              {/* Progress indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'si' ? 'ප්‍රශ්න' : 'Question'} {currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {language === 'si' ? 'ලකුණු' : 'Score'}: {score}
                </div>
              </div>
              
              {/* Question */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                  {language === 'si' 
                    ? questions[currentQuestionIndex].questionSi 
                    : questions[currentQuestionIndex].questionEn}
                </h3>
                
                {/* Answer options */}
                <div className="space-y-3">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-3 rounded-lg border ${
                        selectedAnswer === option.id
                          ? selectedAnswer === questions[currentQuestionIndex].correctAnswer
                            ? 'bg-green-100 border-green-500 dark:bg-green-800 dark:border-green-600'
                            : 'bg-red-100 border-red-500 dark:bg-red-800 dark:border-red-600'
                          : 'bg-gray-50 border-gray-300 hover:bg-purple-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{index + 1}.</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{language === 'si' ? option.textSi : option.textEn}</span>
                          {language === 'si' ? 
                            <span className="text-xs text-gray-500 dark:text-gray-400">{option.textEn}</span> :
                            <span className="text-xs text-gray-500 dark:text-gray-400">{option.textSi}</span>
                          }
                        </div>
                        {selectedAnswer === option.id && (
                          <span className="ml-auto">
                            {option.id === questions[currentQuestionIndex].correctAnswer ? (
                              <FaCheck className="text-green-600 dark:text-green-400" />
                            ) : (
                              <span className="text-red-600 dark:text-red-400">✗</span>
                            )}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Feedback for answer */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-lg ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {isCorrect 
                        ? (language === 'si' ? 'නිවැරදියි! 👏' : 'Correct! 👏')
                        : (language === 'si' ? 'වැරදියි' : 'Incorrect')
                      }
                    </p>
                    
                    {!isCorrect && (
                      <p>
                        {language === 'si' 
                          ? 'නිවැරදි පිළිතුර: ' 
                          : 'The correct answer: '
                        }
                        <span className="font-semibold">
                          {language === 'si' 
                            ? PRECEPTS.find(p => p.id === questions[currentQuestionIndex].correctAnswer)?.nameSi
                            : PRECEPTS.find(p => p.id === questions[currentQuestionIndex].correctAnswer)?.nameEn
                          }
                        </span>
                      </p>
                    )}
                    
                    {questions[currentQuestionIndex].explanationEn && (
                      <p className="mt-1 text-sm">
                        {language === 'si' 
                          ? questions[currentQuestionIndex].explanationSi 
                          : questions[currentQuestionIndex].explanationEn
                        }
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* Completion Screen */}
          {gameState === 'completed' && (
            <motion.div 
              key="completed"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto text-center"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100"
              >
                {language === 'si' ? 'සුබ පැතුම්!' : 'Congratulations!'}
              </motion.h2>
              
              <motion.div 
                variants={itemVariants}
                className="flex justify-center mb-6"
              >
                {Array.from({ length: getStars() }).map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.3, type: 'spring' }}
                  >
                    <FaStar className="text-yellow-500 text-4xl mx-1" />
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl mb-2 text-gray-800 dark:text-gray-100"
              >
                {language === 'si'
                  ? `ඔබ ${questions.length} ප්‍රශ්නයෙන් ${score}ක් නිවැරදිව ලබා ගත්තා!`
                  : `You got ${score} out of ${questions.length} correct!`}
              </motion.p>
              
              <motion.p 
                variants={itemVariants}
                className="mb-6 text-gray-600 dark:text-gray-300"
              >
                {language === 'si' 
                  ? 'දැන් ඔබට පංච සීලය ගැන හොඳ අවබෝධයක් ඇත. එය ඔබේ දෛනික ජීවිතයට යොදා ගන්න.' 
                  : 'You now have a good understanding of the Five Precepts. Apply them in your daily life.'}
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4"
              >
                <motion.button
                  onClick={restartGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Play Again'}
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Language switch button */}
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={() => i18n.changeLanguage(language === 'en' ? 'si' : 'en')}
          className="bg-white dark:bg-gray-700 shadow-lg rounded-full p-3 text-sm font-medium"
        >
          {language === 'en' ? 'සිංහල' : 'English'}
        </button>
      </div>
    </div>
  );
};

export default FivePrecepts;
