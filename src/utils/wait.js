/**
 * Waits for a specified number of seconds before resolving the Promise
 */
export default seconds => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
