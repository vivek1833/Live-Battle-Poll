import React from 'react';
import TimerBar from './TimerBar';

function PollRoom({
    roomCode,
    question,
    options,
    votes,
    secondsLeft,
    hasVoted,
    voteOption,
    votingClosed,
    onVote,
    onCopyRoomCode,
    copied,
    timerPercent
}) {
    return (
        <div className="poll-card card p-4 animate__animated animate__fadeIn">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold">Room Code:</span>
                <span className="room-code" onClick={onCopyRoomCode} title="Copy Room Code">
                    {roomCode} {copied && <span className="text-success ms-1">Copied!</span>}
                </span>
            </div>
            <div className="mb-2"><b>Question:</b> {question}</div>
            <TimerBar percent={timerPercent} />
            <div className="mb-2 text-muted" style={{ fontSize: '1.1rem' }}>
                <b>Time Left:</b> {secondsLeft}s
            </div>
            <div className="mb-3 d-flex flex-column flex-md-row gap-2">
                {options.map(opt => (
                    <button
                        key={opt}
                        className={`btn btn-outline-primary vote-btn ${hasVoted && voteOption === opt ? 'active' : ''}`}
                        disabled={hasVoted || votingClosed}
                        onClick={() => onVote(opt)}
                    >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                ))}
            </div>
            <div className="mb-3">
                <b>Votes:</b>
                <ul className="mb-0">
                    {options.map(opt => (
                        <li key={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}: {votes[opt] || 0}</li>
                    ))}
                </ul>
            </div>
            {hasVoted && <div className="alert alert-info py-2">You voted for <b>{voteOption}</b>.</div>}
            {votingClosed && <div className="alert alert-warning py-2">Voting is closed.</div>}
        </div>
    );
}

export default PollRoom; 