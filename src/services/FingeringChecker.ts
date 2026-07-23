import { ValveCombination, FingeringCheckResult } from '../types';

/**
 * FingeringChecker
 * Proporciona utilidades para comparar combinaciones de válvulas
 */
export const FingeringChecker = {
  check(expected: ValveCombination | null, input: ValveCombination): FingeringCheckResult {
    if (!expected) {
      return {
        isCorrect: false,
        expectedFingering: input,
        inputFingering: input,
        reactionTime: 0,
      };
    }

    const isCorrect =
      expected.length === input.length &&
      expected.every((v, i) => v === input[i]);

    return {
      isCorrect,
      expectedFingering: expected,
      inputFingering: input,
      reactionTime: 0,
    };
  }
};

export default FingeringChecker;
