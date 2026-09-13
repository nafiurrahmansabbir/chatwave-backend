const User = require('../models/User');
const { publicUser } = require('./authController');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password').sort({ name: 1 });
    res.json({ users: users.map(publicUser) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.profile = async (req, res) => res.json({ user: publicUser(req.user) });
