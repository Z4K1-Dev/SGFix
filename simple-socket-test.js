// Simple Socket.IO test
const io = require('socket.io-client');

console.log('Testing Socket.IO connection to remote server...');

const socket = io('https://preview-chat-46449324-1d9b-4b5b-bb3b-00fba80141ba.space.z.ai/api/socketio', {
  transports: ['polling'],
  timeout: 10000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ Connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test joining room
  socket.emit('join-admin');
  console.log('✅ Sent join-admin event');
  
  // Wait a bit then disconnect
  setTimeout(() => {
    socket.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  }, 3000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('Error details:', error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('notification', (data) => {
  console.log('📨 Received notification:', data);
});

// Timeout
setTimeout(() => {
  console.log('❌ Test timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);