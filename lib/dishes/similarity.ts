import type { Dish } from "@/lib/types";

const DUPLICATE_THRESHOLD = 0.72;
const RECOMMEND_THRESHOLD = 0.32;
const MIN_QUERY_LENGTH = 2;

/** Words that distinguish one dish from another (especially proteins). */
const QUALIFIER_TOKENS = new Set([
  "pork",
  "beef",
  "chicken",
  "lamb",
  "duck",
  "fish",
  "shrimp",
  "crab",
  "lobster",
  "tofu",
  "egg",
  "tomato",
  "mutton",
  "goat",
  "seafood",
  "vegetable",
  "veg",
  "mushroom",
  "winter",
  "melon",
  "banana",
  "steamed",
  "fried",
  "braised",
]);

function singularize(word: string): string {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

export function normalizeDishName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff\s]/gi, "")
    .replace(/\s+/g, " ");
}

function tokenize(name: string): string[] {
  return normalizeDishName(name)
    .split(" ")
    .filter(Boolean)
    .map(singularize);
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function getQualifiers(tokens: string[]): string[] {
  return tokens.filter((t) => QUALIFIER_TOKENS.has(t));
}

/** e.g. "beef ribs soup" should not match "pork rib soup". */
export function hasQualifierConflict(
  queryTokens: string[],
  dishTokens: string[]
): boolean {
  const queryQualifiers = getQualifiers(queryTokens);
  const dishQualifiers = getQualifiers(dishTokens);

  if (queryQualifiers.length === 0 || dishQualifiers.length === 0) {
    return false;
  }

  const querySet = new Set(queryQualifiers);
  const dishSet = new Set(dishQualifiers);

  const queryDiff = queryQualifiers.filter((q) => !dishSet.has(q));
  const dishDiff = dishQualifiers.filter((d) => !querySet.has(d));

  return queryDiff.length > 0 && dishDiff.length > 0;
}

/** Match whole or partial words: "so" → "soup", "r" → "rib". */
function tokensLooselyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length === 1) return b.startsWith(a);
  if (b.length === 1) return a.startsWith(b);
  return a.startsWith(b) || b.startsWith(a);
}

function queryTokensMatchDish(
  queryTokens: string[],
  dishTokens: string[]
): boolean {
  if (queryTokens.length === 0) return false;

  let dishIdx = 0;
  for (const queryToken of queryTokens) {
    let matched = false;
    while (dishIdx < dishTokens.length) {
      if (tokensLooselyEqual(queryToken, dishTokens[dishIdx])) {
        matched = true;
        dishIdx++;
        break;
      }
      dishIdx++;
    }
    if (!matched) return false;
  }
  return true;
}

/** Any query word loosely appears in dish words (order doesn't matter). */
function looseTokenOverlapScore(
  queryTokens: string[],
  dishTokens: string[]
): number {
  if (queryTokens.length === 0) return 0;

  let matched = 0;
  for (const queryToken of queryTokens) {
    if (queryToken.length < 1) continue;
    if (dishTokens.some((dt) => tokensLooselyEqual(queryToken, dt))) {
      matched++;
    }
  }

  return matched / queryTokens.length;
}

export function dishNameSimilarity(nameA: string, nameB: string): number {
  return dishRecommendScore(nameA, nameB);
}

/** Score for autocomplete while typing. */
export function dishRecommendScore(query: string, dishName: string): number {
  const trimmed = query.trim();
  if (!trimmed) return 0;

  const normQ = normalizeDishName(trimmed);
  const normD = normalizeDishName(dishName);
  const queryTokens = tokenize(trimmed);
  const dishTokens = tokenize(dishName);

  if (!normQ || !normD) return 0;
  if (normQ === normD) return 1;
  if (hasQualifierConflict(queryTokens, dishTokens)) return 0;

  const overlap = looseTokenOverlapScore(queryTokens, dishTokens);
  const orderedMatch = queryTokensMatchDish(queryTokens, dishTokens);
  const prefixMatch = normD.startsWith(normQ);
  const containsMatch = normD.includes(normQ);

  // Every query word must match (or prefix/ordered match) — prevents "pork rib so" → "soy milk"
  const hasRelevance =
    orderedMatch ||
    prefixMatch ||
    containsMatch ||
    overlap === 1;
  if (!hasRelevance) return 0;

  const scores: number[] = [];

  if (orderedMatch) {
    scores.push(0.75 + (queryTokens.length / dishTokens.length) * 0.25);
  }

  if (prefixMatch) {
    scores.push(0.68 + (normQ.length / normD.length) * 0.32);
  }

  if (containsMatch && !prefixMatch) {
    scores.push(0.55 + (normQ.length / normD.length) * 0.35);
  }

  if (overlap > 0) {
    scores.push(0.35 + overlap * 0.55);
  }

  if (orderedMatch || prefixMatch || overlap >= 0.5) {
    const maxLen = Math.max(normQ.length, normD.length);
    scores.push((1 - levenshtein(normQ, normD) / maxLen) * 0.85);
  }

  return Math.max(...scores);
}

export interface SimilarDishMatch {
  dish: Dish;
  score: number;
}

export function recommendDishesWhileTyping(
  dishes: Dish[],
  query: string,
  options?: { mealSlot?: string; limit?: number }
): SimilarDishMatch[] {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const limit = options?.limit ?? 8;
  const mealSlot = options?.mealSlot;
  const normQuery = normalizeDishName(trimmed);

  return dishes
    .map((dish) => {
      let score = dishRecommendScore(trimmed, dish.name);
      if (
        mealSlot &&
        Array.isArray(dish.meal_types) &&
        dish.meal_types.includes(mealSlot as Dish["meal_types"][number])
      ) {
        score += 0.02;
      }
      return { dish, score };
    })
    .filter(({ score, dish }) => {
      if (score < RECOMMEND_THRESHOLD) return false;
      // Only hide exact same name; keep close variants visible
      return normalizeDishName(dish.name) !== normQuery;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function findSimilarDishes(
  dishes: Dish[],
  name: string,
  threshold = DUPLICATE_THRESHOLD
): SimilarDishMatch[] {
  return recommendDishesWhileTyping(dishes, name, { limit: 10 }).filter(
    ({ score }) => score >= threshold
  );
}

export function isDuplicateDishName(
  dishes: Dish[],
  name: string,
  threshold = DUPLICATE_THRESHOLD
): boolean {
  return findSimilarDishes(dishes, name, threshold).length > 0;
}
