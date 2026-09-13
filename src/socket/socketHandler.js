const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const onlineUsers = new Map();

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch { next(new Error('Invalid socket token')); }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('presence:update', { userId, isOnline: true });

    socket.on('conversation:join', (conversationId) => socket.join(`conversation:${conversationId}`));

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', { userId, conversationId, isTyping: true });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', { userId, conversationId, isTyping: false });
    });

    socket.on('message:send', async ({ conversationId, text }, callback) => {
      try {
        if (!text?.trim()) return callback?.({ success: false, message: 'Message text is required' });
        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conversation) return callback?.({ success: false, message: 'Conversation not found' });
        const message = await Message.create({ conversation: conversationId, sender: userId, text: text.trim(), seenBy: [userId] });
        conversation.lastMessage = message._id; await conversation.save();
        const populated = await message.populate('sender', 'name avatar');
        io.to(`conversation:${conversationId}`).emit('message:new', populated);
        callback?.({ success: true, message: populated });
      } catch (e) { callback?.({ success: false, message: e.message }); }
    });

    socket.on('message:seen', async ({ messageId, conversationId }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { seenBy: userId } });
      io.to(`conversation:${conversationId}`).emit('message:seen', { messageId, userId });
    });

    socket.on('disconnect', async () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        io.emit('presence:update', { userId, isOnline: false, lastSeen: new Date() });
      }
    });
  });
}
module.exports = { registerSocketHandlers };
