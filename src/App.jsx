import './app.css';
import React, { useState } from 'react';
import GameHistoryModal from './GameHistoryModal';
import TurnManagerManual from './TurnManagerManual';

// Import logo
import skunkdLogo from './assets/skunkd-logo.png';

// Import all card images
import countdownCard from './assets/cards/countdown.png';
import extremeCard from './assets/cards/extreme.png';
import megaPlusCard from './assets/cards/mega_plus.png';
import mulliganCard from './assets/cards/mulligan.png';
import pungentCard from './assets/cards/pungent.png';
import sixTwoEvenCard from './assets/cards/six_two_even.png';
import slowBoatCard from './assets/cards/slow_boat.png';
import stripesPlusCard from './assets/cards/stripes_plus.png';
import stinkySuperSkunkdCard from './assets/cards/stinky_super_skunkd.png';
import singleCincoCard from './assets/cards/single_cinco.png';

// List of your 10 elective rules with card name and description
const ELECTIVE_RULES = [
  {
    key: "countdown",
    label: "Countdown",
    description: "Before rolling for the last time, a player must announce “Countdown”. They must then roll a 6, 5, 4, 3, 2, (skunk’d) in consecutive rolls, keeping one die per roll. If successful that player instantly WINS the game!",
    img: countdownCard
  },
  {
    key: "extreme",
    label: "Extreme",
    description: "All players on their turn may continue rolling until they have SKUNK’D, and still move all points from their den onto the board! No min. to get on the board!",
    img: extremeCard
  },
  {
    key: "megaPlus",
    label: "Mega+",
    description: "Mega rules apply to 5‘s and (skunk’d)‘s (in addition to 2’s, 3’s, 4’s, & 6’s). Additional 5‘s are worth 500 and additional (skunk’d)‘s are worth 1,000. Mega doubling also applies.",
    img: megaPlusCard
  },
  {
    key: "mulligan",
    label: "Mulligan",
    description: "A player may proclaim Mulligan to get a do-over! Each player may claim one Mulligan per game. The Mulligan can be called anytime.",
    img: mulliganCard
  },
  {
    key: "pungent",
    label: "Pungent",
    description: "A Scent-sational score of 2,000+ is worth double! An Odorific score of 5,000+ is worth triple!",
    img: pungentCard
  },
  {
    key: "sixTwoEven",
    label: "Six, Two, & Even",
    description: "On any given roll a player may change any 6’s to 2’s or any 2’s to 6’s. Each player may use this rule once per game.",
    img: sixTwoEvenCard
  },
  {
    key: "slowBoat",
    label: "Slow Boat",
    description: "When a player rolls six (skunk’d)‘s or 5’s, one at a time, they receive 5 times the value of the six dice. Ex. Four 5’s and Two (skunk’d)‘s = 400 pts. times 5 for a total of 2,000 pts.!",
    img: slowBoatCard
  },
  {
    key: "stripesPlus",
    label: "Stripes+",
    description: "When a player rolls Stripes (3 pairs) that are numerically consecutive, such as 3’s, 4’s, & 5’s, they get 3,000 points instead of 1,000!",
    img: stripesPlusCard
  },
  {
    key: "stinkySuperSkunkd",
    label: "Stinky Super SKUNK’D",
    description: "When a player has Super SKUNK’D (rolled 6 dice with none scoring) the player’s score on the board resets to ZERO!",
    img: stinkySuperSkunkdCard
  },
  {
    key: "singleCinco",
    label: "Single Cinco",
    description: "When a player rolls six 5’s, one at a time, they receive a score of 3,000 points!",
    img: singleCincoCard
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
    const history = raw ? JSON.parse(raw) : [];
    // Migrate old string notes to array format
    return history.map(game => {
      if (typeof game.notes === 'string') {
        return {
          ...game,
          notes: game.notes ? [{ text: game.notes, timestamp: game.date }] : []
        };
      }
      return game;
    });
  } catch {
    return [];
  }
}

// Save to localStorage
function saveGameHistory(history) {
  localStorage.setItem('skunkdGameHistory', JSON.stringify(history));
}

