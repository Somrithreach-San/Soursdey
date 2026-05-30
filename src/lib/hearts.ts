// d:\React Js\Soursdey\src\lib\hearts.ts

// The maximum number of hearts a user can have.
export const MAX_HEARTS = 5;

// The time it takes to regenerate one heart, in milliseconds.
// 30 minutes * 60 seconds/minute * 1000 milliseconds/second
export const HEART_REGENERATION_TIME = 30 * 60 * 1000;

/**
 * Calculates the number of hearts a user should have based on the time elapsed.
 * 
 * @param currentHearts - The user's current number of hearts from the database.
 * @param lastUpdate - The timestamp of when the hearts were last updated.
 * @returns An object containing the new heart count and a boolean indicating if an update is needed.
 */
export const calculateHeartsToRegenerate = (currentHearts: number, lastUpdate: string | Date) => {
  // If the user already has max hearts, no regeneration is needed.
  if (currentHearts >= MAX_HEARTS) {
    return { heartsToAdd: 0, needsUpdate: false };
  }

  const now = new Date().getTime();
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const timeElapsed = now - lastUpdateTime;

  // Calculate how many full regeneration cycles have passed.
  const heartsToAdd = Math.floor(timeElapsed / HEART_REGENERATION_TIME);

  // We only need to update if there's at least one heart to add.
  if (heartsToAdd > 0) {
    return { heartsToAdd, needsUpdate: true };
  }

  return { heartsToAdd: 0, needsUpdate: false };
};
