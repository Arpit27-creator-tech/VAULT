/**
 * MVP Awards System
 * Tracks MVP recognitions earned across successful heist operations.
 */

const MVP_STORAGE_KEY = 'vault_mvp_count';

export function getMvpCount(user) {
  try {
    const raw = localStorage.getItem(MVP_STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {}
  return user?.stats?.mvpAwards ?? user?.mvpCount ?? 0;
}

export function incrementMvpCount(user) {
  const current = getMvpCount(user);
  const next = current + 1;
  try {
    localStorage.setItem(MVP_STORAGE_KEY, String(next));
  } catch {}

  if (user) {
    const updated = {
      ...user,
      mvpCount: next,
      stats: {
        ...(user.stats || {}),
        mvpAwards: next,
      }
    };
    try {
      localStorage.setItem('vault_current_user', JSON.stringify(updated));
    } catch {}
    window.dispatchEvent(new CustomEvent('vault:user-updated', { detail: updated }));
    return updated;
  }
  return null;
}
