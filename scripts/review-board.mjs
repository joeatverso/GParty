const base = process.env.REVIEW_BASE_URL ?? "http://localhost:3000";
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const jeopardyTopic = args[0] ?? "1990s pop culture";
const doubleTopic = args[1] ?? "World capitals";
const teams = ["Team 1", "Team 2"];

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "in",
  "on",
  "at",
  "and",
  "or",
  "to",
  "for",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
]);

async function fetchPart(part, theme) {
  const started = Date.now();
  console.log(`Requesting ${part} (${theme})...`);
  const res = await fetch(`${base}/api/openai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme, teams, part }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  const data = JSON.parse(json.message);
  console.log(`  ${part} ready in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return data;
}

function contentWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function leakWords(question, answer) {
  const questionWords = new Set(contentWords(question));
  return contentWords(answer).filter((word) => questionWords.has(word));
}

function printClue(clue) {
  console.log(`  $${clue.value}`);
  console.log(`    Q: ${clue.question}`);
  console.log(`    A: ${clue.answer}`);
  const leaked = leakWords(clue.question ?? "", clue.answer ?? "");
  if (leaked.length > 0) {
    console.log(`    ! answer words also in the clue: ${leaked.join(", ")}`);
  }
}

function printRound(title, theme, categories) {
  console.log(`\n${title} — ${theme}`);
  console.log("=".repeat(72));
  if (!Array.isArray(categories)) {
    console.log("  (missing categories)");
    return;
  }
  if (categories.length !== 6) {
    console.log(`  ! expected 6 categories, got ${categories.length}`);
  }
  for (const category of categories) {
    console.log(`\n${category.name}`);
    const clues = category.clues ?? [];
    if (clues.length !== 5) {
      console.log(`  ! expected 5 clues, got ${clues.length}`);
    }
    for (const clue of clues) printClue(clue);
  }
}

const [jeopardy, double, final] = await Promise.all([
  fetchPart("jeopardy", jeopardyTopic),
  fetchPart("double", doubleTopic),
  fetchPart("final", `${jeopardyTopic} + ${doubleTopic}`),
]);

printRound("JEOPARDY", jeopardyTopic, jeopardy.jeopardy);
printRound("DOUBLE JEOPARDY", doubleTopic, double.double);

console.log("\nFINAL JEOPARDY");
console.log("=".repeat(72));
const finalClue = final.final ?? {};
console.log(`\n${finalClue.category ?? "(no category)"}`);
console.log(`  Q: ${finalClue.question}`);
console.log(`  A: ${finalClue.answer}`);
const finalLeak = leakWords(finalClue.question ?? "", finalClue.answer ?? "");
if (finalLeak.length > 0) {
  console.log(`  ! answer words also in the clue: ${finalLeak.join(", ")}`);
}
console.log("");
