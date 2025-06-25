import React from "react";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../components/image/logo/logo.png";

const Footer = ({ language, switchLanguage, playSound }) => (
  <footer className="bg-gray-900 text-white py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <div className="flex items-center mb-4">
            <img
              src={logo}
              alt="Baunseth Sathipasala Logo"
              className="h-10 w-10 rounded-full mr-3"
            />
            <h4 className="text-xl font-bold">BAUNSETH SATHIPASALA</h4>
          </div>
          <p className="text-gray-300">
            {language === "si"
              ? "ළමුන්ගේ මනෝසංයම, චරිත සංවර්ධනය සහ අධ්‍යාපනය සඳහා වන වේදිකාව"
              : "A platform for children's mindfulness, character development, and education"}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-bold mb-4">{language === "si" ? "ක්ෂණික සබැඳි" : "Quick Links"}</h4>
          <ul className="space-y-2">
            {[
              { id: "home", label: language === "si" ? "මුල් පිටුව" : "Home" },
              { id: "subjects", label: language === "si" ? "විෂයයන්" : "Subjects" },
              { id: "games", label: language === "si" ? "ක්‍රීඩා" : "Games" },
              { id: "resources", label: language === "si" ? "සම්පත්" : "Resources" },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-gray-300 hover:text-white transition"
                  onClick={playSound}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-bold mb-4">{language === "si" ? "අපව අමතන්න" : "Contact Us"}</h4>
          <address className="text-gray-300 not-italic">
            <p className="mb-2">email@baunseth.org</p>
            <p className="mb-2">+94 11 123 4567</p>
            <p>{language === "si" ? "කොළඹ, ශ්‍රී ලංකාව" : "Colombo, Sri Lanka"}</p>
          </address>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-xl font-bold mb-4">{language === "si" ? "අපව අනුගමනය කරන්න" : "Follow Us"}</h4>
          <div className="flex space-x-4">
            {[
              { icon: <FaFacebook />, href: "#", label: "Facebook" },
              { icon: <FaTwitter />, href: "#", label: "Twitter" },
              { icon: <FaYoutube />, href: "#", label: "YouTube" },
              { icon: <FaInstagram />, href: "#", label: "Instagram" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-gray-300 hover:text-white text-2xl transition"
                onClick={playSound}
              >
                {social.icon}
              </a>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-gray-400 mb-2">{language === "si" ? "භාෂාව" : "Language"}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => switchLanguage && switchLanguage("en")}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === "en"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                English
              </button>
              <button
                onClick={() => switchLanguage && switchLanguage("si")}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === "si"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                සිංහල
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Baunseth Sathipasala.{" "}
          {language === "si" ? "සියලුම හිමිකම් ඇවිරිණි." : "All rights reserved."}
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
