import React, { useState } from 'react';

export default function GameHistoryModal({ history, open, onClose, onDeleteGame }) {
  const [expandedGames, setExpandedGames] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'multiplayer', 'solo'
  const [deletingGameIdx, setDeletingGameIdx] = useState(null);

  const toggleGameExpansion = (gameIdx) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameIdx)) {
      newExpanded.delete(gameIdx);
    } else {
      newExpanded.add(gameIdx);
    }
    setExpandedGames(newExpanded);
  };

  // Filter games based on active tab
  const filteredGames = history.filter(game => {
    if (activeTab === 'all') return true;
    if (activeTab === 'multiplayer') return game.players.length > 1;
    if (activeTab === 'solo') return game.players.length === 1;
    return true;
  });

  // Count games by type
  const multiplayerCount = history.filter(game => game.players.length > 1).length;
  const soloCount = history.filter(game => game.players.length === 1).length;
  
  // Calculate highest solo score
  const soloGames = history.filter(game => game.players.length === 1);
  const highestSoloScore = soloGames.length > 0 ? Math.max(...soloGames.map(game => game.scores[0])) : 0;

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 13, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 12000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        padding: '24px 20px', maxWidth: 680, width: '100%',
        maxHeight: '85vh', overflowY: 'auto', position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: "var(--gold-primary)", margin: 0, fontSize: '1.4rem' }}>🏆 Past Games</h2>
          <button
            onClick={onClose}
            className="btn btn-outline-gold"
            style={{
              padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          marginBottom: 16, 
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '10px',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              background: activeTab === 'all' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'all' ? '#0f172a' : 'var(--text-secondary)',
              border: 'none',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('multiplayer')}
            style={{
              flex: 1,
              background: activeTab === 'multiplayer' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'multiplayer' ? '#0f172a' : 'var(--text-secondary)',
              border: 'none',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            Multi ({multiplayerCount})
          </button>
          <button
            onClick={() => setActiveTab('solo')}
            style={{
              flex: 1,
              background: activeTab === 'solo' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'solo' ? '#0f172a' : 'var(--text-secondary)',
              border: 'none',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            Solo ({soloCount})
          </button>
        </div>

        {filteredGames.length === 0 ? (
          <div style={{ color: "#fff", marginTop: 24 }}>
            {activeTab === 'all' ? 'No games have been saved yet.' :
             activeTab === 'multiplayer' ? 'No multiplayer games found.' :
             'No solo games found.'}
          </div>
        ) : (
          <div>
            {filteredGames.map((game, filteredIdx) => {
              // Find the original index in the history array
              const originalIdx = history.findIndex(g => g.date === game.date && g.players.length === game.players.length);
              const isExpanded = expandedGames.has(originalIdx);
              const hasDetailedData = game.detailedTurns && game.detailedTurns.length > 0;
              const isSoloGame = game.players.length === 1;
              
              return (
                <div key={filteredIdx} className="glass-card" style={{
                  padding: '14px 16px', marginBottom: 14,
                  borderColor: 'var(--border-gold-glow)'
                }}>
                  {/* Game Summary (Always Visible) */}
                  <div style={{ cursor: hasDetailedData ? 'pointer' : 'default' }} 
                       onClick={() => hasDetailedData && toggleGameExpansion(originalIdx)}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 8 
                    }}>
                      <div style={{ color: "#ccc", fontSize: "0.97em" }}>
                        <b>Date:</b> {new Date(game.date).toLocaleString()}
                        {isSoloGame && (
                          <span style={{ 
                            marginLeft: '10px', 
                            background: '#ffd700', 
                            color: '#222', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.8em',
                            fontWeight: 'bold'
                          }}>
                            🦨 SOLO
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {hasDetailedData && (
                          <button style={{
                            background: 'transparent',
                            border: '1px solid #ffd700',
                            color: '#ffd700',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8em'
                          }}>
                            {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingGameIdx(originalIdx);
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8em',
                            fontWeight: '700'
                          }}
                          title="Delete this game"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 8 }}>
                      <b>Players & Final Scores:</b>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {game.players.map((p, i) => (
                          <li key={i} style={{
                            color: game.winnerIdx === i ? "#ffd700" : "#fff",
                            fontWeight: game.winnerIdx === i ? "bold" : "normal"
                          }}>
                            {p}: {game.scores[i]}
                            {game.winnerIdx === i && ' 👑 Winner!'}
                            {isSoloGame && game.skunkLives !== undefined && (
                              <span style={{ color: '#ff6b6b', marginLeft: '8px' }}>
                                (Lives: {game.skunkLives}/6)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                                         {game.goalScore && !isSoloGame && (
                       <div style={{ marginBottom: 8, color: "#ccc" }}>
                         <b>Goal Score:</b> {game.goalScore}
                       </div>
                     )}

                                         {/* Solo game specific info */}
                     {isSoloGame && game.skunkLetters && game.skunkLetters.length > 0 && (
                       <div style={{ marginBottom: 8, color: "#ccc" }}>
                         <b>SKUNK Letters Earned:</b> {game.skunkLetters.join('')}
                       </div>
                     )}
                     
                     {/* Highest solo score marker */}
                     {isSoloGame && game.scores[0] === highestSoloScore && highestSoloScore > 0 && (
                       <div style={{ 
                         marginBottom: 8, 
                         color: "#ffd700", 
                         fontWeight: "bold",
                         fontSize: "1.1em",
                         textAlign: "center",
                         background: "linear-gradient(45deg, #ffd700, #ffed4e)",
                         color: "#222",
                         padding: "8px",
                         borderRadius: "8px",
                         border: "2px solid #ffd700"
                       }}>
                         🏆 HIGHEST SOLO SCORE! 🏆
                       </div>
                     )}
                  </div>

                  {/* Detailed View (Expandable) */}
                  {isExpanded && hasDetailedData && (
                    <div style={{ 
                      marginTop: 16, 
                      padding: 16, 
                      background: "rgba(15, 23, 42, 0.7)", 
                      borderRadius: 12,
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
                    }}>
                      {/* Turn-by-turn breakdown */}
                      <h4 style={{ color: "var(--gold-primary)", marginBottom: 12, marginTop: 0, fontSize: "1rem" }}>Turn-by-Turn Breakdown:</h4>
                      <div style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(30, 41, 59, 0.95)', position: 'sticky', top: 0 }}>
                              <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>Turn</th>
                              <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>Player</th>
                              <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>Points</th>
                              <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {game.detailedTurns.map((turn, turnIdx) => {
                              const isOvertimeStart = turnIdx > 0 && 
                                !game.detailedTurns[turnIdx - 1].inOvertime && 
                                turn.inOvertime;
                              
                              return (
                                <React.Fragment key={turnIdx}>
                                  {isOvertimeStart && (
                                    <tr>
                                      <td colSpan="4" style={{
                                        padding: '8px',
                                        background: 'rgba(245, 158, 11, 0.3)',
                                        color: 'var(--gold-primary)',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                      }}>
                                        🚨 OVERTIME BEGINS 🚨
                                      </td>
                                    </tr>
                                  )}
                                  <tr style={{
                                    background: turn.wasSkunkd ? 'rgba(239, 68, 68, 0.12)' : 
                                               turn.inOvertime ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                                    color: turn.wasSkunkd ? '#ef4444' : 
                                           turn.inOvertime ? '#f59e0b' : 'var(--text-primary)'
                                  }}>
                                    <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', fontSize: '0.85rem' }}>
                                      {turn.turnNumber}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: '600', fontSize: '0.85rem' }}>
                                      {turn.playerName}
                                    </td>
                                    <td style={{ 
                                      padding: '8px', 
                                      border: '1px solid rgba(255, 255, 255, 0.08)', 
                                      textAlign: 'center',
                                      fontWeight: '700',
                                      fontSize: '0.9rem',
                                      color: turn.pointsBanked > 0 ? 'var(--gold-primary)' : 'inherit'
                                    }}>
                                      {turn.pointsBanked.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', fontSize: '0.82rem', fontWeight: '600' }}>
                                      {turn.wasSkunkd && '🦨 SKUNK\'D'}
                                      {turn.inOvertime && !turn.wasSkunkd && '⏰ Overtime'}
                                      {!turn.wasSkunkd && !turn.inOvertime && '✅ On Board'}
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Game Statistics */}
                      {game.gameStats && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ color: "#ffd700", marginBottom: 8 }}>Game Statistics:</h4>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                            gap: '8px',
                            fontSize: '0.9em'
                          }}>
                            <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                              <strong>Total Turns:</strong> {game.gameStats.totalTurns}
                            </div>
                            {!isSoloGame && (
                              <>
                                <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                                  <strong>Overtime Turns:</strong> {game.gameStats.overtimeTurns}
                                </div>
                                <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                                  <strong>SKUNK'D Turns:</strong> {game.gameStats.skunkdTurns}
                                </div>
                              </>
                            )}
                            {isSoloGame && game.skunkLives !== undefined && (
                              <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                                <strong>Lives Remaining:</strong> {game.skunkLives}/6
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Active Rules */}
                      {game.electiveRules && Object.values(game.electiveRules).some(Boolean) && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ color: "#ffd700", marginBottom: 8 }}>Active Elective Rules:</h4>
                          <div style={{ fontSize: '0.9em', color: '#ccc' }}>
                            {Object.entries(game.electiveRules)
                              .filter(([key, value]) => value)
                              .map(([key]) => key)
                              .join(', ') || 'None'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Section */}
                  <div style={{ marginTop: 12 }}>
                    <b>Notes:</b>
                    <div style={{
                      background: "#fffbe5", color: "#333", fontFamily: "Caveat, cursive",
                      borderRadius: 8, padding: "8px 13px", marginTop: 4, minHeight: 32
                    }}>
                      {Array.isArray(game.notes) && game.notes.length > 0 ? (
                        game.notes.map((note, noteIdx) => (
                          <div key={noteIdx} style={{ margin: "4px 0" }}>
                            <span style={{ fontWeight: "bold", fontSize: "0.9em", color: "#666" }}>
                              {new Date(note.timestamp).toLocaleTimeString()}:
                            </span>
                            <span style={{ marginLeft: "6px" }}>{note.text}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: "#aaa" }}>None</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      style={{
                        background: "#ffd700", color: "#222", borderRadius: 8,
                        padding: "7px 14px", border: "none", fontWeight: "bold", cursor: "pointer"
                      }}
                      onClick={() => {
                        try {
                          const notesText = Array.isArray(game.notes) && game.notes.length > 0
                            ? game.notes.map(note => `  ${new Date(note.timestamp).toLocaleTimeString()}: ${note.text}`).join('\n')
                            : "None";
                          
                          let shareText;
                          if (isSoloGame) {
                            shareText = [
                              `SOLO SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                              `Player: ${game.players[0]}`,
                              `Final Score: ${game.scores[0]}`,
                              `Lives Remaining: ${game.skunkLives || 0}/6`,
                              game.skunkLetters && game.skunkLetters.length > 0 ? `SKUNK Letters: ${game.skunkLetters.join('')}` : 'No SKUNK letters earned',
                              `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                              `Notes:\n${notesText}`
                            ].join('\n');
                          } else {
                            shareText = [
                              `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                              `Goal Score: ${game.goalScore || 'Unknown'}`,
                              ...game.players.map((p, i) =>
                                `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                              `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                              `Notes:\n${notesText}`
                            ].join('\n');
                          }
                          
                          console.log('Share button clicked, shareText:', shareText);
                          
                          if (navigator.share) {
                            console.log('Using navigator.share');
                            navigator.share({ title: "SKUNK'D Results", text: shareText }).catch(err => {
                              console.error('Navigator.share failed:', err);
                              alert('Share failed, but text is in console');
                            });
                          } else {
                            console.log('Using clipboard API');
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(shareText).then(() => {
                                alert('Results copied to clipboard!');
                              }).catch(err => {
                                console.error('Clipboard write failed:', err);
                                alert('Clipboard access failed. Try using the Copy button or check console for text.');
                              });
                            } else {
                              console.error('Clipboard API not available');
                              alert('Clipboard not available. Text is logged to console.');
                            }
                          }
                        } catch (error) {
                          console.error('Share button error:', error);
                          alert('Share failed - check console for details');
                        }
                      }}
                    >Share</button>
                    <button
                      style={{
                        marginLeft: 12, background: "#222", color: "#ffd700", borderRadius: 8,
                        padding: "7px 14px", border: "none", fontWeight: "bold", cursor: "pointer"
                      }}
                      onClick={() => {
                        try {
                          const notesText = Array.isArray(game.notes) && game.notes.length > 0
                            ? game.notes.map(note => `  ${new Date(note.timestamp).toLocaleTimeString()}: ${note.text}`).join('\n')
                            : "None";
                          
                          let shareText;
                          if (isSoloGame) {
                            shareText = [
                              `SOLO SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                              `Player: ${game.players[0]}`,
                              `Final Score: ${game.scores[0]}`,
                              `Lives Remaining: ${game.skunkLives || 0}/6`,
                              game.skunkLetters && game.skunkLetters.length > 0 ? `SKUNK Letters: ${game.skunkLetters.join('')}` : 'No SKUNK letters earned',
                              `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                              `Notes:\n${notesText}`
                            ].join('\n');
                          } else {
                            shareText = [
                              `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                              `Goal Score: ${game.goalScore || 'Unknown'}`,
                              ...game.players.map((p, i) =>
                                `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                              `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                              `Notes:\n${notesText}`
                            ].join('\n');
                          }
                          
                          console.log('Copy button clicked, shareText:', shareText);
                          
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(shareText).then(() => {
                              alert('Results copied to clipboard!');
                            }).catch(err => {
                              console.error('Clipboard write failed:', err);
                              // Fallback: try using execCommand
                              try {
                                const textArea = document.createElement('textarea');
                                textArea.value = shareText;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand('copy');
                                document.body.removeChild(textArea);
                                alert('Results copied to clipboard (fallback method)!');
                              } catch (fallbackErr) {
                                console.error('Fallback copy failed:', fallbackErr);
                                alert('Copy failed. Text is in console log.');
                              }
                            });
                          } else {
                            console.error('Clipboard API not available, trying fallback');
                            // Fallback method
                            try {
                              const textArea = document.createElement('textarea');
                              textArea.value = shareText;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              alert('Results copied to clipboard!');
                            } catch (fallbackErr) {
                              console.error('Fallback copy failed:', fallbackErr);
                              alert('Copy failed. Text is logged to console.');
                            }
                          }
                        } catch (error) {
                          console.error('Copy button error:', error);
                          alert('Copy failed - check console for details');
                        }
                      }}
                    >Copy</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingGameIdx !== null && (
          <div className="confirm-dialog-overlay" onClick={() => setDeletingGameIdx(null)}>
            <div className="confirm-dialog fade-in" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🗑️</div>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--gold-primary)' }}>Delete Game?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
                Are you sure you want to delete this game record from history? This action cannot be undone.
              </p>
              <div className="confirm-dialog-buttons">
                <button 
                  className="confirm-yes"
                  onClick={() => {
                    onDeleteGame(deletingGameIdx);
                    setDeletingGameIdx(null);
                  }}
                >
                  Yes, Delete
                </button>
                <button 
                  className="confirm-no"
                  onClick={() => setDeletingGameIdx(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }