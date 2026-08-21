const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/:eventId', protect, getMessages);
router.post('/:eventId', protect, sendMessage);

module.exports = router;
