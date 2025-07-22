import React, { useState } from 'react';
import { scoreRoll, getScoringDiceIndexes } from './scoringEngine';

const diceImages = [
  '/dice1.png', '/dice2.png', '/dice3.png', '/dice4.png', '/dice5.png', '/dice6.png'
];

function DiceRow({ dice, highlightIndexes = [], selectableIndexes = [], onToggle }) {
  return (
    <div style={{ display: 'flex', gap: '10px', padding: '6px 0' }}>
      {dice.map((val, idx) => (
        <div
          key={idx}
          onClick={onToggle && selectableIndexes.includes(idx) ? () => onToggle(idx) : undefined}
          style={{
            background: '#111',
            border: highlightIndexes.includes(idx) ? '3px solid #0f0' :
              selectableIndexes.includes(idx) && onToggle ? '2px solid #ffa500' : '1px solid #888',
            borderRadius: '12px',
            cursor: selectableIndexes.includes(idx) && onToggle ? 'pointer' : 'default',
            opacity: selectableIndexes.includes(idx) ? 1 : 0.8,
            width: 58,
            height: 70,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img src={diceImages[val - 1]} alt={`Die ${val}`} width={48} height={48} />
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

export default function TurnManager({
  diceRoller,
  manualMode,
  onScoreBoard,
  electiveRules,
  onEndTurn,
  overtime,
  leaderScore,
  eliminated,
  playerName
}) {
  const [den, setDen] = useState([]);
  const [denPoints, setDenPoints] = useState(0);
  const [sequenceDice, setSequenceDice] = useState(6);
  const [turnEnded, setTurnEnded] = useState(false);
  const [skunkd, setSkunkd] = useState(false);
  const [superSkunkd, setSuperSkunkd] = useState(false);
  const [rolledDice, setRolledDice] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [message, setMessage] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [recentSetAside, setRecentSetAside] = useState([]);
  const [denMegas, setDenMegas] = useState([]); // {value, count} for mega bonus

  // Roll dice
  function rollDice(numDice) {
    const roll = diceRoller(numDice);
    setRolledDice(roll);
    setSelectedIndexes([]);
    setMessage('');
    // Forced den fill: If all dice are scoring, must set aside all
    const scoringIndexes = getScoringDiceIndexes(roll, { megas: denMegas });
    if (scoringIndexes.length === roll.length) {
      setSelectedIndexes(scoringIndexes);
      setMessage('All dice are scoring! You must set aside all dice and roll again.');
    }
  }

  // Dice selection logic
  function toggleDice(idx) {
    const scoringIndexes = getScoringDiceIndexes(rolledDice, { megas: denMegas });
    if (!scoringIndexes.includes(idx)) return;
    setSelectedIndexes(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  }

  // Confirm set aside dice (per roll basis, MEGA flexibility)
  function confirmSetAside() {
    if (selectedIndexes.length === 0) {
      setMessage('You must select at least one scoring die!');
      return;
    }

    // Only consider what the player actually selected
    const selectedVals = selectedIndexes.map(i => rolledDice[i]);

    // Count in current roll: for validation
    const countsInRoll = {};
    rolledDice.forEach(v => { countsInRoll[v] = (countsInRoll[v] || 0) + 1; });

    // For each value with 3+ in this roll, if player selects any of them, require at least 3 selected
    for (const val of Object.keys(countsInRoll)) {
      const numInRoll = countsInRoll[val];
      const numSelected = selectedVals.filter(v => v === Number(val)).length;
      if (numInRoll >= 3 && numSelected > 0 && numSelected < 3) {
        setMessage(`To set aside ${val}s for a MEGA, you must select at least 3 of them.`);
        return;
      }
    }

    // Score set-aside dice, considering MEGA/MEGA BONUS
    const score = scoreRoll({
      dice: selectedVals,
      denState: { megas: denMegas },
      denFilled: den.length + selectedVals.length === 6,
      electiveRules
    });

    // Skunk'd detection
    if (score.isSkunkd) {
      setSkunkd(true);
      setSuperSkunkd(score.superSkunkd);
      setMessage(score.superSkunkd
        ? 'Super SKUNK’D! All six dice were non-scoring. Next player!'
        : 'SKUNK’D! No scoring dice. Next player!');
      setDenPoints(0);
      setRecentSetAside([]);
      setRolledDice([]);
      setSelectedIndexes([]);
      return;
    }

    // Only add selected dice to den
    const newDen = [...den, ...selectedVals];
    setDen(newDen);
    setDenPoints(denPoints + score.points);
    setRecentSetAside(selectedVals);

    // Track MEGAs in den for bonus (only 2,3,4,6)
    let newMegas = denMegas.slice();
    [2, 3, 4, 6].forEach(val => {
      const totalCount = newDen.filter(d => d === val).length;
      if (totalCount >= 3) {
        const idx = newMegas.findIndex(m => m.value === val);
        if (idx >= 0) newMegas[idx].count = totalCount;
        else newMegas.push({ value: val, count: totalCount });
      }
    });
    setDenMegas(newMegas);

    // All dice set aside? Sequence resets!
    if (newDen.length === 6) {
      setMessage('Den filled! Rolling all 6 dice again...');
      setSequenceDice(6);
      setRolledDice([]);
      setSelectedIndexes([]);
      setRecentSetAside([]);
    } else {
      setSequenceDice(6 - newDen.length);
      setRolledDice([]);
      setSelectedIndexes([]);
      setRecentSetAside([]);
      setMessage('Roll the remaining dice.');
    }
  }

  function endTurn(skunked = false) {
    setTurnEnded(true);
    onScoreBoard(skunked ? 0 : denPoints);
    setMessage(skunked ? 'SKUNK’D! No points banked.' : 'Turn ended! Points banked.');
    setDen([]);
    setDenPoints(0);
    setSequenceDice(6);
    setRolledDice([]);
    setSelectedIndexes([]);
    setSkunkd(false);
    setSuperSkunkd(false);
    setManualInput('');
    setTurnEnded(false);
    setRecentSetAside([]);
    setDenMegas([]);
    if (onEndTurn) onEndTurn();
  }

  // Manual mode
  function manualAddPoints() {
    const pts = parseInt(manualInput, 10);
    if (!isNaN(pts)) {
      setDenPoints(denPoints + pts);
      setManualInput('');
    }
  }

  function manualSkunkd() {
    setDenPoints(0);
    setMessage('SKUNK’D! No points banked.');
    endTurn(true);
  }

  return (
    <div>
      <h2>Turn Manager {playerName ? `- ${playerName}` : ''}</h2>
      {eliminated ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>Eliminated from overtime!</p>
      ) : manualMode ? (
        <div>
          <p>Manual Mode: Enter points for this sequence</p>
          <input
            type="number"
            min="0"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
          />
          <button onClick={manualAddPoints}>Add Points</button>
          <button onClick={() => endTurn(false)}>End Turn & Bank Points</button>
          <button
            style={{ background: '#222', color: '#ffd700', fontWeight: 'bold', marginLeft: 12 }}
            onClick={manualSkunkd}
          >
            SKUNK’D: Pass Turn (No Points)
          </button>
          <p>Den Points: {denPoints}</p>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <p>Dice left to roll in this sequence: {sequenceDice}</p>
          {/* Current Roll */}
          {rolledDice.length > 0 && !skunkd && (
            <div>
              <h4>Current Roll:</h4>
              <DiceRow
                dice={rolledDice}
                highlightIndexes={selectedIndexes}
                selectableIndexes={getScoringDiceIndexes(rolledDice, { megas: denMegas })}
                onToggle={toggleDice}
              />
              <button onClick={confirmSetAside}>Confirm Set Aside</button>
            </div>
          )}
          {/* Recent set aside this roll */}
          {recentSetAside.length > 0 && (
            <div>
              <h4>Just Set Aside:</h4>
              <DiceRow dice={recentSetAside} />
            </div>
          )}
          {/* Full den */}
          {den.length > 0 && (
            <div>
              <h4>Full Den This Sequence:</h4>
              <DiceRow dice={den} />
            </div>
          )}
          {/* Roll button */}
          {rolledDice.length === 0 && !turnEnded && !skunkd && (
            <button onClick={() => rollDice(sequenceDice)}>Roll Dice</button>
          )}
          <button onClick={() => endTurn(false)} disabled={turnEnded || skunkd}>End Turn & Bank Points</button>
          <p>Den Points: {denPoints}</p>
          <p>{message}</p>
          {/* Skunk'd state */}
          {skunkd && (
            <div>
              <p style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 22 }}>
                {superSkunkd ? 'SUPER SKUNK’D! All six dice were non-scoring.' : 'SKUNK’D! No scoring dice.'}
              </p>
              <button
                style={{ background: '#222', color: '#ffd700', fontWeight: 'bold', marginTop: 8 }}
                onClick={() => endTurn(true)}
              >
                Next Player
              </button>
            </div>
          )}
        </div>
      )}
      {/* Overtime Info */}
      {overtime && (
        <div style={{ marginTop: '10px', color: '#FFD700' }}>
          <strong>OVERTIME!</strong> Leader's Score to Beat: {leaderScore}
        </div>
      )}
    </div>
  );
}