// server/utils/calculatePoints.js

/**
 * Calculates points based on our business rules.
 * @param {string} type - 'lightweight' or 'heavyweight'
 * @param {number} weight - Weight in kg
 * @returns {number} - Total points earned
 */
export const calculatePoints = (type, weight) => {
  if (type === 'lightweight') {
    // 10 points/kg for lightweight
    return Math.round(weight * 10);
  }
  if (type === 'heavyweight') {
    // 20 points/kg for heavyweight
    return Math.round(weight * 20);
  }
  return 0;
};