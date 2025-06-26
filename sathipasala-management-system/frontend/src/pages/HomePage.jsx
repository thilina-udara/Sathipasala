import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBook, FaGamepad, FaNewspaper, FaYinYang, FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
// Replace SwiperJS with Embla Carousel for a smooth, auto-swiping, responsive gallery
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

// Logo import
import logo from "../components/image/logo/logo.png";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const HomePage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
  };

  // Play sound effect when not muted
  const playSound = () => {
    if (!isMuted) {
      // In a real app, you would play an actual sound file
      console.log("Playing sound effect");
    }
  };

  // Subject cards data
  const subjects = [
    {
      name: "English",
      icon: "🇬🇧",
      levels: [
        { title: "ආරම්භක", enTitle: "Beginner", color: "bg-blue-100" },
        { title: "මධ්‍යම", enTitle: "Intermediate", color: "bg-blue-200" },
        { title: "උසස්", enTitle: "Advanced", color: "bg-blue-300" }
      ],
      description: language === "si" 
        ? "ඉංග්‍රීසි භාෂාව ප්‍රාථමික සිට උසස් මට්ටම් දක්වා"
        : "English language from basic to advanced levels"
    },
    {
      name: "Yoga",
      icon: "🧘",
      levels: [
        { title: "මූලික", enTitle: "Foundations", color: "bg-green-100" },
        { title: "ළමා යෝග", enTitle: "Kids Yoga", color: "bg-green-200" },
        { title: "ධ්‍යාන", enTitle: "Meditation", color: "bg-green-300" }
      ],
      description: language === "si" 
        ? "ශරීරයට හා මනසට ප්‍රයෝජනවත් යෝග අභ්‍යාස"
        : "Yoga practices beneficial for body and mind"
    },
    {
      name: "Pali",
      icon: "🕉️",
      levels: [
        { title: "මූලික", enTitle: "Basics", color: "bg-yellow-100" },
        { title: "සූත්‍ර", enTitle: "Suttas", color: "bg-yellow-200" },
        { title: "උසස්", enTitle: "Advanced", color: "bg-yellow-300" }
      ],
      description: language === "si" 
        ? "පාලි භාෂාව හා බෞද්ධ ග්‍රන්ථ"
        : "Pali language and Buddhist scriptures"
    },
    {
      name: "Math",
      icon: "🧮",
      levels: [
        { title: "සංඛ්‍යා", enTitle: "Numbers", color: "bg-purple-100" },
        { title: "වීජීය", enTitle: "Algebra", color: "bg-purple-200" },
        { title: "ජ්‍යාමිතිය", enTitle: "Geometry", color: "bg-purple-300" }
      ],
      description: language === "si" 
        ? "ගණිතය ප්‍රාථමික සිට උසස් මට්ටම් දක්වා"
        : "Mathematics from basic to advanced levels"
    },
    {
      name: "Japanese",
      icon: "🇯🇵",
      levels: [
        { title: "හිරගන", enTitle: "Hiragana", color: "bg-red-100" },
        { title: "කතකන", enTitle: "Katakana", color: "bg-red-200" },
        { title: "කාන්ජි", enTitle: "Kanji", color: "bg-red-300" }
      ],
      description: language === "si" 
        ? "ජපන් භාෂාව හා සංස්කෘතිය"
        : "Japanese language and culture"
    }
  ];

  // Educational games data
  const educationalGames = [
    {
      title: language === "si" ? "හුස්ම ගන්න මිතුරෝ" : "Breathing Buddies",
      desc: language === "si" ? "සාමකාමී හුස්ම ගැනීමේ අභ්‍යාස සඳහා උපකාරී වේ" : "Helps practice peaceful breathing",
      icon: "🧘‍♂️",
      path: "/games/breathing-buddies",
      ageGroup: language === "si" ? "අවුරුදු 3-6" : "Ages 3-6",
      color: "blue"
    },
    {
      title: language === "si" ? "මනෝසංයම් සවන්දීම" : "Mindful Listening",
      desc: language === "si" ? "ශබ්දයන් හඳුනා ගැනීම සඳහා වන ක්‍රීඩාව" : "Game for identifying sounds",
      icon: "👂",
      path: "/games/mindful-listening",
      ageGroup: language === "si" ? "අවුරුදු 3-6" : "Ages 3-6",
      color: "green"
    },
    {
      title: language === "si" ? "කරුණාවේ උද්‍යානය" : "Kindness Garden",
      desc: language === "si" ? "කරුණාවන්ත ක්‍රියා තුළින් උද්‍යානයක් වවන්න" : "Grow a garden through kind actions",
      icon: "🌱",
      path: "/games/kindness-garden",
      ageGroup: language === "si" ? "අවුරුදු 7-10" : "Ages 7-10",
      color: "green"
    },
    {
      title: language === "si" ? "පංචසීල ගමන" : "Five Precepts Journey",
      desc: language === "si" ? "පංචසීලය ගැන ඉගෙනගන්න" : "Learn about the Five Precepts",
      icon: "🏆",
      path: "/games/five-precepts",
      ageGroup: language === "si" ? "අවුරුදු 11-13" : "Ages 11-13",
      color: "purple"
    },
    {
      title: language === "si" ? "ශාන්ත වනය" : "Sacred Grove",
      desc: language === "si" ? "ත්‍රිමාන භාවනා පරිසරයක් ගවේෂණය කරන්න" : "Explore a 3D meditation environment",
      icon: "🌳",
      path: "/games/sacred-grove",
      ageGroup: language === "si" ? "අවුරුදු 14+" : "Ages 14+",
      color: "blue"
    }
  ];

  // Swipeable carousel images
  const carouselImages = [
    { id: 1, title: language === "si" ? "ඉංග්‍රීසි ඉගෙනීම" : "English Learning", description: language === "si" ? "විනෝදජනක ක්‍රමවේදයන්" : "Fun learning methods" },
    { id: 2, title: language === "si" ? "යෝග අභ්‍යාස" : "Yoga Practice", description: language === "si" ? "ළමුන් සඳහා යෝග" : "Yoga for children" },
    { id: 3, title: language === "si" ? "පාලි භාෂාව" : "Pali Language", description: language === "si" ? "බෞද්ධ ග්‍රන්ථ අධ්‍යයනය" : "Study of Buddhist scriptures" },
    { id: 4, title: language === "si" ? "ගණිත චින්තනය" : "Mathematical Thinking", description: language === "si" ? "තර්කනය වර්ධනය කිරීම" : "Developing reasoning skills" },
    { id: 5, title: language === "si" ? "ජපන් සංස්කෘතිය" : "Japanese Culture", description: language === "si" ? "භාෂාව හා සංස්කෘතිය" : "Language and culture" }
  ];

  // Articles data
  const articles = [
    {
      title: language === "si" ? "දරුවන් සඳහා මනෝසංයම" : "Mindfulness for Kids",
      desc: language === "si" ? "දරුවන් සඳහා සරල මනෝසංයම ක්‍රියාකාරකම්" : "Simple mindfulness activities for children"
    },
    {
      title: language === "si" ? "දරුවන් සමග ධර්මය" : "Dhamma with Children",
      desc: language === "si" ? "දරුවන්ට බෞද්ධ ධර්මය හඳුන්වා දීමේ ක්‍රම" : "Ways to introduce Buddhist teachings to children"
    },
    {
      title: language === "si" ? "දරුවන් සඳහා බෞද්ධ කතන්දර" : "Buddhist Stories for Kids",
      desc: language === "si" ? "ජීවිත පාඩම් උගන්වන බෞද්ධ කතන්දර" : "Buddhist stories that teach life lessons"
    }
  ];

  // Embla Carousel setup for gallery
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1024px)': { slidesToScroll: 1, slidesToShow: 3 },
        '(min-width: 768px)': { slidesToScroll: 1, slidesToShow: 2 },
        '(max-width: 767px)': { slidesToScroll: 1, slidesToShow: 1 }
      }
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  // New state for homepage swiper images
  const [swiperImages, setSwiperImages] = useState([]);
  const [swiperLoading, setSwiperLoading] = useState(false);

  // Fetch swiper images from API
  useEffect(() => {
    const fetchSwiperImages = async () => {
      setSwiperLoading(true);
      try {
        const res = await axios.get("/api/home-swiper");
        setSwiperImages(res.data.data || []);
      } catch (e) {
        setSwiperImages([]);
      }
      setSwiperLoading(false);
    };
    fetchSwiperImages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 font-sans">
      {/* Header */}
      <Navigation
        language={language}
        switchLanguage={switchLanguage}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        playSound={playSound}
      />

      {/* Hero Section */}
      <section className="py-16 px-6" id="home">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100 leading-tight">
              {language === 'si' 
                ? 'බවුන්සෙත් සති පාසල වෙත සාදරයෙන් පිළිගනිමු' 
                : 'Welcome to Baunseth Sathipasala'}
            </h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'si'
                ? 'ළමා මනෝසංයම, චරිත සංවර්ධනය සහ අධ්‍යාපනය සඳහා පිළිගත් වේදිකාව. ඔබේ දරුවා ලෝකය පිළිබඳව වඩාත් සැලකිලිමත්, ආචාරශීලි හා ප්‍රඥාවන්ත වීමට සහාය වන්න.'
                : 'A trusted platform for children\'s mindfulness, character development, and education. Help your child become more mindful, compassionate, and wise.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:opacity-90 transition shadow-lg flex items-center"
                onClick={playSound}
              >
                <FaYinYang className="mr-2" /> 
                {language === 'si' ? 'ආරම්භ කරන්න' : 'Get Started'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-300 px-8 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                onClick={playSound}
              >
                {language === 'si' ? 'තවත් දැනගන්න' : 'Learn More'}
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-purple-200 dark:bg-purple-900 rounded-full opacity-70 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-blue-200 dark:bg-blue-900 rounded-full opacity-70 blur-3xl animate-pulse"></div>
              
              <motion.div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-4 border-white dark:border-gray-700"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-2xl">🧘</span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {language === 'si' ? 'මනෝසංයම' : 'Mindfulness'}
                      </h3>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                      {language === 'si' ? 'නොමිලේ' : 'Free'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {language === 'si' 
                      ? 'දරුවන්ගේ චරිත සංවර්ධනය සහ අධ්‍යාපන අත්දැකීම් වැඩි දියුණු කිරීම සඳහා වන මනෝසංයම වැඩසටහන්'
                      : 'Mindfulness programs to enhance children\'s character development and learning experiences'}
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-5xl">📚</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100">
                        {language === 'si' ? 'ප්‍රගතිය' : 'Progress'}
                      </h4>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm transition">
                      {language === 'si' ? 'අධ්‍යයනය කරන්න' : 'Start Learning'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Swiper Section - Now called "Gallery" and placed before Learning Subjects */}
      <section id="gallery" className="py-10 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              {language === "si" ? "ගැලරිය" : "Gallery"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === "si"
                ? "මෙම රූප ප්‍රධාන පිටුවේ පෙන්වයි."
                : "These images appear on the homepage gallery."}
            </p>
          </div>
          <div className="relative w-full">
            {swiperLoading ? (
              <div className="h-80 flex items-center justify-center text-lg text-gray-500">
                {language === "si" ? "රූප පූරණය වෙමින්..." : "Loading images..."}
              </div>
            ) : swiperImages.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-lg text-gray-400">
                {language === "si" ? "රූප නොමැත" : "No images"}
              </div>
            ) : (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {swiperImages.map((img, idx) => (
                    <div
                      key={img._id || idx}
                      className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2"
                    >
                      <motion.img
                        src={img.url}
                        alt={img.title || ""}
                        className="w-full h-[260px] object-cover rounded-2xl"
                        draggable={false}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      />
                      {img.title && (
                        <div className="mt-2 text-base font-semibold text-center text-blue-700 dark:text-blue-200">
                          {img.title}
                        </div>
                      )}
                      {img.description && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
                          {img.description}
                        </div>
                      )}
                      {img.link && (
                        <div className="text-center mt-1">
                          <a
                            href={img.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-xs"
                          >
                            {img.link}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Subjects Section */}
      <section id="subjects" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              {language === 'si' ? 'අධ්‍යයන විෂයයන්' : 'Learning Subjects'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'si' 
                ? 'ළමුන්ගේ දැනුම සහ චරිතය වර්ධනය කිරීම සඳහා වන විෂයයන්' 
                : 'Subjects designed to develop children\'s knowledge and character'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl mr-4">
                      {subject.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{subject.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{subject.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'si' ? 'මට්ටම්' : 'Levels'}
                    </h4>
                    <div className="space-y-2">
                      {subject.levels.map((level, levelIndex) => (
                        <div 
                          key={levelIndex} 
                          className={`${level.color} dark:bg-opacity-30 rounded-lg px-4 py-2 flex justify-between items-center`}
                        >
                          <span className="font-medium">
                            {language === 'si' ? level.title : level.enTitle}
                          </span>
                          <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                            {levelIndex + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition flex items-center justify-center"
                    onClick={playSound}
                  >
                    <span className="mr-2">{language === 'si' ? 'ආරම්භ කරන්න' : 'Start Learning'}</span>
                    <FaBook />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Games Section */}
      <section id="games" className="py-16 px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full mb-4">
              <FaGamepad className="text-blue-600 dark:text-blue-300 mr-2" />
              <span className="text-blue-600 dark:text-blue-300 font-medium">
                {language === 'si' ? 'අධ්‍යාපනික ක්‍රීඩා' : 'Educational Games'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {language === 'si' ? 'ඉගෙනීම විනෝදජනක කරන්න' : 'Make Learning Fun'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'si'
                ? 'විනෝදජනක ක්‍රීඩා හා ප්‍රශ්නෝත්තර සමඟින් බෞද්ධ ඉගැන්වීම් හා මනෝසංයම ඉගෙන ගන්න'
                : 'Learn Buddhist teachings and mindfulness through fun games and quizzes'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educationalGames.map((game, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className={`h-48 bg-${game.color}-100 dark:bg-${game.color}-900 flex items-center justify-center`}>
                  <span className="text-6xl">{game.icon}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{game.title}</h3>
                    <span className={`bg-${game.color}-200 dark:bg-${game.color}-800 text-${game.color}-800 dark:text-${game.color}-200 text-xs px-2 py-1 rounded-full`}>
                      {game.ageGroup}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{game.desc}</p>
                  <button
                    className={`w-full bg-${game.color}-600 hover:bg-${game.color}-700 text-white py-3 rounded-lg transition flex items-center justify-center`}
                    onClick={() => {
                      playSound();
                      navigate(game.path);
                    }}
                  >
                    <span className="mr-2">{language === 'si' ? 'ක්‍රීඩා කරන්න' : 'Play Now'}</span>
                    <FaGamepad />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles & Resources Section */}
      <section id="resources" className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-full mb-4">
              <FaNewspaper className="text-purple-600 dark:text-purple-300 mr-2" />
              <span className="text-purple-600 dark:text-purple-300 font-medium">
                {language === 'si' ? 'අමතර සම්පත්' : 'Additional Resources'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {language === 'si' ? 'දැනුම වර්ධනය කිරීම' : 'Expand Your Knowledge'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'si'
                ? 'දරුවන්ට හා දෙමාපියන්ට ප්‍රයෝජනවත් ලිපි සහ සම්පත්'
                : 'Helpful articles and resources for children and parents'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                      <FaBook />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{article.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{article.desc}</p>
                  
                  <button 
                    className="w-full border-2 border-blue-600 dark:border-blue-300 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 py-3 rounded-lg transition flex items-center justify-center"
                    onClick={playSound}
                  >
                    <span className="mr-2">{language === 'si' ? 'තවත් කියවන්න' : 'Read More'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        language={language}
        switchLanguage={switchLanguage}
        playSound={playSound}
      />
    </div>
  );
};

export default HomePage;