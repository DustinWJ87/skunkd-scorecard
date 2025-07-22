import React from 'react';

// Example props:
// players: [{ name: 'Alice', score: 3200, mulliganUsed: false, sixTwoEvenUsed: false }, ...]
// activeRules: { countdown: true, megaPlus: false, ... }
// currentPlayer: 0 (index)
// turnState: { dice: [...], history: [...], message: '' }
// onAction: function('roll'), function('endTurn'), etc.

export default function Scorecard({ players, activeRules, currentPlayer, turnState, onAction }) {
  return (
    <div className="scorecard">
      <header>
        <h2>Scorecard</h2>
        <ElectiveRuleBar activeRules={activeRules} />
      </header>
      <section>
        <h3>Players</h3>
        <div className="player-row-list">
          {players.map((p, idx) => (
            <PlayerRow
              key={idx}
              player={p}
              isActive={idx === currentPlayer}
            />
          ))}
        </div>
      </section>
      <section>
        <h3>Turn</h3>
        <TurnPanel
          turnState={turnState}
          player={players[currentPlayer]}
          activeRules={activeRules}
          onAction={onAction}
        />
      </section>
      <section>
        <GameFeedback message={turnState?.message} />
      </section>
    </div>
  );
}

function ElectiveRuleBar({ activeRules }) {
  // Show icons or text for each enabled rule
  const enabled = Object.entries(activeRules).filter(([_, v]) => v);
  return (
    <div className="elective-rule-bar" style={{ marginBottom: '10px' }}>
      {enabled.length === 0 ? (
        <span>No elective rules active</span>
      ) : (
        enabled.map(([key]) => (
          <span key={key} className="rule-indicator" style={{ marginRight: '10px', padding: '2px 8px', borderRadius: '4px', background: '#eee', fontSize: '0.95em' }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </span>
        ))
      )}
    </div>
  );
}

function PlayerRow({ player, isActive }) {
  return (
    <div className={`player-row${isActive ? ' active' : ''}`} style={{ marginBottom: '6px', padding: '6px', background: isActive ? '#f0fcf7' : '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
      <strong>{player.name}</strong>
      <span style={{ marginLeft: '16px' }}>Score: <b>{player.score}</b></span>
      {player.mulliganUsed && <span style={{ marginLeft: '12px', color: '#b77' }}>Mulligan Used</span>}
      {player.sixTwoEvenUsed && <span style={{ marginLeft: '8px', color: '#77b' }}>Six, Two, & Even Used</span>}
    </div>
  );
}

function TurnPanel({ turnState, player, activeRules, onAction }) {
  return (
    <div className="turn-panel" style={{ marginTop: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', background: '#fafafa' }}>
      <div>
        <span>Current Player: <b>{player.name}</b></span>
      </div>
      <div style={{ margin: '10px 0' }}>
        <DiceDisplay dice={turnState?.dice} />
      </div>
      {/* Actions: Roll, End Turn, Use Mulligan, Use Six, Two, & Even, etc. */}
      <div>
        <button onClick={() => onAction('roll')}>Roll Dice</button>
        <button onClick={() => onAction('endTurn')} style={{ marginLeft: '10px' }}>End Turn</button>
        {activeRules.mulligan && !player.mulliganUsed && (
          <button onClick={() => onAction('mulligan')} style={{ marginLeft: '10px' }}>Use Mulligan</button>
        )}
        {activeRules.sixTwoEven && !player.sixTwoEvenUsed && (
          <button onClick={() => onAction('sixTwoEven')} style={{ marginLeft: '10px' }}>Six, Two, & Even</button>
        )}
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.95em', color: "#555" }}>
        {/* Show elective rule reminders if relevant */}
        {activeRules.extreme && <div>Extreme: No minimum score, keep rolling until SKUNK'D!</div>}
        {activeRules.pungent && <div>Pungent: Big scores are multiplied!</div>}
        {/* ...add more rule reminders as needed */}
      </div>
    </div>
  );
}

function DiceDisplay({ dice }) {
  if (!dice || dice.length === 0) return <span>No dice rolled yet.</span>;
  return (
    <div className="dice-display" style={{ fontSize: '1.3em' }}>
      {dice.map((d, idx) => (
        <span key={idx} style={{ marginRight: '8px', padding: '4px 8px', borderRadius: '4px', background: '#e2e2ff', border: '1px solid #bbb' }}>
          {d}
        </span>
      ))}
    </div>
  );
}

function GameFeedback({ message }) {
  if (!message) return null;
  return (
    <div className="game-feedback" style={{ marginTop: '14px', padding: '8px', background: '#f7f7e6', borderRadius: '6px', border: '1px solid #eed' }}>
      {message}
    </div>
  );
}