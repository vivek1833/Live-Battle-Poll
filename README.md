# Live Battle Poll

A real-time poll application where users can create or join a poll room and vote live. Results update instantly for all users in the same room.

## Tech Stack

- **Frontend:** ReactJS
- **Backend:** NodeJS with WebSockets

## Features

- Enter your name (unique, no password) and create or join a poll room using a room code
- Display a question with two options (e.g., "Cats vs Dogs")
- Vote for one option and see real-time vote updates
- Prevents re-voting and persists your vote across refreshes (local storage)
- 60-second countdown timer disables voting when time is up
- Multiple rooms supported, each with independent users and votes

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)

### 1. Clone the repository

### 2. Setup and Run the Backend

```bash
cd server
npm install
node index.js
```

The backend WebSocket server runs at `ws://localhost:8080`.

### 3. Setup and Run the Frontend

```bash
cd ../client
npm install
npm start
```

The React app runs at `http://localhost:3000` by default.

---

## Usage

1. Enter your name and choose to create a new poll room or join an existing one with a room code.
2. Vote for one of the two options. Your vote is locked in and cannot be changed.
3. See live vote counts and a countdown timer. Voting is disabled after 60 seconds.
4. Your vote is saved in local storage and persists across page refreshes.

---

## Message Protocol (Backend)

- **Create Room:**
  ```json
  { "type": "create_room", "name": "Alice" }
  ```
- **Join Room:**
  ```json
  { "type": "join_room", "name": "Bob", "roomCode": "ABC123" }
  ```
- **Vote:**
  ```json
  { "type": "vote", "roomCode": "ABC123", "name": "Alice", "option": "cats" }
  ```

---

## Architecture & State Management

- **Vote State Sharing:**
  - The backend keeps all poll room and vote state in memory. When a user votes, the backend updates the room's state and broadcasts the new vote counts to all connected clients in that room via WebSocket.
  - The frontend listens for these updates and updates the UI in real time. Each client also stores their vote in local storage to prevent re-voting and persist across refreshes.
- **Room Management:**
  - Each room is identified by a unique code. The backend manages room creation, user connections, and ensures each user name is unique within a room. All state is ephemeral and lost if the server restarts.

---

## Folder Structure

```bash
├── client
│   ├── public
│   │   ├── icon.jpg
│   │   ├── index.html
│   ├── src
│   │   ├── App.js
│   │   └── index.js
│   ├── components
│   │   ├── EntryForm.js
│   │   └── PollRoom.js
│   │   └── TimerBar.js
│   ├── utils
│   │   ├── server.js
│   └── package.json
├── server
│   ├── utils
│   │   ├── messageHandler.js
│   │   └── roomManager.js
│   ├── index.js
│   └── package.json
├── README.md
```