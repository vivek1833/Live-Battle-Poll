import React, { useState, useEffect, useRef } from 'react';
import EntryForm from './components/EntryForm';
import PollRoom from './components/PollRoom';
import './App.css';
import { WS_URL } from './utils/server';

function App() {
  // State
  const [step, setStep] = useState('enter');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteOption, setVoteOption] = useState('');
  const [error, setError] = useState('');
  const [votingClosed, setVotingClosed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const ws = useRef(null);
  const joinRoomIntent = useRef(false);
  const joinRoomData = useRef({});
  const shouldJoinAfterCreate = useRef(false);

  // Persist vote in localStorage
  useEffect(() => {
    if (roomCode && name && voteOption) {
      localStorage.setItem(`vote_${roomCode}_${name}`, voteOption);
    }
  }, [roomCode, name, voteOption]);

  // Restore vote from localStorage
  useEffect(() => {
    if (roomCode && name) {
      const v = localStorage.getItem(`vote_${roomCode}_${name}`);
      if (v) {
        setHasVoted(true);
        setVoteOption(v);
      }
    }
  }, [roomCode, name]);

  // WebSocket setup
  useEffect(() => {
    if (step === 'poll' && roomCode && name) {
      ws.current = new window.WebSocket(WS_URL);
      ws.current.onopen = () => {
        if (joinRoomIntent.current) {
          ws.current.send(JSON.stringify({ type: 'join_room', ...joinRoomData.current }));
          joinRoomIntent.current = false;
        }
        if (shouldJoinAfterCreate.current) {
          ws.current.send(JSON.stringify({ type: 'join_room', name, roomCode }));
          shouldJoinAfterCreate.current = false;
        }
      };
      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'joined_room' || msg.type === 'room_created') {
          setQuestion(msg.question);
          setOptions(msg.options);
          setVotes(msg.votes || {});
          setSecondsLeft(msg.secondsLeft || 60);
          setVotingClosed(false);
        }
        if (msg.type === 'vote_update') {
          setVotes(msg.votes);
        }
        if (msg.type === 'timer_update') {
          setSecondsLeft(msg.secondsLeft);
        }
        if (msg.type === 'voting_closed') {
          setVotingClosed(true);
        }
        if (msg.type === 'error') {
          setError(msg.message);
          // Reset to entry step and clear poll state
          setStep('enter');
          setRoomCode('');
          setQuestion('');
          setOptions([]);
          setVotes({});
          setSecondsLeft(60);
          setHasVoted(false);
          setVoteOption('');
          setVotingClosed(false);
          setShowJoin(false);
        }
      };
      ws.current.onclose = () => { };
      return () => ws.current && ws.current.close();
    }
  }, [step, roomCode, name]);

  // Handlers
  const handleCreateRoom = () => {
    if (!name) return setError('Enter your name');
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: 'create_room', name }));
    };
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'room_created') {
        setRoomCode(msg.roomCode);
        setQuestion(msg.question);
        setOptions(msg.options);
        setSecondsLeft(msg.secondsLeft);
        setVotes({});
        setVotingClosed(false);
        setStep('poll');
        // After room is created, join the room for real-time updates
        shouldJoinAfterCreate.current = true;
      }
      if (msg.type === 'error') {
        setError(msg.message);
        // Reset to entry step and clear poll state
        setStep('enter');
        setRoomCode('');
        setQuestion('');
        setOptions([]);
        setVotes({});
        setSecondsLeft(60);
        setHasVoted(false);
        setVoteOption('');
        setVotingClosed(false);
        setShowJoin(false);
      }
    };
    ws.current.onclose = () => { };
  };

  const handleShowJoin = () => {
    setShowJoin(true);
    setError('');
  };

  const handleJoinRoom = () => {
    if (!name) return setError('Enter your name');
    if (!inputRoomCode) return setError('Enter room code');
    setRoomCode(inputRoomCode.toUpperCase());
    setStep('poll');
    // Queue join_room for when poll WebSocket opens
    joinRoomIntent.current = true;
    joinRoomData.current = { name, roomCode: inputRoomCode.toUpperCase() };
  };

  const handleVote = (option) => {
    if (hasVoted || votingClosed) return;
    if (ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify({ type: 'vote', roomCode, name, option }));
      setHasVoted(true);
      setVoteOption(option);
    }
  };

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Timer progress
  const timerPercent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  // UI
  return (
    <div className="app-center">
      <h1 className="mb-4 fw-bold" style={{ letterSpacing: '1px' }}>Live Poll Battle</h1>
      {error && <div className="alert alert-danger" style={{ maxWidth: 420 }}>{error}</div>}
      {step === 'enter' && (
        <EntryForm
          name={name}
          setName={setName}
          error={error}
          onCreateRoom={handleCreateRoom}
          onShowJoin={handleShowJoin}
          showJoin={showJoin}
          inputRoomCode={inputRoomCode}
          setInputRoomCode={setInputRoomCode}
          onJoinRoom={handleJoinRoom}
        />
      )}
      {step === 'poll' && (
        <PollRoom
          roomCode={roomCode}
          question={question}
          options={options}
          votes={votes}
          secondsLeft={secondsLeft}
          hasVoted={hasVoted}
          voteOption={voteOption}
          votingClosed={votingClosed}
          onVote={handleVote}
          onCopyRoomCode={handleCopyRoomCode}
          copied={copied}
          timerPercent={timerPercent}
        />
      )}
      <div className="footer">
        <p>Created by Vivek</p>
        <p>Source code: <a target="_blank" href="https://github.com/vivek1833/Live-Battle-Poll">GitHub</a></p>
      </div>
    </div>
  );
}

export default App;
