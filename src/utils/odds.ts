export type OddsFormat = 'DECIMAL' | 'FRACTIONAL' | 'AMERICAN' | 'HONG_KONG';

export function formatOdds(odds: number, format: OddsFormat | string = 'DECIMAL'): string {
  if (!odds || isNaN(odds)) return '1.00';

  if (format === 'DECIMAL') {
    return odds.toFixed(2);
  }

  if (format === 'HONG_KONG') {
    return (odds - 1).toFixed(2);
  }

  if (format === 'AMERICAN') {
    const profit = odds - 1;
    if (profit >= 1) {
      return `+${Math.round(profit * 100)}`;
    } else if (profit > 0) {
      return `-${Math.round(100 / profit)}`;
    }
    return '+100';
  }

  if (format === 'FRACTIONAL') {
    const net = odds - 1;
    // Common fractional approximations
    const commonFractions: Array<[number, string]> = [
      [0.2, '1/5'],
      [0.25, '1/4'],
      [0.33, '1/3'],
      [0.4, '2/5'],
      [0.5, '1/2'],
      [0.6, '3/5'],
      [0.67, '2/3'],
      [0.75, '3/4'],
      [0.8, '4/5'],
      [1.0, '1/1'],
      [1.1, '11/10'],
      [1.2, '6/5'],
      [1.25, '5/4'],
      [1.4, '7/5'],
      [1.5, '3/2'],
      [1.6, '8/5'],
      [1.75, '7/4'],
      [1.8, '9/5'],
      [2.0, '2/1'],
      [2.25, '9/4'],
      [2.5, '5/2'],
      [2.75, '11/4'],
      [3.0, '3/1'],
      [3.5, '7/2'],
      [4.0, '4/1'],
      [4.5, '9/2'],
      [5.0, '5/1'],
      [5.5, '11/2'],
      [6.0, '6/1'],
      [7.0, '7/1'],
      [8.0, '8/1'],
      [9.0, '9/1'],
      [10.0, '10/1'],
      [12.0, '12/1'],
      [14.0, '14/1'],
      [16.0, '16/1'],
      [20.0, '20/1'],
      [25.0, '25/1'],
      [33.0, '33/1'],
      [50.0, '50/1'],
      [100.0, '100/1'],
    ];

    let closest = commonFractions[0][1];
    let minDiff = Infinity;
    for (const [val, str] of commonFractions) {
      const diff = Math.abs(net - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = str;
      }
    }
    return closest;
  }

  return odds.toFixed(2);
}
