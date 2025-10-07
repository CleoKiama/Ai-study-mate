// /lib/mock-data.ts

export const mockDocuments = [
  {
    id: "doc-1",
    name: "Formation of Karst Features in Limestone Areas",
    uploadDate: "2025-10-04",
    size: "1.2 MB",
    type: "PDF",
  },
  {
    id: "doc-2",
    name: "Formation of Mesas and Buttes in Deserts",
    uploadDate: "2025-10-02",
    size: "850 KB",
    type: "PDF",
  },
  {
    id: "doc-3",
    name: "Formation of Cirque Lakes",
    uploadDate: "2025-09-30",
    size: "740 KB",
    type: "PDF",
  },
];

export const mockQuizzes = [
  {
    id: "quiz-1",
    title: "Karst Features Quiz",
    questionsCount: 10,
    bestScore: 88,
    lastAttempt: "2025-10-04",
  },
  {
    id: "quiz-2",
    title: "Desert Landforms Quiz",
    questionsCount: 8,
    bestScore: 76,
    lastAttempt: "2025-10-02",
  },
  {
    id: "quiz-3",
    title: "Glacial Landforms Quiz",
    questionsCount: 7,
    bestScore: 92,
    lastAttempt: "2025-09-30",
  },
];

export const mockQuestions = [
  {
    id: 1,
    question:
      "What process primarily causes the formation of karst features in limestone regions?",
    options: [
      "Mechanical weathering",
      "Chemical dissolution",
      "Wind erosion",
      "Sediment deposition",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which of the following is NOT a typical surface karst feature?",
    options: ["Sinkhole", "Uvala", "Limestone pavement", "Delta"],
    correctAnswer: 3,
  },
  {
    id: 3,
    question: "What is formed when stalactites and stalagmites meet in a cave?",
    options: ["Column", "Doline", "Polje", "Cavern"],
    correctAnswer: 0,
  },
  {
    id: 4,
    question:
      "Which chemical reaction explains the dissolution of limestone by carbonic acid?",
    options: [
      "CaCO₃ + H₂O → Ca(OH)₂ + CO₂",
      "CaCO₃ + H₂CO₃ → Ca(HCO₃)₂",
      "CaCO₃ + O₂ → CaO + CO₂",
      "CaCO₃ + HCl → CaCl₂ + CO₂ + H₂O",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "What type of water typically contributes to karst formation?",
    options: [
      "Hard water rich in calcium carbonate",
      "Pure distilled water",
      "Saltwater",
      "Alkaline groundwater",
    ],
    correctAnswer: 0,
  },
];

export const mockProgress = {
  averageScore: 85,
  streakDays: 6,
  totalQuizzes: 3,
  timeSpent: 2,
};

export const mockSummaries = [
  {
    id: "1",
    documentTitle: "The Rise of Artificial Intelligence",
    createdAt: "2025-10-01T10:24:00Z",
    summary:
      "This paper explores the rapid advancement of AI technologies and their impact on labor markets, privacy, and ethics. It highlights the transition from narrow AI to general AI, while calling for stronger global governance frameworks.",
  },
  {
    id: "2",
    documentTitle: "Understanding Quantum Computing",
    createdAt: "2025-09-29T14:12:00Z",
    summary:
      "An introductory analysis of quantum mechanics principles and how they apply to computational theory. The document discusses qubits, superposition, entanglement, and the potential speedups offered by quantum algorithms like Shor’s and Grover’s.",
  },
  {
    id: "3",
    documentTitle: "Climate Change: A Global Perspective",
    createdAt: "2025-09-25T08:40:00Z",
    summary:
      "A concise summary of recent climate reports, emphasizing human-driven carbon emissions and their impact on global temperature rise. The author suggests a combination of policy change, renewable energy investment, and behavioral adaptation.",
  },
];
