const Event = require('../models/Event');
const User = require('../models/User');

// ── GET /api/events ───────────────────────────────────────────────────────────
// Supports: ?lat=&lng=&radius=&tags=&startDate=&endDate=&search=&page=&limit=
exports.getEvents = async (req, res) => {
  try {
    const { lat, lng, radius = 50, tags, startDate, endDate, search, page = 1, limit = 12 } = req.query;

    let query = { isActive: true, date: { $gte: new Date() } };

    // Tag filter
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Date range filter
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);

    // Text search on title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let events;
    let total;

    if (lat && lng) {
      // Geo-distance sort using $geoNear aggregation
      const radiusInMeters = parseFloat(radius) * 1000;

      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query,
          },
        },
        { $sort: { distance: 1 } },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: parseInt(limit) },
              {
                $lookup: {
                  from: 'users',
                  localField: 'creator',
                  foreignField: '_id',
                  as: 'creator',
                  pipeline: [{ $project: { name: 1, profileImage: 1, reputationScore: 1 } }],
                },
              },
              { $unwind: '$creator' },
            ],
            count: [{ $count: 'total' }],
          },
        },
      ];

      const result = await Event.aggregate(pipeline);
      events = result[0].data;
      total = result[0].count[0]?.total || 0;
    } else {
      // Default: sort by date
      [events, total] = await Promise.all([
        Event.find(query)
          .populate('creator', 'name profileImage reputationScore')
          .sort({ date: 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Event.countDocuments(query),
      ]);
    }

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/events/:id ───────────────────────────────────────────────────────
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name profileImage reputationScore bio location')
      .populate('attendees', 'name profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/events ──────────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, address, latitude, longitude, tags, capacity, price, image } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location coordinates are required.' });
    }

    const event = await Event.create({
      title,
      description,
      creator: req.user._id,
      date,
      endDate,
      location: {
        address,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      tags: tags || [],
      capacity: capacity || 0,
      price: price || 0,
      isFree: !price || price === 0,
      image: image || '',
    });

    // Add event to user's createdEvents
    await User.findByIdAndUpdate(req.user._id, { $push: { createdEvents: event._id } });

    await event.populate('creator', 'name profileImage reputationScore');

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/events/:id ───────────────────────────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event.' });
    }

    const { title, description, date, endDate, address, latitude, longitude, tags, capacity, price, image } = req.body;

    const updateData = { title, description, date, endDate, tags, capacity, image };
    if (price !== undefined) {
      updateData.price = price;
      updateData.isFree = !price || price === 0;
    }
    if (latitude && longitude) {
      updateData['location.address'] = address;
      updateData['location.coordinates'] = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate(
      'creator',
      'name profileImage reputationScore'
    );

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/events/:id ────────────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { createdEvents: req.params.id } });

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/events/user/:userId ──────────────────────────────────────────────
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ creator: req.params.userId, isActive: true })
      .populate('creator', 'name profileImage reputationScore')
      .sort({ date: -1 });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
