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
  onSuperSkunkTurn,
  onEndTurn,
  winnerIdx,
  scores,
  players,
  onSaveGame,
  notesHistory,
  onNotesChange,
  isSoloMode = false,
  setDenPointsForScoreboard,
  activeRules = [],
  activePowerUps = [],
  currentPowerUpUsage = {},
  onTogglePowerUp,
  onOpenShop
}) {
  // State
  const [denPoints, setDenPoints] = useState(0);

  // Stinky Super SKUNK'D rule logic
  const isSuperSkunkActive = activeRules && activeRules.some(r => r.key === 'stinkySuperSkunkd');

  // Slow Boat rule logic & popup calculator state
  const isSlowBoatActive = activeRules && activeRules.some(r => r.key === 'slowBoat');
  const [showSlowBoatModal, setShowSlowBoatModal] = useState(false);
  const [skunkDiceCount, setSkunkDiceCount] = useState(2); // 0 to 6
  const fiveDiceCount = 6 - skunkDiceCount;
  const slowBoatDiceRaw = (skunkDiceCount * 100) + (fiveDiceCount * 50);
  const slowBoatTotalPoints = slowBoatDiceRaw * 5;

  // Pungent rule multiplier calculations:
  // 2,000+ is worth double (2x), 5,000+ is worth triple (3x)
  const isPungentActive = activeRules && activeRules.some(r => r.key === 'pungent');
  let pungentMultiplier = 1;
  let pungentTierName = '';
  if (isPungentActive) {
    if (denPoints >= 5000) {
      pungentMultiplier = 3;
      pungentTierName = 'Odorific';
    } else if (denPoints >= 2000) {
      pungentMultiplier = 2;
      pungentTierName = 'Scent-sational';
    }
  }
  const effectivePoints = isPungentActive ? denPoints * pungentMultiplier : denPoints;

  // Report effective denPoints to parent for scoreboard display
  useEffect(() => {
    if (typeof setDenPointsForScoreboard === 'function') {
      setDenPointsForScoreboard(effectivePoints);
    }
  }, [effectivePoints, setDenPointsForScoreboard]);
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

  // Auto-clear message banner after 3.5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handlers
  function addPoints() {
    const pts = parseInt(manualInput, 10);
    if (!isNaN(pts) && pts > 0) {
      // Track the action for turn-level undo
      setTurnActions(prev => [...prev, { type: 'addPoints', points: pts, timestamp: Date.now() }]);
      setDenPoints(prev => prev + pts);
      setManualInput('');
      setMessage(`+${pts.toLocaleString()} points added to Den!`);
    }
  }

  function undoBankedAction() {
    if (turnActions.length === 0) {
      setMessage("Nothing to undo.");
      return;
    }
    const lastAction = turnActions[turnActions.length - 1];
    if (lastAction.type === 'addPoints') {
      setDenPoints(prev => {
        const newVal = prev - lastAction.points;
        if (newVal < 0) {
          setMessage("Can't undo below zero points!");
          return 0;
        }
        setMessage(`↩ Undid +${lastAction.points.toLocaleString()} points!`);
        return newVal;
      });
      setTurnActions(prev => prev.slice(0, -1));
    } else {
      setMessage("Nothing to undo.");
    }
  }

  function bankPoints() {
    const ptsBanked = effectivePoints;
    if (onScoreBoard) onScoreBoard(ptsBanked);
    if (isPungentActive && pungentMultiplier === 3) {
      setMessage(`🦨💨 ODORIFIC 3x! +${ptsBanked.toLocaleString()} Points on the Board for ${playerName || 'Player'}! 🔥`);
    } else if (isPungentActive && pungentMultiplier === 2) {
      setMessage(`🦨 SCENT-SATIONAL 2x! +${ptsBanked.toLocaleString()} Points on the Board for ${playerName || 'Player'}! ✨`);
    } else {
      setMessage(`+${ptsBanked.toLocaleString()} Points on the Board for ${playerName || 'Player'}! 🎉`);
    }
    setDenPoints(0);
    setTurnActions([]); // Clear turn actions when turn ends
    if (onEndTurn) onEndTurn();
  }

  function skunkdTurn() {
    if (onSkunkTurn) onSkunkTurn();
    setDenPoints(0);
    setTurnActions([]); // Clear turn actions when turn ends
    setMessage(`🦨 SKUNK'D! ${playerName || 'Player'} scored 0 points on the board.`);
  }

  function superSkunkTurn() {
    if (window.confirm(`⚠️ Super SKUNK'D Confirmation\n\nAre you sure ${playerName || 'Player'} rolled Super SKUNK'D (6 unscoring dice)?\n\nThis will reset their score on the board to ZERO (0)!`)) {
      if (onSuperSkunkTurn) {
        onSuperSkunkTurn();
      } else if (onSkunkTurn) {
        onSkunkTurn();
      }
      setDenPoints(0);
      setTurnActions([]);
      setMessage(`💀 SUPER SKUNK'D! ${playerName || 'Player'}'s score on the board was reset to 0!`);
    }
  }

  function applySlowBoatPoints() {
    quickAddPoints(slowBoatTotalPoints);
    setMessage(`🚤 Slow Boat added +${slowBoatTotalPoints.toLocaleString()} pts to Den! (${skunkDiceCount} Skunks, ${fiveDiceCount} 5s × 5)`);
    setShowSlowBoatModal(false);
  }

  function handleUsePowerUp(pu) {
    if (onTogglePowerUp) {
      const isCurrentlyUsed = !!(currentPowerUpUsage && currentPowerUpUsage[pu.key]);
      onTogglePowerUp(pu.key);
      if (isCurrentlyUsed) {
        setMessage(`↩ Restored ${pu.badgeLabel || pu.label} Spray for ${playerName || 'Player'}!`);
      } else {
        setMessage(`🦨 ${playerName || 'Player'} used ${pu.badgeLabel || pu.label} Spray!`);
      }
    }
  }

  // Responsive layout styles
  const containerStyle = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    padding: '16px 14px',
    width: '100%',
    margin: '0 auto 16px auto',
    position: 'relative',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box'
  };

  const leftColumnStyle = {
    width: '100%'
  };

  const rightColumnStyle = {
    width: '100%',
    position: 'relative'
  };

  const notesAreaStyle = {
    background: 'rgba(15, 23, 42, 0.85)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    padding: '12px 14px',
    width: '100%',
    minHeight: isNotesCollapsed ? '46px' : '200px',
    fontSize: '0.95rem',
    position: 'relative',
    transition: 'min-height 0.3s ease',
    boxSizing: 'border-box'
  };

  const notesToggleStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(255, 215, 0, 0.2)',
    color: 'var(--gold-primary)',
    border: '1px solid var(--border-gold-glow)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'block',
    zIndex: 10,
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  // Cheat sheet modal style
  const modalBgStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(10, 13, 20, 0.9)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 10000,
    display: cheatOpen ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  };

  const cheatImgStyle = {
    maxWidth: '92vw',
    maxHeight: '75vh',
    objectFit: 'contain',
    boxShadow: '0 8px 36px rgba(0,0,0,0.8)',
    borderRadius: '16px',
    border: '2px solid var(--gold-primary)'
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '24px',
    right: '24px',
    padding: '8px 18px',
    background: 'var(--gold-gradient)',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
    cursor: 'pointer',
    zIndex: 10010
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

  function quickAddPoints(pts) {
    if (eliminated) return;
    setTurnActions(prev => [...prev, { type: 'addPoints', points: pts, timestamp: Date.now() }]);
    setDenPoints(prev => prev + pts);
    setMessage(`+${pts.toLocaleString()} points added to Den!`);
  }

  return (
    <div style={containerStyle}>
      {/* Left Column - Game Controls */}
      <div style={leftColumnStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          {/* Cheat Sheet Toggle Button */}
          <button
            type="button"
            className="btn btn-outline-gold"
            style={{
              padding: '6px 14px 6px 38px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundImage: `url(${skunkdIcon})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '10px center',
              backgroundSize: '20px'
            }}
            onClick={() => setCheatOpen(true)}
            title="Open STINK SHEET cheat sheet"
          >
            Cheat Sheet
          </button>

          {overtime && (
            <span className="status-badge badge-gold">
              ⚡ Overtime
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
            {playerName ? playerName : "Turn Manager"}
          </h2>
          {eliminated && (
            <span className="status-badge badge-red">
              Eliminated
            </span>
          )}
        </div>

        {/* Big Den Points Counter Card */}
        <div className="den-counter" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
            Points in Den
          </div>
          <div className="den-points-number">
            {denPoints.toLocaleString()}
          </div>

          {/* Pungent Multiplier Indicator */}
          {isPungentActive && (
            <div style={{ marginTop: 6, marginBottom: 4 }}>
              {pungentMultiplier > 1 ? (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 14px',
                    borderRadius: '20px',
                    background: pungentMultiplier === 3
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.35) 100%)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(245, 158, 11, 0.35) 100%)',
                    border: pungentMultiplier === 3
                      ? '1.5px solid #f59e0b'
                      : '1.5px solid #10b981',
                    boxShadow: pungentMultiplier === 3
                      ? '0 0 14px rgba(245, 158, 11, 0.5)'
                      : '0 0 12px rgba(16, 185, 129, 0.4)',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '0.85rem'
                  }}>
                    <span>{pungentMultiplier === 3 ? '🦨💨🔥' : '🦨✨'}</span>
                    <span>{pungentMultiplier}x Multiplier ({pungentTierName}!)</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '700' }}>
                    Board Value: <strong style={{ color: 'var(--gold-primary)', fontSize: '1.08rem' }}>{effectivePoints.toLocaleString()}</strong> pts
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 5 }}>({denPoints.toLocaleString()} × {pungentMultiplier})</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontWeight: '700', color: 'var(--gold-primary)' }}>🦨 Pungent:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>2,000+ for <strong>2x</strong></span>
                  <span>•</span>
                  <span style={{ color: 'var(--text-secondary)' }}>5,000+ for <strong>3x</strong></span>
                </div>
              )}
            </div>
          )}

          {!overtime && denPoints > 0 && typeof playerScore === 'number' && (
            <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--gold-primary)', fontWeight: '600' }}>
              Potential Total: <strong>{(playerScore + effectivePoints).toLocaleString()}</strong> pts
            </div>
          )}

          {overtime && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', fontSize: '0.85rem' }}>
              Score to Beat: <strong>{leaderScore?.toLocaleString()}</strong>
              {scoreNeeded !== null && (
                <span style={{ color: '#ef4444', marginLeft: 8, fontWeight: '700' }}>
                  (Need: {scoreNeeded.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Show running summary of turn actions */}
        {turnActions.length > 0 && (
          <div className="fade-in" style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '14px',
            border: '1px solid var(--border-gold-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                Turn Rolls ({turnActions.length})
              </span>
              <button
                type="button"
                onClick={undoBankedAction}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f59e0b',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ↩ Undo Last Roll
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {turnActions.map((action, idx) => (
                <span key={idx} style={{
                  padding: '3px 8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--gold-primary)',
                  fontWeight: '700'
                }}>
                  +{action.points}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {typeof winnerIdx !== 'number' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Active Consumable Sprays (e.g. Mulligan, 6-2-Even) */}
            {activePowerUps && activePowerUps.length > 0 && (
              <div style={{
                background: 'rgba(20, 26, 38, 0.7)',
                border: '1px solid var(--border-gold-glow)',
                borderRadius: '12px',
                padding: '10px 12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🦨 SPRAYS (1X PER GAME)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Tap to use / undo
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: activePowerUps.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: 8 }}>
                  {activePowerUps.map(pu => {
                    const isUsed = !!(currentPowerUpUsage && currentPowerUpUsage[pu.key]);
                    return (
                      <button
                        key={pu.key}
                        type="button"
                        onClick={() => handleUsePowerUp(pu)}
                        disabled={eliminated}
                        style={{
                          padding: '8px 8px',
                          borderRadius: '8px',
                          border: isUsed ? '1px dashed rgba(255,255,255,0.2)' : '1.5px solid var(--border-gold-glow)',
                          background: isUsed ? 'rgba(15, 23, 42, 0.6)' : 'linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(245, 158, 11, 0.08) 100%)',
                          color: isUsed ? 'var(--text-muted)' : 'var(--gold-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 4,
                          cursor: eliminated ? 'not-allowed' : 'pointer',
                          opacity: isUsed ? 0.6 : 1,
                          boxShadow: isUsed ? 'none' : '0 2px 8px rgba(255, 215, 0, 0.15)',
                          textAlign: 'left',
                          minWidth: 0
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{pu.powerUpIcon}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '700', fontSize: '0.8rem', textDecoration: isUsed ? 'line-through' : 'none', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {pu.badgeLabel || pu.label}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: isUsed ? 'var(--text-muted)' : '#10b981', whiteSpace: 'nowrap' }}>
                              {isUsed ? 'Used' : 'Available'}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '2px 5px',
                          borderRadius: '5px',
                          background: isUsed ? 'rgba(255,255,255,0.1)' : 'var(--gold-primary)',
                          color: isUsed ? 'var(--text-muted)' : '#0f172a',
                          flexShrink: 0
                        }}>
                          {isUsed ? 'USED' : 'USE'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slow Boat Quick Calculator Trigger (when Slow Boat rule active) */}
            {isSlowBoatActive && (
              <button
                type="button"
                onClick={() => setShowSlowBoatModal(true)}
                disabled={eliminated}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(56, 189, 248, 0.6)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(56, 189, 248, 0.08) 100%)',
                  color: '#7dd3fc',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: eliminated ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 10px rgba(14, 165, 233, 0.2)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  🚤 <span>Slow Boat Calculator (6 Dice × 5)</span>
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.25)', padding: '2px 8px', borderRadius: '6px', color: '#e0f2fe', fontWeight: '800' }}>
                  CALCULATE →
                </span>
              </button>
            )}

            {/* Quick Add Points Chips */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Quick Add Roll:
              </div>
              <div className="quick-roll-grid">
                {[50, 100, 250, 500, 1000, 1500].map(pts => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => quickAddPoints(pts)}
                    disabled={eliminated}
                    style={{
                      padding: '10px 4px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'var(--gold-primary)',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: eliminated ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                max="10000"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Custom pts"
                className="modern-input"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.95rem' }}
                disabled={eliminated}
              />
              <button
                type="button"
                className="btn btn-outline-gold"
                onClick={addPoints}
                disabled={eliminated || !manualInput}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.9rem',
                  cursor: eliminated || !manualInput ? 'not-allowed' : 'pointer',
                  opacity: !manualInput ? 0.5 : 1
                }}
              >
                + Add
              </button>
            </div>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-success"
                onClick={bankPoints}
                disabled={eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && effectivePoints < 1000)}
                style={{
                  flex: 2,
                  padding: '14px 10px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: (eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && effectivePoints < 1000)) ? 'not-allowed' : 'pointer',
                  opacity: (eliminated || denPoints === 0 || (manualInput && manualInput.trim() !== '') || (isSoloMode && effectivePoints < 1000)) ? 0.4 : 1
                }}
                title={
                  denPoints === 0 ? "No points in Den" :
                  (manualInput && manualInput.trim() !== '') ? "Add points to Den first" :
                  (isSoloMode && effectivePoints < 1000) ? "In solo mode, need 1,000+ points to put on the board" :
                  `Put ${effectivePoints.toLocaleString()} points on the board`
                }
              >
                ✒️ Put it on the Board {isPungentActive && pungentMultiplier > 1 ? `(+${effectivePoints.toLocaleString()} pts)` : ''}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={skunkdTurn}
                disabled={eliminated}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: eliminated ? 'not-allowed' : 'pointer'
                }}
                title="Mark turn as SKUNK'D (no points on the board)"
              >
                🦨 SKUNK'D
              </button>
            </div>

            {/* Super SKUNK'D Button (when Stinky Super SKUNK'D rule active) */}
            {isSuperSkunkActive && (
              <button
                type="button"
                onClick={superSkunkTurn}
                disabled={eliminated}
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: '10px',
                  border: '1.5px solid rgba(239, 68, 68, 0.7)',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(136, 19, 55, 0.4) 100%)',
                  color: '#fca5a5',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
                  cursor: eliminated ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginTop: 2
                }}
                title="Super SKUNK'D: Rolled 6 dice with none scoring. Board score resets to 0!"
              >
                💀 Super SKUNK'D (Reset to 0)
              </button>
            )}
          </div>
        ) : null}

        {/* Message/feedback */}
        {message && (
          <div className="fade-in" style={{
            margin: "14px 0 0 0",
            padding: "10px 14px",
            background: "rgba(30, 41, 59, 0.9)",
            border: "1px solid var(--border-gold-glow)",
            color: "var(--gold-primary)",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}

        {/* Share results section */}
        {renderShareSection()}

        {/* Compact footer logo & shop link */}
        <div 
          onClick={onOpenShop}
          style={{
            textAlign: "center",
            marginTop: "20px",
            opacity: 0.8,
            cursor: onOpenShop ? "pointer" : "default",
            transition: "all 0.2s ease"
          }}
          title="Tap to open Games Shop & Community Hub"
        >
          <img src={hoj} alt="Hooked on Johnson Logo" style={{ width: "110px", maxWidth: "50vw" }} />
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Powered by <strong style={{ color: "var(--gold-primary)" }}>SKUNK'D</strong> • <span style={{ color: "var(--gold-primary)", textDecoration: "underline" }}>Shop & Community Hub ➔</span>
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
            {isNotesCollapsed ? "Show Notes" : "Hide"}
          </button>
          <strong style={{ color: 'var(--gold-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            📝 Game Notes
          </strong>
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
                  minHeight: "70px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  background: "rgba(10, 14, 22, 0.6)",
                  resize: "vertical",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  padding: "8px 10px",
                  marginTop: "8px",
                  boxSizing: "border-box",
                  touchAction: "manipulation"
                }}
              />
              <button
                onClick={addNote}
                disabled={!currentNote.trim()}
                className="btn btn-outline-gold"
                style={{
                  marginTop: "6px",
                  width: "100%",
                  padding: "6px",
                  fontSize: "0.85rem",
                  cursor: currentNote.trim() ? "pointer" : "not-allowed",
                  opacity: currentNote.trim() ? 1 : 0.4
                }}
              >
                + Add Note
              </button>
              {notes.length > 0 && (
                <div style={{ marginTop: "12px", maxHeight: "180px", overflow: "auto", display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {notes.map((note, idx) => (
                    <div key={idx} style={{
                      fontSize: "0.85rem",
                      padding: "6px 8px",
                      background: "rgba(30, 41, 59, 0.6)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.06)"
                    }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </div>
                      <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>{note.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slow Boat Calculator Modal */}
      {showSlowBoatModal && (
        <div
          onClick={() => setShowSlowBoatModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #131d2e 0%, #0d1522 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '16px',
              padding: '20px 18px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.2)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowSlowBoatModal(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'var(--text-muted)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.4rem' }}>🚤</span>
              <h3 style={{ margin: 0, color: '#7dd3fc', fontSize: '1.2rem', fontWeight: '800' }}>
                Slow Boat Calculator
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.3 }}>
              When you roll six Skunks and 5s one at a time, you get <strong>5x the value</strong> of the six dice!
            </p>

            {/* Interactive Steppers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {/* Skunks Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--gold-primary)' }}>
                    🦨 Skunk Dice (100 pts)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {skunkDiceCount} × 100 = <strong>{skunkDiceCount * 100} pts</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSkunkDiceCount(Math.max(0, skunkDiceCount - 1))}
                    disabled={skunkDiceCount <= 0}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(30, 41, 59, 0.9)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: skunkDiceCount <= 0 ? 'not-allowed' : 'pointer',
                      opacity: skunkDiceCount <= 0 ? 0.3 : 1
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', minWidth: 20, textAlign: 'center', color: '#fff' }}>
                    {skunkDiceCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSkunkDiceCount(Math.min(6, skunkDiceCount + 1))}
                    disabled={skunkDiceCount >= 6}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(30, 41, 59, 0.9)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: skunkDiceCount >= 6 ? 'not-allowed' : 'pointer',
                      opacity: skunkDiceCount >= 6 ? 0.3 : 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fives Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#38bdf8' }}>
                    🎲 5s Dice (50 pts)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {fiveDiceCount} × 50 = <strong>{fiveDiceCount * 50} pts</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSkunkDiceCount(Math.min(6, skunkDiceCount + 1))}
                    disabled={fiveDiceCount <= 0}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(30, 41, 59, 0.9)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: fiveDiceCount <= 0 ? 'not-allowed' : 'pointer',
                      opacity: fiveDiceCount <= 0 ? 0.3 : 1
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', minWidth: 20, textAlign: 'center', color: '#fff' }}>
                    {fiveDiceCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSkunkDiceCount(Math.max(0, skunkDiceCount - 1))}
                    disabled={fiveDiceCount >= 6}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(30, 41, 59, 0.9)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: fiveDiceCount >= 6 ? 'not-allowed' : 'pointer',
                      opacity: fiveDiceCount >= 6 ? 0.3 : 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Combination Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Presets (6 Dice Total):
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { skunks: 2, label: '2 Skunks / 4 Fives (2,000 pts)' },
                  { skunks: 3, label: '3 Skunks / 3 Fives (2,250 pts)' },
                  { skunks: 4, label: '4 Skunks / 2 Fives (2,500 pts)' },
                  { skunks: 1, label: '1 Skunk / 5 Fives (1,750 pts)' },
                  { skunks: 5, label: '5 Skunks / 1 Five (2,750 pts)' },
                  { skunks: 6, label: '6 Skunks (3,000 pts)' },
                  { skunks: 0, label: '6 Fives (1,500 pts)' }
                ].map(preset => {
                  const isSelected = skunkDiceCount === preset.skunks;
                  return (
                    <button
                      key={preset.skunks}
                      type="button"
                      onClick={() => setSkunkDiceCount(preset.skunks)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(20, 30, 48, 0.6)',
                        color: isSelected ? '#7dd3fc' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculation Result Box */}
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              textAlign: 'center',
              marginBottom: 16
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ({skunkDiceCount} × 100) + ({fiveDiceCount} × 50) = {slowBoatDiceRaw} pts × <strong>5</strong>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gold-primary)', marginTop: 2 }}>
                +{slowBoatTotalPoints.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>pts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={applySlowBoatPoints}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                }}
              >
                ➕ Add +{slowBoatTotalPoints.toLocaleString()} pts to Den
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSlowBoatModal(false)}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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