const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id)

    // Join personal room for notifications
    socket.on('join', (userId) => {
      socket.join(userId)
      console.log(`👤 User ${userId} joined their room`)
    })

    // Join booking room for chat + live tracking
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`)
    })

    // Worker sends GPS location update
    socket.on('worker_location', ({ bookingId, coordinates }) => {
      io.to(`booking_${bookingId}`).emit('worker_location_update', { coordinates })
    })

    // Booking chat message
    socket.on('booking_message', ({ bookingId, message }) => {
      io.to(`booking_${bookingId}`).emit('new_message', message)
    })

    // Booking status update
    socket.on('booking_status', ({ bookingId, status, userId }) => {
      io.to(`booking_${bookingId}`).emit('status_update', { status })
      io.to(userId).emit('notification', { type: 'booking', status })
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected:', socket.id)
    })
  })
}

module.exports = { initSocket }
