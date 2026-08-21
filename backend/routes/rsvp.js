const express = require('express');
const router = express.Router();
const { rsvpEvent, cancelRSVP, getAttendees, getMyRSVPs } = require('../controllers/rsvpController');
const { protect } = require('../middleware/auth');

router.get('/my-rsvps', protect, getMyRSVPs);
router.get('/:eventId/attendees', protect, getAttendees);
router.post('/:eventId', protect, rsvpEvent);
router.delete('/:eventId', protect, cancelRSVP);

module.exports = router;