// Add demo data for testing (only if no history exists)
function addDemoData() {
  const existingHistory = loadGameHistory();
  if (existingHistory.length === 0) {
    const demoGame = {
      players: ['Alice', 'Bob', 'Charlie'],
      scores: [12450, 8900, 6500],
      notes: [
        { text: 'Alice got lucky with a double mega!', timestamp: Date.now() - 1000000 },
        { text: 'Bob was skunk\'d three times', timestamp: Date.now() - 500000 },
        { text: 'Great game everyone!', timestamp: Date.now() - 100000 }
      ],
      date: Date.now() - 3600000, // 1 hour ago
      winnerIdx: 0,
      goalScore: 10000,
      detailedTurns: [
        { turnNumber: 1, playerIdx: 0, playerName: 'Alice', pointsBanked: 400, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3600000 },
        { turnNumber: 2, playerIdx: 1, playerName: 'Bob', pointsBanked: 200, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3590000 },
        { turnNumber: 3, playerIdx: 2, playerName: 'Charlie', pointsBanked: 300, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3580000 },
        { turnNumber: 4, playerIdx: 0, playerName: 'Alice', pointsBanked: 0, wasSkunkd: true, inOvertime: false, timestamp: Date.now() - 3570000 },
        { turnNumber: 5, playerIdx: 1, playerName: 'Bob', pointsBanked: 0, wasSkunkd: true, inOvertime: false, timestamp: Date.now() - 3560000 },
        { turnNumber: 6, playerIdx: 2, playerName: 'Charlie', pointsBanked: 1500, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3550000 },
        { turnNumber: 7, playerIdx: 0, playerName: 'Alice', pointsBanked: 2800, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3540000 },
        { turnNumber: 8, playerIdx: 1, playerName: 'Bob', pointsBanked: 1200, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3530000 },
        { turnNumber: 9, playerIdx: 2, playerName: 'Charlie', pointsBanked: 800, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3520000 },
        { turnNumber: 10, playerIdx: 0, playerName: 'Alice', pointsBanked: 9250, wasSkunkd: false, inOvertime: false, timestamp: Date.now() - 3510000 },
        // Overtime starts here
        { turnNumber: 11, playerIdx: 1, playerName: 'Bob', pointsBanked: 1200, wasSkunkd: false, inOvertime: true, timestamp: Date.now() - 3500000 },
        { turnNumber: 12, playerIdx: 2, playerName: 'Charlie', pointsBanked: 0, wasSkunkd: true, inOvertime: true, timestamp: Date.now() - 3490000 },
        { turnNumber: 13, playerIdx: 0, playerName: 'Alice', pointsBanked: 0, wasSkunkd: true, inOvertime: true, timestamp: Date.now() - 3480000 },
        { turnNumber: 14, playerIdx: 1, playerName: 'Bob', pointsBanked: 2300, wasSkunkd: false, inOvertime: true, timestamp: Date.now() - 3470000 },
        { turnNumber: 15, playerIdx: 2, playerName: 'Charlie', pointsBanked: 1600, wasSkunkd: false, inOvertime: true, timestamp: Date.now() - 3460000 },
        { turnNumber: 16, playerIdx: 0, playerName: 'Alice', pointsBanked: 0, wasSkunkd: true, inOvertime: true, timestamp: Date.now() - 3450000 },
        { turnNumber: 17, playerIdx: 1, playerName: 'Bob', pointsBanked: 4200, wasSkunkd: false, inOvertime: true, timestamp: Date.now() - 3440000 },
        { turnNumber: 18, playerIdx: 2, playerName: 'Charlie', pointsBanked: 2300, wasSkunkd: false, inOvertime: true, timestamp: Date.now() - 3430000 }
      ],
      electiveRules: {
        countdown: false,
        extreme: true,
        megaPlus: false,
        mulligan: true,
        pungent: false,
        sixTwoEven: false,
        slowBoat: false,
        stripesPlus: false,
        stinkySuperSkunkd: false,
        singleCinco: false
      },
      gameStats: {
        totalTurns: 18,
        overtimeTurns: 8,
        skunkdTurns: 6
      }
    };
    
    saveGameHistory([demoGame]);
    return [demoGame];
  }
  return existingHistory;
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

  const [notesHistory, setNotesHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState(addDemoData());
  const [showHistory, setShowHistory] = useState(false);
  const [turnHistory, setTurnHistory] = useState([]);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  
  // Detailed turn tracking for game history
  const [detailedTurns, setDetailedTurns] = useState([]);
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1);

  // Global undo functionality - tracks snapshots of entire game state
  const [undoHistory, setUndoHistory] = useState([]);

  /**
   * Creates a deep copy snapshot of the current game state
   * This captures all the essential game state that can be restored
   */
  function createGameSnapshot() {
    return {
      players: [...players],
      scores: [...scores],
      currentPlayerIdx,
      overtime,
      leaderIdx,
      leaderScore,
      eliminated: [...eliminated],
      winnerIdx,
      notesHistory,
      targetScore,
      electiveRules: { ...electiveRules }
    };
  }

  /**
   * Saves a snapshot of the current game state to the undo history
   * Called before any major game state change (bank, skunk, note change)
   */
  function saveGameSnapshot() {
    const snapshot = createGameSnapshot();
    setUndoHistory(prev => [...prev, snapshot]);
  }

  /**
   * Global undo function - restores the game to the previous snapshot
   * Works across turns and players, reverting all game state changes
   */
  function handleGlobalUndo() {
    if (undoHistory.length === 0) return;
    
    const previousSnapshot = undoHistory[undoHistory.length - 1];
    
    // Restore all game state from the snapshot
    setPlayers([...previousSnapshot.players]);
    setScores([...previousSnapshot.scores]);
    setCurrentPlayerIdx(previousSnapshot.currentPlayerIdx);
    setOvertime(previousSnapshot.overtime);
    setLeaderIdx(previousSnapshot.leaderIdx);
    setLeaderScore(previousSnapshot.leaderScore);
    setEliminated([...previousSnapshot.eliminated]);
    setWinnerIdx(previousSnapshot.winnerIdx);
    setNotesHistory(previousSnapshot.notesHistory);
    setTargetScore(previousSnapshot.targetScore);
    setElectiveRules({ ...previousSnapshot.electiveRules });
    
    // Remove the used snapshot from history
    setUndoHistory(prev => prev.slice(0, -1));
  }

  function handleRuleChange(ruleKey) {
    setElectiveRules(rules => ({
      ...rules,
      [ruleKey]: !rules[ruleKey]
    }));
  }

  // Create a snapshot of the current game state for undo functionality
  function createSnapshot() {
    const snapshot = {
      scores: [...scores],
      currentPlayerIdx,
      overtime,
      leaderIdx,
      leaderScore,
      eliminated: [...eliminated],
      winnerIdx,
      notesHistory
    };
    setTurnHistory(prev => [...prev, snapshot]);
  }

  // Undo the last turn by restoring the previous game state
  function undoLastTurn() {
    if (turnHistory.length === 0) return;
    
    const lastSnapshot = turnHistory[turnHistory.length - 1];
    setScores([...lastSnapshot.scores]);
    setCurrentPlayerIdx(lastSnapshot.currentPlayerIdx);
    setOvertime(lastSnapshot.overtime);
    setLeaderIdx(lastSnapshot.leaderIdx);
    setLeaderScore(lastSnapshot.leaderScore);
    setEliminated([...lastSnapshot.eliminated]);
    setWinnerIdx(lastSnapshot.winnerIdx);
    setNotesHistory(lastSnapshot.notesHistory);
    
    // Remove the last snapshot from history
    setTurnHistory(prev => prev.slice(0, -1));
    setShowUndoConfirm(false);
  }

  function handleUndoLastTurnClick() {
    if (turnHistory.length === 0) return;
    setShowUndoConfirm(true);
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
    
    // Reset detailed turn tracking
    setDetailedTurns([]);
    setCurrentTurnNumber(1);
    
    // Reset notes for fresh start
    setNotesHistory([]);
  }

  function handleBankPoints(points) {
    if (winnerIdx !== null) return;
    
    // Save snapshot before banking points (major game state change)
    saveGameSnapshot();
    createSnapshot(); // Also save for turn-level undo
    
    // Record the detailed turn information
    const turnData = {
      turnNumber: currentTurnNumber,
      playerIdx: currentPlayerIdx,
      playerName: players[currentPlayerIdx],
      pointsBanked: points,
      wasSkunkd: false,
      inOvertime: overtime,
      timestamp: Date.now()
    };
    setDetailedTurns(prev => [...prev, turnData]);
    setCurrentTurnNumber(prev => prev + 1);
    
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
          // Find the winner by highest score among non-eliminated players
          let winnerIndex = -1;
          let highestScore = -1;
          for (let i = 0; i < updatedScores.length; i++) {
            if (!newElim[i] && updatedScores[i] > highestScore) {
              highestScore = updatedScores[i];
              winnerIndex = i;
            }
          }
          setWinnerIdx(winnerIndex);
        }
      }
      setScores(updatedScores);
      setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
      return;
    }
    setScores(updatedScores);
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length);
  }

  /**
   * Handles when a player gets SKUNK'D (turn ends with no points)
   * Saves a snapshot before the turn change
   */
  function handleSkunkTurn() {
    if (winnerIdx !== null) return;
    
    // Save snapshot before ending turn due to SKUNK'D (major game state change)
    saveGameSnapshot();
    createSnapshot(); // Also save for turn-level undo
    
    // Record the detailed turn information for SKUNK'D
    const turnData = {
      turnNumber: currentTurnNumber,
      playerIdx: currentPlayerIdx,
      playerName: players[currentPlayerIdx],
      pointsBanked: 0,
      wasSkunkd: true,
      inOvertime: overtime,
      timestamp: Date.now()
    };
    setDetailedTurns(prev => [...prev, turnData]);
    setCurrentTurnNumber(prev => prev + 1);
    
    // In overtime, getting SKUNK'D means elimination (since you scored 0, you can't beat the leader)
    if (overtime) {
      if (!eliminated[currentPlayerIdx]) {
        const newElim = [...eliminated];
        newElim[currentPlayerIdx] = true;
        setEliminated(newElim);
        
        // Check if only one player remains active
        const active = newElim.filter(e => !e);
        if (active.length === 1) {
          // Find the winner by highest score among non-eliminated players
          let winnerIndex = -1;
          let highestScore = -1;
          for (let i = 0; i < scores.length; i++) {
            if (!newElim[i] && scores[i] > highestScore) {
              highestScore = scores[i];
              winnerIndex = i;
            }
          }
          setWinnerIdx(winnerIndex);
          return; // Game is over, don't advance to next player
        }
      }
    }
    
    // Move to next player (no points are banked when skunked)
    setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
  }

  /**
   * Handles note changes with undo tracking
   * Only saves a snapshot when notes are actually submitted/committed, not on every keystroke
   */
  function handleNotesChange(newNotes) {
    // Just update the notes without creating snapshots for every keystroke
    // Snapshots for notes could be created on blur or when notes are "saved"
    // For now, we'll keep it simple and only snapshot on major game actions
    setNotesHistory(newNotes);
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
    
    // Reset detailed turn tracking
    setDetailedTurns([]);
    setCurrentTurnNumber(1);
    
    // Reset notes for fresh start
    setNotesHistory([]);
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
        winnerIdx,
        // Enhanced data for detailed history
        goalScore: targetScore,
        detailedTurns,
        electiveRules: { ...electiveRules },
        gameStats: {
          totalTurns: detailedTurns.length,
          overtimeTurns: detailedTurns.filter(t => t.inOvertime).length,
          skunkdTurns: detailedTurns.filter(t => t.wasSkunkd).length
        }
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 20 
      }}>
        <h1 style={{ margin: 0 }}>SKUNK'D Scorecard</h1>
        <img 
          src={skunkdLogo} 
          alt="SKUNK'D Logo" 
          style={{ 
            height: '90px',
            maxWidth: '300px',
            objectFit: 'contain'
          }} 
        />
      </div>
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
            <>
              <TurnManagerManual
                playerName={players[currentPlayerIdx]}
                eliminated={eliminated[currentPlayerIdx]}
                leaderScore={leaderScore}
                playerScore={scores[currentPlayerIdx]}
                overtime={overtime}
                onScoreBoard={handleBankPoints}
                onSkunkTurn={handleSkunkTurn}
                onEndTurn={() => setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated))}
                winnerIdx={winnerIdx}
                scores={scores}
                players={players}
                onSaveGame={saveCompletedGame}
                notesHistory={notesHistory}
                onNotesChange={handleNotesChange}
                // Pass global undo info (no longer used in TurnManager but keeping for reference)
                globalUndoAvailable={undoHistory.length > 0}
                onGlobalUndo={handleGlobalUndo}
              />
            </>
          ) : (
            <div>
              <h2>Game Over! Winner: {players[winnerIdx]}</h2>
              <button onClick={resetGame}>New Game</button>
            </div>
          )}
          <br />
          <button 
            onClick={handleUndoLastTurnClick}
            disabled={turnHistory.length === 0}
            style={{ 
              marginTop: 16, 
              marginRight: 10,
              background: turnHistory.length === 0 ? "#444" : "#ffd700", 
              color: turnHistory.length === 0 ? "#888" : "#222",
              cursor: turnHistory.length === 0 ? "not-allowed" : "pointer",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: "bold",
              fontSize: "1.1em",
              transition: "all 0.3s ease"
            }}
            title={turnHistory.length === 0 ? "No turns to undo" : "Undo the last completed turn"}
          >
            🔄 Undo Last Turn
          </button>
          <button onClick={resetGame} style={{ marginTop: 16 }}>Reset Game</button>
          
          {/* Confirmation Dialog for Undo Last Turn */}
          {showUndoConfirm && (
            <div className="confirm-dialog-overlay">
              <div className="confirm-dialog">
                <h3>⚠️ Confirm Undo</h3>
                <p>Are you sure you want to undo the last turn? This action will revert the game state to before the last player's turn was completed.</p>
                <div className="confirm-dialog-buttons">
                  <button 
                    className="confirm-yes"
                    onClick={undoLastTurn}
                  >
                    Yes, Undo
                  </button>
                  <button 
                    className="confirm-no"
                    onClick={() => setShowUndoConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}