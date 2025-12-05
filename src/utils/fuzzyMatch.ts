// Levenshtein distance-based fuzzy matching utility

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function similarityScore(a: string, b: string): number {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  
  if (aLower === bLower) return 100;
  
  // Check if one contains the other
  if (aLower.includes(bLower) || bLower.includes(aLower)) {
    return 90;
  }
  
  const maxLen = Math.max(aLower.length, bLower.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(aLower, bLower);
  return Math.round((1 - distance / maxLen) * 100);
}

export interface FuzzyMatch<T> {
  item: T;
  score: number;
}

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getSearchText: (item: T) => string,
  minScore: number = 50
): FuzzyMatch<T>[] {
  const results: FuzzyMatch<T>[] = [];
  
  for (const item of items) {
    const text = getSearchText(item);
    const score = similarityScore(query, text);
    
    // Also check individual words
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let wordMatchBonus = 0;
    for (const qWord of queryWords) {
      for (const tWord of textWords) {
        if (tWord.includes(qWord) || qWord.includes(tWord)) {
          wordMatchBonus += 10;
        }
      }
    }
    
    const finalScore = Math.min(100, score + wordMatchBonus);
    
    if (finalScore >= minScore) {
      results.push({ item, score: finalScore });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

export function findBestMatch<T>(
  query: string,
  items: T[],
  getSearchText: (item: T) => string,
  confidenceThreshold: number = 80
): { match: T | null; confidence: number; alternatives: FuzzyMatch<T>[] } {
  const matches = fuzzySearch(query, items, getSearchText, 40);
  
  if (matches.length === 0) {
    return { match: null, confidence: 0, alternatives: [] };
  }
  
  const best = matches[0];
  const alternatives = matches.slice(1, 4);
  
  if (best.score >= confidenceThreshold) {
    return { match: best.item, confidence: best.score, alternatives };
  }
  
  return { match: null, confidence: best.score, alternatives: matches.slice(0, 4) };
}
