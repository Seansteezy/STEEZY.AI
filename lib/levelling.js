// Constants
const GROWTH_RATE = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

/**
 * Calculate the experience range required for a given level.
 * @param {number} level The current level.
 * @param {number} multiplier The multiplier for XP calculation.
 * @returns {Object} An object containing the minimum, maximum, and required XP for the level.
 */
export function calculateXpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) throw new TypeError('Level cannot be negative');

  const minXp = level === 0 
    ? 0 
    : Math.round(Math.pow(level, GROWTH_RATE) * multiplier) + 1;
  
  const maxXp = Math.round(Math.pow(level + 1, GROWTH_RATE) * multiplier);

  return {
    min: minXp,
    max: maxXp,
    xpRequired: maxXp - minXp
  };
}

/**
 * Find the level corresponding to a given amount of experience points.
 * @param {number} xp The experience points.
 * @param {number} multiplier The multiplier for XP calculation.
 * @returns {number} The level corresponding to the given XP.
 */
export function getLevelFromXp(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) return Infinity;
  if (isNaN(xp) || xp <= 0) return -1;

  let level = 0;
  
  while (calculateXpRange(level, multiplier).min <= xp) {
    level++;
  }

  return level - 1;
}

/**
 * Determine if a player can level up based on the current level and XP.
 * @param {number} level The current level.
 * @param {number} xp The experience points.
 * @param {number} multiplier The multiplier for XP calculation.
 * @returns {boolean} True if the player can level up, otherwise false.
 */
export function canPlayerLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0 || xp <= 0 || isNaN(xp)) return false;
  return level < getLevelFromXp(xp, multiplier);
}