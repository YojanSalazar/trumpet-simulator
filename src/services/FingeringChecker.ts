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
      expected[0] === input[0] && expected[1] === input[1] && expected[2] === input[2];

    return {
      isCorrect,
      expectedFingering: expected,
      inputFingering: input,
      reactionTime: 0,
    };
  }
};

export default FingeringChecker;
