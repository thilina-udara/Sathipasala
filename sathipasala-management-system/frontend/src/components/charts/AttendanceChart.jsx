import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#4ade80', '#f87171', '#facc15'];

const AttendanceChart = ({ data, chartType = 'bar' }) => {
  // Format data for pie chart
  const pieData = [
    { name: 'Present', value: data.present || 0, color: '#4ade80' },
    { name: 'Absent', value: data.absent || 0, color: '#f87171' },
    { name: 'Late', value: data.late || 0, color: '#facc15' }
  ].filter(item => item.value > 0);

  // Format data for bar chart (monthly trend)
  const barData = data.monthlyAttendance || [];

  return (
    <div className="w-full">
      {chartType === 'pie' && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => [`${value}`, 'Days']} />
          </PieChart>
        </ResponsiveContainer>
      )}

      {chartType === 'bar' && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" name="Present" fill="#4ade80" />
            <Bar dataKey="absent" name="Absent" fill="#f87171" />
            <Bar dataKey="late" name="Late" fill="#facc15" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceChart;