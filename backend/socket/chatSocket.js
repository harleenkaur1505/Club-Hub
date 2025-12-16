// socket/chatSocket.js
exports.initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('joinRoom', (room) => {
      socket.join(room)
      socket.to(room).emit('message', { text: 'A user joined the room', system: true })
    })

    socket.on('leaveRoom', (room) => {
      socket.leave(room)
      socket.to(room).emit('message', { text: 'A user left the room', system: true })
    })

    socket.on('chatMessage', ({ room, user, message }) => {
      const payload = {
        user,
        message,
        time: new Date()
      }
      io.to(room).emit('message', payload)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}
