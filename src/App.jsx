import './app.css';
import React, { useState } from 'react';
import GameHistoryModal from './GameHistoryModal';
import TurnManagerManual from './TurnManagerManual';

// List of your 10 elective rules with card name and description
const ELECTIVE_RULES = [
  {
    key: "countdown",
    label: "Countdown",
    description: "Before rolling for the last time, a player must announce “Countdown”. They must then roll a 6, 5, 4, 3, 2, (skunk’d) in consecutive rolls, keeping one die per roll. If successful that player instantly WINS the game!",
    img: "/cards/countdown.png"
  },
  {
    key: "extreme",
    label: "Extreme",
    description: "All players on their turn may continue rolling until they have SKUNK’D, and still move all points from their den onto the board! No min. to get on the board!",
    img: "/cards/extreme.png"
  },
  {
    key: "megaPlus",
    label: "Mega+",
    description: "Mega rules apply to 5‘s and (skunk’d)‘s (in addition to 2’s, 3’s, 4’s, & 6’s). Additional 5‘s are worth 500 and additional (skunk’d)‘s are worth 1,000. Mega doubling also applies.",
    img: "/cards/mega_Plus.png"
  },
  {
    key: "mulligan",
    label: "Mulligan",
    description: "A player may proclaim Mulligan to get a do-over! Each player may claim one Mulligan per game. The Mulligan can be called anytime.",
    img: "/cards/mulligan.png"
  },
  {
    key: "pungent",
    label: "Pungent",
    description: "A Scent-sational score of 2,000+ is worth double! An Odorific score of 5,000+ is worth triple!",
    img: "/cards/pungent.png"
  },
  {
    key: "sixTwoEven",
    label: "Six, Two, & Even",
    description: "On any given roll a player may change any 6’s to 2’s or any 2’s to 6’s. Each player may use this rule once per game.",
    img: "/cards/six_Two_Even.png"
  },
  {
    key: "slowBoat",
    label: "Slow Boat",
    description: "When a player rolls six (skunk’d)‘s or 5’s, one at a time, they receive 5 times the value of the six dice. Ex. Four 5’s and Two (skunk’d)‘s = 400 pts. times 5 for a total of 2,000 pts.!",
    img: "/cards/slow_Boat.png"
  },
  {
    key: "stripesPlus",
    label: "Stripes+",
    description: "When a player rolls Stripes (3 pairs) that are numerically consecutive, such as 3’s, 4’s, & 5’s, they get 3,000 points instead of 1,000!",
    img: "/cards/stripes_Plus.png"
  },
  {
    key: "stinkySuperSkunkd",
    label: "Stinky Super SKUNK’D",
    description: "When a player has Super SKUNK’D (rolled 6 dice with none scoring) the player’s score on the board resets to ZERO!",
    img: "/cards/stinky_Super_Skunkd.png"
  },
  {
    key: "singleCinco",
    label: "Single Cinco",
    description: "When a player rolls six 5’s, one at a time, they receive a score of 3,000 points!",
    img: "/cards/single_Cinco.png"
  }
];

function getNextActivePlayerIdx(currentIdx, eliminated) {
  const n = eliminated.length;
  let nextIdx = (currentIdx + 1) % n;
  while (eliminated[nextIdx] && eliminated.some(e => !e)) {
    nextIdx = (nextIdx + 1) % n;
  }
  return nextIdx;
}

