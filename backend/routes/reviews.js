const express = require('express');
const router = express.Router();
const { createReview, getEventReviews, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/user/:userId', getUserReviews);
router.get('/:eventId', getEventReviews);
router.post('/:eventId', protect, createReview);

module.exports = router;
