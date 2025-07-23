import React, { useState } from 'react';

export default function GameHistoryModal({ history, open, onClose }) {
  const [expandedGames, setExpandedGames] = useState(new Set());

  const toggleGameExpansion = (gameIdx) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameIdx)) {
      newExpanded.delete(gameIdx);
    } else {
      newExpanded.add(gameIdx);
    }
    setExpandedGames(newExpanded);
  };

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
        {history.length === 0 ? (
          <div style={{ color: "#fff", marginTop: 24 }}>No games have been saved yet.</div>
        ) : (
          <div>
            {history.map((game, idx) => {
              const isExpanded = expandedGames.has(idx);
              const hasDetailedData = game.detailedTurns && game.detailedTurns.length > 0;
              
              return (
                <div key={idx} style={{
                  background: "#111", borderRadius: 13, padding: 18, marginBottom: 16,
                  border: "2px solid #ffd700"
                }}>
                  {/* Game Summary (Always Visible) */}
                  <div style={{ cursor: hasDetailedData ? 'pointer' : 'default' }} 
                       onClick={() => hasDetailedData && toggleGameExpansion(idx)}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 8 
                    }}>
                      <div style={{ color: "#ccc", fontSize: "0.97em" }}>
                        <b>Date:</b> {new Date(game.date).toLocaleString()}
                      </div>
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
                          </li>
                        ))}
                      </ul>
                    </div>

                    {game.goalScore && (
                      <div style={{ marginBottom: 8, color: "#ccc" }}>
                        <b>Goal Score:</b> {game.goalScore}
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
                            <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                              <strong>Overtime Turns:</strong> {game.gameStats.overtimeTurns}
                            </div>
                            <div style={{ background: '#333', padding: '8px', borderRadius: '4px' }}>
                              <strong>SKUNK'D Turns:</strong> {game.gameStats.skunkdTurns}
                            </div>
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
                        const notesText = Array.isArray(game.notes) && game.notes.length > 0
                          ? game.notes.map(note => `  ${new Date(note.timestamp).toLocaleTimeString()}: ${note.text}`).join('\n')
                          : "None";
                        const shareText = [
                          `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                          `Goal Score: ${game.goalScore || 'Unknown'}`,
                          ...game.players.map((p, i) =>
                            `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                          `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                          `Notes:\n${notesText}`
                        ].join('\n');
                        if (navigator.share) {
                          navigator.share({ title: "SKUNK'D Results", text: shareText });
                        } else {
                          navigator.clipboard.writeText(shareText);
                          alert('Results copied to clipboard!');
                        }
                      }}
                    >Share</button>
                    <button
                      style={{
                        marginLeft: 12, background: "#222", color: "#ffd700", borderRadius: 8,
                        padding: "7px 14px", border: "none", fontWeight: "bold", cursor: "pointer"
                      }}
                      onClick={() => {
                        const notesText = Array.isArray(game.notes) && game.notes.length > 0
                          ? game.notes.map(note => `  ${new Date(note.timestamp).toLocaleTimeString()}: ${note.text}`).join('\n')
                          : "None";
                        const shareText = [
                          `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                          `Goal Score: ${game.goalScore || 'Unknown'}`,
                          ...game.players.map((p, i) =>
                            `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                          `Total Turns: ${game.gameStats?.totalTurns || 'Unknown'}`,
                          `Notes:\n${notesText}`
                        ].join('\n');
                        navigator.clipboard.writeText(shareText);
                        alert('Results copied to clipboard!');
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