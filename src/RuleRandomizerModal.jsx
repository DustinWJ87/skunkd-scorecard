import React, { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import cardBackImg from './assets/cardback.png';
import mulliganIcon from './assets/rule_icons/mulligan.png';
import pungentIcon from './assets/rule_icons/pungent.png';
import slowBoatIcon from './assets/rule_icons/slow_boat.png';

// Import all card images
import countdownCard from './assets/cards/countdown.png';
import extremeCard from './assets/cards/extreme.png';
import megaPlusCard from './assets/cards/mega_plus.png';
import mulliganCard from './assets/cards/mulligan.png';
import pungentCard from './assets/cards/pungent.png';
import singleCincoCard from './assets/cards/single_cinco.png';
import sixTwoEvenCard from './assets/cards/six_two_even.png';
import slowBoatCard from './assets/cards/slow_boat.png';
import stinkySuperSkunkdCard from './assets/cards/stinky_super_skunkd.png';
import stripesPlusCard from './assets/cards/stripes_plus.png';

export const RULE_DEFINITIONS = [
  {
    key: "countdown",
    label: "Countdown",
    type: "emoji",
    iconChar: "⏱️",
    badgeLabel: "⏱️",
    category: "Chaos",
    description: "Roll 6, 5, 4, 3, 2, Skunk in consecutive rolls to instantly WIN!",
    img: countdownCard
  },
  {
    key: "extreme",
    label: "Extreme",
    type: "text",
    iconChar: "X",
    badgeLabel: "X",
    category: "Chaos",
    description: "Roll until SKUNK'D and still move all points onto the board!",
    img: extremeCard
  },
  {
    key: "megaPlus",
    label: "Mega+",
    type: "text",
    iconChar: "M+",
    badgeLabel: "M+",
    category: "Value",
    description: "Mega rules apply to 5's & Skunks. Additional 5s=500, Skunks=1,000.",
    img: megaPlusCard
  },
  {
    key: "mulligan",
    label: "Mulligan",
    type: "emoji",
    iconChar: "⛳",
    badgeLabel: "⛳",
    isPowerUp: true,
    category: "Spray",
    description: "One good old-fashioned do-over per game anytime!",
    img: mulliganCard
  },
  {
    key: "pungent",
    label: "Pungent",
    type: "emoji",
    iconChar: "☣️",
    badgeLabel: "☣️",
    category: "Value",
    description: "Scores of 2,000+ are doubled (2x)! Scores of 5,000+ are tripled (3x)!",
    img: pungentCard
  },
  {
    key: "sixTwoEven",
    label: "6, 2, & Even",
    type: "text",
    iconChar: "6/2",
    badgeLabel: "6/2",
    isPowerUp: true,
    category: "Spray",
    description: "Set one die to 6, one to 2, and others to even numbers (2, 4, 6)!",
    img: sixTwoEvenCard
  },
  {
    key: "slowBoat",
    label: "Slow Boat",
    type: "emoji",
    iconChar: "⛵",
    badgeLabel: "⛵",
    category: "Value",
    description: "Six Skunks or 5's one-at-a-time receive 5x the value of the 6 dice!",
    img: slowBoatCard
  },
  {
    key: "stripesPlus",
    label: "Stripes+",
    type: "text",
    iconChar: "S+",
    badgeLabel: "S+",
    category: "Value",
    description: "Consecutive 3-pair stripes (e.g. 3, 4, 5) award 3,000 pts instead of 1,000!",
    img: stripesPlusCard
  },
  {
    key: "stinkySuperSkunkd",
    label: "Stinky Super SKUNK'D",
    type: "text",
    iconChar: "S³",
    badgeLabel: "S³",
    category: "Chaos",
    description: "Rolling 6 non-scoring dice (Super SKUNK'D) resets score on board to ZERO!",
    img: stinkySuperSkunkdCard
  },
  {
    key: "singleCinco",
    label: "Single Cinco",
    type: "text",
    iconChar: "5",
    badgeLabel: "5",
    category: "Value",
    description: "Rolling six 5's one at a time receives a score of 3,000 points!",
    img: singleCincoCard
  }
];

export default function RuleRandomizerModal({ open, onClose, currentRules, onApplyRules }) {
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'cards'
  const [numRules, setNumRules] = useState(3);
  const [isRollingDie, setIsRollingDie] = useState(false);
  const [dieDisplayValue, setDieDisplayValue] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRules, setSelectedRules] = useState([]);
  const [heldSlots, setHeldSlots] = useState({}); // { [slotIndex]: ruleKey }
  const [cardsFlipped, setCardsFlipped] = useState([]);
  const [reelAnimations, setReelAnimations] = useState([]); // tracks spinning state per reel
  const [expandedRuleKeys, setExpandedRuleKeys] = useState({});
  const [zoomedCard, setZoomedCard] = useState(null); // { img, label }

  // Initialize with currently selected rules or defaults when opened
  useEffect(() => {
    if (open) {
      const activeKeys = Object.keys(currentRules || {}).filter(k => currentRules[k]);
      const initialCount = activeKeys.length > 0 && activeKeys.length <= 6 ? activeKeys.length : 3;
      setNumRules(initialCount);
      setDieDisplayValue(initialCount);
      setHeldSlots({});
      
      if (activeKeys.length > 0) {
        const initialList = activeKeys
          .map(k => RULE_DEFINITIONS.find(r => r.key === k))
          .filter(Boolean)
          .slice(0, 6);
        setSelectedRules(initialList);
        setCardsFlipped(new Array(initialList.length).fill(true));
      } else {
        // Pick initial random sample
        const shuffled = [...RULE_DEFINITIONS].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, initialCount);
        setSelectedRules(picked);
        setCardsFlipped(new Array(initialCount).fill(false));
      }
    }
  }, [open, currentRules]);

  if (!open) return null;

  async function triggerHaptic(style = ImpactStyle.Light) {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Ignored if unsupported
    }
  }

  // Roll the 6-sided die to pick rule count
  function handleRollDie() {
    if (isRollingDie || isSpinning) return;
    setIsRollingDie(true);
    triggerHaptic(ImpactStyle.Medium);

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomVal = Math.floor(Math.random() * 6) + 1;
      setDieDisplayValue(randomVal);
      triggerHaptic(ImpactStyle.Light);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDieDisplayValue(finalVal);
        setNumRules(finalVal);
        setIsRollingDie(false);
        triggerHaptic(ImpactStyle.Heavy);

        // Clear held slots that are beyond the new count
        setHeldSlots(prev => {
          const updated = {};
          for (let i = 0; i < finalVal; i++) {
            if (prev[i]) updated[i] = prev[i];
          }
          return updated;
        });

        // Trigger spin or deal automatically with the new count
        triggerRandomize(finalVal);
      }
    }, 60);
  }

  // Manually pick rule count (1-6)
  function handleSelectCount(count) {
    if (isRollingDie || isSpinning) return;
    setNumRules(count);
    setDieDisplayValue(count);
    triggerHaptic(ImpactStyle.Light);
    
    setHeldSlots(prev => {
      const updated = {};
      for (let i = 0; i < count; i++) {
        if (prev[i]) updated[i] = prev[i];
      }
      return updated;
    });

    triggerRandomize(count);
  }

  // Toggle HOLD on a specific slot reel
  function toggleHoldSlot(index) {
    if (isSpinning) return;
    triggerHaptic(ImpactStyle.Medium);
    setHeldSlots(prev => {
      const updated = { ...prev };
      if (updated[index]) {
        delete updated[index];
      } else if (selectedRules[index]) {
        updated[index] = selectedRules[index].key;
      }
      return updated;
    });
  }

  // Generate distinct rules honoring held slots
  function generateNewRules(count = numRules) {
    const heldKeys = Object.values(heldSlots);
    const availablePool = RULE_DEFINITIONS.filter(r => !heldKeys.includes(r.key));
    const shuffled = [...availablePool].sort(() => 0.5 - Math.random());

    const result = [];
    let poolIdx = 0;

    for (let i = 0; i < count; i++) {
      if (heldSlots[i]) {
        const heldRule = RULE_DEFINITIONS.find(r => r.key === heldSlots[i]);
        result.push(heldRule || shuffled[poolIdx++]);
      } else {
        result.push(shuffled[poolIdx++]);
      }
    }
    return result.filter(Boolean);
  }

  // Run Slot Spin or Card Draw Animation
  function triggerRandomize(count = numRules) {
    if (isSpinning) return;
    setIsSpinning(true);
    triggerHaptic(ImpactStyle.Medium);

    const newPickedRules = generateNewRules(count);

    if (activeTab === 'slots') {
      // Slot machine sequential stop animation with slower, suspenseful pacing
      setReelAnimations(new Array(count).fill(true));

      // Sequential stopping with suspenseful delay
      newPickedRules.forEach((rule, idx) => {
        const stopDelay = 800 + idx * 450;
        setTimeout(() => {
          setReelAnimations(prev => {
            const next = [...prev];
            next[idx] = false;
            return next;
          });
          setSelectedRules(prev => {
            const next = [...prev];
            next[idx] = newPickedRules[idx];
            return next;
          });
          triggerHaptic(ImpactStyle.Light);

          // Once last reel stops
          if (idx === count - 1) {
            setSelectedRules(newPickedRules);
            setIsSpinning(false);
            triggerHaptic(ImpactStyle.Heavy);
          }
        }, stopDelay);
      });
    } else {
      // Card Draw mode animation - dramatic sequential flips
      setCardsFlipped(new Array(count).fill(false));
      setTimeout(() => {
        setSelectedRules(newPickedRules);
        newPickedRules.forEach((_, idx) => {
          const flipDelay = 400 + idx * 550;
          setTimeout(() => {
            setCardsFlipped(prev => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            triggerHaptic(ImpactStyle.Light);

            if (idx === count - 1) {
              setIsSpinning(false);
              triggerHaptic(ImpactStyle.Heavy);
            }
          }, flipDelay);
        });
      }, 350);
    }
  }

  // Apply selected rules to game setup
  function handleApply() {
    triggerHaptic(ImpactStyle.Heavy);
    const ruleKeys = selectedRules.map(r => r.key);
    onApplyRules(ruleKeys);
    onClose();
  }

  // Render shorthand badge or icon
  function renderShorthandBadge(rule, size = 38) {
    const isEmoji = rule.type === 'emoji' || rule.type === 'icon';

    return (
      <div style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        backgroundColor: '#0a0f1d',
        border: '2px solid var(--gold-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.35)',
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0
      }}>
        {isEmoji ? (
          <span style={{ 
            fontSize: `${Math.round(size * 0.52)}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            lineHeight: 1
          }}>
            {rule.iconChar}
          </span>
        ) : (
          <span style={{
            fontWeight: '900',
            fontSize: rule.iconChar.length > 2 ? `${Math.round(size * 0.34)}px` : `${Math.round(size * 0.44)}px`,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            lineHeight: 1
          }}>
            {rule.iconChar}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className="modal-overlay fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 7, 14, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '12px'
      }}
    >
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid var(--border-gold-glow)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.4rem' }}>🎰</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--gold-primary)' }}>
                Rule Randomizer
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Roll the die & spin the slot reels for random elective rules!
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Mode Switch Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className={activeTab === 'slots' ? 'btn btn-primary' : 'btn btn-outline-gold'}
              style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '10px' }}
              onClick={() => { setActiveTab('slots'); triggerHaptic(ImpactStyle.Light); }}
            >
              🎰 Slot Reels
            </button>
            <button
              type="button"
              className={activeTab === 'cards' ? 'btn btn-primary' : 'btn btn-outline-gold'}
              style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '10px' }}
              onClick={() => { setActiveTab('cards'); triggerHaptic(ImpactStyle.Light); }}
            >
              🃏 Mystery Card Draw
            </button>
          </div>

          {/* Section: 6-Sided Die Roller */}
          <div className="glass-card" style={{ padding: '14px 16px', background: 'rgba(15, 20, 32, 0.7)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* 3D Animated Die Button */}
                <button
                  type="button"
                  disabled={isRollingDie || isSpinning}
                  onClick={handleRollDie}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    backgroundColor: '#1a2233',
                    border: '2px solid var(--gold-primary)',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isRollingDie || isSpinning ? 'not-allowed' : 'pointer',
                    transform: isRollingDie ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                    transition: 'transform 0.25s ease',
                    userSelect: 'none'
                  }}
                  title="Tap to Roll Die for Rule Count"
                >
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--gold-primary)', lineHeight: 1 }}>
                    {dieDisplayValue}
                  </span>
                  <span style={{ fontSize: '0.58rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Dice
                  </span>
                </button>

                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {numRules} {numRules === 1 ? 'Rule' : 'Rules'} Selected
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Tap die to roll 1–6 or pick a number:
                  </div>
                </div>
              </div>

              {/* Number Chips 1-6 */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5, 6].map(val => (
                  <button
                    key={val}
                    type="button"
                    disabled={isRollingDie || isSpinning}
                    onClick={() => handleSelectCount(val)}
                    style={{
                      width: '30px',
                      height: '32px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: '800',
                      border: numRules === val ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: numRules === val ? 'rgba(255, 215, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                      color: numRules === val ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN VISUAL: Slot Machine Reels */}
          {activeTab === 'slots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${numRules}, 1fr)`, 
                  gap: numRules >= 5 ? 6 : 8,
                  background: 'rgba(8, 12, 20, 0.85)',
                  padding: numRules >= 5 ? '12px 6px' : '14px 10px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(255, 215, 0, 0.25)',
                  boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
                  minHeight: '110px',
                  alignItems: 'center'
                }}
              >
                {Array.from({ length: numRules }).map((_, idx) => {
                  const rule = selectedRules[idx] || RULE_DEFINITIONS[idx % RULE_DEFINITIONS.length];
                  const isHeld = !!heldSlots[idx];
                  const isReelSpinning = isSpinning && reelAnimations[idx];

                  return (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 0
                      }}
                    >
                      {/* Reel Window */}
                      <div 
                        style={{
                          width: '100%',
                          height: numRules >= 5 ? '68px' : '76px',
                          background: isHeld 
                            ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.22) 0%, rgba(20, 26, 38, 0.95) 100%)'
                            : 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                          border: isHeld ? '2px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: isHeld ? '0 0 12px rgba(255, 215, 0, 0.4)' : 'none',
                          filter: isReelSpinning ? 'blur(2px)' : 'none',
                          transform: isReelSpinning ? 'scale(0.96)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isReelSpinning ? (
                          <span style={{ fontSize: numRules >= 5 ? '1.4rem' : '1.8rem' }}>🎰</span>
                        ) : (
                          renderShorthandBadge(rule, numRules >= 5 ? 36 : 42)
                        )}
                      </div>

                      {/* HOLD / LOCK Button */}
                      <button
                        type="button"
                        disabled={isSpinning}
                        onClick={() => toggleHoldSlot(idx)}
                        style={{
                          width: '100%',
                          padding: '4px 2px',
                          fontSize: numRules >= 5 ? '0.62rem' : '0.68rem',
                          fontWeight: '800',
                          borderRadius: '6px',
                          border: isHeld ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: isHeld ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.06)',
                          color: isHeld ? '#000' : 'var(--text-muted)',
                          cursor: isSpinning ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          textAlign: 'center',
                          lineHeight: 1
                        }}
                      >
                        {isHeld ? '🔒 HELD' : 'HOLD'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Spin Reels Action Bar */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  disabled={isSpinning || isRollingDie}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '11px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
                  }}
                  onClick={() => triggerRandomize(numRules)}
                >
                  <span>🎰</span>
                  {isSpinning ? 'SPINNING REELS...' : 'SPIN REELS'}
                </button>
              </div>
            </div>
          )}

          {/* MAIN VISUAL: Mystery Card Draw */}
          {activeTab === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: numRules <= 3 ? `repeat(${numRules}, 1fr)` : `repeat(3, 1fr)`,
                  gap: 10,
                  background: 'rgba(8, 12, 20, 0.85)',
                  padding: '16px 12px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(255, 215, 0, 0.25)',
                  minHeight: '160px',
                  alignItems: 'center',
                  justifyItems: 'center'
                }}
              >
                {Array.from({ length: numRules }).map((_, idx) => {
                  const rule = selectedRules[idx] || RULE_DEFINITIONS[idx % RULE_DEFINITIONS.length];
                  const isFlipped = cardsFlipped[idx];

                  return (
                    <div 
                      key={idx}
                      style={{
                        width: '100%',
                        maxWidth: '120px',
                        aspectRatio: '2.5 / 3.5',
                        position: 'relative',
                        borderRadius: '10px',
                        perspective: '1000px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => {
                        if (!isSpinning) {
                          setCardsFlipped(prev => {
                            const next = [...prev];
                            next[idx] = !next[idx];
                            return next;
                          });
                          triggerHaptic(ImpactStyle.Light);
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          transformStyle: 'preserve-3d',
                          transition: 'transform 0.65s cubic-bezier(0.2, 0.85, 0.35, 1.1)',
                          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
                        }}
                      >
                        {/* Front Face (Card Art) */}
                        <div
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                            border: '1.5px solid var(--gold-primary)'
                          }}
                        >
                          <img 
                            src={rule.img} 
                            alt={rule.label} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        </div>

                        {/* Back Face (Card Back) */}
                        <div
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                            border: '1px solid rgba(255,255,255,0.18)'
                          }}
                        >
                          <img 
                            src={cardBackImg} 
                            alt="Card Back" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deal Cards Action Bar */}
              <button
                type="button"
                disabled={isSpinning || isRollingDie}
                className="btn btn-primary"
                style={{
                  padding: '11px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
                }}
                onClick={() => triggerRandomize(numRules)}
              >
                <span>🃏</span>
                {isSpinning ? 'SHUFFLING & DEALING...' : 'DEAL MYSTERY CARDS'}
              </button>
            </div>
          )}

          {/* Section: Selected Rules Summary */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Active Selection Preview ({selectedRules.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedRules.map((rule) => {
                const isExpanded = !!expandedRuleKeys[rule.key];
                return (
                  <div 
                    key={rule.key}
                    className="glass-card"
                    onClick={() => {
                      triggerHaptic(ImpactStyle.Light);
                      setExpandedRuleKeys(prev => ({ ...prev, [rule.key]: !prev[rule.key] }));
                    }}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      border: isExpanded ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255, 215, 0, 0.25)',
                      background: isExpanded ? 'rgba(25, 34, 52, 0.95)' : 'rgba(20, 26, 38, 0.8)',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: isExpanded ? '0 4px 16px rgba(0,0,0,0.5)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        {renderShorthandBadge(rule, 30)}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--gold-primary)' }}>
                            {rule.label}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: rule.category === 'Spray' ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: rule.category === 'Spray' ? '#4ecdc4' : 'var(--text-muted)'
                          }}>
                            {rule.category}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* Mini Card Thumbnail */}
                        {rule.img && (
                          <img
                            src={rule.img}
                            alt={rule.label}
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedCard({ img: rule.img, label: rule.label });
                            }}
                            style={{
                              width: '24px',
                              height: '34px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 215, 0, 0.4)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                              cursor: 'zoom-in'
                            }}
                            title="Tap to zoom card"
                          />
                        )}
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: isExpanded ? 'var(--gold-primary)' : 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          Info {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Description (Full text, wrapped nicely) */}
                    <div style={{
                      fontSize: '0.76rem',
                      color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.35,
                      paddingLeft: '40px'
                    }}>
                      {rule.description}
                    </div>

                    {/* Expanded Footer Details */}
                    {isExpanded && rule.img && (
                      <div style={{
                        marginTop: 4,
                        paddingTop: 8,
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: '40px'
                      }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {rule.category === 'Spray' ? '✨ Spray ability: 1x per game' : '📜 Elective rule in play'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedCard({ img: rule.img, label: rule.label });
                          }}
                          style={{
                            background: 'rgba(255, 215, 0, 0.15)',
                            border: '1px solid var(--gold-primary)',
                            color: 'var(--gold-primary)',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          🔍 View Card
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 14, 24, 0.95)',
          display: 'flex',
          gap: 10
        }}>
          <button
            type="button"
            className="btn btn-outline-gold"
            style={{ flex: 1, padding: '10px', fontSize: '0.88rem', borderRadius: '10px' }}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={selectedRules.length === 0}
            style={{ 
              flex: 2, 
              padding: '10px', 
              fontSize: '0.92rem', 
              fontWeight: '800', 
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.45)'
            }}
            onClick={handleApply}
          >
            ✅ Apply Rules to Game
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Card Zoom */}
      {zoomedCard && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setZoomedCard(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '340px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={zoomedCard.img} 
              alt={zoomedCard.label}
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                border: '2px solid var(--gold-primary)'
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '8px 24px', fontSize: '0.9rem', borderRadius: '10px' }}
              onClick={() => setZoomedCard(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
