/**
 * Content moderation utilities for community safety.
 *
 * - Hard block: content containing profanity is rejected outright.
 * - Soft flag: content containing political bait terms is allowed but
 *   flagged for moderator review.
 */

export const PROFANITY_LIST: string[] = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "cunt",
  "dick",
  "piss",
  "cock",
  "bastard",
  "slut",
  "whore",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "motherfucker",
  "asshole",
  "bullshit",
  "horseshit",
  "dumbass",
  "jackass",
  "shithead",
  "fuckface",
  "dickhead",
];

export const POLITICAL_KEYWORDS: string[] = [
  "democrat",
  "republican",
  "liberal",
  "conservative",
  "trump",
  "biden",
  "maga",
  "woke",
  "antifa",
  "socialism",
  "communism",
  "fascism",
  "leftist",
  "right-wing",
  "left-wing",
  "alt-right",
  "marxist",
  "capitalist",
  "pro-life",
  "pro-choice",
  "gun control",
  "second amendment",
  "immigration ban",
  "defund the police",
  "blue lives matter",
  "black lives matter",
  "all lives matter",
  "crt",
  "critical race theory",
  "election fraud",
  "stolen election",
];

export type ModerationFlag = "PROFANITY" | "POLITICS";

export interface ModerationResult {
  blocked: boolean;
  blockReason?: string;
  flagged: boolean;
  flagRule?: ModerationFlag;
}

/**
 * Check content against moderation rules.
 *
 * 1. Hard block if any profanity word is found (whole-word match,
 *    case-insensitive).
 * 2. Soft flag if any political keyword is found (whole-word match,
 *    case-insensitive).
 *
 * Returns the first match found in each category.
 */
export function checkContent(text: string): ModerationResult {
  const normalised = text.toLowerCase();

  // --- Hard block: profanity ---
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    if (regex.test(normalised)) {
      return {
        blocked: true,
        blockReason: `Content contains prohibited language: "${word}"`,
        flagged: false,
      };
    }
  }

  // --- Soft flag: political keywords ---
  for (const keyword of POLITICAL_KEYWORDS) {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
    if (regex.test(normalised)) {
      return {
        blocked: false,
        flagged: true,
        flagRule: "POLITICS",
      };
    }
  }

  return {
    blocked: false,
    flagged: false,
  };
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
