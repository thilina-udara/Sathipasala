const asyncHandler = require('../middleware/async.middleware');

/**
 * @desc    Get holidays for a specific year
 * @route   GET /api/holidays/:year
 * @access  Public
 */
exports.getHolidaysByYear = asyncHandler(async (req, res, next) => {
  const { year } = req.params;
  
  console.log(`Fetching holidays for year: ${year}`);
  
  // Predefined holiday data by year
  const holidaysMap = {
    // 2023 holidays
    '2023': [
      { date: "2023-01-15", name: "Tamil Thai Pongal Day" },
      { date: "2023-02-04", name: "National Day" },
      { date: "2023-04-13", name: "Sinhala & Tamil New Year Eve" },
      { date: "2023-04-14", name: "Sinhala & Tamil New Year" },
      { date: "2023-05-01", name: "May Day" },
      { date: "2023-05-05", name: "Vesak Full Moon Poya Day" },
      { date: "2023-06-03", name: "Poson Full Moon Poya Day" },
      { date: "2023-12-25", name: "Christmas Day" }
    ],
    // 2024 holidays
    '2024': [
      { date: "2024-01-15", name: "Tamil Thai Pongal Day" },
      { date: "2024-01-25", name: "Duruthu Full Moon Poya Day" },
      { date: "2024-02-04", name: "National Day" },
      { date: "2024-02-24", name: "Navam Full Moon Poya Day" },
      { date: "2024-03-25", name: "Madin Full Moon Poya Day" },
      { date: "2024-04-13", name: "Day prior to Sinhala & Tamil New Year Day" },
      { date: "2024-04-14", name: "Sinhala & Tamil New Year Day" },
      { date: "2024-04-23", name: "Bak Full Moon Poya Day" },
      { date: "2024-05-01", name: "May Day" },
      { date: "2024-05-23", name: "Vesak Full Moon Poya Day" },
      { date: "2024-06-21", name: "Poson Full Moon Poya Day" },
      { date: "2024-07-21", name: "Esala Full Moon Poya Day" },
      { date: "2024-08-19", name: "Nikini Full Moon Poya Day" },
      { date: "2024-09-17", name: "Binara Full Moon Poya Day" },
      { date: "2024-10-17", name: "Vap Full Moon Poya Day" },
      { date: "2024-11-01", name: "Deepavali" },
      { date: "2024-11-15", name: "Il Full Moon Poya Day" },
      { date: "2024-12-15", name: "Unduvap Full Moon Poya Day" },
      { date: "2024-12-25", name: "Christmas Day" }
    ],
    // 2025 holidays (similar pattern)
    '2025': [
      { date: "2025-01-14", name: "Tamil Thai Pongal Day" },
      { date: "2025-01-25", name: "Duruthu Full Moon Poya Day" },
      { date: "2025-02-04", name: "National Day" },
      { date: "2025-02-23", name: "Navam Full Moon Poya Day" },
      { date: "2025-03-24", name: "Madin Full Moon Poya Day" },
      { date: "2025-04-13", name: "Day prior to Sinhala & Tamil New Year Day" },
      { date: "2025-04-14", name: "Sinhala & Tamil New Year Day" },
      { date: "2025-04-23", name: "Bak Full Moon Poya Day" },
      { date: "2025-05-01", name: "May Day" },
      { date: "2025-05-22", name: "Vesak Full Moon Poya Day" },
      { date: "2025-06-20", name: "Poson Full Moon Poya Day" },
      { date: "2025-07-20", name: "Esala Full Moon Poya Day" },
      { date: "2025-08-18", name: "Nikini Full Moon Poya Day" },
      { date: "2025-09-17", name: "Binara Full Moon Poya Day" },
      { date: "2025-10-16", name: "Vap Full Moon Poya Day" },
      { date: "2025-11-14", name: "Il Full Moon Poya Day" },
      { date: "2025-12-14", name: "Unduvap Full Moon Poya Day" },
      { date: "2025-12-25", name: "Christmas Day" }
    ]
  };
  
  // Return holidays for the requested year (or empty array if not found)
  const holidays = holidaysMap[year] || [];
  
  res.status(200).json({
    success: true,
    data: holidays
  });
});

/**
 * @desc    Get all holidays
 * @route   GET /api/holidays
 * @access  Public
 */
exports.getAllHolidays = asyncHandler(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Get holidays for current and next year
  const currentYearHolidays = exports.getHolidaysByYear({ params: { year: currentYear.toString() } }, { status: () => ({ json: data => data }) });
  const nextYearHolidays = exports.getHolidaysByYear({ params: { year: nextYear.toString() } }, { status: () => ({ json: data => data }) });
  
  res.status(200).json({
    success: true,
    data: {
      [currentYear]: currentYearHolidays.data,
      [nextYear]: nextYearHolidays.data
    }
  });
});
