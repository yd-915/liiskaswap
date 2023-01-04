const diffCalculator = (diffInMilliSeconds, secondsFormat = false) => {
  const originalDifference = diffInMilliSeconds;
  // calculate days
  const days = Math.floor(diffInMilliSeconds / 86400);
  diffInMilliSeconds -= days * 86400;

  // calculate hours
  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
  diffInMilliSeconds -= hours * 3600;

  // calculate minutes
  const eta = Math.floor(originalDifference / 60);
  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
  diffInMilliSeconds -= minutes * 60;

  const seconds = diffInMilliSeconds;

  let difference = '';
  if (days > 0) {
    difference += days === 1 ? `${days} day, ` : `${days} days, `;
  }

  difference += hours === 0 ? '' : hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

  difference += minutes === 0 || hours === 1 ? `${minutes} minutes` : `${minutes} minutes`;

  return {
    value: eta,
    label: secondsFormat
      ? `${minutes}:${('0' + seconds).slice(-2)}`
      : difference,
  };
};

export const getETALabelWithSeconds = eta => {
  return diffCalculator(eta, true);
};

export const getETALabel = eta => {
  return diffCalculator(eta * 60);
};

export function timeDiffCalc(dateFuture, dateNow) {
  let diffInMilliSeconds = (dateFuture - dateNow) / 1000;

  return diffCalculator(diffInMilliSeconds);
}

// console.log(timeDiffCalc(new Date('2019/10/4 04:10:00'), new Date('2019/10/2 18:20:00')));

// the time difference is:
// 1 day, 9 hours, 50 minutes
