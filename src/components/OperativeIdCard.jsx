import React, { useState, useMemo, useEffect } from 'react';
import { getLevelProgress } from '../utils/leveling';
import { getLoyaltyRank } from '../utils/loyaltyPoints';
import { getMvpCount } from '../utils/mvpAwards';
import { ACHIEVEMENTS } from '../data/achievements';
import { 
  AVAILABLE_SHOWCASE_MEDALS, 
  DEFAULT_CARD_CONFIG, 
  getOperativeCardConfig 
} from '../utils/cardCustomization';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

// Deterministic QR Code SVG generator matching vault-player-profile-v2.html
function generateQrSvgPath(text) {
  const n = 25;
  let h = 7;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  const finder = (r, c) => {
    const box = (r0, c0) => {
      const dr = r - r0, dc = c - c0;
      if (dr < 0 || dc < 0 || dr > 6 || dc > 6) return null;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };
    let a = box(0, 0); if (a !== null) return a;
    a = box(0, n - 7); if (a !== null) return a;
    a = box(n - 7, 0); return a;
  };
  const isDark = (r, c) => {
    const f = finder(r, c);
    if (f !== null) return f;
    let x = (r * 131 + c * 17 + h) >>> 0;
    x = (x ^ (x >>> 7)) * 2246822519 >>> 0;
    return (x % 100) < 48;
  };
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    }
  }
  return { n, d };
}

