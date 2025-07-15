const WebSocket = require('ws');
const { handleMessage, broadcastToRoom } = require('./utils/messageHandler');
const roomManager = require('./utils/roomManager');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        handleMessage(ws, message);
    });

    ws.on('close', () => {
        // Remove user from room
        if (ws.roomCode && ws.userName) {
            const room = roomManager.getRoom(ws.roomCode);
            if (room) {
                delete room.users[ws.userName];
            }
        }
    });
});

// Timer broadcast
setInterval(() => {
    Object.entries(roomManager.getAllRooms()).forEach(([roomCode, room]) => {
        if (!room.votingClosed) {
            const secondsLeft = Math.max(0, Math.floor((room.endsAt - Date.now()) / 1000));
            broadcastToRoom(roomCode, { type: 'timer_update', secondsLeft });
            if (secondsLeft <= 0 && !room.votingClosed) {
                roomManager.closeVoting(roomCode);
                broadcastToRoom(roomCode, { type: 'voting_closed' });
            }
        }
    });
}, 1000);

console.log('WebSocket server running on ws://localhost:8080'); 