import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      login: {
        title: 'Sign In to Sathipasala',
        email: 'Email Address',
        password: 'Password',
        submit: 'Sign In',
        loggingIn: 'Signing In...',
        forgotPassword: 'Forgot Password?'
      },
      admin: {
        dashboard: {
          title: 'Admin Dashboard',
          totalStudents: 'Total Students',
          todayAttendance: 'Today\'s Attendance',
          upcomingExams: 'Upcoming Exams',
          quickActions: 'Quick Actions',
          registerStudent: 'Register Student',
          markAttendance: 'Mark Attendance',
          manageExams: 'Manage Exams',
          recentStudents: 'Recent Students',
          studentsListWillAppearHere: 'Student list will appear here',
          noStudentsRegistered: 'No students registered yet'
        },
        students: {
          registerNewStudent: 'Register New Student',
          studentInformation: 'Student Information',
          nameEnglish: 'Name (English)',
          nameSinhala: 'Name (සිංහල)',
          dateOfBirth: 'Date of Birth',
          ageGroup: 'Age Group',
          years: 'years',
          classYear: 'Class Year',
          classCode: 'Class',
          parentInformation: 'Parent Information',
          parentNameEnglish: 'Parent Name (English)',
          parentNameSinhala: 'Parent Name (සිංහල)',
          parentPhone: 'Phone Number',
          parentEmail: 'Email Address',
          address: 'Address',
          registerStudent: 'Register Student'
        }
      },
      common: {
        viewAll: 'View All',
        logout: 'Log Out',
        submitting: 'Submitting...'
      },
      sidebar: {
        title: 'Sathipasala',
        adminRole: 'Administrator',
        dashboard: 'Dashboard',
        students: 'Students',
        allStudents: 'All Students',
        registerStudent: 'Register Student',
        classGroups: 'Class Groups',
        attendance: 'Attendance',
        markAttendance: 'Mark Attendance',
        attendanceReports: 'Attendance Reports',
        exams: 'Exams',
        manageExams: 'Manage Exams',
        examResults: 'Enter Results',
        examReports: 'Reports & Analytics',
        users: 'Users',
        teachers: 'Teachers',
        parents: 'Parents',
        accounts: 'Manage Accounts',
        settings: 'Settings',
        logout: 'Logout'
      }
    }
  },
  si: {
    translation: {
      login: {
        title: 'සතිපාසල වෙත පිවිසෙන්න',
        email: 'විද්‍යුත් තැපෑල',
        password: 'මුරපදය',
        submit: 'පිවිසෙන්න',
        loggingIn: 'පිවිසෙමින්...',
        forgotPassword: 'මුරපදය අමතකද?'
      },
      admin: {
        dashboard: {
          title: 'පරිපාලක උපකරණ පුවරුව',
          totalStudents: 'සිසුන් සංඛ්‍යාව',
          todayAttendance: 'අද පැමිණීම',
          upcomingExams: 'ඉදිරි විභාග',
          quickActions: 'ක්‍ෂණික ක්‍රියා',
          registerStudent: 'සිසුන් ලියාපදිංචි කරන්න',
          markAttendance: 'පැමිණීම සටහන් කරන්න',
          manageExams: 'විභාග කළමනාකරණය',
          recentStudents: 'නවතම සිසුන්',
          studentsListWillAppearHere: 'සිසුන් ලැයිස්තුව මෙහි පෙන්වනු ඇත',
          noStudentsRegistered: 'තවම සිසුන් ලියාපදිංචි වී නොමැත'
        },
        students: {
          registerNewStudent: 'නව සිසුවෙකු ලියාපදිංචි කරන්න',
          studentInformation: 'සිසු තොරතුරු',
          nameEnglish: 'නම (ඉංග්‍රීසි)',
          nameSinhala: 'නම (සිංහල)',
          dateOfBirth: 'උපන් දිනය',
          ageGroup: 'වයස් කාණ්ඩය',
          years: 'වසර',
          classYear: 'පන්ති වසර',
          classCode: 'පන්තිය',
          parentInformation: 'දෙමාපිය තොරතුරු',
          parentNameEnglish: 'දෙමාපිය නම (ඉංග්‍රීසි)',
          parentNameSinhala: 'දෙමාපිය නම (සිංහල)',
          parentPhone: 'දුරකථන අංකය',
          parentEmail: 'විද්‍යුත් තැපෑල',
          address: 'ලිපිනය',
          registerStudent: 'සිසුවා ලියාපදිංචි කරන්න'
        }
      },
      common: {
        viewAll: 'සියල්ල බලන්න',
        logout: 'පිටවීම',
        submitting: 'ඉදිරිපත් කරමින්...'
      },
      sidebar: {
        title: 'සතිපාසල',
        adminRole: 'පරිපාලක',
        dashboard: 'උපකරණ පුවරුව',
        students: 'සිසුන්',
        allStudents: 'සියලුම සිසුන්',
        registerStudent: 'සිසුන් ලියාපදිංචි කරන්න',
        classGroups: 'පන්ති කණ්ඩායම්',
        attendance: 'පැමිණීම',
        markAttendance: 'පැමිණීම සටහන් කරන්න',
        attendanceReports: 'පැමිණීමේ වාර්තා',
        exams: 'විභාග',
        manageExams: 'විභාග කළමනාකරණය',
        examResults: 'ප්රතිඵල ඇතුලත් කරන්න',
        examReports: 'වාර්තා සහ විශ්ලේෂණ',
        users: 'පරිශීලකයන්',
        teachers: 'ගුරුවරුන්',
        parents: 'දෙමාපියන්',
        accounts: 'ගිණුම් කළමනාකරණය',
        settings: 'සැකසුම්',
        logout: 'පිටවන්න'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;