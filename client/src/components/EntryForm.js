import React from 'react';

function EntryForm({
    name,
    setName,
    error,
    onCreateRoom,
    onShowJoin,
    showJoin,
    inputRoomCode,
    setInputRoomCode,
    onJoinRoom
}) {
    return (
        <div className="poll-card card p-4">
            <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="d-flex flex-column gap-3 mb-2">
                <button className="btn btn-primary btn-lg" style={{ fontWeight: 600 }} onClick={onCreateRoom}>Create Room</button>
                <div className="text-center text-muted">or</div>
                {!showJoin && (
                    <button className="btn btn-outline-secondary btn-lg" style={{ fontWeight: 600 }} onClick={onShowJoin}>Join Room</button>
                )}
                {showJoin && (
                    <div className="d-flex flex-column gap-2 align-items-stretch">
                        <input className="form-control" placeholder="Enter Room Code" value={inputRoomCode} onChange={e => setInputRoomCode(e.target.value)} />
                        <button className="btn btn-success btn-lg" style={{ fontWeight: 600 }} onClick={onJoinRoom}>Join</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EntryForm; 