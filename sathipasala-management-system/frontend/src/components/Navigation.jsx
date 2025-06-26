import React, { useState } from "react";
import { FaVolumeMute, FaVolumeUp, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../components/image/logo/logo.png";

// Updated navigation links with paths
const navItems = [
  { id: "home", labelSi: "මුල් පිටුව", labelEn: "Home", path: "/" },
  { id: "gallery", labelSi: "ගැලරිය", labelEn: "Gallery", path: "/baunseth_sathi_pasala/gallery" },
  { id: "subjects", labelSi: "විෂයයන්", labelEn: "Subjects", path: "/subjects" },
  { id: "games", labelSi: "ක්‍රීඩා", labelEn: "Games", path: "/games" },
  { id: "resources", labelSi: "සම්පත්", labelEn: "Resources", path: "/resources" },
];

const Navigation = (props) => {
  const {
    language,
    switchLanguage,
    isMuted,
    setIsMuted,
    playSound,
  } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={logo}
            alt="Baunseth Sathipasala Logo"
            className="h-12 w-12 rounded-full mr-3"
          />
          <div>
            <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">
              BAUNSETH SATHIPASALA
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {language === "si"
                ? "බවුන්සෙත් සති පාසල"
                : "Mindful Education Platform"}
            </p>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-700 dark:text-gray-200">
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.id}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium relative group"
              onClick={playSound}
            >
              {language === "si" ? item.labelSi : item.labelEn}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <FaBars className="text-2xl text-blue-700 dark:text-blue-200" />
        </button>

        {/* Right side controls (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Sound toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              playSound();
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <FaVolumeMute className="text-gray-600 dark:text-gray-300" />
            ) : (
              <FaVolumeUp className="text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex">
            <button
              onClick={() => {
                switchLanguage("en");
                playSound();
              }}
              className={`px-3 py-1 text-sm rounded-md transition ${
                language === "en"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                switchLanguage("si");
                playSound();
              }}
              className={`px-3 py-1 text-sm rounded-md transition ${
                language === "si"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              සිං
            </button>
          </div>

          {/* Student Login Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full transition-all shadow-lg flex items-center"
            onClick={playSound}
          >
            <span className="mr-2">🎓</span>
            {language === "si" ? "ශිෂ්‍ය ලොගින්" : "Student Login"}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 flex"
          >
            <div className="w-64 bg-white dark:bg-gray-900 h-full shadow-lg flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-10 w-10 rounded-full mr-2"
                  />
                  <span className="font-bold text-blue-700 dark:text-blue-200">
                    BAUNSETH
                  </span>
                </div>
                <button
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    to={item.path}
                    key={item.id}
                    className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => {
                      playSound();
                      setMobileOpen(false);
                    }}
                  >
                    {language === "si" ? item.labelSi : item.labelEn}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col px-6 space-y-4 mt-auto mb-8">
                {/* Sound toggle */}
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    playSound();
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition self-start"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <FaVolumeMute className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <FaVolumeUp className="text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                {/* Language Switcher */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex w-max">
                  <button
                    onClick={() => {
                      switchLanguage("en");
                      playSound();
                    }}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      language === "en"
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      switchLanguage("si");
                      playSound();
                    }}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      language === "si"
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    සිං
                  </button>
                </div>

                {/* Student Login Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full transition-all shadow-lg flex items-center"
                  onClick={playSound}
                >
                  <span className="mr-2">🎓</span>
                  {language === "si" ? "ශිෂ්‍ය ලොගින්" : "Student Login"}
                </motion.button>
              </div>
            </div>
            <div
              className="flex-1"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;