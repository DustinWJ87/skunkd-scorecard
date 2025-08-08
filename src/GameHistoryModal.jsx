import React, { useState } from 'react';

export default function GameHistoryModal({ history, open, onClose, onDeleteGame }) {
  const [expandedGames, setExpandedGames] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'multiplayer', 'solo'

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
      background: 'rgba(20,20,20,0.8)', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#222', borderRadius: 20, padding: 32, maxWidth: 700,
        maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 6px 32px #000b', position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#ffd700', color: '#222', fontWeight: 'bold',
            borderRadius: 9, border: 'none', fontSize: '1.05em',
            padding: '10px 20px', boxShadow: '0 2px 8px #0008', cursor: 'pointer', zIndex: 2
          }}
        >Close</button>
        <h2 style={{ color: "#ffd700" }}>Past Games</h2>
        
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          marginBottom: 20, 
          borderBottom: '2px solid #444',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#ffd700' : '#333',
              color: activeTab === 'all' ? '#222' : '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}
          >
            All Games ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('multiplayer')}
            style={{
              background: activeTab === 'multiplayer' ? '#ffd700' : '#333',
              color: activeTab === 'multiplayer' ? '#222' : '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}
          >
            Multiplayer ({multiplayerCount})
          </button>
          <button
            onClick={() => setActiveTab('solo')}
            style={{
              background: activeTab === 'solo' ? '#ffd700' : '#333',
              color: activeTab === 'solo' ? '#222' : '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}
          >
            Solo Games ({soloCount})
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
                <div key={filteredIdx} style={{
                  background: "#111", borderRadius: 13, padding: 18, marginBottom: 16,
                  border: "2px solid #ffd700"
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
                             if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
                               onDeleteGame(originalIdx);
                             }
                           }}
                          style={{
                            background: '#dc3545',
                            border: '1px solid #dc3545',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8em'
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
                      background: "#222", 
                      borderRadius: 8,
                      border: "1px solid #444"
                    }}>
                      {/* Turn-by-turn breakdown */}
                      <h4 style={{ color: "#ffd700", marginBottom: 12 }}>Turn-by-Turn Breakdown:</h4>
                      <div style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        border: '1px solid #444',
                        borderRadius: '4px'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#333', position: 'sticky', top: 0 }}>
                              <th style={{ padding: '8px', border: '1px solid #444', color: '#ffd700' }}>Turn</th>
                              <th style={{ padding: '8px', border: '1px solid #444', color: '#ffd700' }}>Player</th>
                              <th style={{ padding: '8px', border: '1px solid #444', color: '#ffd700' }}>Points</th>
                              <th style={{ padding: '8px', border: '1px solid #444', color: '#ffd700' }}>Status</th>
                              <th style={{ padding: '8px', border: '1px solid #444', color: '#ffd700' }}>Time</th>
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
                                      <td colSpan="5" style={{
                                        padding: '8px',
                                        background: '#ff9800',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        border: '1px solid #444'
                                      }}>
                                        🚨 OVERTIME BEGINS 🚨
                                      </td>
                                    </tr>
                                  )}
                                  <tr style={{
                                    background: turn.wasSkunkd ? '#ffebee' : 
                                               turn.inOvertime ? '#fff3e0' : '#111',
                                    color: turn.wasSkunkd ? '#d32f2f' : 
                                           turn.inOvertime ? '#f57c00' : '#fff'
                                  }}>
                                    <td style={{ padding: '8px', border: '1px solid #444', textAlign: 'center' }}>
                                      {turn.turnNumber}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #444' }}>
                                      {turn.playerName}
                                    </td>
                                    <td style={{ 
                                      padding: '8px', 
                                      border: '1px solid #444', 
                                      textAlign: 'center',
                                      fontWeight: turn.pointsBanked > 0 ? 'bold' : 'normal'
                                    }}>
                                      {turn.pointsBanked}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #444', textAlign: 'center' }}>
                                      {turn.wasSkunkd && '🦨 SKUNK\'D'}
                                      {turn.inOvertime && !turn.wasSkunkd && '⏰ Overtime'}
                                      {!turn.wasSkunkd && !turn.inOvertime && '✅ Normal'}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #444', fontSize: '0.8em' }}>
                                      {new Date(turn.timestamp).toLocaleTimeString()}
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
    </div>
  );
}