// Load from localStorage
function loadGameHistory() {
  try {
    const raw = localStorage.getItem('skunkdGameHistory');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save to localStorage
function saveGameHistory(history) {
  localStorage.setItem('skunkdGameHistory', JSON.stringify(history));
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [playerNames, setPlayerNames] = useState(['']);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [scores, setScores] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [targetScore, setTargetScore] = useState(10000);
  const [electiveRules, setElectiveRules] = useState(
    ELECTIVE_RULES.reduce((acc, rule) => {
      acc[rule.key] = false;
      return acc;
    }, {})
  );
  const [overtime, setOvertime] = useState(false);
  const [leaderIdx, setLeaderIdx] = useState(null);
  const [leaderScore, setLeaderScore] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [winnerIdx, setWinnerIdx] = useState(null);

  const [notesHistory, setNotesHistory] = useState('');
  const [gameHistory, setGameHistory] = useState(loadGameHistory());
  const [showHistory, setShowHistory] = useState(false);

  function handleRuleChange(ruleKey) {
    setElectiveRules(rules => ({
      ...rules,
      [ruleKey]: !rules[ruleKey]
    }));
  }

  function handleAddPlayer() {
    setPlayerNames([...playerNames, '']);
  }

  function handleNameChange(idx, name) {
    const newNames = [...playerNames];
    newNames[idx] = name;
    setPlayerNames(newNames);
  }

  function startGame() {
    const filteredNames = playerNames.filter(name => name.trim() !== '');
    setPlayers(filteredNames);
    setScores(filteredNames.map(() => 0));
    setCurrentPlayerIdx(0);
    setGameStarted(true);
    setOvertime(false);
    setLeaderIdx(null);
    setLeaderScore(null);
    setEliminated(filteredNames.map(() => false));
    setWinnerIdx(null);
    setNotesHistory('');
  }

  function handleBankPoints(points) {
    if (winnerIdx !== null) return;
    const updatedScores = [...scores];
    updatedScores[currentPlayerIdx] += points;
    if (!overtime && updatedScores[currentPlayerIdx] >= targetScore) {
      setOvertime(true);
      setLeaderIdx(currentPlayerIdx);
      setLeaderScore(updatedScores[currentPlayerIdx]);
      setScores(updatedScores);
      setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
      return;
    }
    if (overtime) {
      if (eliminated[currentPlayerIdx]) {
        setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
        return;
      }
      if (updatedScores[currentPlayerIdx] > leaderScore) {
        setLeaderIdx(currentPlayerIdx);
        setLeaderScore(updatedScores[currentPlayerIdx]);
      } else {
        const newElim = [...eliminated];
        newElim[currentPlayerIdx] = true;
        setEliminated(newElim);
        const active = newElim.filter(e => !e);
        if (active.length === 1) {
          setWinnerIdx(newElim.findIndex(e => !e));
        }
      }
      setScores(updatedScores);
      setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
      return;
    }
    setScores(updatedScores);
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length);
  }

  function resetGame() {
    setPlayers([]);
    setPlayerNames(['']);
    setScores([]);
    setCurrentPlayerIdx(0);
    setGameStarted(false);
    setElectiveRules(ELECTIVE_RULES.reduce((acc, rule) => {
      acc[rule.key] = false;
      return acc;
    }, {}));
    setTargetScore(10000);
    setOvertime(false);
    setLeaderIdx(null);
    setLeaderScore(null);
    setEliminated([]);
    setWinnerIdx(null);
    setNotesHistory('');
  }

  // Save game to history
  function saveCompletedGame() {
    const newHistory = [
      ...gameHistory,
      {
        players,
        scores,
        notes: notesHistory,
        date: Date.now(),
        winnerIdx
      }
    ];
    setGameHistory(newHistory);
    saveGameHistory(newHistory);
  }

  // Save to history automatically when winner
  React.useEffect(() => {
    if (winnerIdx !== null && players.length && scores.length) {
      saveCompletedGame();
    }
    // eslint-disable-next-line
  }, [winnerIdx]);

  // Get array of active rules for display
  const activeRules = ELECTIVE_RULES.filter(r => electiveRules[r.key]);

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: 20, backgroundColor: '#111', color: '#fff' }}>
      <h1>SKUNK'D Scorecard</h1>
      <div style={{ marginBottom: 12 }}>
        <button
          style={{
            background: "#ffd700", color: "#222", borderRadius: 8,
            padding: "8px 14px", border: "none", fontWeight: "bold",
            cursor: "pointer", marginRight: 10
          }}
          onClick={() => setShowHistory(true)}
        >
          View Past Games
        </button>
      </div>
      <GameHistoryModal
        history={gameHistory}
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />
      {!gameStarted ? (
        <div>
          <h2>New Game Setup</h2>
          {playerNames.map((name, idx) => (
            <div key={idx}>
              <input
                type="text"
                placeholder={`Player ${idx + 1} Name`}
                value={name}
                onChange={e => handleNameChange(idx, e.target.value)}
                style={{ background: "#222", color: "#fff", border: "1px solid #444", marginBottom: 8 }}
              />
            </div>
          ))}
          <button onClick={handleAddPlayer} style={{ margin: '8px 0' }}>Add Player</button>
          <br />
          <label>
            Target Score:{" "}
            <input
              type="number"
              min={1000}
              step={100}
              value={targetScore}
              onChange={e => setTargetScore(parseInt(e.target.value, 10) || 10000)}
              style={{ background: "#222", color: "#fff", border: "1px solid #444", width: 80 }}
            />
          </label>
          <h3>Elective Rules</h3>
          <div>
            {ELECTIVE_RULES.map(rule => (
              <label key={rule.key} style={{ display: "block", marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={electiveRules[rule.key]}
                  onChange={() => handleRuleChange(rule.key)}
                />
                <span title={rule.description} style={{ textDecoration: "underline dotted", cursor: "help" }}>
                  {rule.label}
                </span>
                {rule.img && (
                  <img src={rule.img} alt={rule.label} style={{ height: 32, marginLeft: 8, verticalAlign: 'middle' }} />
                )}
              </label>
            ))}
          </div>
          <button onClick={startGame} disabled={playerNames.every(n => !n.trim())} style={{ marginTop: 12 }}>
            Start Game
          </button>
        </div>
      ) : (
        <div>
          <h2>Scores</h2>
          <ul>
            {players.map((name, idx) => (
              <li key={idx} style={{
                color:
                  winnerIdx === idx ? "#ffd700"
                  : eliminated[idx] ? "#888"
                  : leaderIdx === idx && overtime ? "#00ffea"
                  : "#fff",
                fontWeight: winnerIdx === idx ? "bold" : leaderIdx === idx ? "bold" : "normal"
              }}>
                {name}: {scores[idx]}
                {idx === currentPlayerIdx && ' ← Current'}
                {winnerIdx === idx && ' 👑 Winner!'}
                {eliminated[idx] && overtime && ' (Eliminated)'}
                {leaderIdx === idx && overtime && ' (Leader)'}
              </li>
            ))}
          </ul>
          {/* Active Rule Cards */}
          {activeRules.length > 0 && (
            <div style={{ margin: '16px 0', background: '#222', padding: 12, borderRadius: 10 }}>
              <h3>Active Rules:</h3>
              <div style={{ display: 'flex', gap: 18 }}>
                {activeRules.map(rule => (
                  <div key={rule.key} style={{ textAlign: 'center' }}>
                    {rule.img && (
                      <img src={rule.img} alt={rule.label} style={{ height: 80, marginBottom: 6 }} />
                    )}
                    <div style={{ color: '#ffd700', fontWeight: 'bold' }}>{rule.label}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{rule.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {winnerIdx === null ? (
            <TurnManagerManual
              playerName={players[currentPlayerIdx]}
              eliminated={eliminated[currentPlayerIdx]}
              leaderScore={leaderScore}
              playerScore={scores[currentPlayerIdx]}
              overtime={overtime}
              onScoreBoard={handleBankPoints}
              onEndTurn={() => setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated))}
              winnerIdx={winnerIdx}
              scores={scores}
              players={players}
              onSaveGame={saveCompletedGame}
              notesHistory={notesHistory}
              setNotesHistory={setNotesHistory}
            />
          ) : (
            <div>
              <h2>Game Over! Winner: {players[winnerIdx]}</h2>
              <button onClick={resetGame}>New Game</button>
            </div>
          )}
          <br />
          <button onClick={resetGame} style={{ marginTop: 16 }}>Reset Game</button>
        </div>
      )}
    </div>
  );
}