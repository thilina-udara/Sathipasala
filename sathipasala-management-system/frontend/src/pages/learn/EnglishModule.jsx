import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const LEVELS = [
  {
    id: "beginner",
    title: { en: "Beginner", si: "ආරම්භක" },
    description: {
      en: "Start with basic vocabulary and simple grammar.",
      si: "මූලික වචන හා සරල ව්‍යාකරණයෙන් ආරම්භ කරන්න."
    },
    icon: "🔤",
    color: "from-blue-100 to-blue-300"
  },
  {
    id: "intermediate",
    title: { en: "Intermediate", si: "මධ්‍යම" },
    description: {
      en: "Expand your vocabulary and learn more grammar.",
      si: "ඔබේ වචන සංග්‍රහය වැඩි කර ව්‍යාකරණය ඉගෙන ගන්න."
    },
    icon: "📚",
    color: "from-purple-100 to-purple-300"
  },
  {
    id: "advanced",
    title: { en: "Advanced", si: "උසස්" },
    description: {
      en: "Master advanced grammar and practice with activities.",
      si: "උසස් ව්‍යාකරණය හා ක්‍රියාකාරකම් සමඟ පුහුණු වන්න."
    },
    icon: "🎓",
    color: "from-yellow-100 to-yellow-300"
  }
];

const EnglishModule = () => {
  const { i18n } = useTranslation();
  const language = i18n.language || "en";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-10 text-center">
          {language === "si" ? "ඉංග්‍රීසි ඉගෙනීමේ මට්ටම්" : "English Learning Levels"}
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {LEVELS.map((level) => (
            <Card
              key={level.id}
              className={`flex-1 flex flex-col items-center justify-between rounded-2xl shadow-xl border-0 bg-gradient-to-br ${level.color} dark:from-gray-800 dark:to-gray-900 hover:scale-105 transition-transform duration-200`}
            >
              <CardHeader className="flex flex-col items-center pb-0">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-4xl shadow mb-4 border-2 border-blue-200 dark:border-blue-800">
                  {level.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                  {level.title[language] || level.title.en}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-between w-full">
                <div className="mb-6 text-gray-700 dark:text-gray-300 text-center text-base">
                  {level.description[language] || level.description.en}
                </div>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold text-lg shadow transition"
                  onClick={() => navigate(`/learn/english/${level.id}`)}
                >
                  {language === "si" ? "මෙම මට්ටමට යන්න" : "Go to Level"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishModule;
