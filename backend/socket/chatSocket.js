// socket/chatSocket.js
const Message = require('../models/Message')
const User = require('../models/User')
const Member = require('../models/Member')
const Committee = require('../models/Committee')
const Location = require('../models/Location')

async function canAccessRoom(userId, roomId) {
  if (!userId) return false;
  const user = await User.findById(userId);
  if (!user) return false;
  if (user.role === 'admin') return true;

  const member = await Member.findOne({ email: user.email });
  if (!member || !member.committees || member.committees.length === 0) return false;

  const location = await Location.findById(roomId);
  if (!location) return false;

  const clubs = await Committee.find();
  const clubsAtLocation = clubs.filter(c =>
    (c.location && location.address && c.location.toLowerCase().includes(location.address.toLowerCase())) ||
    (c.location && location.city && c.location.toLowerCase().includes(location.city.toLowerCase())) ||
    (c.name && location.name && (c.name.toLowerCase().includes(location.name.toLowerCase()) || location.name.toLowerCase().includes(c.name.toLowerCase())))
  );

  const clubIdsAtLocation = clubsAtLocation.map(c => c._id.toString());
  return member.committees.some(cId => clubIdsAtLocation.includes(cId.toString()));
}

exports.initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('joinRoom', async ({ room, userId }) => {
      const hasAccess = await canAccessRoom(userId, room);
      if (!hasAccess) return;

      socket.join(room)

      try {
        // Fetch last 50 messages for this room
        const messages = await Message.find({ room })
          .sort({ createdAt: 1 })
          .limit(50)

        // Emit history only to the user who joined
        socket.emit('messageHistory', messages)

        socket.to(room).emit('message', { text: 'A user joined the room', system: true })
      } catch (error) {
        console.error('Error fetching message history:', error)
      }
    })

    // Silent subscription to receive unread badges
    socket.on('subscribeToRooms', async (rooms, userId) => {
      if (Array.isArray(rooms) && userId) {
        for (const room of rooms) {
          const hasAccess = await canAccessRoom(userId, room);
          if (hasAccess) {
            socket.join(room);
          }
        }

        // Fetch recent unread messages (last 24 hours, not from this user)
        if (userId) {
          try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            for (const room of rooms) {
              const count = await Message.countDocuments({
                room: room,
                sender: { $ne: userId },
                createdAt: { $gte: yesterday }
              });
              if (count > 0) {
                socket.emit('unreadCountUpdate', { room, count });
              }
            }
          } catch (err) {
            console.error('Error fetching unread counts:', err);
          }
        }
      }
    })

    socket.on('leaveRoom', (room) => {
      socket.leave(room)
      socket.to(room).emit('message', { text: 'A user left the room', system: true })
    })

    socket.on('chatMessage', async ({ room, user, message }) => {
      const hasAccess = await canAccessRoom(user._id, room);
      if (!hasAccess) return;

      try {
        // user object should have { _id, name }
        const newMessage = new Message({
          text: message,
          sender: user._id,
          senderName: user.name,
          room: room
        })

        const savedMessage = await newMessage.save()

        io.to(room).emit('message', savedMessage)
      } catch (error) {
        console.error('Error saving message:', error)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}
