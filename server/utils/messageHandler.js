const roomManager = require('./roomManager');

function broadcastToRoom(roomCode, data) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;
    Object.values(room.users).forEach(ws => {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify(data));
        }
    });
}

function handleMessage(ws, message) {
    let msg;
    try {
        msg = JSON.parse(message);
    } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
    }

    // CREATE ROOM
    if (msg.type === 'create_room' && msg.name) {
        const roomCode = roomManager.createRoom(msg.name, ws);
        const room = roomManager.getRoom(roomCode);
        room.endsAt = Date.now() + roomManager.VOTE_DURATION * 1000;
        room.timer = setTimeout(() => {
            roomManager.closeVoting(roomCode);
            broadcastToRoom(roomCode, { type: 'voting_closed' });
        }, roomManager.VOTE_DURATION * 1000);
        ws.roomCode = roomCode;
        ws.userName = msg.name;
        ws.send(JSON.stringify({
            type: 'room_created',
            roomCode,
            question: roomManager.QUESTION,
            options: roomManager.OPTIONS,
            secondsLeft: roomManager.VOTE_DURATION,
        }));
        broadcastToRoom(roomCode, {
            type: 'vote_update',
            votes: roomManager.getVotesCount(room.votes),
        });
        return;
    }

    // JOIN ROOM
    if (msg.type === 'join_room' && msg.name && msg.roomCode) {
        const room = roomManager.getRoom(msg.roomCode);
        if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        // Always update the user's socket reference
        roomManager.joinRoom(msg.roomCode, msg.name, ws);
        ws.roomCode = msg.roomCode;
        ws.userName = msg.name;
        if (room.votingClosed) {
            ws.send(JSON.stringify({ type: 'error', message: 'Voting is closed' }));
            return;
        }
        const secondsLeft = Math.max(0, Math.floor((room.endsAt - Date.now()) / 1000));
        ws.send(JSON.stringify({
            type: 'joined_room',
            roomCode: msg.roomCode,
            question: roomManager.QUESTION,
            options: roomManager.OPTIONS,
            votes: roomManager.getVotesCount(room.votes),
            secondsLeft,
        }));
        broadcastToRoom(msg.roomCode, {
            type: 'vote_update',
            votes: roomManager.getVotesCount(room.votes),
        });
        return;
    }

    // VOTE
    if (msg.type === 'vote' && msg.roomCode && msg.name && roomManager.OPTIONS.includes(msg.option)) {
        const room = roomManager.getRoom(msg.roomCode);
        if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        if (room.votingClosed) {
            ws.send(JSON.stringify({ type: 'error', message: 'Voting is closed' }));
            return;
        }
        if (room.votes[msg.name]) {
            ws.send(JSON.stringify({ type: 'error', message: 'Already voted' }));
            return;
        }
        roomManager.vote(msg.roomCode, msg.name, msg.option);
        broadcastToRoom(msg.roomCode, {
            type: 'vote_update',
            votes: roomManager.getVotesCount(room.votes),
        });
        return;
    }
}

module.exports = { handleMessage, broadcastToRoom }; 