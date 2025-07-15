import React from 'react';

function TimerBar({ percent }) {
    return (
        <div className="timer-bar mb-3">
            <div className="timer-bar-inner" style={{ width: `${percent}%` }}></div>
        </div>
    );
}

export default TimerBar; 