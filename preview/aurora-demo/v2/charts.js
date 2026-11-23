window.EstateCharts = (() => {
  const d = window.EstateData;
  const label = {income: 'เงินไหลเข้า', expense: 'เงินไหลออก', net: 'เงินสดสุทธิ', balance: 'เงินต้นคงค้าง'};
  const tones = {income: 'cyan', expense: 'pink', net: 'purple', balance: 'purple'};
  // Each pair gives the distance from zero and the transparency at that point.
  const barStops = [
    [0, 97], [10, 95], [22, 87], [30, 85], [38, 80], [45, 75], [51, 70],
    [57, 65], [62, 60], [66, 55], [70, 50], [74, 45], [78, 40], [82, 35],
    [85, 30], [88, 25], [91, 20], [94, 15], [96, 10], [98, 5], [100, 0],
  ].map(([offset, transparency]) =>
    '<stop offset="' + offset + '%" stop-opacity="' + (100 - transparency) / 100 + '"/>'
  ).join('');
  const amount = (n, key) => (n < 0 ? '−' : key === 'net' && n > 0 ? '+' : '') + d.baht(Math.abs(n));
  const legendMark = (tone, line = false) => '<i class="swatch ' + tone + (line ? ' line' : '') + '" aria-hidden="true"></i>';
  const legend = (keys, mode) => '<div class="legend">' + keys.map(k => '<span>' + legendMark(tones[k], k === 'net' || k === 'balance' || mode === 'lines') + label[k] + '</span>').join('') + '</div>';

  function showTip(tip, bounds, anchor, title, rows, above = false) {
    tip.innerHTML = '<strong>' + title + '</strong>' + rows.map(({name, value, tone}) =>
      '<div>' + legendMark(tone) + '<span>' + name + '</span><b>' + value + '</b></div>').join('');
    tip.hidden = false;
    const left = Math.min(Math.max(4, anchor.x - tip.offsetWidth / 2), bounds.clientWidth - tip.offsetWidth - 4);
    const preferred = above ? anchor.y - tip.offsetHeight - 12 : anchor.y + 10;
    const top = Math.max(0, Math.min(preferred, bounds.clientHeight - tip.offsetHeight));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function tipTarget(button, tip, open, leave) {
    button.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') open(); });
    button.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && document.activeElement !== button) leave(); });
    button.addEventListener('focus', open);
    button.addEventListener('blur', leave);
    button.addEventListener('click', open);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !tip.hidden) {
        e.preventDefault();
        leave();
      }
    });
  }

  function path(points) {
    if (!points.length) return '';
    return points.slice(1).reduce((output, [x, y], i) => {
      const [prevX, prevY] = points[i];
      const mid = (prevX + x) / 2;
      return output + ' C' + mid + ' ' + prevY + ' ' + mid + ' ' + y + ' ' + x + ' ' + y;
    }, 'M' + points[0].join(' '));
  }

  function axis(low, high) {
    const rawStep = Math.max(1, (high - low) / 4);
    const power = 10 ** Math.floor(Math.log10(rawStep));
    const step = [1, 2, 2.5, 5, 10].find(factor => factor * power >= rawStep) * power;
    const min = Math.floor(low / step) * step;
    const max = Math.ceil(high / step) * step || step;
    return {min, max, ticks: Array.from({length: Math.round((max - min) / step) + 1}, (_, i) => min + step * i)};
  }

  function draw(host, range, kind, mode, maxPeriods, scope) {
    const isFlow = kind === 'cash';
    const keys = isFlow ? ['income', 'expense', 'net'] : ['balance'];
    const rows = d.periods(range, maxPeriods, scope);
    const width = host.clientWidth;
    if (!width) return;
    const height = isFlow ? 246 : 182;
    const left = 55;
    const right = width - 10;
    const top = 11;
    const bottom = height - 32;
    const chartBars = isFlow && mode === 'combined';
    const plotValue = (row, key) => chartBars && key === 'expense' ? -row[key] : row[key];
    const values = rows.flatMap(row => keys.map(key => plotValue(row, key)));
    const min = Math.min(0, ...values);
    const max = Math.max(100000, ...values);
    const scale = axis(min, max);
    const y = v => bottom - (v - scale.min) * (bottom - top) / (scale.max - scale.min);
    const cell = (right - left) / rows.length;
    const at = i => left + cell * (i + .5);
    const zeroY = y(0);
    const barWidth = Math.min(31, cell * .48);
    const labelFreq = (right - left) / rows.length < 48 ? 2 : 1;
    const tickText = n => n === 0 ? '0' : Math.abs(n) >= 1000000 ? (n / 1000000) + ' ล.' : (n / 1000) + 'k';

    const defs = chartBars ? ['income','expense'].map(key => {
      const up = key === 'income';
      return '<linearGradient id="' + kind + '-' + key + '" class="cash-bar-gradient ' + tones[key] +
        '" x1="0" x2="0" y1="' + (up ? 1 : 0) + '" y2="' + (up ? 0 : 1) + '" gradientUnits="objectBoundingBox">' +
        barStops + '</linearGradient>';
    }).join('') : '';
    const grids = scale.ticks.map(t => '<line x1="' + left + '" x2="' + right + '" y1="' + y(t) + '" y2="' + y(t) + '" class="' + (t === 0 ? 'axis-zero' : 'axis-grid') + '"/><text class="axis-label" x="' + (left - 9) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + tickText(t) + '</text>').join('');
    const axisLabels = rows.map((row, i) => i % labelFreq === 0 || (i === rows.length - 1 && rows.length % labelFreq === 0 && cell > 39)
      ? '<text class="axis-label" x="' + at(i) + '" y="' + (height - 9) + '" text-anchor="middle">' + row.label + '</text>' : '').join('');

    const bars = chartBars ? rows.map((row, i) => ['income','expense'].map(key => {
      if (!row[key]) return '';
      const edge = y(plotValue(row, key));
      const direction = edge < zeroY ? 1 : -1;
      const left = at(i) - barWidth / 2;
      const right = left + barWidth;
      const radius = Math.min(5, Math.abs(zeroY - edge), barWidth / 2);
      const tangent = edge + direction * radius;
      return '<path data-bar="' + key + '" fill="url(#' + kind + '-' + key + ')" d="M' + left + ' ' + zeroY + ' V' + tangent +
        ' Q' + left + ' ' + edge + ' ' + (left + radius) + ' ' + edge + ' H' + (right - radius) +
        ' Q' + right + ' ' + edge + ' ' + right + ' ' + tangent + ' V' + zeroY + ' Z"/>';
    }).join('')).join('') : '';
    const lines = (chartBars ? ['net'] : keys).map(key => {
      const points = rows.map((row, i) => [at(i), y(row[key])]);
      const curve = path(points);
      const area = key === 'balance' && points.length > 1
        ? '<path d="' + curve + ' L' + points.at(-1)[0] + ' ' + bottom + ' H' + points[0][0] + ' Z" fill="url(#trend-area)"/>' : '';
      return area + '<path class="chart-stroke ' + tones[key] + '" d="' + curve + '"/>' +
        points.map(([x, pointY]) => '<circle class="chart-point ' + tones[key] + '" cx="' + x + '" cy="' + pointY + '" r="' + (chartBars ? 3.4 : 3) + '"/>').join('');
    }).join('');
    host.innerHTML = '<svg height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" aria-hidden="true">' +
      '<defs>' + defs + '<linearGradient id="' + kind + '-area" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop class="area-start"/><stop class="area-end" offset="100%"/></linearGradient></defs>' +
      grids + axisLabels + '<line class="chart-guide" x1="0" x2="0" y1="' + top + '" y2="' + bottom + '" visibility="hidden"/>' + bars + lines + '</svg>' +
      '<div class="chart-selectors" aria-label="เลือกช่วงข้อมูล">' + rows.map((r, i) =>
        '<button class="chart-hit" type="button" tabindex="' + (i === 0 ? 0 : -1) + '" style="left:' + (left + cell * i) + 'px;width:' + cell + 'px;height:' + (bottom + 14) +
        'px" aria-label="' + r.title + ', ' + keys.map(k => label[k] + ' ' + amount(r[k], k)).join(', ') + '"></button>').join('') +
      '</div><div class="chart-tooltip" role="tooltip" hidden></div>';
    const tip = host.querySelector('.chart-tooltip');
    const guide = host.querySelector('.chart-guide');
    const leave = () => {
      tip.hidden = true;
      guide.setAttribute('visibility', 'hidden');
    };
    tip.addEventListener('tip-dismiss', leave);
    host.onpointerleave = (event) => { if (event.pointerType === 'mouse' && !host.contains(document.activeElement)) leave(); };
    const targets = [...host.querySelectorAll('.chart-hit')];
    targets.forEach((button, i) => {
      tipTarget(button, tip, () => {
        const row = rows[i];
        guide.setAttribute('x1', at(i));
        guide.setAttribute('x2', at(i));
        guide.setAttribute('visibility', 'visible');
        showTip(tip, host, {x: at(i), y: Math.max(30, Math.min(...keys.map(key => y(plotValue(row, key)))))}, row.title,
          keys.map(key => ({name: label[key], value: amount(row[key], key), tone: tones[key]})), !isFlow);
      }, leave);
      button.addEventListener('focus', () => {
        for (const target of targets) target.tabIndex = target === button ? 0 : -1;
      });
      button.addEventListener('keydown', e => {
        const next = {ArrowLeft: Math.max(0, i - 1), ArrowRight: Math.min(targets.length - 1, i + 1),
          Home: 0, End: targets.length - 1}[e.key];
        if (next === undefined) return;
        e.preventDefault();
        targets[next].focus();
      });
    });
  }

  function donut(host, items, end) {
    const total = d.sum(items, 'value');
    const arcLength = 2 * Math.PI * 62;
    let offset = 0;
    const circle = (extra, i) => '<circle data-segment="' + i + '" cx="80" cy="80" r="62" transform="rotate(-90 80 80)" ' + extra + '/>';
    const arcs = items.map(({value,tone},i) => {
      if (!value || !total) return '';
      const len = value / total * arcLength;
      const gap = value === total ? 0 : Math.min(18, len * .55);
      const markup = circle('class="ring-arc ' + tone + '" stroke="url(#ring-' + tone + ')" stroke-dasharray="' + (len - gap) + ' ' + (arcLength - len + gap) +
        '" stroke-dashoffset="' + -(offset + gap / 2) + '"', i);
      offset += len;
      return markup;
    }).join('');
    host.innerHTML = '<div class="ring-layout"><div class="ring-visual"><svg viewBox="0 0 160 160" aria-hidden="true"><defs>' +
      items.map(({tone}) => '<linearGradient id="ring-' + tone + '" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop class="gradient-' +
        tone + ' start"/><stop offset="100%" class="gradient-' + tone + ' end"/></linearGradient>').join('') +
      '</defs>' + circle('class="ring-track"', -1) + arcs + '</svg><div class="ring-total"><strong>' + total +
      '</strong><span>สัญญา</span></div></div><div class="ring-legend">' + items.map(({name,value,tone},i) =>
        '<button type="button" data-legend="' + i + '">' + legendMark(tone) + '<span>' + name + '</span><b>' + value + '</b></button>').join('') +
      '</div></div><div class="chart-tooltip" role="tooltip" hidden></div>';
    const tip = host.querySelector('.chart-tooltip');
    const buttons = [...host.querySelectorAll('[data-legend]')];
    const leave = () => {
      tip.hidden = true;
      delete host.dataset.hover;
      host.querySelectorAll('circle').forEach(c => c.classList.remove('selected'));
    };
    function open(i) {
      const item = items[i];
      const h = buttons[i].getBoundingClientRect();
      const b = host.getBoundingClientRect();
      leave();
      host.dataset.hover = 'true';
      host.querySelector('[data-segment="' + i + '"]')?.classList.add('selected');
      showTip(tip, host, {x: h.left - b.left + h.width / 2, y: h.top - b.top}, d.formatDate(end),
        [{name: item.name, tone: item.tone, value: item.value + ' สัญญา · ' + (total ? (item.value / total * 100).toFixed(1) : '0') + '%'}]);
    }
    tip.addEventListener('tip-dismiss', leave);
    buttons.forEach((b,i) => tipTarget(b, tip, () => open(i), leave));
    for (const arc of host.querySelectorAll('.ring-arc')) {
      const reveal = () => open(Number(arc.dataset.segment));
      arc.addEventListener('pointerenter', reveal);
      arc.addEventListener('pointerleave', leave);
      arc.addEventListener('click', reveal);
    }
  }

  return {draw, donut, legend, label, amount};
})();
