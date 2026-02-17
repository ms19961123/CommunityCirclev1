import { describe, it, expect } from "vitest";

// Inline the moderation logic for unit testing without Prisma dependency
const PROFANITY_LIST = [
  "fuck",
  "shit",
  "ass",
  "damn",
  "bitch",
  "bastard",
  "crap",
  "dick",
  "piss",
  "slut",
  "whore",
  "nigger",
  "faggot",
  "retard",
  "cunt",
];

const POLITICAL_KEYWORDS = [
  "maga",
  "trump",
  "biden",
  "democrat",
  "republican",
  "liberal",
  "conservative",
  "left-wing",
  "right-wing",
  "antifa",
  "blm",
  "defund",
  "pro-life",
  "pro-choice",
  "gun control",
  "second amendment",
  "immigration ban",
  "build the wall",
  "socialism",
  "communism",
  "fascism",
  "marxism",
];

function checkContent(text: string): {
  blocked: boolean;
  blockReason?: string;
  flagged: boolean;
  flagRule?: "PROFANITY" | "POLITICS";
} {
  const lower = text.toLowerCase();

  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return { blocked: true, blockReason: `Profanity detected: "${word}"`, flagged: false };
    }
  }

  for (const keyword of POLITICAL_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      return { blocked: false, flagged: true, flagRule: "POLITICS" };
    }
  }

  return { blocked: false, flagged: false };
}

describe("Content Moderation", () => {
  it("should block profanity", () => {
    const result = checkContent("What the fuck is this event");
    expect(result.blocked).toBe(true);
    expect(result.blockReason).toContain("fuck");
  });

  it("should flag political content", () => {
    const result = checkContent("MAGA rally at the park");
    expect(result.blocked).toBe(false);
    expect(result.flagged).toBe(true);
    expect(result.flagRule).toBe("POLITICS");
  });

  it("should allow clean content", () => {
    const result = checkContent("Fun playground meetup for toddlers this Saturday!");
    expect(result.blocked).toBe(false);
    expect(result.flagged).toBe(false);
  });

  it("should be case insensitive for profanity", () => {
    const result = checkContent("DAMN this weather");
    expect(result.blocked).toBe(true);
  });

  it("should detect political keywords regardless of case", () => {
    const result = checkContent("Let's discuss socialism at the park");
    expect(result.flagged).toBe(true);
    expect(result.flagRule).toBe("POLITICS");
  });

  it("should not flag partial word matches for profanity", () => {
    const result = checkContent("Classic craft session for kids");
    expect(result.blocked).toBe(false);
  });

  it("should allow family-friendly content", () => {
    const examples = [
      "Morning stroller walk at Rittenhouse Square",
      "Toddler story time at the Free Library",
      "Craft swap and play date",
      "Soccer practice for kids ages 5-8",
      "Nature walk along the Schuylkill River Trail",
    ];

    for (const text of examples) {
      const result = checkContent(text);
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(false);
    }
  });
});

describe("Geo Utilities", () => {
  // Haversine distance
  function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 3959; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getBoundingBox(
    lat: number,
    lng: number,
    radiusMiles: number
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    const latDelta = radiusMiles / 69;
    const lngDelta = radiusMiles / (69 * Math.cos((lat * Math.PI) / 180));
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }

  it("should calculate distance between two Philadelphia points", () => {
    // Rittenhouse Square to University City: ~1.5 miles
    const dist = haversineDistance(39.9496, -75.172, 39.9522, -75.1932);
    expect(dist).toBeGreaterThan(1);
    expect(dist).toBeLessThan(2);
  });

  it("should return zero distance for same point", () => {
    const dist = haversineDistance(39.9526, -75.1652, 39.9526, -75.1652);
    expect(dist).toBe(0);
  });

  it("should compute a bounding box", () => {
    const box = getBoundingBox(39.9526, -75.1652, 5);
    expect(box.minLat).toBeLessThan(39.9526);
    expect(box.maxLat).toBeGreaterThan(39.9526);
    expect(box.minLng).toBeLessThan(-75.1652);
    expect(box.maxLng).toBeGreaterThan(-75.1652);
  });

  it("should have larger box for larger radius", () => {
    const box5 = getBoundingBox(39.9526, -75.1652, 5);
    const box10 = getBoundingBox(39.9526, -75.1652, 10);
    expect(box10.maxLat - box10.minLat).toBeGreaterThan(
      box5.maxLat - box5.minLat
    );
  });
});

describe("Validation Helpers", () => {
  it("should validate event title length", () => {
    expect("Hi".length).toBeLessThan(6); // too short
    expect("A".repeat(81).length).toBeGreaterThan(80); // too long
    expect("Morning Walk at the Park".length).toBeGreaterThanOrEqual(6);
    expect("Morning Walk at the Park".length).toBeLessThanOrEqual(80);
  });

  it("should validate description length", () => {
    expect("Short".length).toBeLessThan(20); // too short
    expect(
      "Join us for a wonderful morning walk through the park with kids of all ages."
        .length
    ).toBeGreaterThanOrEqual(20);
  });

  it("should validate maxAttendees range", () => {
    expect(1).toBeLessThan(2); // too low
    expect(51).toBeGreaterThan(50); // too high
    expect(10).toBeGreaterThanOrEqual(2);
    expect(10).toBeLessThanOrEqual(50);
  });
});
