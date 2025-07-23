import React from 'react';

export default function GameHistoryModal({ history, open, onClose }) {
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
            {history.map((game, idx) => (
              <div key={idx} style={{
                background: "#111", borderRadius: 13, padding: 18, marginBottom: 16,
                border: "2px solid #ffd700"
              }}>
                <div style={{ color: "#ccc", fontSize: "0.97em", marginBottom: 3 }}>
                  <b>Date:</b> {new Date(game.date).toLocaleString()}
                </div>
                <div>
                  <b>Players & Scores:</b>
                  <ul>
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
                <div style={{ marginBottom: 5 }}>
                  <b>Notes:</b>
                  <div style={{
                    background: "#fffbe5", color: "#333", fontFamily: "Caveat, cursive",
                    borderRadius: 8, padding: "8px 13px", marginTop: 4, minHeight: 32
                  }}>
                    {game.notes || <span style={{ color: "#aaa" }}>None</span>}
                  </div>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: 6, background: "#ffd700", color: "#222", borderRadius: 8,
                      padding: "7px 14px", border: "none", fontWeight: "bold", cursor: "pointer"
                    }}
                    onClick={() => {
                      const shareText = [
                        `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                        ...game.players.map((p, i) =>
                          `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                        `Notes: ${game.notes || "None"}`
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
                      const shareText = [
                        `SKUNK'D Game Results (${new Date(game.date).toLocaleString()}):`,
                        ...game.players.map((p, i) =>
                          `${p}: ${game.scores[i]}${game.winnerIdx === i ? " 👑 Winner!" : ""}`),
                        `Notes: ${game.notes || "None"}`
                      ].join('\n');
                      navigator.clipboard.writeText(shareText);
                      alert('Results copied to clipboard!');
                    }}
                  >Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}