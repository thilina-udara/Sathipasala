const express = require('express');
const { getHolidaysByYear } = require('../controllers/holidays.controller');

const router = express.Router();

// Year-specific holidays
router.route('/:year').get(getHolidaysByYear);

module.exports = router;
