import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateAttendanceReport = (student, attendanceData) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add title
  doc.setFontSize(20);
  doc.text('Student Attendance Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add student details
  doc.setFontSize(12);
  doc.text(`Name: ${student.name.en}`, 15, 40);
  doc.text(`Student ID: ${student.studentId}`, 15, 48);
  doc.text(`Class: ${student.classYear}-${student.classCode}`, 15, 56);

  // Add attendance summary
  doc.setFontSize(16);
  doc.text('Attendance Summary', pageWidth / 2, 70, { align: 'center' });
  
  // Calculate attendance stats
  const total = attendanceData.length;
  const present = attendanceData.filter(item => item.status === 'present').length;
  const absent = attendanceData.filter(item => item.status === 'absent').length;
  const late = attendanceData.filter(item => item.status === 'late').length;
  const attendanceRate = total > 0 ? (present / total * 100).toFixed(1) : 0;
  
  // Add stats as a small table
  doc.autoTable({
    startY: 80,
    head: [['Total Days', 'Present', 'Absent', 'Late', 'Attendance Rate']],
    body: [
      [total, present, absent, late, `${attendanceRate}%`]
    ],
  });
  
  // Add attendance details
  doc.setFontSize(16);
  doc.text('Attendance Records', pageWidth / 2, 110, { align: 'center' });
  
  // Format data for table
  const tableData = attendanceData.map(record => [
    new Date(record.date).toLocaleDateString(),
    record.status.charAt(0).toUpperCase() + record.status.slice(1),
    record.reason || '-'
  ]);
  
  // Add attendance records table
  doc.autoTable({
    startY: 120,
    head: [['Date', 'Status', 'Reason']],
    body: tableData,
  });
  
  // Save PDF
  doc.save(`Attendance_${student.studentId}.pdf`);
  
  return doc;
};