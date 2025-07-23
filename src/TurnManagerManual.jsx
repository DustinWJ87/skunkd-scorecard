import React, { useEffect, useState } from 'react';

// Import your logo and icon images
import skunkdLogo from './assets/skunkd-logo.png'; // Image 1
import skunkdIcon from './assets/skunkd-icon.png'; // Image 2
import stinkSheetImg from './assets/stink-sheet.png'; // Image 3
import hoj from './assets/hoj.png'; // Image 4

export default function TurnManagerManual({
  playerName,
  eliminated,
  leaderScore,
  playerScore,
  overtime,
  onScoreBoard,
  onSkunkTurn,
  onEndTurn,
  winnerIdx,
  scores,
  players,
  onSaveGame,
  notesHistory,
  onNotesChange,
  globalUndoAvailable,
  onGlobalUndo
}) {
  // State
  const [denPoints, setDenPoints] = useState(0);
  const [message, setMessage] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [notes, setNotes] = useState(notesHistory || []);

  const [cheatOpen, setCheatOpen] = useState(false);
  const [notes, setNotes] = useState(notesHistory || []);
  const [currentNote, setCurrentNote] = useState('');

  // Update notes in history on change
  useEffect(() => {
    if (onNotesChange) onNotesChange(notes);
  }, [notes, onNotesChange]);

  // Add a note to the notes array
  function addNote() {
    if (currentNote.trim()) {
      const newNote = {
        text: currentNote.trim(),
        timestamp: Date.now()
      };
      setNotes([...notes, newNote]);
      setCurrentNote('');
    }
  }

  // Calculate score needed to pass leader in overtime
  const scoreNeeded = overtime && leaderScore != null && playerScore != null
    ? Math.max(leaderScore - playerScore + 50, 0)
    : null;

  // Handlers
  function addPoints() {
    const pts = parseInt(manualInput, 10);
    if (!isNaN(pts) && pts > 0) {
      // Just add points to den - no need for per-turn undo tracking
      setDenPoints(denPoints + pts);
      setManualInput('');
      setMessage(`Added ${pts} points to sequence!`);
    }
  }

  function bankPoints() {
    if (onScoreBoard) onScoreBoard(denPoints);
    setMessage('Turn ended! Points banked.');
    setDenPoints(0);
    if (onEndTurn) onEndTurn();
  }

  function skunkdTurn() {
    // Call the new onSkunkTurn handler which will handle global state
    if (onSkunkTurn) onSkunkTurn();
    setDenPoints(0);
    setMessage('SKUNK’D! No points banked.');
  }

  // Removed undoLast function - now using global undo functionality

  // Fun, playful layout styles
  const bgStyle = {
    background: 'linear-gradient(135deg, #111 70%, #1e1e1e 100%)',
    borderRadius: '28px',
    boxShadow: '0 6px 32px #0006',
    padding: '32px 18px 28px 18px',
    maxWidth: 630,
    margin: '32px auto',
    position: 'relative',
    color: '#fff',
    fontFamily: 'Quicksand, Nunito, Arial, sans-serif'
  };

  const logoStyle = {
    width: "330px",
    maxWidth: "90vw",
    margin: "0 auto 16px auto",
    display: "block"
  };

  const iconStyle = {
    width: "85px",
    position: "absolute",
    right: "22px",
    top: "22px",
    filter: "drop-shadow(0 0 8px #0008)"
  };

  const stickyNoteStyle = {
    background: "#fffbe5",
    color: "#333",
    borderRadius: "12px",
    boxShadow: "2px 4px 10px #0004",
    padding: "12px",
    width: "210px",
    minHeight: "72px",
    fontFamily: "Caveat, Comic Sans MS, cursive",
    fontSize: "1.1em",
    position: "absolute",
    right: "20px",
    top: "60px"
  };

  const cheatButtonStyle = {
    position: "absolute",
    left: "18px",
    top: "22px",
    background: "#ffd700",
    color: "#222",
    borderRadius: "9px",
    boxShadow: "0 2px 10px #0005",
    fontWeight: "bold",
    fontSize: "1.06em",
    border: "none",
    padding: "11px 18px 11px 54px",
    cursor: "pointer",
    outline: "none",
    zIndex: 3,
    backgroundImage: `url(${skunkdIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '12px center',
    backgroundSize: '32px'
  };

  // Cheat sheet modal style
  const modalBgStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(20,20,20,0.82)",
    zIndex: 1000,
    display: cheatOpen ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  const cheatImgStyle = {
    maxWidth: "98vw",
    maxHeight: "76vh",
    boxShadow: "0 6px 32px #000b",
    borderRadius: "24px",
    border: "4px solid #ffd700"
  };

  const closeBtnStyle = {
    position: "absolute",
    top: "32px",
    right: "32px",
    padding: "10px 20px",
    background: "#ffd700",
    color: "#222",
    fontWeight: "bold",
    fontSize: "1.05em",
    border: "none",
    borderRadius: "9px",
    boxShadow: "0 2px 8px #0008",
    cursor: "pointer",
    zIndex: 1010
  };

  // Share final results UI when winnerIdx
  function renderShareSection() {
    if (typeof winnerIdx !== 'number' || !players || !scores) return null;
    const notesText = notes.length > 0
      ? notes.map(note => `  ${new Date(note.timestamp).toLocaleTimeString()}: ${note.text}`).join('\n')
      : "None";
    const shareText = [
      `SKUNK'D Game Results:`,
      ...players.map((p, i) => `${p}: ${scores[i]}${winnerIdx === i ? " 👑 Winner!" : ""}`),
      `Notes:\n${notesText}`
    ].join('\n');
    return (
      <div style={{
        margin: "28px 0 0 0",
        background: "#222",
        padding: "16px 18px", borderRadius: "16px",
        textAlign: "center"
      }}>
        <div style={{ color: "#ffd700", fontWeight: "bold", fontSize: "1.2em", marginBottom: 10 }}>
          Share or Save Results!
        </div>
        <textarea
          readOnly
          value={shareText}
          style={{
            width: "95%",
            minHeight: 80,
            background: "#fffbe5",
            color: "#222",
            borderRadius: 10,
            fontFamily: "Caveat, cursive",
            fontSize: "1.1em",
            marginBottom: 10,
            padding: 8
          }}
        />
        <div>
          <button
            style={{
              background: "#ffd700", color: "#222", borderRadius: 8,
              padding: "10px 18px", border: "none", fontWeight: "bold",
              marginRight: 10, cursor: "pointer"
            }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "SKUNK'D Results", text: shareText });
              } else {
                navigator.clipboard.writeText(shareText);
                alert('Results copied to clipboard!');
              }
            }}
          >
            {navigator.share ? "Share" : "Copy"}
          </button>
          <button
            style={{
              background: "#222", color: "#ffd700", borderRadius: 8,
              padding: "10px 18px", border: "none", fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              alert('Results copied to clipboard!');
            }}
          >
            Copy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      {/* Logo at the top */}
      <img src={skunkdLogo} alt="SKUNK'D Logo" style={logoStyle} />
      {/* Skunk icon in the corner */}
      <img src={skunkdIcon} alt="SKUNK'D Mascot" style={iconStyle} />
      {/* Sticky note for notes */}
      <div style={stickyNoteStyle}>
        <strong>Add Note:</strong>
        <textarea
          value={currentNote}
          onChange={e => setCurrentNote(e.target.value)}
          placeholder="Jot down player remarks, bonus, etc..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addNote();
            }
          }}
          style={{
            width: "100%",
            minHeight: "38px",
            border: "none",
            background: "transparent",
            resize: "vertical",
            color: "#333",
            fontFamily: "inherit",
            fontSize: "1em",
            marginTop: "6px"
          }}
        />
        <button
          onClick={addNote}
          disabled={!currentNote.trim()}
          style={{
            marginTop: "6px",
            background: currentNote.trim() ? "#ffd700" : "#ccc",
            color: "#222",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "0.9em",
            cursor: currentNote.trim() ? "pointer" : "not-allowed"
          }}
        >
          Add Note
        </button>
        {notes.length > 0 && (
          <div style={{ marginTop: "8px", maxHeight: "120px", overflow: "auto" }}>
            <strong style={{ fontSize: "0.9em" }}>Game Notes:</strong>
            {notes.map((note, idx) => (
              <div key={idx} style={{
                fontSize: "0.8em",
                margin: "2px 0",
                padding: "2px 4px",
                background: "#f9f9f9",
                borderRadius: "3px",
                border: "1px solid #ddd"
              }}>
                <div style={{ fontWeight: "bold", color: "#666" }}>
                  {new Date(note.timestamp).toLocaleTimeString()}
                </div>
                <div>{note.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Cheat Sheet Toggle Button */}
      <button
        style={cheatButtonStyle}
        onClick={() => setCheatOpen(true)}
        title="Open STINK SHEET cheat sheet"
      >
        Cheat Sheet
      </button>
      {/* Main panel */}
      <div style={{ paddingTop: 24 }}>
        <h2 style={{ textShadow: "0 2px 6px #000b" }}>
          {playerName ? `Player: ${playerName}` : "Turn Manager"}
          {eliminated && (
            <span style={{ color: "#ff5252", marginLeft: 12, fontSize: "1em", fontWeight: "bold", textShadow: "none" }}>
              (Eliminated from Overtime)
            </span>
          )}
        </h2>
        <div style={{ marginBottom: 18 }}>
          <span style={{
            fontWeight: "bold",
            fontSize: "1.3em",
            background: "linear-gradient(90deg, #ffd700 90%, #fffbe5 100%)",
            color: "#222",
            borderRadius: "8px",
            padding: "6px 18px",
            boxShadow: "0 2px 8px #2224",
            marginRight: 12
          }}>
            Sequence Points: {denPoints}
          </span>
          {overtime && (
            <span style={{
              marginLeft: 8,
              padding: "5px 5px",
              background: "#ffc107",
              color: "#222",
              borderRadius: "7px",
              fontWeight: "bold",
              boxShadow: "0 2px 7px #2223"
            }}>
              Score to Beat: {leaderScore}
              {scoreNeeded !== null &&
                <span style={{
                  color: "#d32f2f",
                  marginLeft: 14,
                  fontWeight: "bold"
                }}>
                  Points Needed: {scoreNeeded}
                </span>
              }
            </span>
          )}
        </div>
        {/* Controls */}
        {typeof winnerIdx !== 'number' ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            <input
              type="number"
              min="1"
              max="3000"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Add points"
              style={{
                padding: "8px 16px",
                borderRadius: "7px",
                fontSize: "1.1em",
                border: "2px solid #aaa",
                background: "#1b1b1b",
                color: "#ffd700",
                fontWeight: "bold",
                width: "110px"
              }}
              disabled={eliminated}
            />
            <button
              onClick={addPoints}
              style={{
                background: "#ffd700",
                color: "#222",
                fontWeight: "bold",
                borderRadius: "8px",
                boxShadow: "0 2px 8px #0003",
                fontSize: "1.08em",
                padding: "11px 16px",
                border: "none",
                cursor: "pointer"
              }}
              disabled={eliminated}
            >
              Add Points
            </button>
            <button
              onClick={bankPoints}
              style={{
                background: "#8bc34a",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "8px",
                boxShadow: "0 2px 8px #2223",
                fontSize: "1.08em",
                padding: "11px 20px",
                border: "none",
                cursor: "pointer"
              }}
              disabled={eliminated}
            >
              Bank Points
            </button>
            <button
              onClick={skunkdTurn}
              style={{
                background: "#222",
                color: "#ffd700",
                fontWeight: "bold",
                borderRadius: "8px",
                boxShadow: "0 2px 8px #2226",
                fontSize: "1.08em",
                padding: "11px 20px",
                border: "none",
                cursor: "pointer"
              }}
              disabled={eliminated}
              title="Mark turn as SKUNK’D (no points banked)"
            >
              SKUNK’D
            </button>
          </div>
        ) : null}
        {/* Message/feedback */}
        {message && (
          <div style={{
            margin: "18px 0 0 0",
            padding: "9px 18px",
            background: "#222",
            color: "#ffd700",
            borderRadius: "7px",
            fontWeight: "bold",
            fontSize: "1.15em",
            boxShadow: "0 2px 7px #2225",
            textShadow: "0 1px 6px #000b"
          }}>
            {message}
          </div>
        )}
        {/* Share results section */}
        {renderShareSection()}
      </div>
      {/* Cheat Sheet Modal */}
      <div style={modalBgStyle}>
        {cheatOpen && (
          <>
            <button style={closeBtnStyle} onClick={() => setCheatOpen(false)}>
              Close
            </button>
            <img src={stinkSheetImg} alt="STINK SHEET Cheat Sheet" style={cheatImgStyle} />
          </>
        )}
      </div>
      {/* Footer logo for extra fun */}
      <div style={{
        textAlign: "center",
        marginTop: "34px",
        opacity: 0.56
      }}>
        <img src={hoj} alt="Hooked on Johnson Logo" style={{ width: "190px", maxWidth: "80vw" }} />
        <div style={{ fontFamily: "Caveat, cursive", fontSize: "1.23em", color: "#fffbe5", marginTop: "6px" }}>
          Powered by <span style={{ color: "#ffd700", fontWeight: "bold" }}>SKUNK’D</span>
        </div>
      </div>
    </div>
  );
}