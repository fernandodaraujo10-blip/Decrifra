
export interface MovieInfo {
  originalTitle: string;
  year: number;
  director: string;
  genre: string;
  duration: string;
  country: string;
  whereToWatch: string;
  synopsis: string;
}

export interface Rating {
  criterion: string;
  score: number;
  explanation: string;
}

export interface Character {
  name: string;
  dramaticFunction: string;
  description: string;
}

export interface SymbolMetaphor {
  name: string;
  occurrence: string;
  representation: string;
  reflection: string;
}

export interface CharacterConflict {
  name: string;
  centralDesire: string;
  hiddenFear: string;
  internalContradiction: string;
  symbolicRole: string;
}

export interface Exegesis {
  authorIntention: string;
  nuances: string[];
  centralThesis: string;
}

export interface Lessons {
  human: string[];
  existential: string[];
  reflectionQuestions: string[];
}

export interface AlternativeReadings {
  psychological: string;
  philosophical: string;
  spiritual: string;
}

export interface Spoilers {
  keyScenes: string[];
  twists: string;
  finalExplained: string;
  postEndingSymbols: string;
}

export interface SimilarMovie {
  title: string;
  reason: string;
  category: "tema" | "tom" | "pergunta";
}

export interface RealLifeStory {
  title: string;
  description: string;
  connection: string;
}

export interface Argument {
  title: string;
  paragraph: string;
  connection: string;
}

export interface Synthesis {
  centralThesis: string;
  arguments: Argument[];
  conclusion: string;
}

export interface ThinkerPerspective {
  name: string;
  subtitle: string;
  intro: string;
  interpretation: string;
  meaning: string;
  application: string;
  impactPhrase: string;
  source: string;
}

export interface MovieAnalysis {
  info: MovieInfo;
  ratings: Rating[];
  characters: Character[];
  whyWatch: string;
  hiddenElements: string[];
  symbols: SymbolMetaphor[];
  characterConflicts: CharacterConflict[];
  exegesis: Exegesis;
  lessons: Lessons;
  alternativeReadings: AlternativeReadings;
  spoilers: Spoilers;
  deepEssay: string;
  similarMovies: SimilarMovie[];
  realLifeStory: RealLifeStory;
  synthesis: Synthesis; // Layer 9
  perspectives: ThinkerPerspective[]; // Layer 10
}
