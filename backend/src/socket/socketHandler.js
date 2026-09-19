/**
 * Room strategy: every shopper gets a private room `user-<id>`; the admin
 * joins a single `admin-room`. A message always gets emitted to BOTH the
 * relevant user's room and the admin room, so whichever side is looking
 * gets it instantly without a page refresh.
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', ({ role, userId }) => {
      if (role === 'admin') {
        socket.join('admin-room');
      } else if (role === 'user' && userId) {
        socket.join(`user-${userId}`);
      }
    });
  });
};

module.exports = initSocket;
