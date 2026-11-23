(() => {
  const d = window.EstateData;
  const charts = window.EstateCharts;
  const root = document.querySelector('#app');
  const dialog = document.querySelector('#dialog');
  const toast = document.querySelector('#toast');
  const accounts = {
    portfolio: {name: 'กิตติพงศ์ วัฒนากุล', initials: 'กว', role: 'Admin · ผู้จัดการพอร์ต', email: 'portfolio@example.test', bio: 'ดูแลภาพรวมพอร์ตสินเชื่อและการติดตามสัญญา'},
    operations: {name: 'พิมพ์ชนก สุวรรณ', initials: 'พส', role: 'Super · ทีมสัญญาบริษัท', email: 'operations@example.test', bio: 'ดูแลเอกสารและประสานงานตามกำหนดสัญญา'},
    client: {name:'กมลชนก พราวใจ',initials:'กพ',role:'ผู้กู้ / ผู้ขายฝาก',email:'client@example.test',bio:'บัญชีตัวอย่างสำหรับดูสัญญาของตัวเอง'},
    partner: {name:'นพดล ภูวดล',initials:'นภ',role:'ผู้ร่วมทุน',email:'partner@example.test',bio:'บัญชีตัวอย่างสำหรับดูสัดส่วนของตัวเอง'},
    partner2: {name:'ดาริน รุ่งเรือง',initials:'ดร',role:'ผู้ร่วมทุน',email:'partner2@example.test',bio:'บัญชีตัวอย่างสำหรับตรวจสิทธิ์รายดีล'},
  };
  const defaults = {theme: 'light', period: '24', custom: null, mode: 'combined', type: 'loan', home: 'overview', reminders: true, digest: false, sound: false, birthday: false, profile: {}};
  const pages = {overview: ['ภาพรวม', 'overview'], lending: ['ปล่อยกู้ / ขายฝาก', 'layers'], investments: ['ลงทุนที่ดิน','trend'], profile: ['โปรไฟล์', 'user']};
  const shapes = {
    ai: '<path d="M2 14l8-8 6 6M6 11v8h9v-4M18.5 2v7M15 5.5h7M19.5 12v5m-2.5-2.5h5"/><path d="M3 22h16"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    home: '<path d="M2.5 13.5 12 4l9.5 9.5M6.5 11v7.5L12 16l5.5 2.5V11M9 10.5l3-3 3 3"/><path d="M4 21c3-1 5-1 8-1s6 0 8 1"/>',
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
    layers: '<path d="M12 2.8 22 8l-10 5.2L2 8l10-5.2ZM2 12l10 5.2L22 12M2 16l10 5.2L22 16"/>',
    user: '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20v-1.4a4.6 4.6 0 0 1 4.6-4.6h5.8a4.6 4.6 0 0 1 4.6 4.6V20"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-14 5h2m3 0h2m3 0h1"/>',
    in: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    out: '<path d="M12 16V4m-4 4 4-4 4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M21 10h-5a2.5 2.5 0 0 0 0 5h5m-5-2.5h.1M4 5l11-3"/>',
    chart: '<path d="M3 3v17h18M7 15v-4m4 4V7m4 8V9m4 6V5"/>',
    ring: '<path d="M11 3a9 9 0 1 0 10 10h-10V3Z"/><path d="M14 2.5V10h7.5A8 8 0 0 0 14 2.5Z"/>',
    trend: '<path d="m3 17 6-6 4 4 7-8m-5 0h5v5"/>',
    down: '<path d="m3 7 6 6 4-4 7 8m-5 0h5v-5"/>',
    flat: '<path d="M5 12h14"/>',
    alert: '<path d="M10.2 4.5a2 2 0 0 1 3.6 0l7.5 13.4a2 2 0 0 1-1.8 3H4.5a2 2 0 0 1-1.8-3l7.5-13.4ZM12 9v4m0 3.5h.01"/>',
    arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    percent: '<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M5 19 19 5"/>',
    file: '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l-7-7Zm0 0v7h7M8 14h8m-8 3h6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m21 16-5-5-7 7-2-2-4 4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 0 0 18m0-18a15 15 0 0 1 0 18"/>',
    logout: '<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m-1-8h12m-4-4 4 4-4 4"/>',
  };
  const icon = (name, size = 20) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shapes[name] + '</svg>';
  const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey = 'sunday-estate.redesign.v2';
  let toastTimer;
  function notice(message) {
    toast.textContent = message;
    toast.classList.add('shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('shown'), 3400);
  }
  function read(key) {
    try { return JSON.parse(localStorage.getItem(storageKey + '.' + key)); }
    catch { return null; }
  }
  function write(key, value) {
    try {
      localStorage.setItem(storageKey + '.' + key, JSON.stringify(value));
      return true;
    } catch {
      notice('บันทึกในเบราว์เซอร์ไม่ได้ การตั้งค่าจะอยู่เฉพาะรอบนี้');
      return false;
    }
  }
  const sessions = {};
  let account = read('session');
  if (!Object.hasOwn(accounts, account)) account = account === 'signed-out' ? null : 'portfolio';
  const load = key => {
    const saved = sessions[key] ??= {...defaults, ...read(key)};
    if (saved.period === 'auto') saved.period = defaults.period;
    return saved;
  };
  let pref = account ? load(account) : {...defaults};
  let page = 'overview';
  let statusFilter = 'all';
  let lookup = '';
  let cardFlip;
  let flipRevision = 0;
  const flipMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const chartWidths = new WeakMap();
  let chartFrame = 0;
  const chartResize = new ResizeObserver(entries => {
    const needsRedraw = () => !cardFlip && entries.some(({target}) => target.isConnected && target.clientWidth !== chartWidths.get(target));
    if (!needsRedraw()) return;
    cancelAnimationFrame(chartFrame);
    chartFrame = requestAnimationFrame(() => { if (needsRedraw()) renderCharts(); });
  });
  let dialogType;
  let dialogReturn;
  const route = () => {
    const target = location.hash.slice(1);
    if (target === 'hero') return 'hero';
    if (!account) return 'login';
    const chosen = Object.hasOwn(pages,target) ? target : pref.home;
    return xp.allowedRoute(chosen) ? chosen : 'overview';
  };
  const settings = patch => {
    Object.assign(pref, patch);
    return write(account, pref);
  };
  function range() {
    if (pref.period === 'custom' && pref.custom) return pref.custom;
    const months = Number(pref.period) || Number(defaults.period);
    return {start: d.month(d.asOf, 1 - months), end: d.asOf};
  }
  const safeImage = value => typeof value === 'string' && /^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : '';
  const person = () => ({...accounts[account], ...pref.profile});
  function avatar(large = false) {
    const p = person();
    const photo = safeImage(p.avatar);
    const initials = p.name === accounts[account].name ? accounts[account].initials : p.name.trim().split(/\s+/).slice(0,2).map(s => [...s][0]).join('');
    return '<span class="avatar' + (large ? ' large' : '') + '" aria-hidden="true">' + (photo ? '<img src="' + photo + '" alt="">' : escape(initials)) + '</span>';
  }
  const brandImage = '<img class="brand-mark" src="assets/brand/sunday-logo-mark.png" width="391" height="391" alt="">';
  const brand = brandImage + '<span><strong>Sunday Estate</strong><small>Portfolio workspace</small></span>';
  const disk = (symbol, tone) => '<span class="disk ' + tone + '">' + icon(symbol, 20) + '</span>';
  const buttonIcon = (id, symbol, label, extra = '') => '<button class="icon-button" type="button" data-action="' + id + '" title="' + label + '" aria-label="' + label + '">' + icon(symbol) + extra + '</button>';
  const navLinks = () => Object.entries(pages).filter(([key]) => xp.allowedRoute(key)).map(([key, [title, glyph]]) => '<a href="#' + key + '"' +
    (page === key ? ' aria-current="page"' : '') + '>' + icon(glyph) + '<span>' + title + '</span></a>').join('');

  function shell(content) {
    const p = person();
    const actions = xp.staff() && xp.contracts().some(c => c.status === 'overdue' || c.status === 'soon');
    return '<aside class="sidebar"><div class="sidebar-inner"><a class="brand" href="#overview" aria-label="Sunday Estate · ภาพรวม">' + brand +
      '</a><nav class="side-nav" aria-label="เมนูหลัก">' + navLinks() + '<a href="#hero">' + icon('home') + 'ดูหน้าแรก</a></nav><div class="side-scene" aria-hidden="true"></div>' +
      '<button data-action="accounts" type="button" class="side-account">' + avatar() + '<span><strong>' + escape(p.name) +
      '</strong><small>' + escape(p.role) + '</small></span>' + icon('chevron', 15) + '</button></div></aside>' +
      '<div class="app-body"><header class="topbar"><a class="brand mobile-brand" href="#overview" aria-label="Sunday Estate · ภาพรวม">' +
      brand + '</a><button class="search-trigger" type="button" data-action="search" aria-label="ค้นหาสัญญา">' + icon('search', 17) +
      '<span>ค้นหาเลขสัญญาหรือพื้นที่</span></button><div class="top-actions"><span class="demo-tag"><i></i>ข้อมูลจำลอง</span>' +
      (xp.staff() ? buttonIcon('alerts', 'bell', 'รายการที่ต้องดำเนินการ', actions ? '<i class="notification-dot"></i>' : '') : '') +
      buttonIcon('theme', pref.theme === 'light' ? 'moon' : 'sun', pref.theme === 'light' ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง') +
      '<a class="profile-link" href="#profile" aria-label="เปิดโปรไฟล์">' + avatar() + '</a></div></header>' +
      '<main class="workspace" id="workspace" tabindex="-1">' + content + '</main>' +
      '<nav class="bottom-nav" aria-label="เมนูหลักบนมือถือ">' + navLinks() + '</nav>' + xp.launchers() + '</div>';
  }

  function kpi({title, value, foot, glyph, tone, money = false}) {
    const million = money && Math.abs(value) >= 1000000;
    const full = money ? d.baht(value) : String(value);
    const compact = million ? (value / 1000000).toFixed(2) : full;
    return '<article class="card kpi ' + tone + '"><div class="kpi-title">' + disk(glyph, tone) + '<h2>' + title +
      '</h2></div><div class="kpi-value" title="' + full + '">' + (million ? '<span class="amount-wide">' + full +
      '</span><span class="amount-compact" aria-hidden="true">฿' + compact + '<small> ล้าน</small></span><span class="sr-only amount-exact">' + full + '</span>' : full) + '</div>' +
      '<p class="kpi-foot">' + foot + '</p></article>';
  }

  function cardHead(title, subtitle, glyph, tone, action = '') {
    return '<div class="card-head"><div class="card-title">' + disk(glyph, tone) + '<div><h2>' + title + '</h2><p>' +
      subtitle + '</p></div></div>' + action + '</div>';
  }
  const rangeCaption = r => d.formatDate(r.start) + ' – ' + d.formatDate(r.end);
  const portfolioTrend = 'แนวโน้มพอร์ตสินเชื่อ';
  const trendPercent = new Intl.NumberFormat('th-TH', {style:'percent', maximumFractionDigits:1, signDisplay:'exceptZero'});
  function chartControls(r) {
    return '<div class="range-tools"><button class="control date-button' + (pref.period === 'custom' ? ' chosen' : '') +
      '" type="button" data-action="dates" aria-label="เลือกช่วงวันที่">' + icon('calendar', 17) + '<span>' + rangeCaption(r) + '</span></button>' +
      '<div class="segments ranges" role="group" aria-label="ช่วงเวลาวิเคราะห์">' + [24,12,6,3].map(n =>
        '<button type="button" id="period-' + n + '" data-period="' + n + '" aria-pressed="' + (pref.period === String(n)) + '">' + n + ' เดือน</button>').join('') +
      '</div></div>';
  }

  function dashboard() {
    const r = range();
    const latest = xp.contracts();
    const monthly = d.totals(d.month(d.asOf),d.asOf,xp.scope());
    const active = latest.filter(c => c.balance > 0);
    const actions = latest.filter(c => c.status === 'overdue' || c.status === 'soon');
    const overdue = actions.filter(c => c.status === 'overdue').length;
    const status = overdue > 0 ? '<button class="attention" data-action="alerts" type="button">' + icon('alert', 16) +
      '<span><strong>' + overdue + ' สัญญาเกินกำหนด</strong> <span class="attention-extra">· ติดตามในคิวงาน</span></span>' + icon('right', 14) + '</button>' : '';
    const cards = [
      {title:'เงินต้นคงค้าง', value:d.sum(active,'balance'), foot:active.length + ' สัญญาที่ยังเปิด', glyph:'wallet', tone:'purple', money:true},
      {title:'เงินไหลเข้าเดือนนี้', value:monthly.income, foot:'ยอดรับ ต.ค. 2569', glyph:'in', tone:'cyan', money:true},
      {title:'เงินไหลออกเดือนนี้', value:monthly.expense, foot:'ยอดจ่าย ต.ค. 2569', glyph:'out', tone:'pink', money:true},
      {title:'หลักประกันสินเชื่อ', value:d.sum(active.filter(c=>c.type==='loan'),'appraisal'), foot:'ราคาประเมินของสัญญาปล่อยกู้', glyph:'layers', tone:'blue', money:true},
    ];
    return '<section class="intro overview-intro"><div><h1>ภาพรวมธุรกิจ</h1><p>พอร์ตสินเชื่อ ขายฝาก และกระแสเงินสด</p></div><span class="as-of">' + icon('clock', 15) +
      ' ข้อมูล ณ ' + d.formatDate(d.asOf) + '</span></section>' +
      '<section class="kpis" aria-label="ตัวชี้วัดภาพรวม ณ วันที่สรุป">' + cards.map(kpi).join('') + '</section>' + status +
      '<section class="analytics" aria-labelledby="analytics-title"><div class="analytics-head"><div><h2 id="analytics-title">วิเคราะห์พอร์ต</h2><p class="range-help">ช่วงเวลาสำหรับกราฟกระแสเงินสด สถานะสัญญา และแนวโน้ม</p><p class="range-mobile">' +
      rangeCaption(r) + '</p></div>' + chartControls(r) + '</div>' +
      '<div class="analytics-grid">' + rangeCards(r).map(card =>
        '<div class="card-stage range-card-stage"><div class="card-rotor range-card-rotor">' + card + '</div></div>').join('') +
      '<article class="card panel queue" id="queue" tabindex="-1">' + cardHead('สัญญาที่ต้องติดตาม', actions.length + ' สัญญา ณ ' + d.formatDate(d.asOf), 'calendar', 'amber',
      '<a class="subtle text-data" href="#lending">ดูสัญญา ' + icon('arrow', 15) + '</a>') + queueMarkup(actions) + '</article></div></section>' +
      '<section class="insight-grid" aria-label="ตัวชี้วัดความเสี่ยง">' +
      '<article class="card insight">' + disk('percent','blue') + '<div><h2>สัดส่วนหนี้ต่อหลักประกัน (LTV)</h2><p>เฉพาะปล่อยกู้ · เงินต้นคงค้าง ÷ ราคาประเมิน</p></div><strong>' + d.ratioText(d.ratio(latest)) + '</strong></article>' +
      '<article class="card insight">' + disk('alert','pink') + '<div><h2>เงินต้นของสัญญาเกินกำหนด</h2><p>เงินต้นคงค้างของสัญญาค้างติดตาม</p></div><strong>' +
      d.baht(d.sum(actions.filter(c => c.status === 'overdue'), 'balance')) + '</strong></article></section>';
  }

  function loanTrend(r) {
    let baseDate = r.start;
    let base = d.sum(xp.contracts(baseDate,'loan'),'balance');
    const current = d.sum(xp.contracts(r.end,'loan'),'balance');
    if (!base) {
      const firstBalance = d.periods(r,24,xp.scope(),'loan').find(row => row.balance > 0);
      if (firstBalance && firstBalance.end < r.end) {
        base = firstBalance.balance;
        baseDate = firstBalance.end;
      }
    }
    const change = base > 0 && baseDate < r.end ? (current - base) / base : null;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const comparison = change === null ? 'ไม่มีฐานเปรียบเทียบในช่วงนี้' : 'เทียบกับ ' + d.formatDate(baseDate);
    const percent = change === null ? '—' : change && Math.abs(change) < .0005
      ? (change > 0 ? '+' : '−') + '<0.1%' : trendPercent.format(change);
    return {current,direction,comparison,percent};
  }

  function rangeCards(r, namespace = '') {
    const trend = loanTrend(r);
    const historical = xp.contracts(r.end);
    const flow = d.totals(r.start,r.end,xp.scope());
    const dataButton = kind => '<button type="button" class="subtle text-data" data-table="' + kind + '" aria-label="ดูตาราง' +
      (kind === 'cash' ? 'กระแสเงินสด' : portfolioTrend) + '">' + icon('file', 15) + '<span>ข้อมูล</span></button>';
    return ['<article class="card panel cash" data-range-card>' + cardHead('กระแสเงินสด', pref.mode === 'combined' ? 'เงินเข้าด้านบน · เงินออกด้านล่าง · บาท' : 'รับ จ่าย และยอดสุทธิ · หน่วยบาท', 'chart', 'purple',
      '<div class="head-actions">' + dataButton('cash') + '<button class="subtle mode-button" type="button" data-action="mode" aria-label="สลับเป็น' +
      (pref.mode === 'combined' ? 'กราฟเส้น' : 'กราฟผสม') + '" id="' + namespace + 'mode">' + icon(pref.mode === 'combined' ? 'chart' : 'trend', 16) +
      '<span>' + (pref.mode === 'combined' ? 'กราฟผสม' : 'กราฟเส้น') + '</span>' + icon('chevron', 12) + '</button></div>') +
      charts.legend(['income','expense','net'], pref.mode) + '<div class="chart-host" id="' + namespace + 'cash-chart"></div>' +
      '<div class="chart-summary"><span>รับรวม <b>' + d.baht(flow.income) + '</b></span><span>จ่ายรวม <b>' + d.baht(flow.expense) + '</b></span><span>สุทธิ <b class="' +
      (flow.net < 0 ? 'risk-text' : 'gain-text') + '">' + charts.amount(flow.net,'net') + '</b></span></div></article>',
      '<article class="card panel composition" data-range-card>' + cardHead('สัดส่วนสถานะสัญญา', 'จำนวนตามสถานะ ณ ' + d.formatDate(r.end), 'ring', 'cyan') +
      '<div class="donut-host" id="' + namespace + 'donut-chart"></div><p class="panel-note">นับสัญญาที่เริ่มแล้ว ณ วันสิ้นสุดช่วง · ใกล้ครบกำหนดภายใน 15 วัน</p></article>',
      '<article class="card panel trend" data-range-card data-trend="' + trend.direction + '">' +
      cardHead(portfolioTrend, 'เงินต้นคงค้างเฉพาะสัญญาปล่อยกู้', 'trend', 'purple', dataButton('trend')) +
      '<div class="trend-stat"><div class="trend-amount"><strong>' + d.baht(trend.current) + '</strong><span>ณ ' + d.formatDate(r.end) + '</span></div>' +
      '<div class="trend-change"><span class="trend-badge">' + icon(trend.direction === 'up' ? 'trend' : trend.direction, 15) + escape(trend.percent) +
      '</span><span class="trend-compare">' + trend.comparison + '</span></div></div>' +
      '<div class="chart-host" id="' + namespace + 'trend-chart"></div></article>'];
  }

  const statusPill = c => '<span class="status ' + d.groupTone[c.status] + '">' + d.statusName[c.status] + '</span>';
  function queueMarkup(items) {
    if (!items.length) return '<p class="empty">ไม่มีสัญญาที่ต้องดำเนินการ</p>';
    return '<ul class="queue-list">' + items.slice().sort((a,b) => a.days - b.days).map(c =>
      '<li><button type="button" data-contract="' + c.id + '">' + disk(c.days < 0 ? 'alert' : 'clock', d.groupTone[c.status]) +
      '<span class="queue-text"><strong>' + c.id + ' · ' + c.property + '</strong><small>' + d.labels[c.type] + ' · ' +
      d.formatDate(c.due) + '</small></span>' + statusPill(c) + '</button></li>').join('') + '</ul>';
  }

  function lending() {
    return '<section class="intro lending-intro"><div><h1>ปล่อยกู้ / ขายฝาก</h1><p>ติดตามยอดเงินต้น สัญญาที่เปิด และกำหนดชำระหรือไถ่ถอน</p></div><span class="as-of">' +
      icon('clock', 15) + ' ข้อมูล ณ ' + d.formatDate(d.asOf) + '</span></section><div class="contract-tabs segments" role="tablist" aria-label="ประเภทสัญญา">' +
      Object.entries(d.labels).map(([key, name]) => '<button role="tab" type="button" id="tab-' + key + '" data-type="' + key +
      '" aria-controls="contract-panel" tabindex="' + (pref.type === key ? 0 : -1) + '" aria-selected="' + (pref.type === key) + '">' +
      icon(key === 'loan' ? 'wallet' : 'layers', 18) + name + '</button>').join('') +
      '</div>' + xp.adminTools() + '<div class="card-stage"><div class="card-rotor" id="contract-rotor">' +
      lendingFace(pref.type) + '</div></div>';
  }

  function lendingFace(type, namespace = '') {
    return '<section id="' + namespace + 'contract-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-' + type +
      '" class="contract-panel">' + lendingPanel(type,namespace) + '</section>';
  }

  function lendingPanel(type, namespace) {
    const rows = xp.contracts(d.asOf,type);
    const active = rows.filter(c=>c.balance > 0);
    const actions = rows.filter(c=>c.status === 'overdue' || c.status === 'soon');
    const isLoan = type === 'loan';
    const cards = [
      {title:'เงินต้นคงค้าง', value:d.sum(active,'balance'), foot:'เฉพาะสัญญาที่ยังเปิด', glyph:'wallet', tone:'purple', money:true},
      {title:'เงินต้นตามสัญญา', value:d.sum(rows,'principal'), foot:'รวมทุกสัญญาในชุดจำลอง', glyph:'layers', tone:'cyan', money:true},
      {title:'สัญญาที่เปิดอยู่', value:active.length, foot:'จาก ' + rows.length + ' สัญญา', glyph:'file', tone:'blue'},
      {title:'สัญญาต้องติดตาม', value:actions.length, foot:actions.filter(c=>c.days<0).length + ' เกินกำหนด', glyph:'alert', tone:'amber'},
    ];
    const stat = isLoan ? '<strong>' + d.ratioText(d.ratio(rows)) + '</strong><span>เงินต้นคงค้างเทียบราคาประเมิน</span>' :
      '<strong>' + d.baht(d.sum(active.filter(c => c.status === 'soon'), 'balance')) + '</strong><span>เงินต้นของสัญญาที่ใกล้ครบกำหนดภายใน 15 วัน</span>';
    return '<section class="kpis lending-kpis" aria-label="ตัวชี้วัด' + d.labels[type] + '">' + cards.map(kpi).join('') + '</section>' +
      '<div class="lending-grid"><article class="card panel records">' + cardHead('ทะเบียนสัญญา', 'ดูรายละเอียดจากรายการสัญญา', 'file', 'purple') +
      '<div class="record-tools"><label class="field-search">' + icon('search', 17) + '<input type="search" aria-label="ค้นหาในทะเบียนสัญญา" placeholder="เลขสัญญาหรือพื้นที่" value="' +
      escape(lookup) + '"></label><label><span class="sr-only">สถานะสัญญา</span><select id="' + namespace + 'contract-status" aria-label="สถานะสัญญา"><option value="all">ทุกสถานะ</option>' +
      Object.entries(d.statusName).map(([key, text]) => '<option value="' + key + '"' + (statusFilter === key ? ' selected' : '') + '>' + text + '</option>').join('') +
      '</select></label></div><div id="' + namespace + 'record-results">' + recordRows(rows) + '</div></article>' +
      '<div class="lending-aside"><article class="card panel risk-panel">' +
      cardHead(isLoan ? 'สัดส่วนหนี้ต่อหลักประกัน (LTV)' : 'ยอดใกล้ครบกำหนดไถ่ถอน', isLoan ? 'สัญญาปล่อยกู้ที่ยังเปิด' : 'สัญญาขายฝากที่ยังเปิด', isLoan ? 'percent' : 'clock', 'cyan') +
      '<div class="risk-stat">' + stat + '</div></article><article class="card panel queue">' +
      cardHead('คิวติดตาม', d.labels[type] + ' · ' + actions.length + ' สัญญา', 'calendar', 'amber') + queueMarkup(actions) + '</article></div></div>';
  }
  function recordRows(rows) {
    const query = lookup.trim().toLowerCase();
    const filtered = rows.filter(c => (statusFilter === 'all' || c.status === statusFilter) && (c.id + ' ' + c.property).toLowerCase().includes(query));
    if (!filtered.length) return '<p class="empty" role="status">ไม่พบสัญญาที่ตรงกับตัวกรอง</p>';
    return '<div class="record-header" aria-hidden="true"><span>สัญญา / พื้นที่</span><span>กำหนด</span><span>เงินต้นคงค้าง</span><span>สถานะ</span></div><ul class="record-list" aria-label="ผลการค้นหา ' +
      filtered.length + ' สัญญา">' + filtered.map(c => '<li><button type="button" data-contract="' + c.id + '"><span><strong>' + c.id +
      '</strong><small>' + c.property + '</small></span><span class="record-due">' + d.formatDate(c.due) + '</span><strong class="record-amount">' +
      d.baht(c.balance) + '</strong>' + statusPill(c) + '</button></li>').join('') + '</ul>';
  }

  const themeOptions = '<option value="light">Light · Soft Aurora</option><option value="dark">Dark · Modern</option>';
  const choose = (options, value) => options.replace('value="' + value + '"', 'value="' + value + '" selected');
  function profile() {
    const p = person();
    const cover = safeImage(p.cover);
    const input = (label, key, type = 'text', max = 60) => '<label>' + label + '<input name="' + key + '" type="' + type + '" maxlength="' + max +
      '" value="' + escape(p[key]) + '"' + (key === 'name' || key === 'email' ? ' required' : '') + '></label>';
    const toggle = (key, label, info) => '<label class="toggle-row"><span><strong>' + label + '</strong><small>' + info +
      '</small></span><input type="checkbox" name="' + key + '" role="switch"' + (pref[key] ? ' checked' : '') + '></label>';
    return '<section class="intro profile-intro"><div><h1>โปรไฟล์และการตั้งค่า</h1><p>ปรับพื้นที่ทำงานให้เหมาะกับคุณ</p></div>' +
      '<div class="v2-inline"><a class="control" href="#hero">ดูหน้าแรก</a><button type="button" class="control" data-action="accounts">' + icon('logout', 17) + ' จัดการบัญชีจำลอง</button></div></section>' +
      '<section class="card profile-hero"><div class="profile-cover"><img src="' + (cover || 'assets/aurora-estate.webp') + '" alt="">' +
      '<button type="button" class="cover-button" data-action="cover">' + icon('image', 17) + '<span>เปลี่ยนภาพปก</span></button></div>' +
      '<div class="profile-identity"><div class="profile-avatar">' + avatar(true) + '<button type="button" data-action="avatar" title="เปลี่ยนรูปโปรไฟล์" aria-label="เปลี่ยนรูปโปรไฟล์">' +
      icon('image', 16) + '</button></div><div><h2>' + escape(p.name) + '</h2><span>' + escape(p.role) + ' · บัญชีจำลอง</span><p>' +
      escape(p.bio) + '</p></div></div></section><div class="profile-grid"><article class="card panel">' +
      cardHead('ข้อมูลส่วนตัว', 'ชื่อ บทบาท และข้อมูลติดต่อ', 'user','purple') + '<form id="profile-form" class="editor"><div class="form-grid">' +
      input('ชื่อที่แสดง','name') + input('บทบาท','role') + input('อีเมลติดต่อ','email','email',120) + input('เบอร์โทร','phone','tel',32) +
      '</div><label>เกี่ยวกับคุณ<textarea name="bio" maxlength="160" rows="2">' + escape(p.bio) + '</textarea></label>' +
      '<div class="form-footer"><button class="primary" type="submit">บันทึกโปรไฟล์</button></div></form></article>' +
      '<article class="card panel">' + cardHead('การตั้งค่าพื้นที่ทำงาน','บันทึกแยกตามบัญชีในเบราว์เซอร์นี้','globe','cyan') +
      '<form id="prefs-form" class="editor"><div class="form-grid"><label>ธีม<select name="theme">' + choose(themeOptions, pref.theme) +
      '</select></label><label>ช่วงเวลากราฟ<select name="period">' + choose('<option value="24">24 เดือน (ค่าเริ่มต้น)</option><option value="12">12 เดือน</option><option value="6">6 เดือน</option><option value="3">3 เดือน</option>' +
      (pref.custom ? '<option value="custom">ช่วงวันที่ที่บันทึกไว้</option>' : ''), pref.period) + '</select></label><label>รูปแบบกราฟ<select name="mode">' +
      choose('<option value="combined">ผสมแท่งและเส้น</option><option value="lines">เส้น</option>',pref.mode) + '</select></label><label>หน้าเริ่มต้น<select name="home">' +
      choose('<option value="overview">ภาพรวม</option><option value="lending">ปล่อยกู้ / ขายฝาก</option><option value="profile">โปรไฟล์</option>',pref.home) +
      '</select></label></div>' + toggle('reminders','เตือนกำหนดสัญญา','แสดงจุดแจ้งเตือนในต้นแบบ') + toggle('digest','สรุปรายสัปดาห์','บันทึกตัวเลือกสำหรับเชื่อมระบบแจ้งเตือน') + xp.birthdayInputs() +
      '<div class="form-footer"><button class="primary" type="submit">บันทึกการตั้งค่า</button></div></form></article></div>';
  }

  function login() {
    return '<main class="login-screen"><div class="card login-card"><div class="brand">' + brand + '</div><span class="demo-tag"><i></i>ข้อมูลจำลอง</span>' +
      '<h1>เข้าสู่พื้นที่วิเคราะห์</h1><p>เลือกบัญชีจำลองเพื่อเรียกคืนการตั้งค่าที่บันทึกในเบราว์เซอร์นี้</p>' +
      accountChoices() + '<a href="#hero" class="control">ดูหน้าแรก</a></div></main>';
  }
  function accountChoices() {
    return '<div class="account-options">' + Object.entries(accounts).map(([id,p]) => '<button type="button" data-account="' + id + '">' +
      '<span class="avatar">' + p.initials + '</span><span><strong>' + p.name + '</strong><small>' + p.role +
      '</small></span>' + (id === account ? '<em>กำลังใช้งาน</em>' : icon('right', 16)) + '</button>').join('') + '</div>';
  }

  function render(focusId) {
    settleCardFlip();
    chartResize.disconnect();
    const currentTheme = account ? pref.theme : 'light';
    document.documentElement.dataset.theme = currentTheme;
    page = route();
    let content;
    if (page === 'hero') content = window.EstateScenes.landing({icon,escape,brandImage});
    else if (!account) content = login();
    else if (page === 'profile') content = shell(profile());
    else if (page === 'lending') content = shell(lending());
    else if (page === 'investments') content = shell(xp.investmentPage());
    else content = shell(xp.staff() ? dashboard() : xp.memberHome());
    root.innerHTML = content;
    window.EstateScenes.mount({read});
    const dot = root.querySelector('.notification-dot');
    if (dot && !pref.reminders) dot.remove();
    if (account && page === 'overview') renderCharts();
    if (focusId) document.getElementById(focusId)?.focus({preventScroll:true});
    setTimeout(xp.checkBirthday,250);
  }

  function renderCharts(r = range(), namespace = '') {
    const cash = document.getElementById(namespace + 'cash-chart');
    if (!cash) return;
    for (const [kind,host] of [['cash',cash], ['trend',document.getElementById(namespace + 'trend-chart')]]) {
      chartWidths.set(host,host.clientWidth);
      charts.draw(host,r,kind,pref.mode,xp.scope(),namespace);
    }
    const rows = xp.contracts(r.end);
    charts.donut(document.getElementById(namespace + 'donut-chart'), Object.entries(d.statusName).map(([key,name]) =>
      ({name, tone:d.groupTone[key], value:rows.filter(c=>c.status===key).length})),r.end,namespace);
    if (!namespace) observeChartLayout();
  }

  function observeChartLayout() {
    chartResize.disconnect();
    root.querySelectorAll('#cash-chart,#trend-chart').forEach(host => chartResize.observe(host));
  }

  const sameRange = (left,right) => left.start === right.start && left.end === right.end;

  // The controls are rendered in left-to-right order on both desktop and mobile.
  const turnsLeft = (from,to) => Boolean(from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_PRECEDING);

  function restoreFaceIds(face, namespace) {
    for (const node of [face, ...face.querySelectorAll('[id]')]) {
      if (node instanceof HTMLElement && node.id.startsWith(namespace)) node.id = node.id.slice(namespace.length);
    }
  }

  function settleCardFlip(showBack = false) {
    if (!cardFlip) return;
    const {entries, namespace} = cardFlip;
    cardFlip = undefined;
    for (const {rotor, front, back, rotation} of entries) {
      const visible = showBack ? back : front;
      (showBack ? front : back).remove();
      visible.classList.remove('range-face','range-face-back');
      visible.inert = false;
      if (showBack) restoreFaceIds(visible,namespace);
      rotor.classList.remove('is-turning','turns-left');
      rotation.cancel();
    }
  }

  function completeCardFlip(turn) {
    if (cardFlip !== turn) return;
    settleCardFlip(true);
    turn.onFinish();
  }

  function turnCards({rotors,markup,left,prepare,onFinish}) {
    const animated = !flipMotion.matches && rotors[0].animate &&
      CSS.supports('transform-style','preserve-3d') && CSS.supports('backface-visibility','hidden');
    const namespace = animated ? 'flip-' + (++flipRevision) + '-' : '';
    const template = document.createElement('template');
    template.innerHTML = markup(namespace);
    const faces = [...template.content.children];
    if (!animated) {
      rotors.forEach((rotor,index) => rotor.replaceChildren(faces[index]));
      prepare?.(namespace);
      return;
    }

    const entries = rotors.map((rotor,index) => {
      const front = rotor.firstElementChild;
      const back = faces[index];
      front.classList.add('range-face');
      back.classList.add('range-face','range-face-back');
      front.inert = true;
      back.inert = true;
      rotor.append(back);
      return {rotor,front,back};
    });
    // Draw the back while it is attached but still facing away from the viewer.
    prepare?.(namespace);
    const angle = left ? 180 : -180;
    for (const entry of entries) {
      entry.rotor.classList.add('is-turning');
      entry.rotor.classList.toggle('turns-left',left);
      entry.rotation = entry.rotor.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(' + angle + 'deg)'}],
        {duration:470,easing:'cubic-bezier(.55,.04,.28,1)',fill:'forwards'});
    }
    const turn = {entries,namespace,onFinish};
    cardFlip = turn;
    Promise.all(entries.map(({rotation}) => rotation.finished)).then(() => completeCardFlip(turn), () => {});
  }

  flipMotion.addEventListener('change', () => {
    if (flipMotion.matches && cardFlip) completeCardFlip(cardFlip);
  });

  function turnRange(from, to, next) {
    const control = period => root.querySelector(period === 'custom' ? '[data-action="dates"]' : '[data-period="' + period + '"]');
    turnCards({
      rotors: [...root.querySelectorAll('.range-card-rotor')],
      markup: namespace => rangeCards(next,namespace).join(''),
      left: turnsLeft(control(from),control(to)),
      prepare: namespace => renderCharts(next,namespace),
      onFinish: () => {
        const latest = range();
        if (!sameRange(latest,next)) turnRange(to,pref.period,latest);
        else observeChartLayout();
      }
    });
  }

  function changeRange(patch, focus) {
    const from = pref.period;
    const before = range();
    settings(patch);
    const next = range();
    const date = root.querySelector('[data-action="dates"]');
    date.querySelector('span').textContent = rangeCaption(next);
    date.classList.toggle('chosen', pref.period === 'custom');
    root.querySelector('.range-mobile').textContent = rangeCaption(next);
    root.querySelectorAll('[data-period]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.period === pref.period));
    });
    focus.focus({preventScroll:true});
    if (!cardFlip && !sameRange(before,next)) turnRange(from,pref.period,next);
  }

  function showDialog(title, content, type) {
    if (!dialog.open) dialogReturn = document.activeElement;
    dialogType = type;
    dialog.dataset.kind = type;
    dialog.innerHTML = '<div class="dialog-head"><h2 id="dialog-title">' + title + '</h2>' + buttonIcon('dismiss','x','ปิดหน้าต่าง') +
      '</div><div class="dialog-body">' + content + '</div>';
    if (!dialog.open) dialog.showModal();
    else dialog.querySelector('.dialog-head button')?.focus({preventScroll:true});
  }
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (dialogReturn?.isConnected) dialogReturn.focus({preventScroll:true});
    dialog.replaceChildren();
    dialogType = null;
  });
  function dateDialog() {
    const r = pref.custom ?? range();
    showDialog('กำหนดช่วงวันที่', '<form id="date-form" class="editor"><p>ชุดข้อมูลครอบคลุม ' +
      rangeCaption({start:d.first,end:d.asOf}) + '</p><div class="form-grid"><label>วันที่เริ่มต้น<input type="date" name="start" min="' + d.first +
      '" max="' + d.asOf + '" value="' + r.start + '" required></label><label>วันที่สิ้นสุด<input type="date" name="end" min="' + d.first +
      '" max="' + d.asOf + '" value="' + r.end + '" required></label></div><p id="date-error" class="risk-text" role="alert"></p>' +
      '<div class="form-footer"><button class="control" data-action="date-auto" type="button">กลับไป 24 เดือน</button><button class="primary" type="submit">ใช้ช่วงวันที่</button></div></form>', 'dates');
  }
  function dataTable(kind) {
    const r = range();
    const isFlow = kind === 'cash';
    const keys = isFlow ? ['income','expense','net'] : ['balance'];
    const rows = d.periods(r,24,xp.scope(),isFlow ? undefined : 'loan');
    showDialog(isFlow ? 'ข้อมูลกระแสเงินสด' : 'ข้อมูล' + portfolioTrend, '<div class="table-wrap"><table class="data-table"><caption>' +
      rangeCaption(r) + ' · รายเดือน · บาท</caption><thead><tr><th scope="col">ช่วง</th>' + keys.map(k=>'<th scope="col">' + charts.label[k] + '</th>').join('') +
      '</tr></thead><tbody>' + rows.map(row => '<tr><th scope="row">' + row.title + '</th>' + keys.map(k=>'<td>' + charts.amount(row[k],k) +
      '</td>').join('') + '</tr>').join('') + '</tbody></table></div>', 'table');
  }
  function contract(id) {
    const c = xp.lookup(id);
    if (!c) return;
    const fields = [['ประเภทสัญญา',d.labels[c.type]], ['พื้นที่',c.property], ['วันเปิดสัญญา',d.formatDate(c.opened)],
      ['ครบกำหนด',d.formatDate(c.due)], ['เงินต้นตามสัญญา',d.baht(c.principal)], ['เงินต้นคงค้าง',d.baht(c.balance)]];
    if (c.type === 'loan') fields.push(['ราคาประเมินหลักประกัน',d.baht(c.appraisal)]);
    showDialog(c.id + ' · ข้อมูลสัญญาจำลอง', statusPill(c) + '<dl class="details">' + fields.map(([key,value]) =>
      '<div><dt>' + key + '</dt><dd>' + value + '</dd></div>').join('') + '</dl>' + xp.actionsForContract(c), 'contract');
  }
  function globalSearch() {
    showDialog('ค้นหาสัญญา', '<label class="field-search">' + icon('search', 17) +
      '<input type="search" id="global-lookup" aria-label="ค้นหาเลขสัญญาหรือพื้นที่" placeholder="เช่น SE-1024 หรือคลองหลวง" autofocus></label><div id="search-results"></div>', 'search');
    updateSearch('');
  }
  function updateSearch(query) {
    const rows = xp.contracts().filter(c => (c.id + ' ' + c.property).toLowerCase().includes(query.trim().toLowerCase()));
    dialog.querySelector('#search-results').innerHTML = rows.length ?
      '<div class="search-results">' + rows.map(c => '<button type="button" data-contract="' + c.id + '"><strong>' + c.id +
      '</strong><span>' + c.property + ' · ' + d.labels[c.type] + '</span>' + icon('right',15) + '</button>').join('') +
      '</div>' : '<p class="empty" role="status">ไม่พบสัญญา</p>';
  }
  function mediaDialog(target) {
    const title = target === 'cover' ? 'ภาพปก' : 'รูปโปรไฟล์';
    showDialog('เปลี่ยน' + title, '<form class="editor" id="media-form" data-target="' + target +
      '"><label>เลือกรูปจากอุปกรณ์<input type="file" name="image" accept="image/png,image/jpeg,image/webp" required></label><p class="muted">JPEG, PNG หรือ WebP · สูงสุด 12 MB</p><p class="risk-text" role="alert" id="media-error"></p>' +
      '<div class="form-footer"><button class="control" type="button" data-reset="' + target +
      '">ใช้ภาพเริ่มต้น</button><button type="submit" class="primary">บันทึกรูป</button></div></form>', 'media');
  }
  async function saveImage(form) {
    const {target} = form.dataset;
    const file = form.elements.image.files[0];
    const error = form.querySelector('#media-error');
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 12000000) {
      error.textContent = 'เลือกรูป JPEG, PNG หรือ WebP ขนาดไม่เกิน 12 MB';
      return;
    }
    const owner = account;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const widthLimit = target === 'avatar' ? 320 : 1440;
      const heightLimit = target === 'avatar' ? 320 : 720;
      const scale = Math.min(1, widthLimit / img.width, heightLimit / img.height);
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      img.close();
      if (owner !== account || !form.isConnected || !dialog.open) return;
      const saved = settings({profile:{...pref.profile, [target]:canvas.toDataURL('image/webp',.82)}});
      dialog.close();
      render();
      root.querySelector('[data-action="' + target + '"]')?.focus();
      if (saved) notice('บันทึกรูปแล้ว');
    } catch {
      error.textContent = 'เปิดไฟล์รูปนี้ไม่ได้';
    } finally {
      button.disabled = false;
    }
  }

  function activateAccount(key) {
    if (!Object.hasOwn(accounts, key) || key === account) { if (dialog.open) dialog.close(); return; }
    if (dialog.open) dialog.close();
    account = key;
    pref = load(account);
    lookup = '';
    statusFilter = 'all';
    write('session', account);
    history.replaceState(null, '', '#' + pref.home);
    render('workspace');
    window.scrollTo(0,0);
  }

  function flip(to) {
    if (to === pref.type) return;
    const nextTab = document.getElementById('tab-' + to);
    const from = pref.type;
    xp.sound();
    settings({type:to});
    root.querySelectorAll('[role="tab"]').forEach(b => {
      b.setAttribute('aria-selected', String(b === nextTab));
      b.tabIndex = b === nextTab ? 0 : -1;
    });
    if (nextTab !== document.activeElement) nextTab.focus({preventScroll:true});
    if (!cardFlip) turnLending(from,to);
  }

  function turnLending(from,to) {
    turnCards({
      rotors: [document.getElementById('contract-rotor')],
      markup: namespace => lendingFace(to,namespace),
      left: turnsLeft(document.getElementById('tab-' + from),document.getElementById('tab-' + to)),
      onFinish: () => {
        if (pref.type !== to) turnLending(to,pref.type);
      }
    });
  }

  function toQueue() {
    if (page !== 'overview') {
      history.pushState(null,'','#overview');
      render();
    }
    const queue = document.getElementById('queue');
    queue.focus({preventScroll:true});
    queue.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }

  document.addEventListener('pointerdown', e => {
    for (const tip of root.querySelectorAll('.chart-tooltip:not([hidden])')) {
      if (!tip.parentElement.contains(e.target)) tip.dispatchEvent(new Event('tip-dismiss'));
    }
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.v2) { xp.handleClick(btn); return; }
    const {action, period, type, table, contract: id, account: choice, reset} = btn.dataset;
    if (choice) { activateAccount(choice); return; }
    if (!account) return;
    if (period) { changeRange({period},btn); return; }
    if (type) { flip(type); return; }
    if (table) { dataTable(table); return; }
    if (id) { contract(id); return; }
    if (reset) {
      const profileSettings = {...pref.profile};
      delete profileSettings[reset];
      const saved = settings({profile:profileSettings});
      dialog.close();
      render();
      root.querySelector('[data-action="' + reset + '"]')?.focus();
      if (saved) notice('คืนค่าเริ่มต้นแล้ว');
      return;
    }
    switch (action) {
      case 'theme':
        settings({theme: pref.theme === 'light' ? 'dark' : 'light'});
        document.documentElement.dataset.theme = pref.theme;
        const name = pref.theme === 'light' ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง';
        btn.title = name;
        btn.setAttribute('aria-label', name);
        btn.innerHTML = icon(pref.theme === 'light' ? 'moon' : 'sun');
        const themeSelect = root.querySelector('#prefs-form [name="theme"]');
        if (themeSelect) themeSelect.value = pref.theme;
        break;
      case 'alerts': toQueue(); break;
      case 'dates': dateDialog(); break;
      case 'date-auto':
        dialog.close();
        changeRange({period:defaults.period},root.querySelector('[data-action="dates"]'));
        break;
      case 'mode': settings({mode:pref.mode === 'combined' ? 'lines' : 'combined'}); render('mode'); break;
      case 'search': globalSearch(); break;
      case 'dismiss': dialog.close(); break;
      case 'accounts':
        showDialog('บัญชีจำลอง', accountChoices() + '<div class="form-footer"><button data-action="sign-out" class="control" type="button">' +
          icon('logout',18) + ' ออกจากบัญชี</button></div>', 'accounts');
        break;
      case 'sign-out':
        dialog.close();
        account = null;
        write('session', 'signed-out');
        pref = {...defaults};
        history.replaceState(null,'',location.pathname + location.search);
        render();
        root.querySelector('[data-account]')?.focus();
        window.scrollTo(0,0);
        break;
      case 'avatar': case 'cover': mediaDialog(action); break;
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('#v2-deal input')) xp.updateDeal(e.target.form);
    if (e.target.closest('#v2-expense')) xp.updateExpensePreview(e.target.closest('form'));
    if (e.target.id === 'global-lookup') updateSearch(e.target.value);
    if (e.target.matches('.record-tools input')) {
      lookup = e.target.value;
      document.querySelector('#record-results').innerHTML = recordRows(xp.contracts(d.asOf,pref.type));
    }
  });
  document.addEventListener('change', e => {
    if (e.target.matches('#v2-deal select')) xp.changeDeal(e.target.form,e.target);
    if (e.target.closest('#v2-expense')) xp.updateExpensePreview(e.target.closest('form'));
    if (e.target.id === 'contract-status') {
      statusFilter = e.target.value;
      document.querySelector('#record-results').innerHTML = recordRows(xp.contracts(d.asOf,pref.type));
    }
    if (dialogType === 'dates') dialog.querySelector('#date-error').textContent = '';
  });
  document.addEventListener('submit', e => {
    const form = e.target;
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (form.id.startsWith('v2-')) { xp.handleSubmit(form,values); return; }
    if (form.id === 'date-form') {
      const {start,end} = values;
      if (start > end || start < d.first || end > d.asOf) {
        dialog.querySelector('#date-error').textContent = 'เลือกวันเริ่มต้นก่อนหรือเท่ากับวันสิ้นสุดภายในชุดข้อมูล';
        form.elements.end.focus();
        return;
      }
      dialog.close();
      changeRange({period:'custom',custom:{start,end}},root.querySelector('[data-action="dates"]'));
    }
    if (form.id === 'profile-form') {
      const cleaned = Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()]));
      if (!cleaned.name) { notice('กรอกชื่อที่แสดง'); form.elements.name.focus(); return; }
      const saved = settings({profile:{...pref.profile,...cleaned}});
      render();
      root.querySelector('#profile-form [type="submit"]').focus();
      if (saved) notice('บันทึกโปรไฟล์แล้ว');
    }
    if (form.id === 'prefs-form') {
      const experience = xp.birthdayPatch(values);
      if (!experience) { notice('เลือกวันและเดือนเกิดที่ถูกต้อง'); form.elements.birthdayDay.focus(); return; }
      const saved = settings({...values,...experience,reminders:form.elements.reminders.checked,digest:form.elements.digest.checked});
      if (experience.sound) xp.sound();
      render();
      root.querySelector('#prefs-form [type="submit"]').focus();
      if (saved) notice('บันทึกการตั้งค่าแล้ว');
    }
    if (form.id === 'media-form') void saveImage(form);
  });
  root.addEventListener('keydown', e => {
    if (!e.target.matches('[role="tab"]')) return;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const next = {Home:0, End:1, ArrowLeft:1-tabs.indexOf(e.target), ArrowRight:1-tabs.indexOf(e.target)}[e.key];
    if (next === undefined) return;
    e.preventDefault();
    flip(tabs[next].dataset.type);
  });
  window.addEventListener('hashchange', () => {
    const next = route();
    if (next === page) return;
    if (dialog.open) dialog.close();
    render('workspace');
    window.scrollTo(0,0);
  });
  const xp = window.createEstateExperience({icon,escape,read,write,notice,open:showDialog,person,settings,render,
    account:()=>account,prefs:()=>pref,page:()=>page});
  if (account && !location.hash) history.replaceState(null,'','#' + pref.home);
  render();
})();
