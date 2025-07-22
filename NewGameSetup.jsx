import React, { useState } from 'react';

// Example elective rules data (expand as needed)
const ELECTIVE_RULES = [
  {
    key: 'countdown',
    name: 'Countdown',
    description: 'Win instantly by rolling 6, 5, 4, 3, 2, SKUNK in order, keeping one die per roll.',
  },
  {
    key: 'extreme',
    name: 'Extreme',
    description: 'No minimum score to move points. Keep rolling until SKUNK\'D. Play to 20,000 points.',
  },
  {
    key: 'megaPlus',
    name: 'Mega+',
    description: 'Mega applies to 5s and SKUNK icons. Additional 5s = 500 pts, SKUNKs = 1,000 pts. Mega doubling applies.',
  },
  {
    key: 'mulligan',
    name: 'Mulligan',
    description: 'Each player may claim one Mulligan (do-over) per game, at any time.',
  },
  {
    key: 'pungent',
    name: 'Pungent',
    description: 'Scores of 2,000+ are doubled; scores of 5,000+ are tripled. Suggests 20,000 target score.',
  },
  {
    key: 'sixTwoEven',
    name: 'Six, Two, & Even',
    description: 'Once per game, a player may change all rolled 6s to 2s or all 2s to 6s for a single roll.',
  },
  {
    key: 'slowBoat',
    name: 'Slow Boat',
    description: 'Rolling six SKUNK icons or six 5s (one at a time) gives 5x value for those dice.',
  },
  {
    key: 'stripesPlus',
    name: 'Stripes+',
    description: 'Rolling three consecutive pairs (e.g., 3s, 4s, & 5s) awards 3,000 pts (instead of 1,000).',
  },
  {
    key: 'stinkySuperSkunkd',
    name: 'Stinky Super SKUNK\'D',
    description: 'Rolling six dice, none score (“Super SKUNK’D”) resets your board score to zero.',
  },
  {
    key: 'singleCinco',
    name: 'Single Cinco',
    description: 'Rolling six 5s (one at a time) awards 3,000 pts.',
  }
];

export default function NewGameSetup({ onStart }) {
  const [players, setPlayers] = useState([{ name: '' }, { name: '' }]);
  const [activeRules, setActiveRules] = useState(
    ELECTIVE_RULES.reduce((acc, rule) => ({ ...acc, [rule.key]: false }), {})
  );

  // Handle rule toggle
  const handleRuleChange = (key) => {
    setActiveRules(rules => ({
      ...rules,
      [key]: !rules[key]
    }));
  };

  // Handle player name change
  const handlePlayerNameChange = (idx, value) => {
    setPlayers(players =>
      players.map((p, i) => i === idx ? { ...p, name: value } : p)
    );
  };

  // Add/remove player
  const addPlayer = () => setPlayers(players => [...players, { name: '' }]);
  const removePlayer = idx =>
    setPlayers(players => players.filter((_, i) => i !== idx));

  // Start game
  const handleStartGame = () => {
    if (players.some(p => !p.name.trim())) {
      alert('Please enter a name for each player.');
      return;
    }
    onStart({ players, activeRules });
  };

  return (
    <div className="new-game-setup">
      <h2>New Game Setup</h2>
      <section>
        <h3>Players</h3>
        {players.map((player, idx) => (
          <div key={idx} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Player ${idx + 1} Name`}
              value={player.name}
              onChange={e => handlePlayerNameChange(idx, e.target.value)}
              style={{ marginRight: '8px' }}
            />
            {players.length > 2 && (
              <button type="button" onClick={() => removePlayer(idx)}>-</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPlayer}>Add Player</button>
      </section>
      <section>
        <h3>Elective Rules</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ELECTIVE_RULES.map(rule => (
            <li key={rule.key} style={{ marginBottom: '12px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={activeRules[rule.key]}
                  onChange={() => handleRuleChange(rule.key)}
                />
                <strong style={{ marginLeft: '8px' }}>{rule.name}</strong>
              </label>
              <div style={{ fontSize: '0.95em', color: '#555', marginLeft: '28px' }}>
                {rule.description}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <button type="button" onClick={handleStartGame} style={{ marginTop: '20px', padding: '10px 24px' }}>
        Start Game
      </button>
    </div>
  );
}