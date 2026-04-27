import type { Category, Clue, RawCategory, RawRoundData, RoundData } from "./types";

const JEOPARDY_VALUES = [200, 400, 600, 800, 1000];
const DOUBLE_VALUES = [400, 800, 1200, 1600, 2000];

function pickUniqueCells(
  categoryCount: number,
  clueCount: number,
  count: number,
  excludeFirstRow = false,
): Array<{ categoryIdx: number; clueIdx: number }> {
  const picks = new Set<string>();
  const result: Array<{ categoryIdx: number; clueIdx: number }> = [];
  const minClueIdx = excludeFirstRow ? 1 : 0;

  let safety = 0;
  while (result.length < count && safety < 1000) {
    safety += 1;
    const categoryIdx = Math.floor(Math.random() * categoryCount);
    const clueIdx =
      minClueIdx + Math.floor(Math.random() * (clueCount - minClueIdx));
    const key = `${categoryIdx}:${clueIdx}`;
    if (picks.has(key)) continue;
    picks.add(key);
    result.push({ categoryIdx, clueIdx });
  }
  return result;
}

function buildCategory(raw: RawCategory, fallbackValues: number[]): Category {
  const clues: Clue[] = fallbackValues.map((value, idx) => {
    const rawClue = raw.clues?.[idx];
    return {
      question: rawClue?.question ?? "",
      answer: rawClue?.answer ?? "",
      value,
      played: false,
      isDailyDouble: false,
    };
  });
  return { name: raw.name, clues };
}

export function buildRoundData(raw: RawRoundData): RoundData {
  const jeopardy = raw.jeopardy
    .slice(0, 6)
    .map((c) => buildCategory(c, JEOPARDY_VALUES));
  const double = raw.double
    .slice(0, 6)
    .map((c) => buildCategory(c, DOUBLE_VALUES));

  for (const pick of pickUniqueCells(jeopardy.length, 5, 1, true)) {
    const clue = jeopardy[pick.categoryIdx]?.clues[pick.clueIdx];
    if (clue) clue.isDailyDouble = true;
  }
  for (const pick of pickUniqueCells(double.length, 5, 2, false)) {
    const clue = double[pick.categoryIdx]?.clues[pick.clueIdx];
    if (clue) clue.isDailyDouble = true;
  }

  return {
    jeopardy,
    double,
    final: raw.final,
  };
}
