export interface LinearForecast {
  slope: number;
  rSquared: number;
  predict: (stepsAhead: number) => number;
}

// Least-squares line through values taken at consecutive days.
// predict(0) is the fitted value on the last day; predict(k) is k days later.
export function linearForecast(values: number[]): LinearForecast {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, v) => sum + v, 0) / n;

  let sxy = 0;
  let sxx = 0;
  let ssTot = 0;
  values.forEach((y, x) => {
    sxy += (x - xMean) * (y - yMean);
    sxx += (x - xMean) ** 2;
    ssTot += (y - yMean) ** 2;
  });

  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = yMean - slope * xMean;

  let ssRes = 0;
  values.forEach((y, x) => {
    ssRes += (y - (intercept + slope * x)) ** 2;
  });
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return {
    slope,
    rSquared,
    predict: (stepsAhead) => intercept + slope * (n - 1 + stepsAhead),
  };
}
