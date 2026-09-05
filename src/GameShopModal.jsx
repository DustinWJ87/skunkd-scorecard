import React, { useState } from 'react';
import hoj from './assets/hoj.png';
import skunkdLogo from './assets/skunkd-logo.png';

export default function GameShopModal({ open, onClose, isSupporter, onSupport }) {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'community'
  const [thankYouMessage, setThankYouMessage] = useState('');

  if (!open) return null;

  function handleOpenLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleJoinDiscord() {
    if (onSupport) {
      onSupport(0, 'Discord Community');
    }
    setThankYouMessage('🎉 Welcome to the SKUNK\'D Discord Community! Supporter Badge Unlocked! ⭐');
    setTimeout(() => {
      setThankYouMessage('');
    }, 4500);
    window.open('https://skunkd.games/discord', '_blank', 'noopener,noreferrer');
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
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '24px 20px',
          border: '1px solid var(--border-gold-glow)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          background: 'linear-gradient(180deg, rgba(20, 28, 48, 0.95) 0%, rgba(10, 15, 28, 0.98) 100%)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <img
            src={skunkdLogo}
            alt="SKUNK'D"
            style={{ height: '42px', objectFit: 'contain', marginBottom: '6px' }}
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
            Official Games & Community Hub
          </div>
          {isSupporter && (
            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'rgba(255, 215, 0, 0.18)', border: '1px solid var(--border-gold-glow)', borderRadius: '20px', color: 'var(--gold-primary)', fontSize: '0.78rem', fontWeight: '800' }}>
              👑 Community Supporter
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'shop' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'shop' ? '#0f172a' : 'var(--text-secondary)',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎲</span>
            <span>Games & Merch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'community' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'community' ? '#0f172a' : 'var(--text-secondary)',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>💬</span>
            <span>Discord & Community</span>
          </button>
        </div>

        {/* Thank You / Welcome Toast */}
        {thankYouMessage && (
          <div className="fade-in" style={{
            background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.35) 0%, rgba(16, 185, 129, 0.35) 100%)',
            border: '1.5px solid var(--gold-primary)',
            color: '#fff',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            fontWeight: '700',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(88, 101, 242, 0.3)'
          }}>
            {thankYouMessage}
          </div>
        )}

        {/* TAB 1: GAMES & MERCH */}
        {activeTab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Physical Boxed Game Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1.5px solid var(--border-gold-glow)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--gold-primary)', letterSpacing: '0.04em' }}>
                  🎲 Physical Tabletop Edition
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,215,0,0.2)', color: 'var(--gold-primary)', borderRadius: '10px', fontWeight: '700' }}>
                  Official Store
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
                SKUNK'D Dice & Card Game
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Bring the real-life excitement to your table! Get the physical boxed game with premium custom dice, elective cards, and tokens for game night.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenLink('https://skunkd.games/get-skunkd')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>🛒</span>
                <span>Get Physical Game & Expansions</span>
                <span style={{ fontSize: '1.1rem' }}>➔</span>
              </button>
            </div>

            {/* Mobile Video Game Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.04em' }}>
                  📱 Digital Mobile Game
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '10px', fontWeight: '700' }}>
                  iOS & Android
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
                SKUNK'D Mobile Video Game
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Play digital SKUNK'D anywhere on your phone! Featuring solo challenges, exciting visual effects, and full gameplay.
              </p>
              <button
                type="button"
                onClick={() => handleOpenLink('https://skunkd.games/play')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  marginTop: '4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📲</span>
                <span>Play Mobile Game on App Store & Google Play</span>
                <span style={{ fontSize: '1.1rem' }}>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DISCORD & COMMUNITY */}
        {activeTab === 'community' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Discord Community Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%)',
              border: '1.5px solid rgba(88, 101, 242, 0.5)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(88, 101, 242, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.04em' }}>
                  👾 Official Community
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(88, 101, 242, 0.3)', color: '#a5b4fc', borderRadius: '10px', fontWeight: '700' }}>
                  Discord Server
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👾</span>
                <span>Join the SKUNK'D Discord</span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Hang out with other SKUNK'D players! Chat about game nights, share custom house rules, get sneak peeks at upcoming expansions, and give direct feedback to the creators.
              </p>
              <button
                type="button"
                onClick={handleJoinDiscord}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  marginTop: '4px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(88, 101, 242, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🚀</span>
                <span>Join Our Discord Community</span>
                <span style={{ fontSize: '1.1rem' }}>➔</span>
              </button>
            </div>

            {/* Official Website & House Rules Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🌐</span>
                <div>
                  <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.92rem' }}>
                    Official SKUNK'D Website
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    skunkd.games • Rules, videos & updates
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-gold"
                onClick={() => handleOpenLink('https://skunkd.games')}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Visit ➔
              </button>
            </div>
          </div>
        )}

        {/* Footer Credit & Legal Links */}
        <div style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img
              src={hoj}
              alt="Hooked on Johnson Games"
              style={{ width: '80px', opacity: 0.8 }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hooked on Johnson Games
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <button
              type="button"
              onClick={() => handleOpenLink('https://skunkd.games/skunkd/privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.75rem',
                textDecoration: 'underline'
              }}
            >
              🔒 Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLink('https://skunkd.games/skunkd/terms')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.75rem',
                textDecoration: 'underline'
              }}
            >
              📄 Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
