const DIGIT_NAMES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

/** Lookalikes in the note-id alphabet `0-9a-z`. */
const LOOKALIKE_NAMES: Record<string, string> = {
  "0": "digit zero — not the letter o",
  o: "letter o — not zero",
  "1": "digit one — not letter l",
  l: "letter l — not one",
};

export type CharCategory = "digit" | "letter" | "other";

export type CharEntry = {
  index: number;
  glyph: string;
  category: CharCategory;
  description: string;
};

export function categorizeChar(ch: string): CharCategory {
  if (ch >= "0" && ch <= "9") {
    return "digit";
  }
  if (ch >= "a" && ch <= "z") {
    return "letter";
  }
  return "other";
}

export function describeChar(ch: string): string {
  const lookalike = LOOKALIKE_NAMES[ch];
  if (lookalike) {
    return lookalike;
  }

  if (ch >= "0" && ch <= "9") {
    return `digit ${DIGIT_NAMES[Number(ch)]} (${ch})`;
  }
  if (ch >= "a" && ch <= "z") {
    return `letter ${ch}`;
  }

  return `character ${ch}`;
}

export function listCharEntries(id: string): CharEntry[] {
  return [...id].map((ch, index) => ({
    index: index + 1,
    glyph: ch,
    category: categorizeChar(ch),
    description: describeChar(ch),
  }));
}

export function formatCharBreakdown(id: string): string {
  return listCharEntries(id)
    .map((entry) => `${entry.index}. ${entry.glyph} — ${entry.description}`)
    .join("\n");
}
