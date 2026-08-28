// ============================================================
// V.A.U.L.T — Missions Routes (List, Detail, Custom CRUD)
// ============================================================

import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/missions — List all missions (built-in + featured custom)
// ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, featured, custom } = req.query;

    let sql = `SELECT id, title, category, difficulty, reward, description, image_url, 
                      rooms_count, featured, is_custom, rooms_data, creator_id, created_at
               FROM missions WHERE 1=1`;
    const params = [];
    let paramIdx = 1;

    if (category) {
      sql += ` AND category = $${paramIdx++}`;
      params.push(category);
    }
    if (difficulty) {
      sql += ` AND difficulty = $${paramIdx++}`;
      params.push(difficulty);
    }
    if (featured === 'true') {
      sql += ` AND featured = TRUE`;
    }
    if (custom === 'true') {
      sql += ` AND is_custom = TRUE`;
    } else if (custom === 'false') {
      sql += ` AND is_custom = FALSE`;
    }

    sql += ` ORDER BY featured DESC, created_at DESC`;

    const result = await query(sql, params);

    const missions = result.rows.map(m => ({
      id: m.id,
      title: m.title,
      category: m.category,
      difficulty: m.difficulty,
      reward: m.reward,
      description: m.description,
      image: m.image_url,
      roomsCount: m.rooms_count,
      featured: m.featured,
      isCustom: m.is_custom,
      rooms: m.rooms_data || [],
      creatorId: m.creator_id
    }));

    res.json({ missions });

  } catch (err) {
    console.error('[MISSIONS] List error:', err);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/missions/:id — Single mission detail
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*, u.username AS creator_name, u.callsign AS creator_callsign
       FROM missions m
       LEFT JOIN users u ON u.id = m.creator_id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const m = result.rows[0];

    // Also fetch custom heist stage data if exists
    const stagesResult = await query(
      `SELECT stage_data FROM custom_heist_stages WHERE mission_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      mission: {
        id: m.id,
        title: m.title,
        category: m.category,
        difficulty: m.difficulty,
        reward: m.reward,
        description: m.description,
        image: m.image_url,
        roomsCount: m.rooms_count,
        featured: m.featured,
        isCustom: m.is_custom,
        rooms: m.rooms_data || [],
        creator: m.creator_name ? { username: m.creator_name, callsign: m.creator_callsign } : null,
        customStageData: stagesResult.rows.length > 0 ? stagesResult.rows[0].stage_data : null
      }
    });

  } catch (err) {
    console.error('[MISSIONS] Get detail error:', err);
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/missions — Create a custom heist mission
// ─────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, category, difficulty, reward, description, image_url, rooms_count, rooms_data, customStageData } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    // Insert mission
    const missionResult = await query(
      `INSERT INTO missions (title, category, difficulty, reward, description, image_url, rooms_count, featured, is_custom, rooms_data, creator_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE, $8, $9)
       RETURNING *`,
      [
        title,
        category || 'Custom Operation',
        difficulty || 'Medium',
        reward || '8,000 XP & Custom Token',
        description || '',
        image_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        rooms_count || 1,
        JSON.stringify(rooms_data || []),
        req.user.id
      ]
    );

    const mission = missionResult.rows[0];

    // Save custom stage data if provided
    if (customStageData) {
      await query(
        `INSERT INTO custom_heist_stages (mission_id, stage_data, creator_id) VALUES ($1, $2, $3)`,
        [mission.id, JSON.stringify(customStageData), req.user.id]
      );
    }

    res.status(201).json({
      mission: {
        id: mission.id,
        title: mission.title,
        category: mission.category,
        difficulty: mission.difficulty,
        reward: mission.reward,
        description: mission.description,
        image: mission.image_url,
        roomsCount: mission.rooms_count,
        featured: mission.featured,
        isCustom: mission.is_custom,
        rooms: mission.rooms_data || []
      }
    });

  } catch (err) {
    console.error('[MISSIONS] Create error:', err);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/missions/:id — Delete own custom mission
// ─────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const mission = await query(
      `SELECT creator_id, is_custom FROM missions WHERE id = $1`,
      [id]
    );

    if (mission.rows.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    if (!mission.rows[0].is_custom) {
      return res.status(403).json({ error: 'Cannot delete built-in missions' });
    }

    if (mission.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own missions' });
    }

    await query(`DELETE FROM missions WHERE id = $1`, [id]);

    res.json({ message: 'Mission deleted successfully' });

  } catch (err) {
    console.error('[MISSIONS] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

export default router;
