import Pusher from 'pusher-js'
import api from './api/axios'

// Drop-in replacement for the old Socket.io client: exposes the same
// connect() / emit('join', {role, userId}) / on(event, handler) /
// off(event, handler) shape that AdminLayout, AdminInbox, AdminChatModal
// and UserChatBubble already use, so none of those files needed to
// change. Underneath, it's backed by Pusher instead of Socket.io, because
// Socket.io needs a persistent connection that Vercel's serverless
// functions can't keep open - Pusher's hosted service handles that part
// for us.
//
// Private channels ('private-admin-room' / 'private-user-<id>') are used
// instead of plain public ones so the backend's /api/pusher/auth route can
// verify (via the httpOnly login cookie) that whoever is subscribing is
// actually that admin/user - the old Socket.io code trusted whatever
// role/userId the client claimed when joining a room, which this improves
// on for free.

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      api
        .post('/pusher/auth', { socket_id: socketId, channel_name: channel.name })
        .then((res) => callback(null, res.data))
        .catch((err) => callback(err, null))
    },
  }),
})

let channel = null

const socket = {
  // No-op: Pusher connects automatically when instantiated above. Kept so
  // existing call sites (`socket.connect()`) don't need to change.
  connect() {},

  emit(event, payload) {
    if (event !== 'join') return
    const { role, userId } = payload
    const channelName = role === 'admin' ? 'private-admin-room' : `private-user-${userId}`
    if (channel?.name === channelName) return
    if (channel) pusher.unsubscribe(channel.name)
    channel = pusher.subscribe(channelName)
  },

  on(event, handler) {
    channel?.bind(event, handler)
  },

  off(event, handler) {
    channel?.unbind(event, handler)
  },
}

export default socket
