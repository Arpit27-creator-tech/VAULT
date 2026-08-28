-- ============================================================
-- V.A.U.L.T — Seed Data
-- Pre-populates missions, characters (as reference data), and topics
-- ============================================================

-- ============================================================
-- SEED MISSIONS (5 built-in)
-- ============================================================
INSERT INTO missions (id, title, category, difficulty, reward, description, image_url, rooms_count, featured, is_custom, rooms_data)
VALUES
  (
    uuid_generate_v4(),
    'The Bank of Logic & Proofs',
    'Computer Science & Logic',
    'Master Expedition',
    '10,000 XP & Kernel Cipher',
    'Infiltrate the kernel mainframe and crack array pointer traversal firewall locks before the root security grid cycles.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    4, TRUE, FALSE,
    '[]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'The Quantum Laser & Optics Vault',
    'Applied Physics & Mathematics',
    'Medium',
    '7,500 XP & Laser Prism',
    'Calculate trajectory deflections, Snell''s law refraction indices, and load balances to override the high-voltage laser barrier.',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    4, TRUE, FALSE,
    '[]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'The Alchemical Reactor & Bio-Lab',
    'Chemistry & Life Sciences',
    'Easy',
    '5,000 XP & Catalyst Flask',
    'Synthesize neutralizing compound reagents, balance stoichiometric reactions, and regulate cellular ATP bio-voltage.',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    3, FALSE, FALSE,
    '[]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'The Rosetta Crypt & Frequency Vault',
    'Linguistics & Ancient Ciphers',
    'Master Expedition',
    '12,000 XP & Golden Glyph',
    'Tune VHF radio frequencies, solve Vigenère and Caesar shifts, and decipher historical glyphs to broadcast the override pass.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    6, FALSE, FALSE,
    '[]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'The Multidisciplinary Grand Core',
    'Integrated STEM Synthesis',
    'Master Expedition',
    '15,000 XP & Master Key',
    'The ultimate 4-way collaborative operation requiring simultaneous chemical, optical, algorithmic, and linguistic decryption.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    1, FALSE, FALSE,
    '[{"id": 1, "title": "Mainframe Core", "question": "Which data structure follows First-In, First-Out (FIFO) ordering for processing execution streams?", "options": ["Queue", "Stack", "Binary Heap", "Hash Map"], "correct": 0}]'::jsonb
  );
