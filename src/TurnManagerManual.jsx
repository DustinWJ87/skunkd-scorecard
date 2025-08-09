import React, { useEffect, useState } from 'react';

// Import your logo and icon images
import cardBack from './assets/cardback.png'; // Image 1
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
  isSoloMode = false
}) {
  // State
  const [denPoints, setDenPoints] = useState(0);
  const [message, setMessage] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [notes, setNotes] = useState(notesHistory || []);
  const [cheatOpen, setCheatOpen] = useState(false);

  // Turn-level undo for banked points (within current turn only)
  const [turnActions, setTurnActions] = useState([]);
  const [isNotesCollapsed, setIsNotesCollapsed] = useState(false);

  // Update notes in history on change
  useEffect(() => {
    if (onNotesChange) onNotesChange(notes);
  }, [notes, onNotesChange]);

  // Reset turn actions when player changes (new turn)
  useEffect(() => {
    setTurnActions([]);
    setDenPoints(0);
  }, [playerName]);

  // Handle responsive notes collapse - only collapse on initial load for mobile
  useEffect(() => {
    // Set initial state based on screen size only on mount
    if (window.innerWidth < 768) {
      setIsNotesCollapsed(true);
    }
  }, []); // Empty dependency array - only run on mount

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
      // Track the action for turn-level undo
      setTurnActions(prev => [...prev, { type: 'addPoints', points: pts, timestamp: Date.now() }]);
      setDenPoints(denPoints + pts);
      setManualInput('');
      setMessage(`Added ${pts} points to sequence!`);
    }
  }

  function undoBankedAction() {
    if (turnActions.length === 0) return;
    
    const lastAction = turnActions[turnActions.length - 1];
    if (lastAction.type === 'addPoints') {
      setDenPoints(prev => prev - lastAction.points);
      setTurnActions(prev => prev.slice(0, -1));
      setMessage(`Undid adding ${lastAction.points} points!`);
    }
  }

  function bankPoints() {
    if (onScoreBoard) onScoreBoard(denPoints);
    setMessage('Turn ended! Points banked.');
    setDenPoints(0);
    setTurnActions([]); // Clear turn actions when turn ends
    if (onEndTurn) onEndTurn();
  }

  function skunkdTurn() {
    // Call the new onSkunkTurn handler which will handle global state
    if (onSkunkTurn) onSkunkTurn();
    setDenPoints(0);
    setTurnActions([]); // Clear turn actions when turn ends
    setMessage('SKUNK\'D! No points banked.');
  }

  // Two-column responsive layout styles (more mobile-friendly)
  const containerStyle = {
    background: 'linear-gradient(135deg, #111 70%, #1e1e1e 100%)',
    backgroundImage: `url(${cardBack})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    borderRadius: '20px',
    boxShadow: '0 6px 32px #0006',
    padding: '20px 16px',
    maxWidth: '900px', // Reduced from 1200px
    margin: '20px auto',
    position: 'relative',
    color: '#fff',
    fontFamily: 'Quicksand, Nunito, Arial, sans-serif',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const leftColumnStyle = {
    flex: '1 1 320px', // Main content column
    minWidth: '300px'
  };

  const rightColumnStyle = {
    flex: '1 1 280px', // Notes column
    minWidth: '250px',
    position: 'relative'
  };

  const notesAreaStyle = {
    background: "#fffbe5",
    color: "#333",
    borderRadius: "12px",
    boxShadow: "2px 4px 10px #0004",
    padding: "12px",
    width: "100%",
    minHeight: isNotesCollapsed ? "50px" : "250px", // Reduced heights
    fontFamily: "Caveat, Comic Sans MS, cursive",
    fontSize: "1.0em", // Slightly smaller
    position: "relative",
    transition: "min-height 0.3s ease"
  };

  const notesToggleStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#ffd700",
    color: "#222",
    border: "none",
    borderRadius: "4px",
    padding: "6px 10px",
    fontSize: "0.9em",
    cursor: "pointer",
    display: window.innerWidth < 768 ? "block" : "none",
    zIndex: 10,
    minWidth: "28px",
    minHeight: "28px",
    userSelect: "none",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent"
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
    
    // Detect if we're in an iframe
    const isInIframe = window !== window.parent;
    
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
            onClick={async () => {
              console.log('Share button clicked, isInIframe:', isInIframe);
              console.log('ShareText:', shareText);
              
              try {
                if (navigator.share && !isInIframe) {
                  // Only use native share if not in iframe
                  console.log('Attempting navigator.share...');
                  await navigator.share({ title: "SKUNK'D Results", text: shareText });
                  console.log('Navigator.share completed successfully');
                } else {
                  // Fallback for iframe context or browsers without Web Share API
                  console.log('Using clipboard fallback method...');
                  
                  // Try modern clipboard API first
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                      await navigator.clipboard.writeText(shareText);
                      alert('Results copied to clipboard!');
                      console.log('Clipboard API success');
                      return;
                    } catch (clipboardErr) {
                      console.log('Clipboard API failed, trying execCommand fallback:', clipboardErr);
                    }
                  }
                  
                  // Fallback to execCommand
                  const textArea = document.createElement('textarea');
                  textArea.value = shareText;
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-999999px';
                  textArea.style.top = '-999999px';
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  
                  try {
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (successful) {
                      alert('Results copied to clipboard!');
                      console.log('execCommand copy successful');
                    } else {
                      throw new Error('execCommand returned false');
                    }
                  } catch (execErr) {
                    document.body.removeChild(textArea);
                    console.log('execCommand failed:', execErr);
                    console.log('Text to copy:', shareText);
                    alert('Copy failed. The text has been logged to the console - please copy it manually from there.');
                  }
                }
              } catch (err) {
                console.error('Share/copy operation failed:', err);
                console.log('Text to copy:', shareText);
                alert('Share failed. The text has been logged to the console - please copy it manually from there.');
              }
            }}
          >
            {navigator.share && !isInIframe ? "Share" : "Copy"}
          </button>
          <button
            style={{
              background: "#222", color: "#ffd700", borderRadius: 8,
              padding: "10px 18px", border: "none", fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={async () => {
              console.log('Copy button clicked');
              console.log('Text to copy:', shareText);
              
              try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  try {
                    await navigator.clipboard.writeText(shareText);
                    alert('Results copied to clipboard!');
                    console.log('Clipboard API copy successful');
                    return;
                  } catch (clipboardErr) {
                    console.log('Clipboard API failed, trying execCommand fallback:', clipboardErr);
                  }
                }
                
                // Fallback to execCommand
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                  const successful = document.execCommand('copy');
                  document.body.removeChild(textArea);
                  
                  if (successful) {
                    alert('Results copied to clipboard!');
                    console.log('execCommand copy successful');
                  } else {
                    throw new Error('execCommand returned false');
                  }
                } catch (execErr) {
                  document.body.removeChild(textArea);
                  console.log('execCommand failed:', execErr);
                  throw execErr;
                }
              } catch (err) {
                console.error('Copy operation failed:', err);
                console.log('Text to copy:', shareText);
                alert('Copy failed. The text has been logged to the console - please copy it manually from there.');
              }
            }}
          >
            Copy
          </button>
          {isInIframe && (
            <button
              style={{
                background: "#2196F3", color: "#fff", borderRadius: 8,
                padding: "10px 18px", border: "none", fontWeight: "bold",
                cursor: "pointer", marginLeft: 10
              }}
              onClick={() => {
                console.log('Open Full App button clicked, isInIframe:', isInIframe);
                
                // Always open in new window (most reliable approach)
                if (confirm('Open the app in a new window for the best fullscreen experience?')) {
                  const newWindow = window.open(
                    window.location.href, 
                    'skunkd_fullscreen',
                    'width=1200,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
                  );
                  
                  if (newWindow) {
                    newWindow.focus();
                    console.log('New window opened successfully');
                  } else {
                    alert('Popup blocked. Please allow popups for this site and try again.');
                  }
                } else {
                  console.log('User cancelled new window open');
                }
              }}
            >
              � Open Full App
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Left Column - Game Controls */}
      <div style={leftColumnStyle}>
        {/* Cheat Sheet Toggle Button */}
        <button
          style={{
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
            marginBottom: "16px",
            backgroundImage: `url(${skunkdIcon})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '12px center',
            backgroundSize: '32px'
          }}
          onClick={() => setCheatOpen(true)}
          title="Open STINK SHEET cheat sheet"
        >
          Cheat Sheet
        </button>

        <h2 style={{ textShadow: "0 2px 6px #000b", marginBottom: "16px" }}>
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
            Den Points: {denPoints}
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

        {/* Show running summary of turn actions */}
        {turnActions.length > 0 && (
          <div style={{
            background: "#1e1e1e",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "2px solid #ffd700",
            animation: "fadeIn 0.5s ease"
          }}>
            <strong style={{ color: "#ffd700" }}>Turn Summary:</strong>
            <div style={{ marginTop: "8px" }}>
              {turnActions.map((action, idx) => (
                <div key={idx} style={{
                  padding: "4px 8px",
                  margin: "2px 0",
                  background: "#333",
                  borderRadius: "4px",
                  fontSize: "0.9em"
                }}>
                  Added {action.points} points at {new Date(action.timestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {typeof winnerIdx !== 'number' ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px", // Reduced gap
            flexWrap: "wrap",
            marginBottom: "12px" // Reduced margin
          }}>
            <input
              type="number"
              min="1"
              max="3000"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Add Points"
              style={{
                padding: "6px 12px", // Reduced padding
                borderRadius: "6px",
                fontSize: "1.0em", // Reduced font size
                border: "2px solid #aaa",
                background: "#1b1b1b",
                color: "#ffd700",
                fontWeight: "bold",
                width: "100px" // Reduced width
              }}
              disabled={eliminated}
            />
            <button
              onClick={addPoints}
              style={{
                background: "#ffd700",
                color: "#222",
                fontWeight: "bold",
                borderRadius: "6px",
                boxShadow: "0 2px 6px #0003",
                fontSize: "1.0em",
                padding: "8px 12px", // Reduced padding
                border: "none",
                cursor: "pointer"
              }}
              disabled={eliminated}
            >
              Add to Den
            </button>
            <button
              onClick={undoBankedAction}
              disabled={turnActions.length === 0 || eliminated}
              style={{
                background: turnActions.length === 0 ? "#444" : "#ff6b35",
                color: turnActions.length === 0 ? "#888" : "#fff",
                fontWeight: "bold",
                borderRadius: "6px",
                boxShadow: "0 2px 6px #0003",
                fontSize: "1.0em",
                padding: "8px 12px", // Reduced padding
                border: "none",
                cursor: turnActions.length === 0 || eliminated ? "not-allowed" : "pointer",
                transition: "all 0.3s ease"
              }}
              title="Undo last points added to sequence"
            >
              🔄 Undo Add
            </button>
            <button
              onClick={bankPoints}
              disabled={eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && denPoints < 1000)}
              style={{
                background: (eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && denPoints < 1000)) ? "#444" : "#8bc34a",
                color: (eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && denPoints < 1000)) ? "#888" : "#fff",
                fontWeight: "bold",
                borderRadius: "6px",
                boxShadow: "0 2px 6px #2223",
                fontSize: "1.0em",
                padding: "8px 14px", // Reduced padding
                border: "none",
                cursor: (eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && denPoints < 1000)) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease"
              }}
              title={
                denPoints === 0 ? "No points to bank" :
                (manualInput && manualInput.trim() !== '') ? "Add points to den first" :
                (isSoloMode && denPoints < 1000) ? "In solo mode, need 1,000+ points to bank" :
                "Bank your sequence points"
              }
            >
              ✒️ Put it on the Board
            </button>
            <button
              onClick={skunkdTurn}
              style={{
                background: "#222",
                color: "#ffd700",
                fontWeight: "bold",
                borderRadius: "6px",
                boxShadow: "0 2px 6px #2226",
                fontSize: "1.0em",
                padding: "8px 14px", // Reduced padding
                border: "none",
                cursor: "pointer"
              }}
              disabled={eliminated}
              title="Mark turn as SKUNK'D (no points banked)"
            >
              😶‍🌫️ SKUNK'D
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
            textShadow: "0 1px 6px #000b",
            animation: "fadeIn 0.5s ease"
          }}>
            {message}
          </div>
        )}

        {/* Share results section */}
        {renderShareSection()}

        {/* Compact footer logo */}
        <div style={{
          textAlign: "center",
          marginTop: "20px",
          opacity: 0.4
        }}>
          <img src={hoj} alt="Hooked on Johnson Logo" style={{ width: "120px", maxWidth: "60vw" }} />
          <div style={{ fontFamily: "Caveat, cursive", fontSize: "0.9em", color: "#fffbe5", marginTop: "4px" }}>
            Powered by <span style={{ color: "#ffd700", fontWeight: "bold" }}>SKUNK'D</span>
          </div>
        </div>
      </div>

      {/* Right Column - Notes Area */}
      <div style={rightColumnStyle}>
                 <div 
           style={notesAreaStyle}
           onClick={(e) => e.stopPropagation()}
           onTouchStart={(e) => e.stopPropagation()}
         >
          <button
            style={notesToggleStyle}
            onClick={(e) => {
              e.stopPropagation();
              setIsNotesCollapsed(!isNotesCollapsed);
            }}
          >
            {isNotesCollapsed ? "+" : "-"}
          </button>
          <strong>Add Note:</strong>
          {!isNotesCollapsed && (
            <>
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
                 onClick={e => e.stopPropagation()}
                 onTouchStart={e => e.stopPropagation()}
                 onTouchEnd={e => e.stopPropagation()}
                 onTouchMove={e => e.stopPropagation()}
                 style={{
                   width: "100%",
                   minHeight: "80px",
                   border: "none",
                   background: "transparent",
                   resize: "vertical",
                   color: "#333",
                   fontFamily: "inherit",
                   fontSize: "1em",
                   marginTop: "6px",
                   touchAction: "manipulation"
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
                <div style={{ marginTop: "12px", maxHeight: "200px", overflow: "auto" }}>
                  <strong style={{ fontSize: "1em" }}>Game Notes:</strong>
                  {notes.map((note, idx) => (
                    <div key={idx} style={{
                      fontSize: "0.9em",
                      margin: "4px 0",
                      padding: "6px 8px",
                      background: "#f9f9f9",
                      borderRadius: "6px",
                      border: "1px solid #ddd"
                    }}>
                      <div style={{ fontWeight: "bold", color: "#666", fontSize: "0.8em" }}>
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{note.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
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
    </div>
  );
}