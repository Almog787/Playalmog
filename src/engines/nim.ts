import { NimMove, NimState } from '../types';

// Calculate Bitwise XOR Nim-Sum (Bouton 1901 Theorem)
export function calculateNimSum(piles: number[]): { nimSum: number; binaryPiles: string[]; binarySum: string } {
  const nimSum = piles.reduce((acc, curr) => acc ^ curr, 0);
  const maxVal = Math.max(...piles, 1);
  const maxBits = Math.max(3, maxVal.toString(2).length);

  const binaryPiles = piles.map(p => p.toString(2).padStart(maxBits, '0'));
  const binarySum = nimSum.toString(2).padStart(maxBits, '0');

  return { nimSum, binaryPiles, binarySum };
}

// Calculate mathematically guaranteed optimal move (Bouton's Theorem)
export function getBestNimMove(
  piles: number[],
  mode: 'normal' | 'misere' = 'normal'
): { move: NimMove | null; isWinningPosition: boolean; nimSum: number; explanationHe: string; explanationEn: string } {
  const { nimSum } = calculateNimSum(piles);
  const activePiles = piles.filter(p => p > 0);

  if (activePiles.length === 0) {
    return {
      move: null,
      isWinningPosition: false,
      nimSum: 0,
      explanationHe: 'המשחק הסתיים',
      explanationEn: 'Game Over'
    };
  }

  // Misère Nim Special Case:
  // When all piles greater than 1 are about to be eliminated, leave an ODD number of 1s!
  if (mode === 'misere') {
    const pilesGreaterThanOne = piles.filter(p => p > 1);
    if (pilesGreaterThanOne.length <= 1) {
      // Find the index of the pile > 1 (or the largest pile if all are 1)
      let targetIdx = -1;
      let maxVal = -1;
      piles.forEach((p, idx) => {
        if (p > maxVal) {
          maxVal = p;
          targetIdx = idx;
        }
      });

      const countOnesInOtherPiles = piles.filter((p, idx) => idx !== targetIdx && p === 1).length;
      // If count of other 1s is even, reduce target to 1 (leaving odd number of 1s).
      // If count of other 1s is odd, reduce target to 0 (leaving odd number of 1s).
      const desiredTargetVal = countOnesInOtherPiles % 2 === 0 ? 1 : 0;
      const countToRemove = piles[targetIdx] - desiredTargetVal;

      if (countToRemove > 0) {
        return {
          move: { pileIndex: targetIdx, count: countToRemove },
          isWinningPosition: true,
          nimSum,
          explanationHe: 'אסטרטגיית מילכוד Misère: השארת מספר אי-זוגי של ערימות עם פריט 1 לאילוץ הפסד ליריב',
          explanationEn: 'Misère endgame trap: Leaving an odd count of 1-item piles forces opponent loss'
        };
      }
    }
  }

  // Standard Nim-Sum Strategy (S != 0 means winning position)
  if (nimSum !== 0) {
    for (let i = 0; i < piles.length; i++) {
      const targetVal = piles[i] ^ nimSum;
      if (targetVal < piles[i]) {
        const countToRemove = piles[i] - targetVal;
        return {
          move: { pileIndex: i, count: countToRemove },
          isWinningPosition: true,
          nimSum,
          explanationHe: `משפט בוטון: הורדת ${countToRemove} פריטים מערימה ${i + 1} מאפסת את סכום ה-XOR ל-0`,
          explanationEn: `Bouton Theorem: Removing ${countToRemove} items from Pile ${i + 1} zeroes the Nim-Sum (XOR)`
        };
      }
    }
  }

  // If Nim-Sum is already 0, position is sub-optimal (Losing position if opponent plays perfectly).
  // Make a fallback move (remove 1 item from largest pile)
  let largestIdx = 0;
  for (let i = 1; i < piles.length; i++) {
    if (piles[i] > piles[largestIdx]) largestIdx = i;
  }

  return {
    move: { pileIndex: largestIdx, count: 1 },
    isWinningPosition: false,
    nimSum: 0,
    explanationHe: 'עמדת נחיתות (XOR = 0): האלגוריתם מגן וממתין לטעות של היריב',
    explanationEn: 'Sub-optimal state (XOR = 0): Algorithm plays defensively awaiting opponent error'
  };
}

// Preset configurations for Nim
export const DEFAULT_NIM_PRESETS = [
  { id: 'classic-357', nameHe: 'קלאסי (3, 5, 7)', nameEn: 'Classic (3, 5, 7)', piles: [3, 5, 7] },
  { id: 'standard-1357', nameHe: 'מדורג (1, 3, 5, 7)', nameEn: 'Graduated (1, 3, 5, 7)', piles: [1, 3, 5, 7] },
  { id: 'even-2468', nameHe: 'זוגי (2, 4, 6, 8)', nameEn: 'Even Piles (2, 4, 6, 8)', piles: [2, 4, 6, 8] },
  { id: 'quick-333', nameHe: 'מהיר (3, 3, 3)', nameEn: 'Quick Triple (3, 3, 3)', piles: [3, 3, 3] },
];
