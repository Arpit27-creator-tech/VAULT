export const FALLBACK_SUBJECT_IMG = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80";
export const FALLBACK_AVATAR_IMG = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80";

export const initialMissions = [
  {
    id: "m1",
    title: "The Bank of Logic & Proofs",
    category: "Computer Science & Logic",
    difficulty: "Master Expedition",
    reward: "10,000 XP & Kernel Cipher",
    description: "Infiltrate the kernel mainframe and crack array pointer traversal firewall locks before the root security grid cycles.",
    roomsCount: 4,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    rooms: []
  },
  {
    id: "m2",
    title: "The Quantum Laser & Optics Vault",
    category: "Applied Physics & Mathematics",
    difficulty: "Medium",
    reward: "7,500 XP & Laser Prism",
    description: "Calculate trajectory deflections, Snell's law refraction indices, and load balances to override the high-voltage laser barrier.",
    roomsCount: 4,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    rooms: []
  },
  {
    id: "m3",
    title: "The Alchemical Reactor & Bio-Lab",
    category: "Chemistry & Life Sciences",
    difficulty: "Easy",
    reward: "5,000 XP & Catalyst Flask",
    description: "Synthesize neutralizing compound reagents, balance stoichiometric reactions, and regulate cellular ATP bio-voltage.",
    roomsCount: 3,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    rooms: []
  },
  {
    id: "m4",
    title: "The Rosetta Crypt & Frequency Vault",
    category: "Linguistics & Ancient Ciphers",
    difficulty: "Master Expedition",
    reward: "12,000 XP & Golden Glyph",
    description: "Tune VHF radio frequencies, solve Vigenère and Caesar shifts, and decipher historical glyphs to broadcast the override pass.",
    roomsCount: 6,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    rooms: []
  },
  {
    id: "custom-5b2a732a",
    title: "The Multidisciplinary Grand Core",
    category: "Integrated STEM Synthesis",
    difficulty: "Master Expedition",
    reward: "15,000 XP & Master Key",
    description: "The ultimate 4-way collaborative operation requiring simultaneous chemical, optical, algorithmic, and linguistic decryption.",
    roomsCount: 1,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    rooms: [
      {
        id: 1,
        title: "Mainframe Core",
        question: "Which data structure follows First-In, First-Out (FIFO) ordering for processing execution streams?",
        options: ["Queue", "Stack", "Binary Heap", "Hash Map"],
        correct: 0
      }
    ]
  }
];

export const initialCharacters = [
  {
    id: "c1",
    name: "Alex 'Byte' Vance",
    role: "The Hacker",
    discipline: "Computer Science & Logic",
    specialAbility: "Kernel Pointer Bypass (Instantly deciphers 1 array slice firewall node)",
    description: "Specializes in data structures, recursion, binary logic gates, and low-level kernel injection.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    stats: { speed: 80, hacking: 99, stealth: 85 }
  },
  {
    id: "c2",
    name: "Dr. Marcus Chen",
    role: "The Engineer",
    discipline: "Applied Physics & Calculus",
    specialAbility: "Snell's Law Overdrive (Auto-calculates optical refraction and laser trajectory)",
    description: "Master of laser deflector mechanics, structural stress blueprints, and capacitor grid loads.",
    avatar: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80",
    stats: { speed: 65, strength: 95, physics: 98 }
  },
  {
    id: "c3",
    name: "Dr. Elena Rostova",
    role: "The Scientist",
    discipline: "Chemistry & Stoichiometry",
    specialAbility: "Stoichiometry Catalyst (Balances molar reagents & pH buffer instantly)",
    description: "Expert in reagent synthesis, thermodynamics enthalpy, and cryo-containment dissolution.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    stats: { speed: 75, chemistry: 99, wisdom: 92 }
  },
  {
    id: "c4",
    name: "Maya 'Cipher' Lin",
    role: "The Cryptographer",
    discipline: "Linguistics & Ciphers",
    specialAbility: "Frequency Lock & Key (Eliminates VHF static and reveals cipher shift)",
    description: "Fluent in 8 languages, master of Caesar/Vigenère ciphers, and ancient historical glyphs.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    stats: { speed: 92, linguistics: 99, agility: 88 }
  }
];

export const initialTopics = [
  {
    id: "t1",
    name: "Computer Science & Logic",
    icon: "Terminal",
    discipline: "Algorithms, Slicing, Boolean Gates & Data Structures",
    description: "Write recursive algorithms, optimize memory pointers, and bypass kernel firewall sandboxes.",
    activeHeists: 3420
  },
  {
    id: "t2",
    name: "Applied Physics & Mathematics",
    icon: "Compass",
    discipline: "Optics, Geometry, Calculus & Energy Loads",
    description: "Calculate laser reflection angles, Snell's law refraction, and capacitor grid resistance.",
    activeHeists: 2850
  },
  {
    id: "t3",
    name: "Chemistry & Stoichiometry",
    icon: "FlaskConical",
    discipline: "Molar Equations, pH Buffers & Thermodynamics",
    description: "Synthesize neutralizing reagents, balance enthalpy reactions, and dissolve security alloy locks.",
    activeHeists: 2310
  },
  {
    id: "t4",
    name: "Cryptography & Linguistics",
    icon: "Key",
    discipline: "Vigenère Ciphers, VHF Radio Tuning & Runes",
    description: "Decipher intercepted enemy communications, tune frequency spectrums, and translate ancient glyphs.",
    activeHeists: 1980
  }
];

export const initialLobby = {
  id: "lobby-knowledge",
  code: "HEIST-782",
  name: "The Quantum Core Strike Squad",
  missionId: "m1",
  players: [
    {
      slotId: 1,
      playerName: "",
      username: "",
      role: "The Hacker",
      characterId: "c1",
      isReady: false,
      isHost: false
    },
    {
      slotId: 2,
      playerName: "",
      username: "",
      role: "The Engineer",
      characterId: "c2",
      isReady: false,
      isHost: false
    },
    {
      slotId: 3,
      playerName: "",
      username: "",
      role: "The Scientist",
      characterId: "c3",
      isReady: false,
      isHost: false
    },
    {
      slotId: 4,
      playerName: "",
      username: "",
      role: "The Cryptographer",
      characterId: "c4",
      isReady: false,
      isHost: false
    }
  ],
  status: "waiting"
};

export const triviaQuestions = {
  1: {
    question: "In computer science, what is the time complexity of looking up a key in a balanced Hash Table on average?",
    options: [
      "O(1) Constant Time",
      "O(n) Linear Time",
      "O(log n) Logarithmic",
      "O(n^2) Quadratic"
    ],
    correct: 0
  },
  2: {
    question: "According to Snell's Law (n1 * sin(θ1) = n2 * sin(θ2)), what happens when light travels from air into denser glass (n > 1)?",
    options: [
      "The beam bends away from the normal",
      "The beam bends toward the normal line",
      "The beam maintains original trajectory",
      "The frequency of light increases"
    ],
    correct: 1
  },
  3: {
    question: "When balancing the combustion reaction CH4 + 2 O2 -> CO2 + 2 H2O, what is the stoichiometric coefficient of O2?",
    options: [
      "2",
      "1",
      "3",
      "4"
    ],
    correct: 0
  },
  4: {
    question: "In classical cryptography, which cipher uses a series of interwoven Caesar ciphers based on the letters of a keyword?",
    options: [
      "Vigenère Cipher",
      "Atbash Cipher",
      "Rail Fence Cipher",
      "Scytale Transposition"
    ],
    correct: 0
  }
};
