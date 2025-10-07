// Test script for Socket.IO connection
// Run with: node test-socket-connection.js

const { io } = require('socket.io-client');

console.log('Testing Socket.IO connection...');

// Test local connection
const localSocket = io('http://localhost:3000/api/socketio', {
  transports: ['websocket', 'polling'],
  reconnection: false
});

localSocket.on('connect', () => {
  console.log('✅ Local connection successful!');
  console.log('Socket ID:', localSocket.id);
  
  // Test joining admin room
  localSocket.emit('join-admin');
  console.log('✅ Joined admin room');
  
  // Disconnect after 2 seconds
  setTimeout(() => {
    localSocket.disconnect();
    console.log('✅ Local test completed');
  }, 2000);
});

localSocket.on('connect_error', (error) => {
  console.log('❌ Local connection failed:', error.message);
});

// Test remote connection
const remoteSocket = io('https://preview-chat-46449324-1d9b-4b5b-bb3b-00fba80141ba.space.z.ai/api/socketio', {
  transports: ['polling'], // Use polling only for remote
  reconnection: false,
  timeout: 15000,
  upgrade: false,
  rememberUpgrade: false
});

remoteSocket.on('connect', () => {
  console.log('✅ Remote connection successful!');
  console.log('Socket ID:', remoteSocket.id);
  
  // Test joining user room
  remoteSocket.emit('join-user');
  console.log('✅ Joined user room');
  
  // Disconnect after 2 seconds
  setTimeout(() => {
    remoteSocket.disconnect();
    console.log('✅ Remote test completed');
    process.exit(0);
  }, 2000);
});

remoteSocket.on('connect_error', (error) => {
  console.log('❌ Remote connection failed:', error.message);
  process.exit(1);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log('❌ Test timeout');
  process.exit(1);
}, 15000);