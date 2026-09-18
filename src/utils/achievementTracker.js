import { ACHIEVEMENTS } from '../data/achievements';
import { userAPI } from '../services/api';

/**
 * Checks if an event triggers any new achievements for the user.
 * Returns an array of newly unlocked achievements.
 *
 * @param {Object} currentUser The active user profile
 * @param {string} eventType e.g., 'HEIST_COMPLETE', 'ROLE_SOLVED', 'LEVEL_UP', 'TEAM_JOINED', 'BLUEPRINT_SAVED', 'SOLO_COMPLETE', 'COMMS_SENT'
 * @param {Object} eventData e.g., { timeTaken, alarmsTripped, role, level, isCoop }
 * @returns {Array} List of newly unlocked achievement objects
 */
export function evaluateAchievements(currentUser, eventType, eventData = {}) {
  if (!currentUser) return [];

  // Existing unlocked achievement IDs (stored either in user.achievements or user.badges)
  const existingUnlocked = new Set([
    ...(currentUser.achievements || []),
    ...(currentUser.badges || [])
  ]);

  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (existingUnlocked.has(achievement.id) || existingUnlocked.has(achievement.title)) {
      continue;
    }

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_breach':
        if (eventType === 'HEIST_COMPLETE') shouldUnlock = true;
        break;

      case 'speed_demon':
        if (eventType === 'HEIST_COMPLETE' && typeof eventData.timeTaken === 'number' && eventData.timeTaken <= 120) {
          shouldUnlock = true;
        }
        break;

      case 'quantum_heist':
        if (eventType === 'HEIST_COMPLETE' && typeof eventData.timeTaken === 'number' && eventData.timeTaken <= 60) {
          shouldUnlock = true;
        }
        break;

      case 'hacker_elite':
        if (eventType === 'ROLE_SOLVED' && eventData.role === 'hacker') shouldUnlock = true;
        break;

      case 'photon_surgeon':
        if (eventType === 'ROLE_SOLVED' && eventData.role === 'engineer') shouldUnlock = true;
        break;

      case 'alchemical_synthesis':
        if (eventType === 'ROLE_SOLVED' && eventData.role === 'scientist') shouldUnlock = true;
        break;

      case 'cipher_whisperer':
        if (eventType === 'ROLE_SOLVED' && eventData.role === 'cryptographer') shouldUnlock = true;
        break;

      case 'quad_discipline':
        if (eventType === 'ROLE_SOLVED') {
          const solvedSet = new Set(eventData.solvedRoles || []);
          if (eventData.role) solvedSet.add(eventData.role);
          if (solvedSet.has('hacker') && solvedSet.has('engineer') && solvedSet.has('scientist') && solvedSet.has('cryptographer')) {
            shouldUnlock = true;
          }
        }
        break;

      case 'perfect_sync':
        if (eventType === 'HEIST_COMPLETE' && eventData.alarmsTripped === 0) {
          shouldUnlock = true;
        }
        break;

      case 'squad_cell':
        if (eventType === 'TEAM_JOINED') shouldUnlock = true;
        break;

      case 'comms_discipline':
        if (eventType === 'COMMS_SENT') shouldUnlock = true;
        break;

      case 'coop_veteran':
        if (eventType === 'HEIST_LAUNCH' && eventData.isCoop) shouldUnlock = true;
        break;

      case 'canopy_ranger':
        if ((eventType === 'LEVEL_UP' || eventType === 'LOGIN') && (eventData.level >= 2 || currentUser.level >= 2)) {
          shouldUnlock = true;
        }
        break;

      case 'syndicate_officer':
        if ((eventType === 'LEVEL_UP' || eventType === 'LOGIN') && (eventData.level >= 5 || currentUser.level >= 5)) {
          shouldUnlock = true;
        }
        break;

      case 'architect_blueprint':
        if (eventType === 'BLUEPRINT_SAVED') shouldUnlock = true;
        break;

      case 'solo_graduate':
        if (eventType === 'SOLO_COMPLETE') shouldUnlock = true;
        break;

      default:
        break;
    }

    if (shouldUnlock) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
