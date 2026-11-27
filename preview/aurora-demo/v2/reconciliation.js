window.createEstateReconciliation = ({root,dialog,icon,escape,read,write,notice,open,moduleHeader,render,active,reviewer}) => {
  const d = window.EstateData;
  const storeKey = 'demo-reconciliation-matches';
  const wallet = 'บัญชีรับชำระ • 4821';
  const statements = [
    {id:'BANK-01',title:'เงินเข้าพร้อมเลขอ้างอิง',date:'2026-10-27',satang:1250000,reference:'TX-DEMO-101'},
    {id:'BANK-02',title:'ยอดจากธนาคารต่างจากใบรับ',date:'2026-10-28',satang:860000,reference:'TX-DEMO-102'},
    {id:'BANK-03',title:'รายการนำเข้าซ้ำ',date:'2026-10-29',satang:540000,reference:'TX-DEMO-103'},
    {id:'BANK-04',title:'เงินเข้าที่มีใบรับยอดเท่ากัน',date:'2026-10-30',satang:740000,reference:''},
  ];
  const receipts = [
    {id:'RC-DEMO-101',contract:'SE-1023',date:'2026-10-27',satang:1250000,reference:'TX-DEMO-101'},
    {id:'RC-DEMO-102',contract:'SE-1024',date:'2026-10-28',satang:890000,reference:'TX-DEMO-102'},
    {id:'RC-DEMO-103',contract:'SE-1026',date:'2026-10-29',satang:540000,reference:'TX-DEMO-103'},
    {id:'RC-DEMO-104',contract:'SE-1029',date:'2026-10-30',satang:740000,reference:'TX-DEMO-104'},
    {id:'RC-DEMO-105',contract:'SE-1032',date:'2026-10-30',satang:740000,reference:'TX-DEMO-105'},
  ];
  const seed = {statementId:'BANK-SEED',receiptId:'RC-DEMO-103',reference:'TX-DEMO-103',reviewer:'Admin ตัวอย่าง',at:'2026-10-29T03:05:00Z'};
  const time = new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'});
  const unit = new Intl.NumberFormat('th-TH',{style:'currency',currency:'THB',minimumFractionDigits:2});
  const money = satang => unit.format(satang/100);
  const bank = id => statements.find(row => row.id === id);
  const receipt = id => receipts.find(row => row.id === id);
  let dragged;
  let pending = false;
  let pendingOnly = false;

  function matches() {
    const saved = read(storeKey);
    const known = Array.isArray(saved) ? saved.filter(pair => {
      const statement = bank(pair?.statementId);
      const invoice = receipt(pair?.receiptId);
      return statement?.reference && statement.reference === pair.reference && invoice?.reference === pair.reference &&
        typeof pair.reviewer === 'string' && typeof pair.at === 'string' && Number.isFinite(Date.parse(pair.at));
    }) : [];
    return [seed,...known];
  }

  function compare(statement, invoice, recorded) {
    const match = recorded.find(pair => pair.statementId === statement.id);
    if (match && match.receiptId === invoice?.id) return {label:'จับคู่แล้ว',tone:'cyan'};
    if (match) return {label:'รายการซ้ำ',tone:'pink',reason:'เงินเข้ารายการนี้จับคู่กับใบรับ ' + match.receiptId + ' แล้ว'};
    if (recorded.some(pair => (statement.reference && pair.reference === statement.reference) || pair.receiptId === invoice?.id))
      return {label:'รายการซ้ำ',tone:'pink',reason:'เลขอ้างอิงหรือใบรับนี้ถูกใช้กระทบยอดแล้ว'};
    if (!statement.reference && receipts.filter(row => row.date === statement.date && row.satang === statement.satang).length > 1)
      return {label:'รอตรวจ',tone:'amber',reason:'พบใบรับมากกว่าหนึ่งรายการที่มียอดและวันที่เดียวกัน กรุณาตรวจเลขอ้างอิงจากธนาคาร'};
    if (!invoice) return {label:'รอตรวจ',tone:'amber',reason:'ยังไม่พบใบรับที่ตรงกับรายการนี้'};
    if (invoice.satang !== statement.satang) return {label:'ยอดต่าง',tone:'amber',
      reason:'ยอดต่าง ' + money(Math.abs(invoice.satang - statement.satang)) + ' ต้องตรวจหลักฐานก่อนจับคู่'};
    if (!statement.reference || invoice.reference !== statement.reference || invoice.date !== statement.date)
      return {label:'รอตรวจ',tone:'amber',reason:'เลขอ้างอิงและวันที่ต้องตรงกันเพื่อยืนยันคู่รายการ'};
    return {label:'พร้อมจับคู่',tone:'purple',ready:true};
  }

  const tag = ({label,tone}) => '<span class="status ' + tone + '">' + label + '</span>';
  const action = (name,label,statementId,receiptId) => '<button type="button" class="' + (name === 'confirm' ? 'primary' : 'control') +
    '" data-recon="' + name + '" data-statement="' + statementId + '"' + (receiptId ? ' data-receipt="' + receiptId + '"' : '') + '>' + label + '</button>';
  const rowMeta = row => d.formatDate(row.date) + ' · ' + (row.reference || 'ไม่มีเลขอ้างอิง');

  function page() {
    if (!active()) return '';
    const recorded = matches();
    const matched = new Set(recorded.map(pair=>pair.statementId));
    const count = statements.filter(statement=>matched.has(statement.id)).length;
    const visible = pendingOnly ? statements.filter(statement=>!matched.has(statement.id)) : statements;
    const statementRows = visible.map(statement => {
      const candidate = receipts.find(row => row.reference === statement.reference);
      const result = compare(statement,candidate,recorded);
      return '<li class="recon-row"><div class="recon-row-top"><span class="recon-handle" draggable="true" data-bank-drag="' + statement.id +
        '" aria-hidden="true">' + icon('grip',17) + '</span><strong>' + statement.title + '</strong><b>' + money(statement.satang) + '</b></div>' +
        '<small>' + rowMeta(statement) + '</small><div class="recon-row-actions">' + tag(result) +
        action('select',result.label === 'จับคู่แล้ว' ? 'ดูผล' : 'เลือกใบรับ',statement.id) + '</div></li>';
    }).join('');
    const receiptRows = receipts.map(invoice =>
      '<li class="recon-row recon-target" data-recon-target="' + invoice.id + '"><div class="recon-row-top"><strong>' + invoice.id +
      '</strong><b>' + money(invoice.satang) + '</b></div><small>' + rowMeta(invoice) + ' · ' + invoice.contract + '</small>' +
      (recorded.some(pair => pair.receiptId === invoice.id) ? tag({label:'จับคู่แล้ว',tone:'cyan'}) : '') + '</li>').join('');
    const history = recorded.slice().reverse().map(pair => '<li><strong>' + escape(pair.reference) + ' → ' + escape(pair.receiptId) +
      '</strong><small>ตรวจโดย ' + escape(pair.reviewer) + ' · ' + time.format(new Date(pair.at)) + ' น.</small></li>').join('');
    return moduleHeader('reconciliation',{title:'กระทบยอด',description:'จับคู่เงินเข้าธนาคารกับใบรับในสมุดเงิน · ข้อมูลจำลอง',
      details:'<div class="module-actions"><a href="#overview" class="control">กลับหน้าภาพรวม</a></div>'}) +
      '<section class="recon-workbench" aria-label="จับคู่รายการ"><div class="recon-context">' + icon('wallet',19) +
      '<strong>' + wallet + '</strong><span>บัญชีธนาคารจำลอง</span></div>' +
      '<div class="card panel recon-progress"><label for="recon-progress">ยืนยันแล้ว ' + count + ' จาก ' + statements.length +
      ' รายการในชุดนี้</label><progress id="recon-progress" value="'+count+'" max="'+statements.length+'"></progress>' +
      '<button type="button" class="control" data-recon="pending-only" aria-pressed="'+pendingOnly+'">เฉพาะยังไม่ยืนยัน</button></div>' +
      '<p class="recon-instruction">เลือกใบรับจากรายการเงินเข้า <span>หรือใช้หูจับลากไปที่ใบรับ</span> แล้วตรวจข้อมูลก่อนยืนยัน</p>' +
      '<div class="recon-grid"><article class="card panel"><h2>เงินเข้าธนาคาร</h2><ul class="recon-list">' + statementRows +
      '</ul>' + (visible.length ? '' : '<p class="empty">ไม่มีรายการที่ยังไม่ยืนยันในชุดนี้</p>') + '</article><article class="card panel recon-receipts"><h2>ใบรับในสมุดเงิน</h2><ul class="recon-list">' + receiptRows +
      '</ul></article></div></section><section class="card panel recon-history" aria-labelledby="recon-history-title"><h2 id="recon-history-title">ประวัติการจับคู่</h2>' +
      '<ul>' + history + '</ul></section>';
  }

  function select(statement) {
    const recorded = matches();
    const pair = recorded.find(row => row.statementId === statement.id);
    if (pair) { review(statement,receipt(pair.receiptId)); return; }
    const related = receipts.filter(row => (statement.reference && row.reference === statement.reference) ||
      (row.date === statement.date && row.satang === statement.satang));
    if (related.length === 1) { review(statement,related[0]); return; }
    open('เลือกใบรับ','<div class="recon-dialog"><p><strong>' + money(statement.satang) + '</strong> · ' + rowMeta(statement) +
      '</p><ul class="recon-list">' + related.map(invoice => '<li class="recon-row"><div class="recon-row-top"><strong>' + invoice.id +
      '</strong><b>' + money(invoice.satang) + '</b></div><small>' + rowMeta(invoice) + ' · ' + invoice.contract + '</small>' +
      action('review','ทบทวน ' + invoice.id,statement.id,invoice.id) + '</li>').join('') +
      '</ul></div>','reconciliation-select');
  }

  function review(statement,invoice) {
    if (!active() || !statement || !invoice) return;
    const recorded = matches();
    const result = compare(statement,invoice,recorded);
    const pair = recorded.find(row => row.statementId === statement.id && row.receiptId === invoice.id);
    const fields = (title,row) => '<div class="recon-preview card"><h3>' + title + '</h3><strong>' + money(row.satang) +
      '</strong><span>' + d.formatDate(row.date) + '</span><span>' + wallet + '</span><small>' + (row.reference || 'ไม่มีเลขอ้างอิง') + '</small></div>';
    open('ทบทวนคู่รายการ','<div class="recon-dialog">' + tag(result) + '<div class="recon-preview-grid">' +
      fields('เงินเข้าธนาคาร',statement) + fields('ใบรับ ' + invoice.id,invoice) + '</div>' +
      (result.reason ? '<p class="risk-text" role="status">' + escape(result.reason) + '</p>' : '') +
      (pair ? '<p>ตรวจโดย ' + escape(pair.reviewer) + ' · ' + time.format(new Date(pair.at)) + ' น.</p>' : '') +
      '<div class="form-footer"><button type="button" class="control" data-action="dismiss">' + (result.ready ? 'ยกเลิก' : 'ปิด') +
      '</button>' + (result.ready ? action('confirm','ยืนยันกระทบยอด',statement.id,invoice.id) : '') + '</div></div>','reconciliation-review');
  }

  async function confirm(button,statement,invoice) {
    if (!active() || pending || dialog.dataset.kind !== 'reconciliation-review') return;
    pending = true;
    button.disabled = true;
    try {
      const commit = () => {
        if (!active() || !dialog.open || !button.isConnected) return;
        const recorded = matches();
        if (!compare(statement,invoice,recorded).ready) { review(statement,invoice); return; }
        const match = {statementId:statement.id,receiptId:invoice.id,reference:statement.reference,reviewer:reviewer(),at:new Date().toISOString()};
        if (!write(storeKey,[...recorded.slice(1),match])) return;
        dialog.close();
        render('workspace');
        root.querySelector('[data-statement="' + statement.id + '"]')?.focus({preventScroll:true});
        notice('บันทึกคู่รายการกระทบยอดแล้ว');
      };
      if (navigator.locks) await navigator.locks.request('sunday-estate-demo-reconciliation',commit);
      else commit();
    } catch {
      notice('ยังบันทึกคู่รายการไม่ได้ ลองยืนยันใหม่','error');
    } finally {
      pending = false;
      button.disabled = false;
    }
  }

  function click(button) {
    if (!active()) return;
    if (button.dataset.recon === 'pending-only') {
      pendingOnly = !pendingOnly;
      render('workspace');
      root.querySelector('[data-recon="pending-only"]')?.focus({preventScroll:true});
      return;
    }
    const statement = bank(button.dataset.statement);
    const invoice = receipt(button.dataset.receipt);
    if (!statement) return;
    if (button.dataset.recon === 'select') select(statement);
    if (button.dataset.recon === 'review' && invoice) review(statement,invoice);
    if (button.dataset.recon === 'confirm' && invoice) void confirm(button,statement,invoice);
  }

  function clearDrag() {
    dragged = undefined;
    root.querySelector('.recon-workbench')?.classList.remove('recon-dragging');
    root.querySelectorAll('.recon-target.is-over').forEach(row => row.classList.remove('is-over'));
  }
  root.addEventListener('dragstart',event => {
    const handle = event.target.closest('[data-bank-drag]');
    if (!active() || !handle) return;
    dragged = handle.dataset.bankDrag;
    event.dataTransfer.setData('text/plain',dragged);
    event.dataTransfer.effectAllowed = 'link';
    root.querySelector('.recon-workbench').classList.add('recon-dragging');
  });
  root.addEventListener('dragover',event => {
    const target = event.target.closest('[data-recon-target]');
    if (!dragged || !target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'link';
    root.querySelector('.recon-target.is-over:not([data-recon-target="' + target.dataset.reconTarget + '"])')?.classList.remove('is-over');
    target.classList.add('is-over');
  });
  root.addEventListener('dragleave',event => {
    const target = event.target.closest('[data-recon-target]');
    if (target && !target.contains(event.relatedTarget)) target.classList.remove('is-over');
  });
  root.addEventListener('drop',event => {
    const target = event.target.closest('[data-recon-target]');
    if (!dragged || !target) return;
    event.preventDefault();
    const statement = bank(dragged);
    clearDrag();
    statement && root.querySelector('[data-statement="' + statement.id + '"]')?.focus({preventScroll:true});
    review(statement,receipt(target.dataset.reconTarget));
  });
  root.addEventListener('dragend',clearDrag);
  window.addEventListener('hashchange',clearDrag);

  return {page,click};
};
