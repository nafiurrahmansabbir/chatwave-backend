const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { listUsers, profile } = require('../controllers/userController');
router.get('/', auth, listUsers);
router.get('/me', auth, profile);
module.exports = router;
