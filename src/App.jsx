import './app.css';
import React, { useState, useEffect } from 'react';
import GameHistoryModal from './GameHistoryModal';
import GameShopModal from './GameShopModal';
import RuleRandomizerModal from './RuleRandomizerModal';
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
    description: "Before rolling for the last time, a player must announce 'Countdown'. They must then roll a 6, 5, 4, 3, 2, (skunk'd) in consecutive rolls, keeping one die per roll. If successful that player instantly WINS the game!",
    img: countdownCard
  },
  {
    key: "extreme",
    label: "Extreme",
    description: "All players on their turn may continue rolling until they have SKUNK'D, and still move all points from their den onto the board! No min. to get on the board!",
    img: extremeCard
  },
  {
    key: "megaPlus",
    label: "Mega+",
    description: "Mega rules apply to 5's and (skunk'd)'s (in addition to 2's, 3's, 4's, & 6's). Additional 5's are worth 500 and additional (skunk'd)'s are worth 1,000. Mega doubling also applies.",
    img: megaPlusCard
  },
  {
    key: "mulligan",
    label: "Mulligan",
    isPowerUp: true,
    powerUpIcon: "⛳",
    badgeLabel: "Mulligan",
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
    label: "6, 2, & Even",
    isPowerUp: true,
    powerUpIcon: "🎲",
    badgeLabel: "6-2-Even",
    description: "A player may claim '6, 2, & Even' once per game! The player gets to set one die to 6, one die to 2, and any additional dice must be set to any even number (2, 4, or 6).",
    img: sixTwoEvenCard
  },
  {
    key: "slowBoat",
    label: "Slow Boat",
    description: "When a player rolls six (skunk'd)'s or 5's, one at a time, they receive 5 times the value of the six dice. Ex. Four 5's and Two (skunk'd)'s = 400 pts. times 5 for a total of 2,000 pts.!",
    img: slowBoatCard
  },
  {
    key: "stripesPlus",
    label: "Stripes+",
    description: "When a player rolls Stripes (3 pairs) that are numerically consecutive, such as 3's, 4's, & 5's, they get 3,000 points instead of 1,000!",
    img: stripesPlusCard
  },
  {
    key: "stinkySuperSkunkd",
    label: "Stinky Super SKUNK'D",
    description: "When a player has Super SKUNK'D (rolled 6 dice with none scoring) the player's score on the board resets to ZERO!",
    img: stinkySuperSkunkdCard
  },
  {
    key: "singleCinco",
    label: "Single Cinco",
    description: "When a player rolls six 5's, one at a time, they receive a score of 3,000 points!",
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

// Minimal demo data helper (keeps build stable)
function addDemoData() {
  try {
    const existing = loadGameHistory();
    if (existing && existing.length) return existing;
    return [];
  } catch {
    return [];
  }
}
// (end of demo helper)

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
  const [potentialDenPoints, setPotentialDenPoints] = useState(0);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  
  // Detailed turn tracking for game history
  const [detailedTurns, setDetailedTurns] = useState([]);
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1);

  // Global undo functionality - tracks snapshots of entire game state
  const [undoHistory, setUndoHistory] = useState([]);
  
  // Power-up usage tracking (e.g. Mulligan, 6-2-Even) per player
  const [powerUpUsage, setPowerUpUsage] = useState({});
  
  // State for tracking if game was restored from save
  const [hasSavedGame, setHasSavedGame] = useState(false);
  
  // State for tracking which rule descriptions are expanded (mobile-friendly)
  const [expandedRules, setExpandedRules] = useState({});
  
  // State for fullscreen card viewer modal
  const [viewingCard, setViewingCard] = useState(null);
  
  // State for Game Shop / Creator Tip Jar modal
  const [showShopModal, setShowShopModal] = useState(false);
  const [isSupporter, setIsSupporter] = useState(() => localStorage.getItem('skunkd_is_supporter') === 'true');

  // State for Rule Randomizer modal
  const [showRuleRandomizer, setShowRuleRandomizer] = useState(false);

  function handleSupport(amount, label) {
    setIsSupporter(true);
    localStorage.setItem('skunkd_is_supporter', 'true');
  }

  // State for Screen Wake Lock (Keep Screen Awake during games)
  const [keepAwake, setKeepAwake] = useState(() => {
    const saved = localStorage.getItem('skunkd_keep_awake');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    let wakeLockSentinel = null;

    const requestLock = async () => {
      if (keepAwake && 'wakeLock' in navigator) {
        try {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.debug('Wake lock request prevented:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && keepAwake) {
        requestLock();
      }
    };

    requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
        wakeLockSentinel = null;
      }
    };
  }, [keepAwake]);

  const toggleKeepAwake = () => {
    setKeepAwake(prev => {
      const next = !prev;
      localStorage.setItem('skunkd_keep_awake', String(next));
      return next;
    });
  };

  function handleApplyRandomRules(selectedKeys) {
    setElectiveRules(ELECTIVE_RULES.reduce((acc, rule) => {
      acc[rule.key] = selectedKeys.includes(rule.key);
      return acc;
    }, {}));
  }
  
  // State for tracking if the app has been opened (defaults to true for standalone app)
  const [appOpened, setAppOpened] = useState(true);
  
  // State for tracking solo mode
  const [isSoloMode, setIsSoloMode] = useState(false);
  
  // Solo mode specific state
  const [skunkLives, setSkunkLives] = useState(6);
  const [skunkLetters, setSkunkLetters] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Load saved game state on app start
  useEffect(() => {
    // Check if the app should open directly (from URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenDirectly = urlParams.get('open') === 'true';
    
    if (shouldOpenDirectly) {
      setAppOpened(true);
      // Clean up the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('open');
      window.history.replaceState({}, '', newUrl.toString());
    }
    
    const savedGameState = localStorage.getItem('skunkd-game-state');
    if (savedGameState) {
      try {
        const gameState = JSON.parse(savedGameState);
        setHasSavedGame(true);
        
        // Restore all the game state
        setGameStarted(gameState.gameStarted || false);
        setPlayers(gameState.players || []);
        setScores(gameState.scores || []);
        setCurrentPlayerIdx(gameState.currentPlayerIdx || 0);
        setEliminated(gameState.eliminated || []);
        setTargetScore(gameState.targetScore || 10000);
        setElectiveRules(gameState.electiveRules || ELECTIVE_RULES.reduce((acc, rule) => {
          acc[rule.key] = false;
          return acc;
        }, {}));
        setWinnerIdx(gameState.winnerIdx || null);
        setOvertime(gameState.overtime || false);
        setLeaderIdx(gameState.leaderIdx || null);
        setLeaderScore(gameState.leaderScore || null);
        setTurnHistory(gameState.turnHistory || []);
        setNotesHistory(gameState.notesHistory || []);
        setPlayerNames(gameState.playerNames || ['', '', '', '']);
        setDetailedTurns(gameState.detailedTurns || []);
        setCurrentTurnNumber(gameState.currentTurnNumber || 1);
        setPowerUpUsage(gameState.powerUpUsage || {});
        
        // Restore solo mode state if it exists
        setIsSoloMode(gameState.isSoloMode || false);
        setSkunkLives(gameState.skunkLives || 6);
        setSkunkLetters(gameState.skunkLetters || []);
        setGameOver(gameState.gameOver || false);
        
        // If there's a saved game, automatically open the app
        setAppOpened(true);
      } catch (error) {
        console.log('Failed to restore game state:', error);
        // Clear corrupted data
        localStorage.removeItem('skunkd-game-state');
        setHasSavedGame(false);
      }
    }
  }, []);

  // Auto-dismiss "Game Resumed" notification after 4 seconds
  useEffect(() => {
    if (hasSavedGame) {
      const timer = setTimeout(() => {
        setHasSavedGame(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasSavedGame]); // Empty dependency array means this runs once on mount

  // Auto-save game state whenever it changes
  useEffect(() => {
    if (gameStarted) {
      const gameState = {
        gameStarted,
        players,
        scores,
        currentPlayerIdx,
        eliminated,
        targetScore,
        electiveRules,
        winnerIdx,
        overtime,
        leaderIdx,
        leaderScore,
        turnHistory,
        notesHistory,
        playerNames,
        detailedTurns,
        currentTurnNumber,
        powerUpUsage,
        // Solo mode state
        isSoloMode,
        skunkLives,
        skunkLetters,
        gameOver
      };
      localStorage.setItem('skunkd-game-state', JSON.stringify(gameState));
    }
  }, [gameStarted, players, scores, currentPlayerIdx, eliminated, targetScore, 
      electiveRules, winnerIdx, overtime, leaderIdx, leaderScore, turnHistory, 
      notesHistory, playerNames, detailedTurns, currentTurnNumber, powerUpUsage, isSoloMode, 
      skunkLives, skunkLetters, gameOver]);

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
      electiveRules: { ...electiveRules },
      powerUpUsage: JSON.parse(JSON.stringify(powerUpUsage))
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
    setPowerUpUsage(previousSnapshot.powerUpUsage || {});
    
    // Remove the used snapshot from history
    setUndoHistory(prev => prev.slice(0, -1));
  }

  function togglePlayerPowerUp(playerIdx, ruleKey) {
    saveGameSnapshot();
    setPowerUpUsage(prev => {
      const playerPu = prev[playerIdx] || {};
      return {
        ...prev,
        [playerIdx]: {
          ...playerPu,
          [ruleKey]: !playerPu[ruleKey]
        }
      };
    });
  }

  function handleRuleChange(ruleKey) {
    setElectiveRules(rules => ({
      ...rules,
      [ruleKey]: !rules[ruleKey]
    }));
  }

  function toggleRuleDescription(ruleKey) {
    setExpandedRules(prev => ({
      ...prev,
      [ruleKey]: !prev[ruleKey]
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

  function handleRemovePlayer(idx) {
    if (playerNames.length <= 1) {
      setPlayerNames(['']);
      return;
    }
    setPlayerNames(playerNames.filter((_, i) => i !== idx));
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
    
    // Reset power-up usage for all players
    setPowerUpUsage({});
    
    // Check if this is solo mode (single player)
    setIsSoloMode(filteredNames.length === 1);
    
    // Reset detailed turn tracking
    setDetailedTurns([]);
    setCurrentTurnNumber(1);
    
    // Reset notes for fresh start
    setNotesHistory([]);
    
    // Clear any previous saved state when starting fresh
    localStorage.removeItem('skunkd-game-state');
    setHasSavedGame(false);
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
    
    if (isSoloMode) {
      // Solo mode: lose a life and earn a letter
      const newLives = skunkLives - 1;
      setSkunkLives(newLives);
      
      // Add the next letter in sequence
      const letterOrder = ['S', 'K', 'U', 'N', 'K', 'D'];
      const nextLetter = letterOrder[skunkLetters.length];
      if (nextLetter) {
        setSkunkLetters(prev => [...prev, nextLetter]);
      }
      
      // Check if game is over (no more lives)
      if (newLives <= 0) {
        setGameOver(true);
        setWinnerIdx(0); // Set winner to the solo player
      }
      
      // In solo mode, no turn switching - player continues
      return;
    }
    
    // Multiplayer mode logic
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
   * Handles when a player rolls Super SKUNK'D (6 unscoring dice with Stinky Super SKUNK'D rule).
   * Resets the player's score on the board to ZERO (0).
   */
  function handleSuperSkunkTurn() {
    if (winnerIdx !== null) return;
    
    // Save snapshot before resetting score to 0
    saveGameSnapshot();
    createSnapshot();
    
    // Record the detailed turn information for Super SKUNK'D
    const turnData = {
      turnNumber: currentTurnNumber,
      playerIdx: currentPlayerIdx,
      playerName: players[currentPlayerIdx],
      pointsBanked: 0,
      wasSkunkd: true,
      wasSuperSkunkd: true,
      inOvertime: overtime,
      timestamp: Date.now()
    };
    setDetailedTurns(prev => [...prev, turnData]);
    setCurrentTurnNumber(prev => prev + 1);
    
    // Reset player's score on the board to 0
    const updatedScores = [...scores];
    updatedScores[currentPlayerIdx] = 0;
    setScores(updatedScores);
    
    if (isSoloMode) {
      const newLives = skunkLives - 1;
      setSkunkLives(newLives);
      const letterOrder = ['S', 'K', 'U', 'N', 'K', 'D'];
      const nextLetter = letterOrder[skunkLetters.length];
      if (nextLetter) {
        setSkunkLetters(prev => [...prev, nextLetter]);
      }
      if (newLives <= 0) {
        setGameOver(true);
        setWinnerIdx(0);
      }
      return;
    }
    
    if (overtime) {
      if (!eliminated[currentPlayerIdx]) {
        const newElim = [...eliminated];
        newElim[currentPlayerIdx] = true;
        setEliminated(newElim);
        
        const active = newElim.filter(e => !e);
        if (active.length === 1) {
          let winnerIndex = -1;
          let highestScore = -1;
          for (let i = 0; i < updatedScores.length; i++) {
            if (!newElim[i] && updatedScores[i] > highestScore) {
              highestScore = updatedScores[i];
              winnerIndex = i;
            }
          }
          setWinnerIdx(winnerIndex);
          return;
        }
      }
      setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated));
      return;
    }
    
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
    
    // Reset solo mode state
    setIsSoloMode(false);
    setSkunkLives(6);
    setSkunkLetters([]);
    setGameOver(false);
    
    // Reset detailed turn tracking
    setDetailedTurns([]);
    setCurrentTurnNumber(1);
    
    // Reset notes for fresh start
    setNotesHistory([]);
    setPowerUpUsage({});
    
    // Clear saved game state
    localStorage.removeItem('skunkd-game-state');
    setHasSavedGame(false);
    
    // Reset app opened state to go back to initial screen
    setAppOpened(false);
  }

  // Open the new-game setup UI (reset game state but keep the setup screen open)
  function openNewGameSetup() {
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
    setIsSoloMode(false);
    setSkunkLives(6);
    setSkunkLetters([]);
    setGameOver(false);
    setDetailedTurns([]);
    setPowerUpUsage({});
    setCurrentTurnNumber(1);
    setNotesHistory([]);
    setHasSavedGame(false);
    // Ensure the app shows the setup screen
    setAppOpened(true);
  }

  // Save game to history
  function saveCompletedGame() {
    const gameData = {
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
    };

    // Add solo mode specific data if it's a solo game
    if (isSoloMode) {
      gameData.skunkLives = skunkLives;
      gameData.skunkLetters = skunkLetters;
      gameData.gameOver = gameOver;
    }

    const newHistory = [...gameHistory, gameData];
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

  // Get array of active rules and powerups for display
  const activeRules = ELECTIVE_RULES.filter(r => electiveRules[r.key]);
  const activePowerUps = ELECTIVE_RULES.filter(r => electiveRules[r.key] && r.isPowerUp);
  
  // Function to get solo score category
  function getSoloScoreCategory(score) {
    if (score === 0) return { category: "STUMP'D", color: "#888" };
    if (score >= 50 && score <= 4950) return { category: "Stinker SKUNK", color: "#ff6b6b" };
    if (score > 5000 && score <= 9999) return { category: "Slick SKUNK", color: "#4ecdc4" };
    if (score >= 10000 && score <= 19999) return { category: "Superior SKUNK", color: "#45b7d1" };
    if (score >= 20000) return { category: "Scent-sational SKUNK", color: "#ffd700" };
    return { category: "No Category", color: "#888" };
  }

  return (
    <div className="app-container">
      {/* Sleek App Header */}
      <div className="glass-panel" style={{ padding: '12px 14px', marginBottom: 14 }}>
        {/* Top Row: Logo & Supporter Badge (Left) + New Game Action (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img 
              src={skunkdLogo} 
              alt="SKUNK'D Logo" 
              style={{ 
                height: '42px',
                maxWidth: '140px',
                objectFit: 'contain',
                cursor: 'pointer'
              }} 
              onClick={() => setShowShopModal(true)}
              title="SKUNK'D - Tap for Games Shop & Creator Hub"
            />
            {isSupporter && (
              <button
                type="button"
                onClick={() => setShowShopModal(true)}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: 'var(--gold-primary)',
                  background: 'rgba(255, 215, 0, 0.18)',
                  border: '1px solid var(--border-gold-glow)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Active Supporter! Tap to open Community Hub"
              >
                👑 Supporter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={toggleKeepAwake}
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: keepAwake ? 'var(--gold-primary)' : 'var(--text-muted)',
                background: keepAwake ? 'rgba(255, 215, 0, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                border: keepAwake ? '1px solid var(--border-gold-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              title={keepAwake ? "Screen stays awake during games (Tap to disable)" : "Screen wake lock disabled (Tap to keep awake)"}
            >
              <span>{keepAwake ? '☀️' : '🌙'}</span>
              <span style={{ fontSize: '0.72rem' }}>{keepAwake ? 'Awake' : 'Sleep'}</span>
            </button>

            {gameStarted && (
              <button
                className="btn btn-primary"
                style={{ 
                  padding: '7px 14px', 
                  fontSize: '0.86rem', 
                  fontWeight: '700',
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  cursor: 'pointer',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setShowNewGameConfirm(true)}
              >
                ➕ New Game
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: 50/50 Split for Past Games & Shop / Support */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(6px, 2vw, 10px)' }}>
          <button
            className="btn btn-outline-gold"
            style={{ 
              padding: '8px 4px', 
              fontSize: 'clamp(0.76rem, 2.8vw, 0.86rem)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 4, 
              cursor: 'pointer',
              borderRadius: '8px',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShowHistory(true)}
          >
            <span>🏆</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Past Games</span>
          </button>
          <button
            className="btn btn-outline-gold"
            style={{ 
              padding: '8px 4px', 
              fontSize: 'clamp(0.76rem, 2.8vw, 0.86rem)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 4, 
              cursor: 'pointer',
              borderRadius: '8px',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShowShopModal(true)}
            title="Get physical game, expansions, or join our Discord community"
          >
            <span>🛍️</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Shop & Community</span>
          </button>
        </div>
      </div>
      
      {/* Dismissible "Game Resumed" Notification Toast */}
      {hasSavedGame && gameStarted && (
        <div className="fade-in" style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981',
          padding: '8px 14px',
          borderRadius: '12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: '0.85rem',
          fontWeight: '600',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✅</span>
            <span>Game Resumed from Previous Session</span>
          </div>
          <button
            type="button"
            onClick={() => setHasSavedGame(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1
            }}
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
      
      <GameHistoryModal
        history={gameHistory}
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onDeleteGame={(gameIdx) => {
          const newHistory = gameHistory.filter((_, idx) => idx !== gameIdx);
          setGameHistory(newHistory);
          saveGameHistory(newHistory);
        }}
      />
      
      <GameShopModal
        open={showShopModal}
        onClose={() => setShowShopModal(false)}
        isSupporter={isSupporter}
        onSupport={handleSupport}
      />
      
      <RuleRandomizerModal
        open={showRuleRandomizer}
        onClose={() => setShowRuleRandomizer(false)}
        currentRules={electiveRules}
        onApplyRules={handleApplyRandomRules}
      />
      {!appOpened ? (
        // Initial welcome screen
        <div className="glass-panel" style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          margin: '20px auto'
        }}>
          <img 
            src={skunkdLogo} 
            alt="SKUNK'D Logo" 
            style={{ 
              height: '100px',
              maxWidth: '300px',
              objectFit: 'contain',
              marginBottom: '20px'
            }} 
          />
          <h1 style={{ 
            color: 'var(--gold-primary)', 
            fontSize: '2.2rem', 
            marginBottom: '12px',
            letterSpacing: '0.02em'
          }}>
            Welcome to SKUNK'D
          </h1>
          <p style={{ 
            fontSize: '1.05rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            The official digital scorecard for your SKUNK'D dice games.
          </p>
          <button 
            className="btn btn-primary"
            onClick={openApp}
            style={{
              padding: '14px 32px',
              fontSize: '1.15rem',
              cursor: 'pointer'
            }}
          >
            🎲 Open Scorecard
          </button>
        </div>
      ) : !gameStarted ? (
        <div className="glass-panel" style={{ padding: '20px 16px', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--gold-primary)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            🎲 New Game Setup
          </h2>

          {/* Section: Players */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Players ({playerNames.filter(n => n.trim()).length || 1})
              </label>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playerNames.map((name, idx) => {
                const avatarColors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];
                const avatarColor = avatarColors[idx % avatarColors.length];
                return (
                  <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: avatarColor,
                      color: '#fff',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 0 10px ${avatarColor}55`
                    }}>
                      P{idx + 1}
                    </div>
                    <input
                      type="text"
                      className="modern-input"
                      placeholder={`Player ${idx + 1} Name`}
                      value={name}
                      onChange={e => handleNameChange(idx, e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 4px', fontSize: '1.05rem' }}
                    />
                    {playerNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          color: '#ef4444',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove player"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn btn-outline-gold"
              onClick={handleAddPlayer}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ➕ Add Another Player
            </button>
          </div>

            {/* Section: Target Score */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Target Score
              </label>
              
              <div className="target-score-grid" style={{ marginBottom: 10 }}>
                {[5000, 10000, 15000, 20000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetScore(val)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '10px',
                      border: targetScore === val ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: targetScore === val ? 'var(--gold-gradient)' : 'rgba(15, 23, 42, 0.7)',
                      color: targetScore === val ? '#0f172a' : '#cbd5e1',
                      fontWeight: '700',
                      fontSize: 'clamp(0.78rem, 2.7vw, 0.9rem)',
                      cursor: 'pointer',
                      minWidth: 0,
                      boxShadow: targetScore === val ? '0 0 12px rgba(255, 215, 0, 0.3)' : 'none'
                    }}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 8 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Custom Target:</span>
              <input
                type="number"
                min={1000}
                step={100}
                className="modern-input"
                value={targetScore}
                onChange={e => setTargetScore(parseInt(e.target.value, 10) || 10000)}
                style={{ flex: 1, padding: '4px 8px', fontWeight: 'bold', color: 'var(--gold-primary)', background: 'transparent', border: 'none' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pts</span>
            </div>
          </div>

          {/* Section: Elective Rules */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 6, flexWrap: 'nowrap' }}>
              <label style={{ fontSize: 'clamp(0.75rem, 2.7vw, 0.85rem)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: 0 }}>
                Elective Rules ({Object.values(electiveRules).filter(Boolean).length} Active)
              </label>

              <button
                type="button"
                className="btn btn-outline-gold"
                style={{
                  padding: '5px 8px',
                  fontSize: 'clamp(0.72rem, 2.5vw, 0.8rem)',
                  fontWeight: '700',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  background: 'rgba(255, 215, 0, 0.12)',
                  borderColor: 'var(--border-gold-glow)',
                  color: 'var(--gold-primary)',
                  boxShadow: '0 2px 10px rgba(255, 215, 0, 0.2)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setShowRuleRandomizer(true)}
                title="Roll a die and spin slot reels for random rules"
              >
                <span>🎰</span>
                <span>Randomize Rules</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ELECTIVE_RULES.map(rule => {
                const isChecked = !!electiveRules[rule.key];
                const isExpanded = !!expandedRules[rule.key];
                return (
                  <div
                    key={rule.key}
                    className="glass-card"
                    style={{
                      padding: '10px 12px',
                      borderColor: isChecked ? 'var(--border-gold-glow)' : 'rgba(255, 255, 255, 0.08)',
                      background: isChecked ? 'rgba(35, 45, 66, 0.85)' : 'rgba(20, 26, 38, 0.65)'
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1, gap: 10, userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isChecked}
                          onChange={() => handleRuleChange(rule.key)}
                        />
                        <span style={{ fontWeight: isChecked ? '700' : '600', color: isChecked ? 'var(--gold-primary)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {rule.label}
                        </span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => toggleRuleDescription(rule.key)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: 'var(--text-muted)',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Rule details"
                        >
                          Info {isExpanded ? '▲' : '▼'}
                        </button>

                        {rule.img && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setViewingCard(rule);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            title="Tap to view card full screen"
                          >
                            <img
                              src={rule.img}
                              alt={rule.label}
                              style={{
                                height: 36,
                                borderRadius: 4,
                                border: '1.5px solid var(--gold-primary)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                                pointerEvents: 'none'
                              }}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="fade-in"
                        style={{
                          marginTop: 8,
                          padding: '8px 10px',
                          background: 'rgba(10, 14, 22, 0.75)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          borderLeft: '3px solid var(--gold-primary)',
                          lineHeight: '1.45'
                        }}
                      >
                        {rule.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Big Start Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={startGame}
            disabled={playerNames.every(n => !n.trim())}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1.15rem',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: playerNames.every(n => !n.trim()) ? 'not-allowed' : 'pointer',
              opacity: playerNames.every(n => !n.trim()) ? 0.5 : 1
            }}
          >
            🎲 START GAME {playerNames.filter(n => n.trim()).length > 0 && `(${playerNames.filter(n => n.trim()).length} Player${playerNames.filter(n => n.trim()).length > 1 ? 's' : ''})`}
          </button>
        </div>
      ) : (
        <div>
          {/* Active Rule Cards Strip */}
          {activeRules.length > 0 && (
            <div className="glass-card" style={{ margin: '0 0 14px 0', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-primary)', marginBottom: 8 }}>
                📜 Active Elective Rules
              </div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                {activeRules.map(rule => (
                  <div
                    key={rule.key}
                    onClick={() => setViewingCard(rule)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-gold-glow)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {rule.img && (
                      <img
                        src={rule.img}
                        alt={rule.label}
                        style={{ height: 28, borderRadius: 3 }}
                      />
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isSoloMode ? (
            // SOLO SKUNK'D Layout
            <div>
              <div className="glass-panel" style={{ 
                padding: '20px 16px',
                marginBottom: '16px'
              }}>
                <h2 style={{ 
                  textAlign: 'center', 
                  color: 'var(--gold-primary)', 
                  marginBottom: '16px',
                  fontSize: '1.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  🦨 SOLO SKUNK'D
                </h2>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: '20px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '12px 16px',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Player: <strong>{players[0]}</strong></div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gold-primary)' }}>
                      {scores[0].toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>pts</span>
                    </div>
                    {scores[0] > 0 && (
                      <div style={{ 
                        color: getSoloScoreCategory(scores[0]).color, 
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {getSoloScoreCategory(scores[0]).category}
                      </div>
                    )}
                    {activePowerUps.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {activePowerUps.map(pu => {
                          const isUsed = !!(powerUpUsage[0] && powerUpUsage[0][pu.key]);
                          return (
                            <button
                              key={pu.key}
                              type="button"
                              onClick={() => togglePlayerPowerUp(0, pu.key)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                border: isUsed ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-gold-glow)',
                                background: isUsed ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 215, 0, 0.15)',
                                color: isUsed ? 'var(--text-muted)' : 'var(--gold-primary)',
                                textDecoration: isUsed ? 'line-through' : 'none',
                                opacity: isUsed ? 0.6 : 1
                              }}
                              title={isUsed ? `${pu.label} used. Tap to restore.` : `${pu.label} ready. Tap to mark used.`}
                            >
                              <span>{pu.powerUpIcon}</span>
                              <span>{pu.badgeLabel || pu.label}</span>
                              <span>{isUsed ? '✕ Used' : '✓ Ready'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      SKUNK Lives: <strong>{skunkLives}/6</strong>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px', 
                      justifyContent: 'flex-end',
                      marginBottom: '6px'
                    }}>
                      {['S', 'K', 'U', 'N', 'K', 'D'].map((letter, idx) => (
                        <div key={idx} style={{
                          width: '26px',
                          height: '26px',
                          border: '1.5px solid var(--gold-primary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13px',
                          backgroundColor: idx < skunkLetters.length ? 'var(--gold-primary)' : 'transparent',
                          color: idx < skunkLetters.length ? '#0f172a' : 'var(--gold-primary)'
                        }}>
                          {letter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {gameOver ? (
                  <div className="glass-panel" style={{ 
                    textAlign: 'center', 
                    padding: '24px 16px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1.5px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '16px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '1.5rem' }}>Game Over!</h3>
                    <div style={{ fontSize: '1.2rem', color: '#fff' }}>
                      Final Score: <strong>{scores[0].toLocaleString()}</strong>
                    </div>
                    <div style={{ 
                      color: getSoloScoreCategory(scores[0]).color, 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      marginTop: '8px'
                    }}>
                      {getSoloScoreCategory(scores[0]).category}
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowResetConfirm(true)}
                      style={{
                        marginTop: '18px',
                        padding: '12px 24px',
                        cursor: 'pointer'
                      }}
                    >
                      🎲 Play Again
                    </button>
                  </div>
                ) : (
                  <TurnManagerManual
                    playerName={players[0]}
                    eliminated={false}
                    leaderScore={null}
                    playerScore={scores[0]}
                    overtime={false}
                    onScoreBoard={handleBankPoints}
                    onSkunkTurn={handleSkunkTurn}
                    onSuperSkunkTurn={handleSuperSkunkTurn}
                    onEndTurn={() => {}}
                    winnerIdx={null}
                    scores={scores}
                    players={players}
                    onSaveGame={saveCompletedGame}
                    notesHistory={notesHistory}
                    onNotesChange={handleNotesChange}
                    globalUndoAvailable={undoHistory.length > 0}
                    onGlobalUndo={handleGlobalUndo}
                    isSoloMode={true}
                    activeRules={activeRules}
                    activePowerUps={activePowerUps}
                    currentPowerUpUsage={powerUpUsage[0] || {}}
                    onTogglePowerUp={(ruleKey) => togglePlayerPowerUp(0, ruleKey)}
                    onOpenShop={() => setShowShopModal(true)}
                  />
                )}
              </div>
            </div>
          ) : (
            // MULTIPLAYER Layout
            <>
              <div className="glass-panel" style={{ padding: '16px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ margin: 0, color: 'var(--gold-primary)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🏆 Scoreboard
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Goal: <strong style={{ color: 'var(--gold-primary)' }}>{targetScore.toLocaleString()}</strong> pts
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {players.map((name, idx) => {
                    const isCurrent = idx === currentPlayerIdx && winnerIdx === null;
                    const isWinner = winnerIdx === idx;
                    const isLeader = leaderIdx === idx && overtime;
                    const isElim = eliminated[idx] && overtime;
                    const avatarColors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];
                    const avatarColor = avatarColors[idx % avatarColors.length];

                    return (
                      <div
                        key={idx}
                        className={`player-score-strip ${isCurrent ? 'current-player' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: avatarColor,
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 8px ${avatarColor}55`,
                            flexShrink: 0
                          }}>
                            P{idx + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className="player-name-text" style={{ color: isCurrent ? 'var(--gold-primary)' : 'var(--text-primary)', fontWeight: '700' }}>
                                {name}
                              </span>
                              {isWinner && <span className="status-badge badge-gold">👑 Winner</span>}
                              {isLeader && <span className="status-badge badge-gold">👑 Leader</span>}
                              {isElim && <span className="status-badge badge-red">💀 Eliminated</span>}
                            </div>
                            {isCurrent && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: '600', marginTop: 1 }}>
                                ● Currently Rolling
                              </div>
                            )}
                            {activePowerUps.length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                {activePowerUps.map(pu => {
                                  const isUsed = !!(powerUpUsage[idx] && powerUpUsage[idx][pu.key]);
                                  return (
                                    <button
                                      key={pu.key}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlayerPowerUp(idx, pu.key);
                                      }}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        padding: '2px 6px',
                                        borderRadius: '6px',
                                        fontSize: '0.66rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        border: isUsed ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-gold-glow)',
                                        background: isUsed ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 215, 0, 0.15)',
                                        color: isUsed ? 'var(--text-muted)' : 'var(--gold-primary)',
                                        textDecoration: isUsed ? 'line-through' : 'none',
                                        opacity: isUsed ? 0.6 : 1,
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                      }}
                                      title={isUsed ? `${pu.label} Spray used by ${name}. Tap to restore.` : `${pu.label} Spray available for ${name}. Tap to mark used.`}
                                    >
                                      <span>{pu.powerUpIcon}</span>
                                      <span>{pu.badgeLabel || pu.label}</span>
                                      <span>{isUsed ? '✕' : '✓'}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: isWinner ? 'var(--gold-primary)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                            {scores[idx].toLocaleString()}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {winnerIdx === null ? (
                <TurnManagerManual
                  playerName={players[currentPlayerIdx]}
                  eliminated={eliminated[currentPlayerIdx]}
                  leaderScore={leaderScore}
                  playerScore={scores[currentPlayerIdx]}
                  overtime={overtime}
                  onScoreBoard={handleBankPoints}
                  onSkunkTurn={handleSkunkTurn}
                  onSuperSkunkTurn={handleSuperSkunkTurn}
                  onEndTurn={() => setCurrentPlayerIdx(getNextActivePlayerIdx(currentPlayerIdx, eliminated))}
                  winnerIdx={winnerIdx}
                  scores={scores}
                  players={players}
                  onSaveGame={saveCompletedGame}
                  notesHistory={notesHistory}
                  onNotesChange={handleNotesChange}
                  globalUndoAvailable={undoHistory.length > 0}
                  onGlobalUndo={handleGlobalUndo}
                  isSoloMode={false}
                  activeRules={activeRules}
                  setDenPointsForScoreboard={val => setPotentialDenPoints(val)}
                  activePowerUps={activePowerUps}
                  currentPowerUpUsage={powerUpUsage[currentPlayerIdx] || {}}
                  onTogglePowerUp={(ruleKey) => togglePlayerPowerUp(currentPlayerIdx, ruleKey)}
                  onOpenShop={() => setShowShopModal(true)}
                />
              ) : (
                <div className="glass-panel" style={{ padding: '28px 16px', textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>👑</div>
                  <h2 style={{ color: 'var(--gold-primary)', fontSize: '1.6rem', margin: '0 0 6px 0' }}>
                    {players[winnerIdx]} WINS!
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 20 }}>
                    Final Winning Score: <strong>{scores[winnerIdx].toLocaleString()}</strong> points
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowResetConfirm(true)}
                    style={{ padding: '12px 28px', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    🎲 Play Again
                  </button>
                </div>
              )}
            </>
          )}
          
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button 
              className="btn btn-outline-gold"
              onClick={handleUndoLastTurnClick}
              disabled={turnHistory.length === 0}
              style={{ 
                flex: 1,
                padding: "10px 14px",
                fontSize: "0.9rem",
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: turnHistory.length === 0 ? "not-allowed" : "pointer",
                opacity: turnHistory.length === 0 ? 0.4 : 1
              }}
              title={turnHistory.length === 0 ? "No turns to undo" : "Undo the last completed turn"}
            >
              🔄 Undo Last Turn
            </button>
          </div>
          {/* Confirmation Dialog for Reset Game */}
          {showResetConfirm && (
            <div className="confirm-dialog-overlay" onClick={() => setShowResetConfirm(false)}>
              <div className="confirm-dialog fade-in" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--gold-primary)' }}>Reset Game?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
                  Are you sure you want to reset? This will end the current game and return to the setup screen. All progress will be lost.
                </p>
                <div className="confirm-dialog-buttons">
                  <button 
                    className="confirm-yes"
                    onClick={() => {
                      resetGame();
                      setShowResetConfirm(false);
                    }}
                  >
                    Yes, Reset
                  </button>
                  <button 
                    className="confirm-no"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Dialog for Undo Turn */}
          {showUndoConfirm && (
            <div className="confirm-dialog-overlay" onClick={() => setShowUndoConfirm(false)}>
              <div className="confirm-dialog fade-in" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🔄</div>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--gold-primary)' }}>Undo Last Turn?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
                  Are you sure you want to undo the last turn? This will revert the points and active player turn.
                </p>
                <div className="confirm-dialog-buttons">
                  <button 
                    className="confirm-yes"
                    style={{ background: 'var(--gold-gradient)', color: '#0f172a' }}
                    onClick={() => {
                      handleUndoTurn();
                      setShowUndoConfirm(false);
                    }}
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

      {/* Confirmation Dialog for New Game (Root level) */}
      {showNewGameConfirm && (
        <div className="confirm-dialog-overlay" onClick={() => setShowNewGameConfirm(false)}>
          <div className="confirm-dialog fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🎲</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--gold-primary)' }}>Start New Game?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
              This will clear the current in-progress game and return to game setup. Are you sure you want to continue?
            </p>
            <div className="confirm-dialog-buttons">
              <button 
                className="confirm-yes"
                style={{ background: 'var(--gold-gradient)', color: '#0f172a' }}
                onClick={() => {
                  setShowNewGameConfirm(false);
                  openNewGameSetup();
                }}
              >
                Yes, New Game
              </button>
              <button 
                className="confirm-no"
                onClick={() => setShowNewGameConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Card Viewer Modal */}
      {viewingCard && (
        <div
          onClick={() => setViewingCard(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1c1c1c 0%, #292929 100%)',
              padding: '20px 16px 16px 16px',
              borderRadius: '16px',
              border: '2px solid #ffd700',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.85)',
              position: 'relative',
              boxSizing: 'border-box',
              cursor: 'default',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setViewingCard(null)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                fontSize: '1.2em',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
              aria-label="Close"
            >
              ✕
            </button>
            
            <img
              src={viewingCard.img}
              alt={viewingCard.label}
              style={{
                maxHeight: '52vh',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '10px',
                marginTop: 6,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)'
              }}
            />
            <h2 style={{ color: '#ffd700', margin: '14px 0 6px 0', fontSize: '1.4em' }}>
              {viewingCard.label}
            </h2>
            <p style={{ color: '#eee', margin: '0 0 14px 0', fontSize: '0.95em', lineHeight: '1.45', maxWidth: '380px' }}>
              {viewingCard.description}
            </p>
            <button
              onClick={() => setViewingCard(null)}
              style={{
                background: '#ffd700',
                color: '#222',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 28px',
                fontWeight: 'bold',
                fontSize: '1em',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function saveGameHistory(history) {
  try {
    // If caller passed the full history array, persist it directly
    if (Array.isArray(history)) {
      setGameHistory(history);
      try {
        localStorage.setItem('skunkdGameHistory', JSON.stringify(history));
      } catch (e) {
        console.warn('Failed to persist game history to localStorage:', e);
      }
      return;
    }

    // Otherwise treat the argument as a single game object and prepend it
    const existing = loadGameHistory() || [];
    const next = [history, ...existing];
    setGameHistory(next);
    try {
      localStorage.setItem('skunkdGameHistory', JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to persist game history to localStorage:', e);
    }
  } catch (err) {
    console.error('saveGameHistory error:', err);
  }
}