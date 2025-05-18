const Event = require('../models/event.model');
const { startOfMonth, endOfMonth } = require('date-fns');

// @desc    Get all events or filtered events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const { year, month, type } = req.query;
    
    let query = {};
    
    // Add date filter if year and month provided
    if (year && month) {
      const startDate = startOfMonth(new Date(year, month - 1, 1));
      const endDate = endOfMonth(new Date(year, month - 1, 1));
      
      query = {
        $or: [
          { date: { $gte: startDate, $lte: endDate } },
          { 
            isRecurringYearly: true,
            $expr: {
              $eq: [{ $month: "$date" }, parseInt(month)]
            }
          }
        ]
      };
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    const events = await Event.find(query).sort({ date: 1 });
    
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch events'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    return res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    await event.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event'
    });
  }
};