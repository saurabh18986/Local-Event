const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getUserEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/user/:userId', getUserEvents);
router.get('/:id', getEvent);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
