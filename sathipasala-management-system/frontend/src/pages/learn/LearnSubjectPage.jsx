import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import EnglishModule from "./EnglishModule";

// Example lesson data (replace with API or DB in real app)
const LESSONS = {
  english: [
    {
      id: 1,
      title: { en: "Alphabet", si: "අකුරු" },
      description: { en: "Learn the English alphabet.", si: "ඉංග්‍රීසි අකුරු ඉගෙන ගන්න." },
      content: { en: "A B C D ...", si: "A B C D ..." }
    },
    {
      id: 2,
      title: { en: "Simple Words", si: "සරල වචන" },
      description: { en: "Practice simple English words.", si: "සරල ඉංග්‍රීසි වචන පුහුණු වන්න." },
      content: { en: "Cat, Dog, Sun, Book", si: "Cat, Dog, Sun, Book" }
    }
  ],
  yoga: [
    {
      id: 1,
      title: { en: "Breathing", si: "හුස්ම ගැනීම" },
      description: { en: "Practice mindful breathing.", si: "මනෝසංයම හුස්ම ගැනීම පුහුණු වන්න." },
      content: { en: "Inhale... Exhale...", si: "ආශ්වාසය... නාශ්වාසය..." }
    }
  ]
  // Add more subjects/lessons as needed
};

const LearnSubjectPage = () => {
  const { subjectId } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language || "en";

  const lessons = LESSONS[subjectId] || [];

  // Special handling for English subject
  if (subjectId === "english") {
    return <EnglishModule />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-8 text-center">
          {subjectId.charAt(0).toUpperCase() + subjectId.slice(1)} {language === "si" ? "පාඩම්" : "Lessons"}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              {language === "si" ? "මෙම විෂය සඳහා පාඩම් නොමැත" : "No lessons for this subject yet."}
            </div>
          ) : (
            lessons.map((lesson) => (
              <Card key={lesson.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{lesson.title[language] || lesson.title.en}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-gray-600 dark:text-gray-300">{lesson.description[language] || lesson.description.en}</div>
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

export default LearnSubjectPage;
