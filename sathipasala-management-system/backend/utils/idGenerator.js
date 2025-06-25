const mongoose = require('mongoose');

/**
 * Generates a unique Student ID in the format BSP_<year>_<random4digit>
 * Example: BSP_25_4582 (for year 2025)
 * 
 * @returns {Promise<string>} Unique student ID
 */
async function generateUniqueStudentId() {
  try {
    // Get current year's last two digits (e.g., '25' for 2025)
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    
    let isUnique = false;
    let studentId = '';
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    console.log(`Generating Student ID for year: ${currentYear} (${yearSuffix})`);
    
    while (!isUnique && attempts < maxAttempts) {
      // Generate a random 4-digit number (1000-9999)
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      
      // Create the student ID with the specified format: BSP_YY_NNNN
      studentId = `BSP_${yearSuffix}_${randomNum}`;
      
      console.log(`Checking uniqueness for ID: ${studentId}`);
      
      // Use mongoose.models to access the Student model instead of importing it
      const Student = mongoose.models.Student;
      
      if (!Student) {
        throw new Error('Student model not yet registered');
      }
      
      // Check if this ID already exists in the database
      const existingStudent = await Student.findOne({ studentId });
      
      if (!existingStudent) {
        isUnique = true;
        console.log(`✓ Generated unique Student ID: ${studentId}`);
      } else {
        console.log(`✗ ID ${studentId} already exists, generating new one...`);
      }
      
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error(`Could not generate a unique student ID after ${maxAttempts} attempts`);
    }
    
    return studentId;
    
  } catch (error) {
    console.error('Error generating student ID:', error);
    throw new Error(`Failed to generate student ID: ${error.message}`);
  }
}

/**
 * Generates a secure temporary password for new students
 * Format: BSP + 4 random digits (e.g., BSP1234)
 * 
 * @returns {string} Temporary password
 */
function generateTemporaryPassword() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BSP${randomNum}`;
}

/**
 * Batch generates multiple unique student IDs
 * Useful for testing or bulk operations
 * 
 * @param {number} count - Number of IDs to generate
 * @returns {Promise<string[]>} Array of unique student IDs
 */
async function generateBatchStudentIds(count = 5) {
  const ids = [];
  
  console.log(`Generating ${count} unique student IDs...`);
  
  for (let i = 0; i < count; i++) {
    try {
      const id = await generateUniqueStudentId();
      ids.push(id);
      console.log(`Generated ID ${i + 1}/${count}: ${id}`);
    } catch (error) {
      console.error(`Failed to generate ID ${i + 1}/${count}:`, error.message);
      throw error;
    }
  }
  
  return ids;
}

/**
 * Validates if a student ID follows the correct format
 * 
 * @param {string} studentId - Student ID to validate
 * @returns {boolean} True if valid format, false otherwise
 */
function validateStudentIdFormat(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    return false;
  }
  
  // Check format: BSP_YY_NNNN
  const regex = /^BSP_\d{2}_\d{4}$/;
  return regex.test(studentId);
}

/**
 * Extracts year from student ID
 * 
 * @param {string} studentId - Student ID to parse
 * @returns {number|null} Full year (e.g., 2025) or null if invalid
 */
function extractYearFromStudentId(studentId) {
  if (!validateStudentIdFormat(studentId)) {
    return null;
  }
  
  const yearSuffix = studentId.split('_')[1];
  const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
  return currentCentury + parseInt(yearSuffix, 10);
}

module.exports = { 
  generateUniqueStudentId,
  generateTemporaryPassword,
  generateBatchStudentIds,
  validateStudentIdFormat,
  extractYearFromStudentId
};