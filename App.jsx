import React, { useState } from 'react';
import NewGameSetup from './NewGameSetup';
import Scorecard from './Scorecard';
import { calculateScore, checkWinCondition, useMulligan, useSixTwoEven } from './scoringEngine';

function App() {
  const [screen, setScreen] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [activeRules, setActiveRules] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [turnState, setTurnState] = useState({ dice: [], history: [], message: '' });
  const [gameOver, setGameOver] = useState(false);

  // Start a new game
  const handleStart = ({ players: setupPlayers, activeRules: rules }) => {
    // Add score/mulligan/sixTwoEven tracking to each player
    const playersWithState = setupPlayers.map(p => ({
      ...p,
      score: 0,
      mulliganUsed: false,
      sixTwoEvenUsed: false
    }));
    setPlayers(playersWithState);
    setActiveRules(rules);
    setCurrentPlayer(0);
    setTurnState({ dice: [], history: [], message: '' });
    setGameOver(false);
    setScreen('scorecard');
  };

  // Handle turn actions
  const handleAction = (action) => {
    if (gameOver) return;
    let newTurn = { ...turnState, message: '' };
    let newPlayers = [...players];
    let player = newPlayers[currentPlayer];

    if (action === 'roll') {
      // Example: roll 6 dice, values 2-6 and 'SKUNK'
      const diceValues = [2, 3, 4, 5, 6, 'SKUNK'];
      const dice = Array.from({ length: 6 }, () =>
        diceValues[Math.floor(Math.random() * diceValues.length)]
      );
      newTurn.dice = dice;
      newTurn.history = [...(newTurn.history || []), ...dice.map(d => ({ die: d, player: player.name }))];

      // Score calculation
      const score = calculateScore({
        dice,
        activeRules,
        turnHistory: newTurn.history
      });

      // Stinky Super SKUNK'D effect handled in scoringEngine: if dice score zero, message
      if (score === 0 && activeRules.stinkySuperSkunkd) {
        player.score = 0;
        newTurn.message = `Super SKUNK'D! ${player.name}'s board score reset to zero.`;
      } else {
        player.score += score;
        newTurn.message = `${player.name} rolled: ${dice.join(', ')} and scored ${score} points.`;
      }

      // Win condition check
      const win = checkWinCondition({
        gameState: { players: newPlayers },
        activeRules,
        turnHistory: newTurn.history
      });
      if (win?.winner) {
        setGameOver(true);
        newTurn.message += `\n${win.winner.name} wins! (${win.reason})`;
      }
      setPlayers(newPlayers);
      setTurnState(newTurn);
    }

    if (action === 'endTurn') {
      // Next player's turn
      setCurrentPlayer((currentPlayer + 1) % players.length);
      setTurnState({ dice: [], history: [], message: '' });
    }

    if (action === 'mulligan') {
      // Only once per player
      if (!player.mulliganUsed) {
        player.mulliganUsed = true;
        setTurnState({ dice: [], history: [], message: `${player.name} used their Mulligan!` });
      }
      setPlayers(newPlayers);
    }

    if (action === 'sixTwoEven') {
      // Only once per player, prompt for change (simple default: 6s to 2s)
      if (!player.sixTwoEvenUsed) {
        player.sixTwoEvenUsed = true;
        // Transform dice in turnState
        const dice = turnState.dice.map(d => d === 6 ? 2 : d);
        newTurn.dice = dice;
        newTurn.message = `${player.name} changed all 6s to 2s!`;
        setTurnState(newTurn);
      }
      setPlayers(newPlayers);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '24px', background: '#f4f6fc', borderRadius: '12px', minHeight: '80vh' }}>
      <h1>Skunk Scorecard</h1>
      {screen === 'setup' && <NewGameSetup onStart={handleStart} />}
      {screen === 'scorecard' &&
        <Scorecard
          players={players}
          activeRules={activeRules}
          currentPlayer={currentPlayer}
          turnState={turnState}
          onAction={handleAction}
        />}
      {gameOver && (
        <div style={{ marginTop: '24px', fontSize: '1.2em', color: '#b00', padding: '12px', background: '#ffeaea', borderRadius: '8px' }}>
          Game Over!
          <button style={{ marginLeft: '24px' }} onClick={() => setScreen('setup')}>Start New Game</button>
        </div>
      )}
    </div>
  );
}

export default App;