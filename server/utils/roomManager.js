const { v4: uuidv4 } = require('uuid');

const QUESTION = 'Cats vs Dogs?';
const OPTIONS = ['cats', 'dogs'];
const VOTE_DURATION = 60; // seconds

const rooms = {}; // roomCode: { users: {}, votes: {}, timer: null, endsAt: Date, votingClosed: bool }

function generateRoomCode() {
    return uuidv4().slice(0, 6).toUpperCase();
}

function getVotesCount(votes) {
    return OPTIONS.reduce((acc, opt) => {
        acc[opt] = Object.values(votes).filter(v => v === opt).length;
        return acc;
    }, {});
}

function createRoom(userName, ws) {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
        users: { [userName]: ws },
        votes: {},
        timer: null,
        endsAt: Date.now() + VOTE_DURATION * 1000,
        votingClosed: false,
    };
    return roomCode;
}

function joinRoom(roomCode, userName, ws) {
    const room = rooms[roomCode];
    if (!room) return false;
    room.users[userName] = ws;
    return true;
}

function closeVoting(roomCode) {
    if (!rooms[roomCode]) return;
    rooms[roomCode].votingClosed = true;
}

function vote(roomCode, userName, option) {
    const room = rooms[roomCode];
    if (!room) return false;
    if (room.votingClosed) return false;
    if (room.votes[userName]) return false;
    room.votes[userName] = option;
    return true;
}

function getRoom(roomCode) {
    return rooms[roomCode];
}

function getAllRooms() {
    return rooms;
}

module.exports = {
    QUESTION,
    OPTIONS,
    VOTE_DURATION,
    rooms,
    generateRoomCode,
    getVotesCount,
    createRoom,
    joinRoom,
    closeVoting,
    vote,
    getRoom,
    getAllRooms,
}; 