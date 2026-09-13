const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || userId === req.user._id.toString()) return res.status(400).json({ message: 'Valid other userId required' });
    let conversation = await Conversation.findOne({ participants: { $all: [req.user._id, userId], $size: 2 } });
    if (!conversation) conversation = await Conversation.create({ participants: [req.user._id, userId] });
    conversation = await conversation.populate('participants', '-password');
    res.json({ conversation });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await Message.find({ conversation: conversation._id }).populate('sender', 'name avatar').sort({ createdAt: -1 }).limit(limit);
    res.json({ messages: messages.reverse() });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id }).populate('participants', '-password').populate('lastMessage').sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
