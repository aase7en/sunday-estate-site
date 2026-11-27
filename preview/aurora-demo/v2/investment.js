window.EstateInvestment = (() => {
  const whole = 10000;
  const units = value => Math.round(Number(value) * 100);
  const validMoney = value => Number.isFinite(value) && value >= 0 && value <= 1e10 &&
    Math.abs(value * 100 - units(value)) < 0.001;

  // Apportion percentage hundredths by largest remainder so displayed shares sum to 100%.
  function amountShares(amounts) {
    const cents = amounts.map(value => BigInt(units(value)));
    const total = cents.reduce((sum, value) => sum + value, 0n);
    if (!total) return cents.map(() => null);
    const rows = cents.map((value, index) => {
      const scaled = value * BigInt(whole);
      return {index, share:Number(scaled / total), remainder:scaled % total};
    });
    let remaining = whole - rows.reduce((sum, row) => sum + row.share, 0);
    const ranked = [...rows].sort((a, b) => a.remainder === b.remainder ? a.index - b.index :
      a.remainder > b.remainder ? -1 : 1);
    for (const row of ranked) if (remaining-- > 0) row.share++;
    return rows.map(row => row.share / 100);
  }

  function calculate(rows, basis) {
    const shares = rows.map(row => {
      const share = Number(row.share);
      return validMoney(share) && share <= 100 ? share : 0;
    });
    const amounts = rows.map(row => validMoney(Number(row.pledged)) ? Number(row.pledged) : 0);
    if (basis === 'amount') {
      return {shares:amountShares(amounts), amounts, total:amounts.reduce((sum, value) => sum + units(value), 0) / 100};
    }

    const anchorShare = units(shares[0]);
    const anchorAmount = units(amounts[0]);
    const total = anchorShare > 0 && anchorAmount > 0 ?
      (BigInt(anchorAmount) * BigInt(whole) + BigInt(Math.floor(anchorShare / 2))) / BigInt(anchorShare) : null;
    let cumulativeShare = 0;
    let previous = 0n;
    const projected = shares.map(share => {
      if (total === null || !Number.isFinite(share) || share <= 0) return null;
      cumulativeShare += units(share);
      if (cumulativeShare > whole) return null;
      const next = (total * BigInt(cumulativeShare) + BigInt(whole / 2)) / BigInt(whole);
      const amount = Number(next - previous) / 100;
      previous = next;
      return amount;
    });
    return {shares, amounts:projected, total:total === null ? null : Number(total) / 100};
  }

  function normalize(deal) {
    if (deal.allocations) return deal;
    const byPerson = new Map();
    for (const deed of deal.deeds) {
      for (const row of deed.allocations) {
        const existing = byPerson.get(row.person) ?? {person:row.person, share:0, pledged:0, paid:0, returns:0};
        for (const key of ['share','pledged','paid','returns']) existing[key] = (units(existing[key]) + units(row[key])) / 100;
        byPerson.set(row.person, existing);
      }
    }
    const allocations = [...byPerson.values()];
    const weights = allocations.some(row => row.pledged > 0) ? allocations.map(row => row.pledged) : allocations.map(row => row.share);
    const shares = amountShares(weights);
    allocations.forEach((row, index) => { row.share = shares[index] ?? 0; });
    return {...deal, basis:'amount', needsReview:true, deeds:deal.deeds.map(({allocations: legacyAllocations, ...deed})=>deed), allocations};
  }

  return {calculate, normalize, units, validMoney};
})();
