/* Fixed synthetic ledger. Contract principal balances are reconstructed as of a date. */
window.EstateData = (() => {
  const first = '2024-11-01';
  const recentStart = '2025-11-01';
  const asOf = '2026-10-31';
  const dates = (date) => new Date(date + 'T00:00:00Z');
  const iso = (date) => date.toISOString().slice(0, 10);
  const month = (date, offset = 0) => {
    const d = dates(date);
    return iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1)));
  };
  const monthEnd = (date) => iso(new Date(dates(month(date, 1)).getTime() - 86400000));
  const distance = (start, end) => Math.round((dates(end) - dates(start)) / 86400000);
  const thMonth = new Intl.DateTimeFormat('th-TH', {month: 'short', timeZone: 'UTC'});
  const monthAxis = new Intl.DateTimeFormat('th-TH', {month: 'short', year: '2-digit', timeZone: 'UTC'});
  const thDate = new Intl.DateTimeFormat('th-TH', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  const thMonthYear = new Intl.DateTimeFormat('th-TH', {month: 'long', year: 'numeric', timeZone: 'UTC'});
  const integer = new Intl.NumberFormat('th-TH');
  const baht = (n) => '฿' + integer.format(n);
  const formatDate = (d) => thDate.format(dates(d));
  const labels = {loan: 'ปล่อยกู้', redemption: 'ขายฝาก'};
  const statusName = {current: 'ปกติ', soon: 'ใกล้ครบกำหนด', overdue: 'เกินกำหนด', closed: 'ปิดสัญญา'};
  const groupTone = {current: 'purple', soon: 'amber', overdue: 'pink', closed: 'cyan'};
  const places = ['ลาดพร้าว', 'บางบัวทอง', 'หนองจอก', 'คลองหลวง', 'บางพลี', 'สามโคก', 'สันกำแพง', 'บางใหญ่', 'รังสิต', 'บางกรวย', 'พุทธมณฑล', 'มีนบุรี'];
  const principals = [1680000, 2450000, 1420000, 2940000, 1900000, 3150000, 2100000, 2850000, 1750000, 3080000, 2290000, 1980000];
  const schedule = ['2027-02-12','2026-11-06','2027-02-20','2026-10-23','2027-03-16','2026-11-14','2027-02-28','2026-11-09','2027-01-18','2027-02-17','2026-10-27','2026-12-16'];
  const contracts = principals.map((principal, i) => {
    const type = [1, 4, 7, 9].includes(i) ? 'redemption' : 'loan';
    const opened = i < 4 ? '2025-0' + (i + 5) + '-08' : month(recentStart, i - 3).slice(0, 7) + '-12';
    const repayments = [];
    if (i < 9) repayments.push({date: month(recentStart, i + 2).slice(0, 7) + '-19', amount: Math.round(principal * .16 / 1000) * 1000});
    if ([0, 6].includes(i)) repayments.push({date: month(recentStart, i + 5).slice(0, 7) + '-25', amount: principal - repayments[0].amount});
    return {id: 'SE-' + (1021 + i), type, scope: [6,10].includes(i) ? 'personal' : 'company', property: places[i], opened, due: schedule[i],
      principal, appraisal: Math.round(principal / [.55, .62, .58, .65][i % 4] / 1000) * 1000, repayments};
  });
  const inflow = [830000, 1120000, 1240000, 970000, 1550000, 1310000, 1460000, 1890000, 1580000, 2010000, 1470000, 2190000,
    1120000,1480000,1270000,2210000,980000,2620000,1700000,2100000,2540000,2240000,2875000,3120000];
  const outflow = [550000, 690000, 610000, 750000, 860000, 770000, 910000, 650000, 920000, 1090000, 820000, 1030000,
    710000,540000,590000,620000,800000,810000,920000,940000,1000000,1990000,1450000,1190000];
  const ledger = Array.from({length: inflow.length}, (_, i) => {
    const prefix = month(first, i).slice(0, 7);
    return [
      {date: prefix + '-04', scope:'company', amount: Math.floor(inflow[i] * .42)},
      {date: prefix + '-09', scope:'company', amount: -Math.floor(outflow[i] * .6)},
      {date: prefix + '-21', scope:'company', amount: Math.ceil(inflow[i] * .58)},
      {date: prefix + '-27', scope:'company', amount: -Math.ceil(outflow[i] * .4)},
    ];
  }).flat();
  for (const c of contracts) {
    ledger.push({date: c.opened, amount: -c.principal, scope:c.scope});
    for (const payment of c.repayments) ledger.push({date: payment.date, amount: payment.amount, scope:c.scope});
  }
  const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
  function portfolio(date, type, scope) {
    return contracts.filter(c => c.opened <= date && (!type || c.type === type) && (!scope || c.scope === scope)).map(c => {
      const balance = c.principal - sum(c.repayments.filter(r => r.date <= date), 'amount');
      const days = distance(date, c.due);
      const status = balance === 0 ? 'closed' : days < 0 ? 'overdue' : days <= 15 ? 'soon' : 'current';
      return {...c, balance, status, days};
    });
  }
  function totals(start, end, scope) {
    const rows = ledger.filter(p => p.date >= start && p.date <= end && (!scope || p.scope === scope));
    const income = sum(rows.filter(p => p.amount > 0), 'amount');
    const expense = -sum(rows.filter(p => p.amount < 0), 'amount') || 0;
    return {income, expense, net: income - expense};
  }
  function periods(range, maxPeriods, scope, balanceType) {
    const months = [];
    for (let d = month(range.start); d <= range.end; d = month(d, 1)) months.push(d);
    const step = Math.ceil(months.length / maxPeriods);
    const buckets = [];
    for (let i = 0; i < months.length; i += step) {
      const through = months[Math.min(i + step - 1, months.length - 1)];
      const start = months[i] < range.start ? range.start : months[i];
      const end = monthEnd(through) > range.end ? range.end : monthEnd(through);
      const label = months.length > 12 ? monthAxis.format(dates(through)) :
        thMonth.format(dates(months[i])) + (months[i] !== through ? '–' + thMonth.format(dates(through)) : '');
      const full = start === months[i] && end === monthEnd(through);
      const title = full && start.slice(0,7) === end.slice(0,7) ? thMonthYear.format(dates(start)) : formatDate(start) + ' – ' + formatDate(end);
      buckets.push({label, title, start, end, months: Math.min(step, months.length - i), ...totals(start, end, scope), balance: sum(portfolio(end,balanceType,scope), 'balance')});
    }
    return buckets;
  }
  function ratio(rows) {
    const eligible = rows.filter(c => c.balance > 0 && c.appraisal > 0 && c.type === 'loan');
    return eligible.length ? sum(eligible, 'balance') / sum(eligible, 'appraisal') : null;
  }
  const ratioText = value => value == null ? '—' : (value * 100).toFixed(1) + '%';
  return {first, asOf, month, monthEnd, baht, integer, formatDate, portfolio, totals, periods, sum, labels, statusName, groupTone, ratio, ratioText};
})();
