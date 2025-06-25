import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBook, FaGamepad, FaNewspaper, FaYinYang, FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
// Remove CustomCursor import
import { AnimatedElement, FloatingElement, addKeyframes } from '../utils/animationUtils';
import soundManager from '../utils/soundUtils';

const HomePage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const navigate = useNavigate();

  useEffect(() => {
    // Add floating animation keyframes
    addKeyframes();
    
    // Load UI sounds
    soundManager.load('hover', '/sounds/hover.mp3');
    soundManager.load('click', '/sounds/click.mp3');
    
    // Smooth scroll to anchor implementation
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });
    
    // Add sound to buttons
    const addButtonSounds = () => {
      const buttons = document.querySelectorAll('button, a.hover-effect');
      
      buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          if (!soundManager.muted) soundManager.play('hover');
        });
        
        button.addEventListener('click', () => {
          if (!soundManager.muted) soundManager.play('click');
        });
      });
    };
    
    // Call after a slight delay to ensure DOM is loaded
    setTimeout(addButtonSounds, 500);
    
    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
  };

  // Define the mindfulness practice items
  const mindfulnessPractices = [
    {
      title: language === 'si' ? 'ආනාපානසති භාවනාව' : 'Breathing Meditation',
      desc: language === 'si' ? 'හුස්ම ගැනීම අරමුණු කරගත් භාවනාව' : 'Meditation focused on the breath',
      icon: '🧘‍♂️',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    },
    {
      title: language === 'si' ? 'කරුණා භාවනාව' : 'Loving-Kindness',
      desc: language === 'si' ? 'මෛත්‍රිය වර්ධනය කිරීම' : 'Developing compassion and kindness',
      icon: '❤️',
      color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    },
    {
      title: language === 'si' ? 'සතිමත් ගමන' : 'Mindful Walking',
      desc: language === 'si' ? 'ගමන් කිරීමේදී සිහියෙන් සිටීම' : 'Being present while walking',
      icon: '👣',
      color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    }
  ];
  
  // Define the educational games
  const educationalGames = [
    {
      title: language === 'si' ? 'හුස්ම ගන්න මිතුරෝ' : 'Breathing Buddies',
      desc: language === 'si' ? 'සාමකාමී හුස්ම ගැනීමේ අභ්‍යාස සඳහා උපකාරී වේ' : 'Helps practice peaceful breathing',
      icon: '🧘‍♂️',
      path: '/games/breathing-buddies',
      ageGroup: language === 'si' ? 'අවුරුදු 3-6' : 'Ages 3-6',
      color: 'blue'
    },
    {
      title: language === 'si' ? 'මනෝසංයම් සවන්දීම' : 'Mindful Listening',
      desc: language === 'si' ? 'ශබ්දයන් හඳුනා ගැනීම සඳහා වන ක්‍රීඩාව' : 'Game for identifying sounds',
      icon: '👂',
      path: '/games/mindful-listening',
      ageGroup: language === 'si' ? 'අවුරුදු 3-6' : 'Ages 3-6',
      color: 'green'
    },
    {
      title: language === 'si' ? 'කරුණාවේ උද්‍යානය' : 'Kindness Garden',
      desc: language === 'si' ? 'කරුණාවන්ත ක්‍රියා තුළින් උද්‍යානයක් වවන්න' : 'Grow a garden through kind actions',
      icon: '🌱',
      path: '/games/kindness-garden',
      ageGroup: language === 'si' ? 'අවුරුදු 7-10' : 'Ages 7-10',
      color: 'green'
    },
    {
      title: language === 'si' ? 'පංචසීල ගමන' : 'Five Precepts Journey',
      desc: language === 'si' ? 'පංචසීලය ගැන ඉගෙනගන්න' : 'Learn about the Five Precepts',
      icon: '🏆',
      path: '/games/five-precepts',
      ageGroup: language === 'si' ? 'අවුරුදු 11-13' : 'Ages 11-13',
      color: 'purple'
    },
    {
      title: language === 'si' ? 'ශාන්ත වනය' : 'Sacred Grove',
      desc: language === 'si' ? 'ත්‍රිමාන භාවනා පරිසරයක් ගවේෂණය කරන්න' : 'Explore a 3D meditation environment',
      icon: '🌳',
      path: '/games/sacred-grove',
      ageGroup: language === 'si' ? 'අවුරුදු 14+' : 'Ages 14+',
      color: 'blue'
    }
  ];
  
  // Define the articles and resources
  const articles = [
    {
      title: language === 'si' ? 'දරුවන් සඳහා මනෝසංයම' : 'Mindfulness for Kids',
      desc: language === 'si' ? 'දරුවන් සඳහා සරල මනෝසංයම ක්‍රියාකාරකම්' : 'Simple mindfulness activities for children'
    },
    {
      title: language === 'si' ? 'දරුවන් සමග ධර්මය' : 'Dhamma with Children',
      desc: language === 'si' ? 'දරුවන්ට බෞද්ධ ධර්මය හඳුන්වා දීමේ ක්‍රම' : 'Ways to introduce Buddhist teachings to children'
    },
    {
      title: language === 'si' ? 'දරුවන් සඳහා බෞද්ධ කතන්දර' : 'Buddhist Stories for Kids',
      desc: language === 'si' ? 'ජීවිත පාඩම් උගන්වන බෞද්ධ කතන්දර' : 'Buddhist stories that teach life lessons'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950">
      {/* Remove CustomCursor component */}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 flex items-center justify-center rounded-full mr-3">
              <span role="img" aria-label="meditation" className="text-2xl">🧘</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sathipasala
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-gray-700 dark:text-gray-200 ml-10">
            { [
              { id: 'mindfulness', label: language === 'si' ? 'මනෝසංයම' : 'Mindfulness' },
              { id: 'games', label: language === 'si' ? 'අධ්‍යාපනික ක්‍රීඩා' : 'Games' },
              { id: 'articles', label: language === 'si' ? 'සම්පත්' : 'Resources' },
              { id: 'contact', label: language === 'si' ? 'සම්බන්ධ වන්න' : 'Contact' }
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium relative group hover-effect"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Language & Login Buttons */}
          <div className="flex items-center space-x-3">
            {/* Sound toggle */}
            <button
              onClick={() => {
                const newState = soundManager.toggleMute();
                // You might want to add state to update UI
              }}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              aria-label={soundManager.muted ? 'Unmute' : 'Mute'}
            >
              {soundManager.muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            {/* Language Switcher */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-2 py-1 text-xs rounded-md transition hover-effect ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguage('si')}
                className={`px-2 py-1 text-xs rounded-md transition hover-effect ${
                  language === 'si'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                සිං
              </button>
            </div>

            {/* Student Login Button - Only visible option */}
            <Link
              to="/student-login"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium hover:scale-105 hover-effect flex items-center"
            >
              <span className="mr-2 text-lg">🎓</span>
              {language === 'si' ? 'ශිෂ්‍ය ලොගින්' : 'Student Login'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <AnimatedElement 
            animation="fade-right" 
            className="md:w-1/2 mb-10 md:mb-0" 
            delay={100}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              {language === 'si' 
                ? 'සතිපාසල වෙත සාදරයෙන් පිළිගනිමු' 
                : 'Welcome to Sathipasala'}
            </h2>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'si'
                ? 'ළමා මනෝසංයම හා බෞද්ධ අධ්‍යාපනය සඳහා පිළිගත් වේදිකාව. ඔබේ දරුවා ලෝකය පිළිබඳව වඩාත් සැලකිලිමත්, ආචාරශීලි හා ප්‍රඥාවන්ත වීමට සහාය වන්න.'
                : 'A trusted platform for children\'s mindfulness and Buddhist education. Help your child become more mindful, compassionate, and wise.'}
            </p>
            <button
              onClick={() => document.getElementById('mindfulness').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:opacity-90 transition shadow-lg flex items-center hover:scale-105 hover-effect"
            >
              <FaYinYang className="mr-2" /> {language === 'si' ? 'ගවේෂණය කරන්න' : 'Explore Now'}
            </button>
          </AnimatedElement>

          <AnimatedElement 
            animation="fade-left" 
            className="md:w-1/2 flex justify-center" 
            delay={300}
          >
            <FloatingElement amplitude={15} period={4}>
              {/* Replace image with a styled div containing the emoji */}
              <div className="w-full max-w-md h-72 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <span role="img" aria-label="meditation" className="text-8xl">🧘</span>
                  <h3 className="mt-4 text-xl text-blue-800 dark:text-blue-200 font-medium">
                    {language === 'si' ? 'මනෝසංයම' : 'Mindfulness'}
                  </h3>
                </div>
              </div>
            </FloatingElement>
          </AnimatedElement>
        </div>
      </section>

      {/* Mindfulness Education Section */}
      <section id="mindfulness" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <AnimatedElement animation="fade-up" className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaYinYang className="mr-3 text-blue-600" /> {language === 'si' ? 'මනෝසංයම අධ්‍යාපනය' : 'Mindfulness Education'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'විවිධ මනෝසංයම පුහුණුවීම් තුළින් තමන් ගැන දැනීමක් ඇති කරගන්න. මෙම පුහුණුවීම් දරුවන්ට ඔවුන්ගේ මනස, ශරීරය හා හැඟීම් අවබෝධ කර ගැනීමට උපකාරී වේ.'
                : 'Explore a variety of mindfulness practices to develop self-awareness. These practices help children understand their mind, body, and emotions.'}
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mindfulnessPractices.map((practice, index) => (
              <AnimatedElement 
                key={index}
                animation="scale" 
                delay={200 + (index * 150)}
              >
                <div className={`${practice.color} p-6 rounded-xl shadow-md transition hover:shadow-lg transform hover:-translate-y-1 hover:scale-105`}>
                  <FloatingElement period={(3 + index * 0.5)} delay={index * 300} className="text-4xl mb-4 inline-block">
                    {practice.icon}
                  </FloatingElement>
                  <h4 className="text-xl font-semibold mb-2">{practice.title}</h4>
                  <p>{practice.desc}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Games Section */}
      <section id="games" className="py-16 px-6 bg-purple-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <AnimatedElement animation="fade-up" className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaGamepad className="mr-3 text-purple-600" /> {language === 'si' ? 'අධ්‍යාපනික ක්‍රීඩා' : 'Educational Games'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'විනෝදජනක ක්‍රීඩා හා ප්‍රශ්නෝත්තර සමඟින් බෞද්ධ ඉගැන්වීම් හා මනෝසංයම ඉගෙන ගන්න. බලන්න, ක්‍රීඩා කරන්න, ඉගෙන ගන්න!'
                : 'Learn Buddhist teachings and mindfulness through fun games and quizzes. See, play, learn!'}
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {educationalGames.map((game, index) => (
              <AnimatedElement 
                key={index}
                animation="fade-up" 
                delay={300 + (index * 200)}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl transform hover:scale-105">
                  <div className={`w-full h-48 bg-${game.color}-100 dark:bg-${game.color}-900 flex items-center justify-center`}>
                    <div className="text-center">
                      <span role="img" aria-label={game.title} className="text-5xl">
                        {game.icon}
                      </span>
                      <p className="mt-2 text-gray-700 dark:text-gray-100 font-medium">
                        {game.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {game.ageGroup}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{game.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{game.desc}</p>
                    <a 
                      href={game.path}
                      className={`inline-block bg-${game.color}-600 hover:bg-${game.color}-700 text-white px-4 py-2 rounded-md`}
                    >
                      {language === 'si' ? 'ක්‍රීඩා කරන්න' : 'Play Now'}
                    </a>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Articles & Resources Section */}
      <section id="articles" className="py-16 px-6 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <AnimatedElement animation="fade-up" className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaNewspaper className="mr-3 text-green-600" /> {language === 'si' ? 'ලිපි සහ සම්පත්' : 'Articles & Resources'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'දරුවන්ට හා දෙමාපියන්ට ප්‍රයෝජනවත් ලිපි සහ සම්පත්. එදිනෙදා ජීවිතය සඳහා ප්‍රායෝගික බෞද්ධ උපදෙස්.'
                : 'Helpful articles and resources for children and parents. Practical Buddhist guidance for everyday life.'}
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <AnimatedElement 
                key={index}
                animation="fade-up" 
                delay={200 + (index * 100)}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition transform hover:scale-105">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{article.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{article.desc}</p>
                  <button className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center bg-transparent hover-effect">
                    {language === 'si' ? 'තවත් කියවන්න' : 'Read more'} →
                  </button>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <AnimatedElement animation="fade-up" delay={100}>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපි ගැන' : 'About Us'}</h4>
              <p className="text-gray-300">
                {language === 'si'
                  ? 'සතිපාසල යනු දරුවන් සඳහා මනෝසංයම හා බෞද්ධ අධ්‍යාපනය ලබාදෙන වේදිකාවකි.'
                  : 'Sathipasala is a platform dedicated to providing mindfulness and Buddhist education for children.'}
              </p>
            </AnimatedElement>

            {/* Quick Links */}
            <AnimatedElement animation="fade-up" delay={200}>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'ක්ෂණික සබැඳි' : 'Quick Links'}</h4>
              <ul className="space-y-2">
                { [
                  { id: '', label: language === 'si' ? 'අපි ගැන' : 'About' },
                  { id: 'mindfulness', label: language === 'si' ? 'මනෝසංයම' : 'Mindfulness' },
                  { id: 'games', label: language === 'si' ? 'ක්‍රීඩා' : 'Games' },
                  { id: 'articles', label: language === 'si' ? 'සම්පත්' : 'Resources' }
                ].map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.id ? `#${item.id}` : '#'} 
                      className="text-gray-300 hover:text-white hover-effect"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedElement>

            {/* Contact */}
            <AnimatedElement animation="fade-up" delay={300}>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපව අමතන්න' : 'Contact Us'}</h4>
              <address className="text-gray-300 not-italic">
                <p>email@sathipasala.org</p>
                <p>+94 11 123 4567</p>
                <p>{language === 'si' ? 'කොළඹ, ශ්‍රී ලංකාව' : 'Colombo, Sri Lanka'}</p>
              </address>
            </AnimatedElement>

            {/* Social Media */}
            <AnimatedElement animation="fade-up" delay={400}>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපව අනුගමනය කරන්න' : 'Follow Us'}</h4>
              <div className="flex space-x-4">
                { [
                  { icon: <FaFacebook />, href: '#', label: 'Facebook' },
                  { icon: <FaTwitter />, href: '#', label: 'Twitter' },
                  { icon: <FaYoutube />, href: '#', label: 'YouTube' },
                  { icon: <FaInstagram />, href: '#', label: 'Instagram' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    aria-label={social.label}
                    className="text-gray-300 hover:text-white text-2xl hover-effect transition transform hover:scale-125"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </AnimatedElement>
          </div>

          <AnimatedElement animation="fade-up" delay={500}>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Sathipasala. {language === 'si' ? 'සියලුම හිමිකම් ඇවිරිණි.' : 'All rights reserved.'}</p>
            </div>
          </AnimatedElement>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
