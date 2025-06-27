import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

// Example learning materials for each level
const ENGLISH_LESSONS = {
  beginner: [
    {
      id: 1,
      type: "vocab",
      title: { en: "Basic Vocabulary", si: "මූලික වචන" },
      content: { en: "cat, dog, sun, book, apple", si: "cat, dog, sun, book, apple" }
    },
    {
      id: 2,
      type: "grammar",
      title: { en: "Simple Sentences", si: "සරල වාක්‍ය" },
      content: { en: "I am a boy. She is a girl.", si: "I am a boy. She is a girl." }
    }
  ],
  intermediate: [
    {
      id: 1,
      type: "vocab",
      title: { en: "Daily Activities", si: "දෛනික ක්‍රියා" },
      content: { en: "wake up, brush, eat, study, play", si: "wake up, brush, eat, study, play" }
    },
    {
      id: 2,
      type: "grammar",
      title: { en: "Present Continuous", si: "වර්තමාන ක්‍රියා විධි" },
      content: { en: "I am eating. They are playing.", si: "I am eating. They are playing." }
    }
  ],
  advanced: [
    {
      id: 1,
      type: "vocab",
      title: { en: "Advanced Vocabulary", si: "උසස් වචන" },
      content: { en: "responsibility, achievement, opportunity", si: "responsibility, achievement, opportunity" }
    },
    {
      id: 2,
      type: "grammar",
      title: { en: "Complex Sentences", si: "සංකීර්ණ වාක්‍ය" },
      content: { en: "Although it was raining, we went outside.", si: "Although it was raining, we went outside." }
    }
  ]
};

const EnglishLevel = () => {
  const { levelId } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language || "en";
  const lessons = ENGLISH_LESSONS[levelId] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-8 text-center capitalize">
          {levelId ? (language === "si"
            ? `ඉංග්‍රීසි - ${levelId === "beginner" ? "ආරම්භක" : levelId === "intermediate" ? "මධ්‍යම" : "උසස්"}`
            : `English - ${levelId.charAt(0).toUpperCase() + levelId.slice(1)}`) : ""}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              {language === "si" ? "මෙම මට්ටම සඳහා පාඩම් නොමැත" : "No lessons for this level yet."}
            </div>
          ) : (
            lessons.map((lesson) => (
              <Card key={lesson.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{lesson.title[language] || lesson.title.en}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-gray-600 dark:text-gray-300">{lesson.type === "vocab" ? (language === "si" ? "වචන" : "Vocabulary") : (language === "si" ? "ව්‍යාකරණය" : "Grammar")}</div>
                  <div className="bg-white dark:bg-gray-800 rounded p-4 shadow text-gray-800 dark:text-gray-100">
                    {lesson.content[language] || lesson.content.en}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnglishLevel;
