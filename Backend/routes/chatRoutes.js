const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chatcontroller.js');
const authenticateUser = require('../middlewares/authmiddleware');

router.get('/history', authenticateUser, getChatHistory);
router.post('/send', authenticateUser, sendMessage);

module.exports = router;