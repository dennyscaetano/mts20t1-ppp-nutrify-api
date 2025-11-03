const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middlewares/auth');

// GET /progress?date=YYYY-MM-DD&userId=<id>
router.get('/', auth, progressController.getDaily);

module.exports = router;


