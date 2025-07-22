// Modular scoring engine for elective rule-based gameplay

// Example: basic score calculation for a turn
export function calculateScore({ dice, activeRules, turnHistory }) {
  let score = baseScore(dice);

  // --- Elective Rule Effects ---
  // Mega+ (doubles 5s and SKUNK icons)
  if (activeRules.megaPlus) {
    score += megaPlusBonus(dice);
  }

  // Pungent (double/triple for large scores)
  if (activeRules.pungent) {
    if (score >= 5000) score *= 3;
    else if (score >= 2000) score *= 2;
  }

  // Slow Boat (6 SKUNKs or 6 5s one at a time)
  if (activeRules.slowBoat && isSlowBoatEvent(turnHistory)) {
    score *= 5;
  }

  // Stripes+ (three consecutive pairs)
  if (activeRules.stripesPlus && isStripesPlusEvent(dice)) {
    score += stripesPlusBonus(dice);
  }

  // Single Cinco (six 5s one at a time)
  if (activeRules.singleCinco && isSingleCincoEvent(turnHistory)) {
    score += 3000; // Award bonus
  }

  // Countdown (special win condition)
  // Handled in checkWinCondition

  // Stinky Super SKUNK'D (reset if all dice score nothing)
  if (activeRules.stinkySuperSkunkd && isSuperSkunkd(dice)) {
    score = 0; // Or trigger board score reset in game state
  }

  return score;
}

// --- Rule Helper Functions ---

function baseScore(dice) {
  // Example: calculate score from dice (classic rules)
  // Customize for your game!
  let score = 0;
  // Count 2s, 3s, 4s, 5s, 6s, SKUNK icons
  for (const die of dice) {
    if (die === 2 || die === 3 || die === 4 || die === 6) score += 100;
    if (die === 5) score += 50;
    if (die === 'SKUNK') score += 100;
  }
  return score;
}

function megaPlusBonus(dice) {
  // Add bonus points for extra 5s/SKUNKs under Mega+ rules
  let bonus = 0;
  let fives = dice.filter(d => d === 5).length;
  let skunks = dice.filter(d => d === 'SKUNK').length;
  if (fives > 1) bonus += (fives - 1) * 500;
  if (skunks > 1) bonus += (skunks - 1) * 1000;
  return bonus;
}

function isSlowBoatEvent(turnHistory) {
  // Check if player rolled six SKUNKs or six 5s one at a time
  let lastSix = turnHistory.slice(-6);
  let allFives = lastSix.every(t => t.die === 5);
  let allSkunks = lastSix.every(t => t.die === 'SKUNK');
  return allFives || allSkunks;
}

function isStripesPlusEvent(dice) {
  // Check for three pairs that are numerically consecutive
  let counts = {};
  dice.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
  let pairs = Object.entries(counts).filter(([_, c]) => c >= 2).map(([v]) => Number(v)).sort((a, b) => a - b);
  // Find three consecutive numbers (e.g., 3,4,5)
  for (let i = 0; i < pairs.length - 2; i++) {
    if (pairs[i + 1] === pairs[i] + 1 && pairs[i + 2] === pairs[i] + 2) return true;
  }
  return false;
}
function stripesPlusBonus(dice) { return 2000; } // 3,000 pts total, so 2,000 bonus over normal

function isSingleCincoEvent(turnHistory) {
  // Last six rolls were all single 5s
  let lastSix = turnHistory.slice(-6);
  return lastSix.length === 6 && lastSix.every(t => t.die === 5);
}

function isSuperSkunkd(dice) {
  // None of the dice score
  return dice.every(d => !isScoringDie(d));
}
function isScoringDie(die) {
  // Define what counts as a scoring die
  return [2, 3, 4, 5, 6, 'SKUNK'].includes(die);
}

// --- Win Condition Checks ---

export function checkWinCondition({ gameState, activeRules, turnHistory }) {
  // Countdown win
  if (activeRules.countdown && isCountdownWin(turnHistory)) {
    return { winner: turnHistory[turnHistory.length - 1].player, reason: "Countdown Win!" };
  }
  // Extreme/Pungent: custom target score (e.g., 20,000)
  const targetScore = (activeRules.extreme || activeRules.pungent) ? 20000 : 10000;
  for (const player of gameState.players) {
    if (player.boardScore >= targetScore) {
      return { winner: player, reason: `Reached ${targetScore} points!` };
    }
  }
  // Add any other custom win logic here
  return null;
}

function isCountdownWin(turnHistory) {
  // Check if a player rolled 6,5,4,3,2,'SKUNK' in order, one at a time
  const countdownSeq = [6, 5, 4, 3, 2, 'SKUNK'];
  let rolls = turnHistory.slice(-6).map(t => t.die);
  return rolls.length === 6 && rolls.every((d, i) => d === countdownSeq[i]);
}

// --- Mulligan & Six, Two, & Even (player-limited rules) ---

export function useMulligan(gameState, playerId) {
  if (!gameState.players[playerId].mulliganUsed) {
    // Rollback turn, set mulliganUsed = true
    gameState.players[playerId].mulliganUsed = true;
    // Implement turn rollback logic here
    return true;
  }
  return false;
}
export function useSixTwoEven(gameState, playerId, changeFrom, changeTo) {
  if (!gameState.players[playerId].sixTwoEvenUsed) {
    // Transform dice for one roll
    gameState.players[playerId].sixTwoEvenUsed = true;
    // change dice values from changeFrom to changeTo
    return true;
  }
  return false;
}

// --- Example Usage ---
/*
const score = calculateScore({
  dice: [5, 5, 5, 5, 5, 5],
  activeRules: { singleCinco: true },
  turnHistory: [{ die: 5, player: 'A' }, ...]
});
const win = checkWinCondition({ gameState, activeRules, turnHistory });
*/