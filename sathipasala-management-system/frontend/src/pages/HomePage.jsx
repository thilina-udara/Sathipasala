import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBook, FaGamepad, FaNewspaper, FaYinYang, FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';

const HomePage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const navigate = useNavigate();

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
      title: language === 'si' ? 'මනෝසංයම ක්‍රීඩා' : 'Mindfulness Games',
      desc: language === 'si' ? 'සති පුහුණුවට උපකාරී ක්‍රීඩා' : 'Games that help develop mindfulness',
      image: '/images/mindfulness-game.jpg',
      placeholder: 'https://img.freepik.com/free-vector/kids-playing-room-scene_1308-43716.jpg'
    },
    {
      title: language === 'si' ? 'බෞද්ධ ප්‍රශ්නෝත්තර' : 'Buddhist Quizzes',
      desc: language === 'si' ? 'බෞද්ධ ඉගැන්වීම් පිළිබඳ විනෝදජනක ප්‍රශ්නෝත්තර' : 'Fun quizzes on Buddhist teachings',
      image: '/images/buddhist-quiz.jpg',
      placeholder: 'https://img.freepik.com/free-vector/quiz-word-concept_23-2147844150.jpg'
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Sathipasala Logo" 
              className="h-12 w-auto mr-3"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/48?text=🧘';
              }}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sathipasala
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-gray-700 dark:text-gray-200 ml-10">
            <a href="#mindfulness" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {language === 'si' ? 'මනෝසංයම' : 'Mindfulness'}
            </a>
            <a href="#games" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {language === 'si' ? 'අධ්‍යාපනික ක්‍රීඩා' : 'Games'}
            </a>
            <a href="#articles" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {language === 'si' ? 'සම්පත්' : 'Resources'}
            </a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {language === 'si' ? 'සම්බන්ධ වන්න' : 'Contact'}
            </a>
          </nav>

          {/* Language & Login Buttons */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-2 py-1 text-xs rounded-md transition ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguage('si')}
                className={`px-2 py-1 text-xs rounded-md transition ${
                  language === 'si'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                සිං
              </button>
            </div>

            {/* Login Buttons */}
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-md text-sm font-medium"
            >
              {language === 'si' ? 'පිවිසෙන්න' : 'Login'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:opacity-90 transition shadow-lg flex items-center"
            >
              <FaYinYang className="mr-2" /> {language === 'si' ? 'ගවේෂණය කරන්න' : 'Explore Now'}
            </button>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/images/meditation-illustration.svg" 
              alt="Children meditating illustration"
              className="max-w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://img.freepik.com/free-vector/tiny-people-sitting-lotus-position-meditating-isolated-flat-vector-illustration-cartoon-characters-doing-yoga-nature-relaxing-breathing-mental-health-concept_74855-10130.jpg?w=740&t=st=1686595279~exp=1686595879~hmac=3a7e6c61bcb8e5bc0a15d7cbc698e23a44df80b8780a4672e4b104e9c51b5402';
              }}
            />
          </div>
        </div>
      </section>

      {/* Mindfulness Education Section */}
      <section id="mindfulness" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaYinYang className="mr-3 text-blue-600" /> {language === 'si' ? 'මනෝසංයම අධ්‍යාපනය' : 'Mindfulness Education'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'විවිධ මනෝසංයම පුහුණුවීම් තුළින් තමන් ගැන දැනීමක් ඇති කරගන්න. මෙම පුහුණුවීම් දරුවන්ට ඔවුන්ගේ මනස, ශරීරය හා හැඟීම් අවබෝධ කර ගැනීමට උපකාරී වේ.'
                : 'Explore a variety of mindfulness practices to develop self-awareness. These practices help children understand their mind, body, and emotions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mindfulnessPractices.map((practice, index) => (
              <div 
                key={index}
                className={`${practice.color} p-6 rounded-xl shadow-md transition hover:shadow-lg transform hover:-translate-y-1`}
              >
                <div className="text-4xl mb-4">{practice.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{practice.title}</h4>
                <p>{practice.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Games Section */}
      <section id="games" className="py-16 px-6 bg-purple-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaGamepad className="mr-3 text-purple-600" /> {language === 'si' ? 'අධ්‍යාපනික ක්‍රීඩා' : 'Educational Games'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'විනෝදජනක ක්‍රීඩා හා ප්‍රශ්නෝත්තර සමඟින් බෞද්ධ ඉගැන්වීම් හා මනෝසංයම ඉගෙන ගන්න. බලන්න, ක්‍රීඩා කරන්න, ඉගෙන ගන්න!'
                : 'Learn Buddhist teachings and mindfulness through fun games and quizzes. See, play, learn!'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {educationalGames.map((game, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = game.placeholder;
                  }}
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{game.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{game.desc}</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                    {language === 'si' ? 'ක්‍රීඩා කරන්න' : 'Play Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles & Resources Section */}
      <section id="articles" className="py-16 px-6 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 inline-flex items-center">
              <FaNewspaper className="mr-3 text-green-600" /> {language === 'si' ? 'ලිපි සහ සම්පත්' : 'Articles & Resources'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
              {language === 'si'
                ? 'දරුවන්ට හා දෙමාපියන්ට ප්‍රයෝජනවත් ලිපි සහ සම්පත්. එදිනෙදා ජීවිතය සඳහා ප්‍රායෝගික බෞද්ධ උපදෙස්.'
                : 'Helpful articles and resources for children and parents. Practical Buddhist guidance for everyday life.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{article.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{article.desc}</p>
                <button className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center bg-transparent">
                  {language === 'si' ? 'තවත් කියවන්න' : 'Read more'} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපි ගැන' : 'About Us'}</h4>
              <p className="text-gray-300">
                {language === 'si'
                  ? 'සතිපාසල යනු දරුවන් සඳහා මනෝසංයම හා බෞද්ධ අධ්‍යාපනය ලබාදෙන වේදිකාවකි.'
                  : 'Sathipasala is a platform dedicated to providing mindfulness and Buddhist education for children.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'ක්ෂණික සබැඳි' : 'Quick Links'}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">{language === 'si' ? 'අපි ගැන' : 'About'}</a></li>
                <li><a href="#mindfulness" className="text-gray-300 hover:text-white">{language === 'si' ? 'මනෝසංයම' : 'Mindfulness'}</a></li>
                <li><a href="#games" className="text-gray-300 hover:text-white">{language === 'si' ? 'ක්‍රීඩා' : 'Games'}</a></li>
                <li><a href="#articles" className="text-gray-300 hover:text-white">{language === 'si' ? 'සම්පත්' : 'Resources'}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපව අමතන්න' : 'Contact Us'}</h4>
              <address className="text-gray-300 not-italic">
                <p>email@sathipasala.org</p>
                <p>+94 11 123 4567</p>
                <p>{language === 'si' ? 'කොළඹ, ශ්‍රී ලංකාව' : 'Colombo, Sri Lanka'}</p>
              </address>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-xl font-bold mb-4">{language === 'si' ? 'අපව අනුගමනය කරන්න' : 'Follow Us'}</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white text-2xl"><FaFacebook /></a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl"><FaTwitter /></a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl"><FaYoutube /></a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl"><FaInstagram /></a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Sathipasala. {language === 'si' ? 'සියලුම හිමිකම් ඇවිරිණි.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
