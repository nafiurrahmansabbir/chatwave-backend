const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getOrCreateConversation, getMessages, getConversations } = require('../controllers/chatController');
router.get('/', auth, getConversations);
router.post('/', auth, getOrCreateConversation);
router.get('/:conversationId/messages', auth, getMessages);
module.exports = router;
