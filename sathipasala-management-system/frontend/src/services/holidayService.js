import axios from 'axios';
import { format } from 'date-fns';

/**
 * Holiday Service for managing special days in the application
 */
class HolidayService {
  /**
   * Get holidays for a specific year
   * @param {number} year - The year to get holidays for
   * @returns {Promise<Array>} - List of holidays
   */
  async getHolidays(year) {
    try {
      // First try to get from API
      const response = await axios.get(`/api/holidays/${year}`);
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fall back to static holidays if API fails
      return this.getStaticHolidays(year);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      return this.getStaticHolidays(year);
    }
  }
  
  /**
   * Calculate Poya days for a specific year
   * @param {number} year - The year to calculate Poya days for
   * @returns {Array<string>} - Array of Poya days in YYYY-MM-DD format
   */
  calculatePoyaDays(year) {
    // This implementation uses a simplified lunar calendar calculation
    // For production use, consider a proper astronomical calculation library
    // or an API service for accurate full moon dates
    
    const poyaDays = [];
    const lunarMonthLength = 29.53059;
    
    // Approximate starting point - first full moon of the year
    // You'll want to adjust this based on actual astronomical data
    let baseDate = new Date(`${year}-01-05T12:00:00Z`);
    
    // Generate full moon dates for the year
    for (let i = 0; i < 13; i++) {
      const fullMoonDate = new Date(baseDate);
      fullMoonDate.setDate(baseDate.getDate() + Math.round(i * lunarMonthLength));
      
      // Skip if we've gone into the next year
      if (fullMoonDate.getFullYear() > year) break;
      
      poyaDays.push(format(fullMoonDate, 'yyyy-MM-dd'));
    }
    
    return poyaDays;
  }
  
  /**
   * Get static holidays for a specific year when API is not available
   * @param {number} year - The year to get holidays for
   * @returns {Array} - List of holidays
   */
  getStaticHolidays(year) {
    return [
      { date: `${year}-01-01`, name: "New Year's Day" },
      { date: `${year}-02-04`, name: "National Day" },
      { date: `${year}-05-01`, name: "May Day" },
      { date: `${year}-12-25`, name: "Christmas Day" },
      // Add more static holidays as needed
    ];
  }
  
  /**
   * Check if date is a holiday
   * @param {Date} date - The date to check
   * @param {Array} holidays - List of holidays to check against
   * @returns {boolean} - Whether the date is a holiday
   */
  isHoliday(date, holidays) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.some(holiday => holiday.date === formattedDate);
  }
  
  /**
   * Check if date is a Poya day
   * @param {Date} date - The date to check
   * @param {Array} poyaDays - List of Poya days to check against
   * @returns {boolean} - Whether the date is a Poya day
   */
  isPoyaDay(date, poyaDays) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return poyaDays.includes(formattedDate);
  }
}

export default new HolidayService();