export default function OperativeIdCard({
  operative,
  customConfig = null,
  onClose = null,
  onInvite = null,
  onOpenCustomizer = null,
  isMe = false,
  className = ''
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);

  // Sync custom configuration dynamically from customConfig, user object, or saved localStorage
  const [liveConfig, setLiveConfig] = useState(() => {
    return customConfig || operative?.cardConfig || getOperativeCardConfig(operative);
  });

  useEffect(() => {
    if (customConfig) {
      setLiveConfig(customConfig);
      return;
    }
    const syncConfig = () => {
      setLiveConfig(operative?.cardConfig || getOperativeCardConfig(operative));
    };
    syncConfig();

    window.addEventListener('vault:card-updated', syncConfig);
    window.addEventListener('vault:user-updated', syncConfig);
    return () => {
      window.removeEventListener('vault:card-updated', syncConfig);
      window.removeEventListener('vault:user-updated', syncConfig);
    };
  }, [customConfig, operative]);

  const activeConfig = customConfig || liveConfig || operative?.cardConfig || getOperativeCardConfig(operative);

  // 1. Callsign / Display Name
  const callsign = operative?.callsign || operative?.username || operative?.name || 'Operative';

  // 2. Unique Agent ID
  const rawAgentId = operative?.agentId || operative?.agent_id || (
    operative?.id 
      ? (operative.id.length > 8 
          ? `VLT-${operative.id.replace(/-/g, '').substring(0, 4).toUpperCase()}-${operative.id.replace(/-/g, '').substring(4, 7).toUpperCase()}` 
          : `VLT-${operative.id.toUpperCase()}`)
      : 'VLT-OPERATIVE'
  );

  // 3. Role / Motto Customization
  const rawRole = activeConfig?.motto || operative?.role || operative?.title || 'Field Operative';
  const role = typeof rawRole === 'string' ? rawRole.toUpperCase() : 'FIELD OPERATIVE';

  // 4. Actual XP & Level Progression
  const xp = typeof operative?.xp === 'number' ? operative.xp : 0;
  const { level: derivedLevel, xpIntoLevel, xpForNextLevel, progress } = getLevelProgress(xp);
  const level = operative?.level || derivedLevel || 1;
  const currentLevelXp = xpIntoLevel || 0;
  const targetLevelXp = xpForNextLevel || 1000;
  const pct = Math.min(100, Math.max(0, Math.round((progress || 0) * 100)));
  const xpRemaining = Math.max(0, targetLevelXp - currentLevelXp);

  // 5. Squad Loyalty (0 - 1000 LP)
  const rawLp = typeof operative?.loyaltyPoints === 'number' 
    ? operative.loyaltyPoints 
    : (typeof operative?.loyalty_points === 'number' 
        ? operative.loyalty_points 
        : (typeof operative?.lp === 'number' ? operative.lp : 0));
  const lp = Math.min(1000, Math.max(0, rawLp));
  const loyaltyRank = getLoyaltyRank(lp);
  const loyaltyPercent = Math.min(100, Math.max(0, Math.round((lp / 1000) * 100)));

  // 6. Actual Telemetry Stats
  const statsObj = operative?.stats || {};
  const runsPlayed = typeof statsObj.missionsCompleted === 'number' 
    ? statsObj.missionsCompleted 
    : (typeof statsObj.runs === 'number' ? statsObj.runs : (operative?.history?.length || 0));

  const vaultsCracked = typeof statsObj.vaultsCracked === 'number' 
    ? statsObj.vaultsCracked 
    : 0;

  const winRate = typeof statsObj.winRate === 'number' 
    ? statsObj.winRate 
    : (runsPlayed > 0 ? Math.min(100, Math.round((vaultsCracked / runsPlayed) * 100)) : 100);

  const bestStreak = typeof statsObj.bestStreak === 'number' 
    ? statsObj.bestStreak 
    : (typeof statsObj.streak === 'number' ? statsObj.streak : getMvpCount(operative));

  // 7. Online Status & Activity
  const isOnline = operative?.isOnline !== false && operative?.is_online !== false && operative?.status !== 'offline';
  const currentActivity = isOnline 
    ? (operative?.presence || operative?.currentActivity || 'Lobby') 
    : (operative?.lastSeen || 'Offline');

  // 8. Custom Avatar or Stylized Robot
  const avatarUrl = operative?.avatar || operative?.avatar_url;
  const hasCustomAvatar = Boolean(avatarUrl && !avatarUrl.includes('placeholder') && !avatarUrl.includes('dicebear'));

  // 9. Actual Unlocked Medals & Showcase Medals
  const medals = useMemo(() => {
    const configured = Array.isArray(activeConfig?.showcasedMedals) && activeConfig.showcasedMedals.length
      ? activeConfig.showcasedMedals
      : DEFAULT_CARD_CONFIG.showcasedMedals;

    const unlockedSet = new Set([
      ...(operative?.achievements || []),
      ...(operative?.badges || [])
    ]);

    const rarityMap = {
      LEGENDARY: 'legendary',
      PLATINUM: 'legendary',
      EPIC: 'epic',
      GOLD: 'epic',
      RARE: 'rare',
      SILVER: 'rare',
      BRONZE: 'rare'
    };

    return configured.map(id => {
      // Find in AVAILABLE_SHOWCASE_MEDALS first, then ACHIEVEMENTS
      const foundShowcase = AVAILABLE_SHOWCASE_MEDALS.find(m => m.id === id);
      const foundAch = ACHIEVEMENTS.find(a => a.id === id);

      const medalName = foundShowcase?.title || foundAch?.title || id.replace(/_/g, ' ');
      const medalEmoji = foundShowcase?.emoji || (foundAch ? '🎖️' : '🏅');
      const medalTier = foundShowcase?.tier || foundAch?.tier || 'LEGENDARY';
      const medalDesc = foundShowcase?.desc || foundAch?.description || 'Syndicate operative medal commendation.';

      // Determine if locked
      // Only squad_anchor shows as locked if user has not yet completed 25 runs and not unlocked
      const isLocked = id === 'squad_anchor' && !unlockedSet.has(id) && (runsPlayed < 25);
      const isEarned = !isLocked;

      return {
        id,
        name: medalName,
        rarity: rarityMap[medalTier] || 'epic',
        tierLabel: medalTier,
        emoji: medalEmoji,
        earned: isEarned,
        desc: medalDesc,
        date: isEarned ? 'Equipped on ID Pass' : 'Finish 25 runs with the same squad to unlock.'
      };
    });
  }, [activeConfig?.showcasedMedals, operative?.achievements, operative?.badges, runsPlayed]);

  // 10. Card Details Metadata
  const memberSince = operative?.createdAt || operative?.created_at
    ? new Date(operative.createdAt || operative.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Operative';

  const clearanceName = loyaltyRank?.name ? `${loyaltyRank.name}` : 'Tier 1 Operative';

  const favoriteMode = operative?.favoriteRole 
    ? `${operative.favoriteRole.toUpperCase()} Specialist`
    : (operative?.role ? `${operative.role.toUpperCase()} Specialist` : 'Co-Op Heist Run');

  // QR Code data
  const qrData = useMemo(() => generateQrSvgPath(`vault://player/${rawAgentId}`), [rawAgentId]);

  const handleCopyId = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(rawAgentId);
    setCopiedId(true);
    heistAudio.playKeyClick();
    toast.success(`Player ID copied: ${rawAgentId}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    const link = `${window.location.origin}/?agent=${rawAgentId}`;
    navigator.clipboard?.writeText(link);
    setMenuOpen(false);
    heistAudio.playKeyClick();
    toast.success('Profile link copied to clipboard');
  };

  const handlePrimaryAction = (e) => {
    e?.stopPropagation();
    heistAudio.playKeyClick();
    if (isMe && onOpenCustomizer) {
      onOpenCustomizer();
    } else if (onInvite) {
      setInviteSent(true);
      onInvite(operative);
      toast.success(`Invite sent to ${callsign}!`);
      setTimeout(() => setInviteSent(false), 2500);
    } else {
      setInviteSent(true);
      toast.success(`Invite sent to ${callsign}!`);
      setTimeout(() => setInviteSent(false), 2500);
    }
  };

  return (
    <div className={`vault-profile-container w-full max-w-[900px] ${className}`}>
      {/* Scoped CSS matching vault-player-profile-v2.html */}
      <style>{`
        .vault-profile-container {
          --ink: #04140d;
          --hs: #020d08;
          --felt: #14472f;
          --felt-2: #0e3826;
          --deep: #08251a;
          --text: #ffffff;
          --mint: #6ef0b0;
          --mint-2: #9fe3c2;
          --mint-3: #4df0b0;
          --btn: #1fa36b;
          --btn-shadow: #07361f;
          --red: #ec2f58;
          --pink: #ff5a7d;
          --yellow: #fbdc3f;
          --mono: "Space Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
          --disp: "Rubik", ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif;
          font-family: var(--disp);
          container-type: inline-size;
        }

        .vpc-card {
          position: relative;
          color: var(--text);
          background:
            radial-gradient(circle, rgba(110,240,176,.13) 1.6px, transparent 1.9px) 0 0/24px 24px,
            linear-gradient(180deg, #0d3626, #07190f);
          border-radius: 38px;
          padding: 16px;
          box-shadow: 8px 10px 0 var(--hs);
          display: grid;
          gap: 14px;
          grid-template-areas:
            "head"
            "hero"
            "xp"
            "medals"
            "stats"
            "details";
          text-align: left;
        }

        @container (min-width: 620px) {
          .vpc-card {
            padding: 24px;
            gap: 18px;
            grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
            grid-template-areas:
              "head head"
              "hero xp"
              "hero medals"
              "hero stats"
              "details details";
          }
          .vpc-hero {
            justify-content: center;
            padding: 30px 20px;
          }
          .vpc-avatar-wrap {
            width: 168px;
            height: 168px;
          }
          .vpc-menu {
            right: 24px;
            top: 76px;
          }
        }

        .vpc-sticker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: .04em;
          text-transform: uppercase;
          padding: 7px 13px 7px 11px;
          border-radius: 14px;
          border: 3px solid var(--ink);
          box-shadow: 3px 4px 0 var(--ink);
          color: var(--ink);
        }
        .vpc-sticker.gold {
          background: var(--yellow);
          transform: rotate(-2deg);
        }
        .vpc-sticker.on {
          background: var(--mint-3);
          transform: rotate(2deg);
        }
        .vpc-sticker.off {
          background: #3a4a43;
          color: #e8f5ee;
          transform: rotate(2deg);
        }
        .vpc-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ink);
          animation: vpc-pulse 2.4s ease-out infinite;
        }
        @keyframes vpc-pulse {
          0% { box-shadow: 0 0 0 0 rgba(4,20,13,.55); }
          70%, 100% { box-shadow: 0 0 0 7px rgba(4,20,13,0); }
        }

        .vpc-chip {
          display: inline-block;
          font-family: var(--mono);
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
          padding: 5px 7px;
          border-radius: 9px;
          border: 2px solid var(--ink);
          background: var(--rc, #2fd08a);
          color: var(--ink);
          text-transform: uppercase;
          white-space: nowrap;
        }

        .vpc-head {
          grid-area: head;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 2px 0;
        }
        .vpc-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: .02em;
        }
        .vpc-iconbtn {
          width: 44px;
          height: 44px;
          border-radius: 15px;
          border: 2px solid #1d5c42;
          background: var(--ink);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 3px 4px 0 var(--hs);
          transition: transform 0.1s;
        }
        .vpc-iconbtn:active {
          transform: translate(2px, 3px);
          box-shadow: 1px 1px 0 var(--hs);
        }

        .vpc-menu {
          position: absolute;
          right: 14px;
          top: 66px;
          z-index: 30;
          min-width: 220px;
          background: var(--ink);
          border: 3px solid var(--btn);
          border-radius: 20px;
          padding: 6px;
          box-shadow: 5px 6px 0 var(--hs);
        }
        .vpc-menu button {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: 0;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--mono);
        }
        .vpc-menu button:hover {
          background: rgba(110,240,176,.14);
        }

        .vpc-hero {
          grid-area: hero;
          border-radius: 32px;
          padding: 24px 16px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: radial-gradient(circle, rgba(110,240,176,.10) 1.4px, transparent 1.7px) 0 0/20px 20px, var(--felt);
          box-shadow: 6px 8px 0 var(--hs);
        }
        .vpc-avatar-wrap {
          position: relative;
          width: 144px;
          height: 144px;
          margin-bottom: 6px;
        }
        .vpc-avatar {
          width: 100%;
          height: 100%;
          border-radius: 34px;
          overflow: hidden;
          background: var(--yellow);
          border: 4px solid var(--ink);
          box-shadow: 5px 6px 0 var(--ink);
        }
        .vpc-astatus {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          border: 3px solid var(--ink);
          box-shadow: 2px 3px 0 var(--ink);
          transform: rotate(6deg);
        }
        .vpc-astatus.on {
          background: var(--mint-3);
          color: var(--ink);
        }
        .vpc-astatus.off {
          background: #3a4a43;
          color: #e8f5ee;
        }
        .vpc-lv {
          position: absolute;
          right: -12px;
          bottom: -10px;
          transform: rotate(-4deg);
          background: var(--yellow);
          color: var(--ink);
          border: 3px solid var(--ink);
          border-radius: 13px;
          box-shadow: 3px 4px 0 var(--ink);
          padding: 3px 10px;
          font-weight: 800;
          font-size: 17px;
          white-space: nowrap;
        }
        .vpc-name {
          font-weight: 800;
          font-size: clamp(26px, 8vw, 36px);
          line-height: 1.05;
          margin: 6px 0 0;
          max-width: 100%;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }
        .vpc-presence {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 6px 8px;
          margin: 0;
          font-family: var(--mono);
          font-size: 14px;
          color: var(--mint);
        }
        .vpc-pillhl {
          display: inline-block;
          border: 2px solid #2fa672;
          border-radius: 12px;
          padding: 3px 10px;
          font-weight: 700;
          color: var(--yellow);
          background: rgba(4,20,13,.35);
        }
        .vpc-idchip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: var(--ink);
          border: 2px solid #1d5c42;
          color: #fff;
          border-radius: 14px;
          padding: 8px 14px;
          cursor: pointer;
          font-family: var(--mono);
          font-weight: 700;
          font-size: 14px;
          max-width: 100%;
          box-shadow: 3px 4px 0 var(--hs);
          transition: transform 0.1s;
        }
        .vpc-idchip small {
          color: var(--mint-2);
          font-size: 12px;
          font-weight: 400;
        }
        .vpc-idchip:active {
          transform: translate(2px, 3px);
          box-shadow: 1px 1px 0 var(--hs);
        }
        .vpc-cta {
          width: 100%;
          max-width: 340px;
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          background: var(--btn);
          color: #032315;
          border: 3px solid var(--ink);
          border-radius: 18px;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: .02em;
          text-transform: uppercase;
          padding: 13px 18px;
          box-shadow: 4px 5px 0 var(--ink);
          transition: transform 0.1s;
        }
        .vpc-cta:active:not(:disabled) {
          transform: translate(3px, 4px);
          box-shadow: 1px 1px 0 var(--ink);
        }

        .vpc-xp {
          grid-area: xp;
          background: var(--felt);
          border-radius: 28px;
          padding: 16px 18px;
          box-shadow: 6px 8px 0 var(--hs);
        }
        .vpc-xp-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
        }
        .vpc-xp-lv {
          font-weight: 800;
          font-size: 24px;
          text-transform: uppercase;
        }
        .vpc-xp-num {
          font-family: var(--mono);
          font-weight: 700;
          font-size: 14px;
          color: var(--mint);
        }
        .vpc-bar {
          height: 30px;
          border-radius: 999px;
          background: var(--ink);
          padding: 5px;
          margin: 12px 0 14px;
        }
        .vpc-fill {
          height: 100%;
          border-radius: 999px;
          background: repeating-linear-gradient(-45deg, rgba(0,0,0,.13) 0 8px, transparent 8px 16px), var(--yellow);
          transition: width 0.8s cubic-bezier(.2,.8,.2,1);
        }
        .vpc-xp-msg {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 10px;
          font-family: var(--mono);
          font-size: 14px;
          color: var(--mint);
        }
        .vpc-loyal {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          padding: 9px 12px;
          background: rgba(4,20,13,.4);
          border-radius: 16px;
          font-family: var(--mono);
          font-size: 13px;
          color: var(--mint-2);
        }
        .vpc-mini {
          margin-left: auto;
          width: 60px;
          height: 10px;
          border-radius: 99px;
          background: var(--ink);
          overflow: hidden;
          flex: none;
        }
        .vpc-mini i {
          display: block;
          height: 100%;
          background: var(--mint-3);
          border-radius: 99px;
        }

        .vpc-medals {
          grid-area: medals;
        }
        .vpc-sec-h {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          margin: 2px 4px 12px;
        }
        .vpc-sec-h h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
        }
        .vpc-sec-h span {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--mint);
        }
        .vpc-tiles {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }
        .vpc-tile {
          appearance: none;
          color: #fff;
          text-align: center;
          cursor: pointer;
          background: var(--felt);
          border: 0;
          border-radius: 22px;
          padding: 14px 5px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          box-shadow: 4px 5px 0 var(--hs);
          transition: background 0.15s, transform 0.1s;
        }
        .vpc-tile:hover {
          background: #1a553a;
        }
        .vpc-plate {
          width: 62px;
          height: 62px;
          border-radius: 19px;
          background: var(--rc);
          border: 3px solid var(--ink);
          box-shadow: 3px 4px 0 var(--ink);
          display: grid;
          place-items: center;
          font-size: 32px;
          line-height: 1;
          transform: rotate(-3deg);
        }
        .vpc-tile:nth-child(2) .vpc-plate {
          transform: rotate(4deg);
        }
        .vpc-tname {
          font-weight: 700;
          font-size: 13.5px;
          line-height: 1.15;
          text-transform: uppercase;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          overflow-wrap: anywhere;
          min-height: 2.3em;
          max-width: 100%;
        }
        .vpc-state {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--mint-2);
        }
        .vpc-tile.locked {
          background: transparent;
          box-shadow: none;
          border: 3px dashed #2f6b4f;
          padding: 11px 3px 9px;
        }
        .vpc-tile.locked:hover {
          background: rgba(110,240,176,.06);
        }
        .vpc-tile.locked .vpc-plate {
          background: var(--deep);
          border: 3px dashed #2f6b4f;
          box-shadow: none;
          color: #9fe3c2;
        }
        .vpc-tile.locked .vpc-tname {
          color: #b4d8c6;
        }
        .vpc-tile.locked .vpc-chip {
          background: #16382a;
          color: var(--mint-2);
          border-color: #2f6b4f;
        }

        .vpc-stats {
          grid-area: stats;
          background: var(--felt);
          border-radius: 28px;
          padding: 16px 8px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px;
          box-shadow: 6px 8px 0 var(--hs);
        }
        .vpc-stat {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .vpc-stat .vpc-emo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 3px solid var(--ink);
          box-shadow: 2px 3px 0 var(--ink);
          display: grid;
          place-items: center;
          font-size: 19px;
          margin-bottom: 4px;
        }
        .vpc-stat b {
          font-weight: 800;
          font-size: 32px;
          line-height: 1.05;
          font-variant-numeric: tabular-nums;
        }
        .vpc-stat span {
          font-family: var(--mono);
          font-size: 12.5px;
          color: var(--mint);
        }

        .vpc-details {
          grid-area: details;
        }
        .vpc-details summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 22px;
          background: var(--deep);
          border: 3px solid var(--btn);
          color: var(--mint-3);
          font-weight: 800;
          font-size: 16px;
          text-transform: uppercase;
        }
        .vpc-details summary::-webkit-details-marker {
          display: none;
        }
        .vpc-sum-l {
          display: flex;
          flex-direction: column;
        }
        .vpc-sum-l small {
          font-family: var(--mono);
          font-weight: 400;
          font-size: 12.5px;
          text-transform: none;
          color: var(--mint-2);
        }
        .vpc-details-body {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 20px;
          align-items: center;
          margin-top: 12px;
          padding: 16px;
          background: var(--felt);
          border-radius: 26px;
          box-shadow: 6px 8px 0 var(--hs);
        }
        .vpc-qr {
          width: 112px;
          height: 112px;
          background: #fff;
          border: 3px solid var(--ink);
          border-radius: 16px;
          padding: 6px;
          box-shadow: 3px 4px 0 var(--ink);
          flex: none;
        }
        .vpc-meta {
          margin: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 6px 16px;
          font-family: var(--mono);
          font-size: 13.5px;
          min-width: 0;
        }
        .vpc-meta dt {
          color: var(--mint-2);
        }
        .vpc-meta dd {
          margin: 0;
          font-weight: 700;
          color: #fff;
          overflow-wrap: anywhere;
        }

        .vpc-dlg {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(2, 10, 6, .78);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .vpc-dlg-card {
          border-radius: 34px;
          color: #fff;
          width: 100%;
          max-width: 380px;
          font-family: var(--disp);
          background: radial-gradient(circle, rgba(110,240,176,.13) 1.6px, transparent 1.9px) 0 0/24px 24px, linear-gradient(180deg, #0d3626, #07190f);
          box-shadow: 8px 10px 0 var(--hs);
          position: relative;
          padding: 26px 20px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      {/* SVG Definitions */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="vpc-lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6ef0b0" />
            <stop offset="1" stopColor="#fbdc3f" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Card Section */}
      <section className={`vpc-card ${isOnline ? 'is-on' : 'is-off'}`}>
        
        {/* Header */}
        <header className="vpc-head">
          <div className="vpc-logo">
            <svg className="w-8 h-8 flex-none" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 2l12 7v14l-12 7L4 23V9z" fill="url(#vpc-lg)" stroke="#04140d" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="16" cy="14" r="4" fill="#04140d" />
              <rect x="14.6" y="15" width="2.8" height="8" rx="1.4" fill="#04140d" />
            </svg>
            <span>VAULT</span>
          </div>

          <div className="flex-1" />

          {isOnline ? (
            <span className="vpc-sticker on">
              <span className="vpc-dot" aria-hidden="true" />
              Online
            </span>
          ) : (
            <span className="vpc-sticker off">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
              Offline
            </span>
          )}

          <div className="relative">
            <button 
              className="vpc-iconbtn" 
              type="button" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More actions"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2.2" fill="currentColor" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                <circle cx="19" cy="12" r="2.2" fill="currentColor" />
              </svg>
            </button>

            {menuOpen && (
              <div className="vpc-menu animate-in fade-in zoom-in-95">
                <button type="button" onClick={handleCopyLink}>
                  Copy profile link
                </button>
                <button type="button" onClick={handleCopyId}>
                  Copy agent ID
                </button>
                {onOpenCustomizer && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenCustomizer();
                    }}
                  >
                    Customize ID pass
                  </button>
                )}
                {onClose && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setMenuOpen(false);
                      onClose();
                    }}
                    className="text-red-400"
                  >
                    Close card
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="vpc-hero">
          <div className="vpc-avatar-wrap">
            <div className="vpc-avatar">
              {hasCustomAvatar ? (
                <img src={avatarUrl} alt={callsign} className="w-full h-full object-cover" />
              ) : (
                /* The exact SVG robot avatar */
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="vpc-robot-bg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fbdc3f" />
                      <stop offset="1" stopColor="#f4a62a" />
                    </linearGradient>
                  </defs>
                  <rect width="160" height="160" fill="url(#vpc-robot-bg)" />
                  <circle cx="124" cy="32" r="42" fill="#fff" opacity=".22" />
                  <path d="M22 160c0-32 24-50 58-50s58 18 58 50z" fill="#04140d" />
                  <path d="M64 112h32v10a16 16 0 0 1-32 0z" fill="#14472f" />
                  <rect x="76" y="10" width="8" height="22" rx="4" fill="#04140d" />
                  <circle cx="80" cy="11" r="8" fill="#ec2f58" stroke="#04140d" strokeWidth="4" />
                  <rect x="42" y="30" width="76" height="84" rx="36" fill="#14472f" stroke="#04140d" strokeWidth="5" />
                  <rect x="52" y="56" width="56" height="32" rx="16" fill="#6ef0b0" stroke="#04140d" strokeWidth="4" />
                  <circle cx="68" cy="72" r="4.5" fill="#04140d" />
                  <circle cx="92" cy="72" r="4.5" fill="#04140d" />
                </svg>
              )}
            </div>

            <span className={`vpc-astatus ${isOnline ? 'on' : 'off'}`} aria-hidden="true">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" />
              </svg>
            </span>

            <span className="vpc-lv">Lv {level}</span>
          </div>

          <span className="vpc-sticker gold">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.2 7.3L22 12l-7.8 2.7L12 22l-2.2-7.3L2 12l7.8-2.7z" />
            </svg>
            {role}
          </span>

          <h2 className="vpc-name">{callsign}</h2>

          <p className="vpc-presence">
            {isOnline ? (
              <>Currently in <span className="vpc-pillhl">{currentActivity}</span></>
            ) : (
              <>Last seen <span className="vpc-pillhl">{currentActivity}</span></>
            )}
          </p>

          <button 
            className="vpc-idchip" 
            type="button" 
            onClick={handleCopyId}
            title="Click to copy ID"
          >
            <small>ID</small>
            <span>{rawAgentId}</span>
            {copiedId ? (
              <svg className="w-4 h-4 text-[#6ef0b0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="4 12.5 9.5 18 20 6.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#6ef0b0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <rect x="9" y="9" width="12" height="12" rx="3" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </svg>
            )}
          </button>

          <button 
            className="vpc-cta" 
            type="button"
            onClick={handlePrimaryAction}
          >
            <span>{isMe ? 'CUSTOMIZE ID PASS' : (inviteSent ? 'INVITE SENT' : 'INVITE TO SQUAD')}</span>
            <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {inviteSent ? (
                <polyline points="4 12.5 9.5 18 20 6.5" />
              ) : (
                <path d="M5 12h14M13 6l6 6-6 6" />
              )}
            </svg>
          </button>
        </div>

        {/* XP Progress Section */}
        <div className="vpc-xp">
          <div className="vpc-xp-top">
            <span className="vpc-xp-lv">Level {level}</span>
            <span className="vpc-xp-num">{currentLevelXp.toLocaleString()} / {targetLevelXp.toLocaleString()} XP</span>
          </div>

          <div className="vpc-bar" role="progressbar">
            <div className="vpc-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="vpc-xp-msg">
            <span className="vpc-chip" style={{ '--rc': '#2fd08a' }}>
              {xpRemaining.toLocaleString()} XP TO GO
            </span>
            <span>Almost at Level {level + 1}!</span>
          </div>

          <div className="vpc-loyal">
            <span>Squad loyalty</span>
            <span className="vpc-mini">
              <i style={{ width: `${loyaltyPercent}%` }} />
            </span>
            <b>{loyaltyPercent}%</b>
          </div>
        </div>

        {/* Medal Showcase Section */}
        <div className="vpc-medals">
          <div className="vpc-sec-h">
            <h3>Medal showcase</h3>
            <span>{medals.filter(m => m.earned).length} of {medals.length} earned</span>
          </div>

          <div className="vpc-tiles">
            {medals.map((m, i) => {
              const locked = !m.earned;
              const rcColor = m.rarity === 'legendary' ? '#fbdc3f' : (m.rarity === 'epic' ? '#ff5a7d' : '#4df0b0');
              return (
                <button
                  key={i}
                  className={`vpc-tile ${locked ? 'locked' : ''}`}
                  style={{ '--rc': rcColor }}
                  type="button"
                  onClick={() => setSelectedMedal(m)}
                >
                  <span className="vpc-plate" aria-hidden="true">
                    {locked ? '🔒' : m.emoji}
                  </span>
                  <span className="vpc-tname">{m.name}</span>
                  <span className="vpc-chip" style={{ '--rc': rcColor }}>
                    {(m.tierLabel || m.rarity).toUpperCase()}
                  </span>
                  {locked && <span className="vpc-state">Locked</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="vpc-stats">
          <div className="vpc-stat">
            <span className="vpc-emo" style={{ background: '#6ef0b0' }}>🏁</span>
            <b>{runsPlayed.toLocaleString()}</b>
            <span>Runs played</span>
          </div>
          <div className="vpc-stat">
            <span className="vpc-emo" style={{ background: '#fbdc3f' }}>🏆</span>
            <b>{winRate}%</b>
            <span>Win rate</span>
          </div>
          <div className="vpc-stat">
            <span className="vpc-emo" style={{ background: '#ff5a7d' }}>🔥</span>
            <b>{bestStreak}</b>
            <span>Best streak</span>
          </div>
        </div>

        {/* Card Details Accordion */}
        <details className="vpc-details">
          <summary>
            <span className="vpc-sum-l">
              Card details
              <small>QR code and profile info</small>
            </span>
            <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="vpc-details-body">
            <div className="vpc-qr">
              <svg viewBox={`-1 -1 ${qrData.n + 2} ${qrData.n + 2}`} shapeRendering="crispEdges" className="w-full h-full">
                <path d={qrData.d} fill="#04140d" />
              </svg>
            </div>
            <dl className="vpc-meta">
              <dt>Player ID</dt>
              <dd>{rawAgentId}</dd>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
              <dt>Clearance</dt>
              <dd>{clearanceName}</dd>
              <dt>Favorite mode</dt>
              <dd>{favoriteMode}</dd>
            </dl>
          </div>
        </details>

      </section>

      {/* Medal Inspection Modal Dialog */}
      {selectedMedal && (
        <div className="vpc-dlg" onClick={() => setSelectedMedal(null)}>
          <div className="vpc-dlg-card" onClick={e => e.stopPropagation()}>
            <button 
              className="vpc-iconbtn absolute top-3.5 right-3.5" 
              type="button" 
              onClick={() => setSelectedMedal(null)}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <span className="vpc-sticker gold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.2 7.3L22 12l-7.8 2.7L12 22l-2.2-7.3L2 12l7.8-2.7z" />
              </svg>
              Medal details
            </span>

            <span 
              className="vpc-plate text-5xl w-24 h-24 rounded-3xl"
              style={{ 
                '--rc': selectedMedal.rarity === 'legendary' ? '#fbdc3f' : (selectedMedal.rarity === 'epic' ? '#ff5a7d' : '#4df0b0'),
                background: selectedMedal.earned ? undefined : '#08251a'
              }}
            >
              {!selectedMedal.earned ? '🔒' : selectedMedal.emoji}
            </span>

            <h3 className="text-2xl font-black uppercase text-white tracking-wide">
              {selectedMedal.name}
            </h3>

            <span className="vpc-chip" style={{ '--rc': selectedMedal.rarity === 'legendary' ? '#fbdc3f' : (selectedMedal.rarity === 'epic' ? '#ff5a7d' : '#4df0b0') }}>
              {(selectedMedal.tierLabel || selectedMedal.rarity).toUpperCase()}{!selectedMedal.earned ? ' · LOCKED' : ''}
            </span>

            <p className="font-mono text-sm text-[#6ef0b0] max-w-[280px]">
              {selectedMedal.desc}
            </p>

            <p className="font-mono text-xs text-white font-bold">
              {selectedMedal.date}
            </p>

            <button 
              className="w-full mt-2 bg-[#08251a] border-3 border-[#1fa36b] text-[#4df0b0] rounded-2xl py-3 font-bold uppercase tracking-wider font-mono hover:bg-[#0e3826] transition-colors"
              onClick={() => setSelectedMedal(null)}
            >
              Back to profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
