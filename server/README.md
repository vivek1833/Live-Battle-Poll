# Live Poll Battle Backend

This is the NodeJS WebSocket backend for the Live Poll Battle app.

## Features

- Create and join poll rooms
- Real-time voting and updates
- 60-second countdown per poll
- In-memory storage (no database)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node index.js
   ```

The server will run on `ws://localhost:8080`.

## Message Protocol

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

See `index.js` for more details.
