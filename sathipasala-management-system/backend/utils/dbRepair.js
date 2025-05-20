/**
 * Database repair utilities for fixing collection issues
 */
const mongoose = require('mongoose');

/**
 * Completely repair attendance collection index issues
 */
const repairAttendanceCollection = async () => {
  try {
    console.log('Starting attendance collection repair...');
    
    // Get the database connection
    const db = mongoose.connection.db;
    
    // Check attendance collection and its indexes
    const collections = await db.listCollections().toArray();
    const attendanceCollectionExists = collections.some(col => col.name === 'attendances');
    
    if (attendanceCollectionExists) {
      console.log('Checking attendance collection indexes...');
      const collection = db.collection('attendances');
      const indexes = await collection.indexes();
      
      // Log all found indexes
      console.log('Current indexes:', indexes.map(idx => `${idx.name} - ${JSON.stringify(idx.key)}`));
      
      // Drop any problematic indexes (keep only _id_ index)
      for (const idx of indexes) {
        if (idx.name !== '_id_') {
          console.log(`Dropping index: ${idx.name}`);
          await collection.dropIndex(idx.name);
        }
      }
      
      // Create only the correct index
      console.log('Creating proper student+date compound index');
      await collection.createIndex(
        { student: 1, date: 1 }, 
        { 
          unique: true, 
          name: 'student_date_unique',
          background: true 
        }
      );
      
      // Verify indexes after changes
      const updatedIndexes = await collection.indexes();
      console.log('Updated indexes:', updatedIndexes.map(idx => `${idx.name} - ${JSON.stringify(idx.key)}`));
    } else {
      console.log('Attendance collection does not exist yet, will be created when needed.');
    }
    
    console.log('Attendance collection repair completed.');
    return true;
  } catch (error) {
    console.error('Error repairing attendance collection:', error);
    return false;
  }
};

module.exports = {
  repairAttendanceCollection
};
