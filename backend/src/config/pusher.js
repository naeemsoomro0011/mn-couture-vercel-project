const Pusher = require('pusher');

// Free account: https://dashboard.pusher.com -> Channels -> your app ->
// "App Keys" tab has all four of these values.
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

module.exports = pusher;
