// SKUNK'D Scoring Engine with MEGA, MEGA BONUS, DOUBLE MEGA

function countDice(dice) {
  const counts = {};
  dice.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function detectMegas(dice) {
  const counts = countDice(dice);
  const megas = [];
  for (let val = 1; val <= 6; val++) {
    if (counts[val] >= 3) {
      megas.push({ value: val, count: counts[val] });
    }
  }
  return megas;
}

const megaBase = {
  1: 1000,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 600
};

function getSingles(dice) {
  let points = 0;
  let singles = [];
  dice.forEach(val => {
    if (val === 1) {
      points += 100;
      singles.push(val);
    } else if (val === 5) {
      points += 50;
      singles.push(val);
    }
  });
  return { points, singles };
}

function isStripes(dice) {
  if (dice.length !== 6) return false;
  const counts = Object.values(countDice(dice));
  return counts.filter(c => c === 2).length === 3;
}

function isPolecat(dice) {
  if (dice.length !== 6) return false;
  return [1,2,3,4,5,6].every(num => dice.includes(num));
}

function getCarbuncle(dice, denFilled) {
  if (!denFilled) return 0;
  const counts = countDice(dice);
  let carbunclePairs = 0;
  [2, 3, 4, 6].forEach(val => {
    if (counts[val] === 2) carbunclePairs += 1;
  });
  if (carbunclePairs === 2) return 500;
  if (carbunclePairs === 1) return 250;
  return 0;
}

// MEGA BONUS calculation: if den contains a MEGA (2s, 3s, 4s, 6s), each matching die set aside in a roll gets bonus points: 100 x face x number of matching dice set aside (i.e. single=100, double=200 each, triple=300 each, etc.)
function getMegaBonus(dice, denMegas) {
  // Only applies for den MEGAs in 2s, 3s, 4s, or 6s
  const allowed = [2, 3, 4, 6];
  const bonuses = [];
  denMegas.forEach(mega => {
    if (allowed.includes(mega.value)) {
      const matchingDice = dice.filter(d => d === mega.value);
      if (matchingDice.length > 0) {
        const multiplier = matchingDice.length;
        matchingDice.forEach(() => {
          bonuses.push({
            value: mega.value,
            points: 100 * mega.value * multiplier
          });
        });
      }
    }
  });
  return bonuses;
}

export function scoreRoll({ dice, denState = {}, denFilled = false, electiveRules = {} }) {
  let result = {
    points: 0,
    scoringDice: [],
    combos: [],
    isSkunkd: false,
    superSkunkd: false
  };

  const counts = countDice(dice);
  const skunkCount = counts[1] || 0;

  // Triple Skunk (3+ 1's)
  if (skunkCount >= 3) {
    result.points = 1000;
    result.combos.push('tripleSkunk');
    result.scoringDice = dice.filter(d => d === 1);
    return result;
  }

  // Stripes
  if (isStripes(dice)) {
    result.points += 1000;
    result.combos.push('stripes');
    result.scoringDice = [...dice];
    return result;
  }

  // Polecat
  if (isPolecat(dice)) {
    result.points += 1500;
    result.combos.push('polecat');
    result.scoringDice = [...dice];
    return result;
  }

  // Single Skunk (six 1's)
  if (dice.length === 6 && dice.every(val => val === 1)) {
    result.points += 6000;
    result.combos.push('singleSkunk');
    result.scoringDice = [...dice];
    return result;
  }

  // MEGA & DOUBLE MEGA
  const megas = detectMegas(dice);
  if (megas.length > 0) {
    let megaPoints = 0;
    let megaDice = [];
    megas.forEach(mega => {
      let base = megaBase[mega.value];
      let multiplier = 1;
      if (mega.count === 4) multiplier = 2;
      if (mega.count === 5) multiplier = 4;
      if (mega.count === 6) multiplier = 8;
      megaPoints += base * multiplier;
      megaDice.push(...dice.filter(val => val === mega.value));
      result.combos.push('mega');
    });

    // DOUBLE MEGA: two MEGAs at once doubles the total
    if (megas.length === 2) {
      megaPoints *= 2;
      result.combos.push('doubleMega');
    }
    result.points += megaPoints;
    result.scoringDice = [...megaDice];

    // MEGA BONUS: if den already has a MEGA (2,3,4,6), and you set aside matching dice in a new roll
    if (denState && denState.megas && denState.megas.length > 0) {
      const bonuses = getMegaBonus(dice, denState.megas);
      if (bonuses.length > 0) {
        bonuses.forEach(b => {
          result.points += b.points;
          result.combos.push('megaBonus');
          result.scoringDice.push(b.value);
        });
      }
    }
    return result;
  }

  // MEGA BONUS ONLY (no new MEGA, just adding on to den MEGA)
  if (denState && denState.megas && denState.megas.length > 0) {
    const bonuses = getMegaBonus(dice, denState.megas);
    if (bonuses.length > 0) {
      bonuses.forEach(b => {
        result.points += b.points;
        result.combos.push('megaBonus');
        result.scoringDice.push(b.value);
      });
    }
  }

  // Singles (skunks, fives)
  const singles = getSingles(dice);
  if (singles.points) {
    result.points += singles.points;
    result.scoringDice.push(...singles.singles);
    result.combos.push('singles');
  }

  // Carbuncle (only if den is filled by pair(s))
  const carbunclePoints = getCarbuncle(dice, denFilled);
  if (carbunclePoints) {
    result.points += carbunclePoints;
    result.combos.push(carbunclePoints === 500 ? 'doubleCarbuncle' : 'carbuncle');
  }

  // No scoring dice: skunk'd
  if (result.points === 0) {
    result.isSkunkd = true;
    if (dice.length === 6) result.superSkunkd = true;
  }

  return result;
}

// Helper: which dice are scoring from a roll (for UI highlighting)
export function getScoringDiceIndexes(rolledDice, denState = {}) {
  const score = scoreRoll({ dice: rolledDice, denState });
  const indexes = [];
  // For combos, include all dice in combo
  if (
    score.combos.includes('stripes') ||
    score.combos.includes('polecat') ||
    score.combos.includes('singleSkunk') ||
    score.combos.includes('mega') ||
    score.combos.includes('doubleMega')
  ) {
    return rolledDice.map((_, idx) => idx);
  }
  // For singles and mega bonus, mark those dice
  rolledDice.forEach((val, idx) => {
    if (score.scoringDice.includes(val)) indexes.push(idx);
  });
  return indexes;
}