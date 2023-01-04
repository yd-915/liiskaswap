export const roundToDecimals = (input, decimals) => {
  const multiply = Math.pow(10, decimals);
  return Math.round(input * multiply) / multiply;
};
