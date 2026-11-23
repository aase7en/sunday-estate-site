window.createEstateExperience = api => {
  const d = window.EstateData;
  const {icon, escape, read, write, notice, open, moduleHeader} = api;
  const money = new Intl.NumberFormat('th-TH',{style:'currency',currency:'THB',maximumFractionDigits:2});
  const baht = n => money.format(n);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const admin = () => api.account() === 'portfolio';
  const staff = () => admin() || api.account() === 'operations';
  const actor = () => staff() ? 'staff' : api.account() === 'client' ? 'client' : 'partner';
  const scope = () => api.account() === 'operations' ? 'company' : undefined;
  const contracts = (date=d.asOf,type) => d.portfolio(date,type,scope()).filter(c => staff() || (api.account() === 'client' && ['SE-1023','SE-1028'].includes(c.id)));
  const lookup = id => contracts().find(c => c.id === id);
  const allowedRoute = route => staff() || ['hero','profile','overview'].includes(route) ||
    (route === 'investments' && actor() === 'partner');
  const readList = key => {
    const value = read(key);
    return Array.isArray(value) ? value : [];
  };
  const copy = (title, description) => '<div><h2>' + title + '</h2><p class="muted">' + description + '</p></div>';
  const btn = (key,label,primary=false) => '<button type="button" class="' + (primary ? 'primary' : 'control') +
    '" data-v2="' + key + '">' + label + '</button>';
  const close = () => document.getElementById('dialog').close();
  const contractOptions = () => contracts().map(c => '<option value="' + c.id + '">' + c.id + ' · ' + c.property + '</option>').join('');
  const loanLabel = c => c.type === 'redemption' ? 'สินไถ่ตามตัวอย่าง' : 'เงินต้นคงค้าง';
  const redemptionAmount = c => c.balance + (c.balance > 0 ? 46000 : 0);
  const balance = c => c.type === 'redemption' ? redemptionAmount(c) : c.balance;
  const formFooter = (label, extra='') => '<div class="form-footer">' + extra + '<button class="primary" type="submit">' +
    label + '</button></div>';
  const error = (form,text) => { form.querySelector('[data-form-error]').textContent = text; };
  const errorLine = '<p class="risk-text" role="alert" data-form-error></p>';
  const option = (value,label,current) => '<option value="' + escape(value) + '"' + (value === current ? ' selected' : '') + '>' +
    escape(label) + '</option>';
  const contact = 'ทีมดูแลสัญญา Sunday Estate · ช่องทางติดต่อจะแสดงตามสัญญาในระบบจริง';
  let audio;
  let chat = [];
  let chatOwner;
  let payInProgress = false;
  const attempted = new Set();

  function sound(kind = 'tap') {
    if (!api.prefs().sound) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audio ||= new Audio();
      if (audio.state === 'suspended') void audio.resume().catch(() => {});
      const notes = kind === 'close' ? [523.25,659.25,783.99] : kind === 'success' ? [587.33,783.99] :
        kind === 'birthday' ? [523.25,587.33,659.25] : [394];
      notes.forEach((hz,i) => {
        const t = audio.currentTime + i * .075;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = hz;
        gain.gain.setValueAtTime(.0001,t);
        gain.gain.exponentialRampToValueAtTime(.048,t+.013);
        gain.gain.exponentialRampToValueAtTime(.0001,t+.11);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(t);
        oscillator.stop(t+.12);
      });
    } catch { /* Audio is an enhancement when the device allows it. */ }
  }

  const birthdayDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type,part.value]));
  };
  function birthdayInputs() {
    const p = api.prefs();
    const selections = (max,key,title) => '<label>' + title + '<select name="' + key + '"><option value="">เลือก</option>' +
      Array.from({length:max},(_,i)=>option(String(i+1),String(i+1),String(p[key] || ''))).join('') + '</select></label>';
    return '<label class="toggle-row"><span><strong>เสียงเอฟเฟกต์</strong><small>เสียงแตะและเสียงยืนยันสั้น ๆ</small></span>' +
      '<input type="checkbox" name="sound" role="switch"' + (p.sound ? ' checked' : '') + '></label>' +
      '<label class="toggle-row"><span><strong>คำอวยพรวันเกิด</strong><small>แสดงในบัญชีของคุณเมื่อถึงวัน</small></span>' +
      '<input type="checkbox" name="birthday" role="switch"' + (p.birthday ? ' checked' : '') + '></label>' +
      '<div class="form-grid">' + selections(31,'birthdayDay','วันเกิด') + selections(12,'birthdayMonth','เดือนเกิด') + '</div>';
  }

  function birthdayPatch(values) {
    const day = Number(values.birthdayDay);
    const month = Number(values.birthdayMonth);
    const max = new Date(Date.UTC(2000,month,0)).getUTCDate();
    const given = Number.isInteger(day) && Number.isInteger(month) && month >= 1 && month <= 12 && day >= 1 && day <= max;
    if ((values.birthday || day || month) && !given) return null;
    return {sound: values.sound === 'on', birthday: values.birthday === 'on', birthdayDay: given ? day : 0, birthdayMonth: given ? month : 0};
  }

  const sparkles = size => '<div class="v2-sparkles" aria-hidden="true">' +
    Array.from({length:reduced() ? 0 : size},(_,i) => '<i style="--turn:' + i * 360/size + 'deg;--delay:' + (i%4)*.035 +
      's;--distance:' + (62+(i%4)*14) + 'px"></i>').join('') + '</div>';
  const cake = '<svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
    '<path d="M9 31v-9c0-3 2-5 5-5h20c3 0 5 2 5 5v9M6 31h36v8H6zM9 25c4 0 4 3 8 3s4-3 7-3 4 3 8 3 4-3 7-3M24 12v5M24 4c-3 3-3 5 0 6 3-1 3-3 0-6Z"/></svg>';
  function celebrate(kind, receipt) {
    const isBirthday = kind === 'birthday';
    const name = isBirthday ? 'สุขสันต์วันเกิด' : kind === 'close' ? 'ปิดยอดจำลองสำเร็จ' : 'บันทึกรับชำระจำลองสำเร็จ';
    const details = isBirthday ? '<p>' + escape(api.person().name) + ' ขอให้ปีนี้เป็นปีที่ดีของคุณ</p>' :
      '<strong>' + baht(receipt.amount) + '</strong><p>' + receipt.id + ' · ' + receipt.contract + '</p>' +
      '<p class="muted">ยอดคงเหลือที่ทดลอง ' + baht(receipt.remaining) + '</p>';
    sound(kind);
    open(name,'<div class="v2-celebrate">' + sparkles(kind === 'success' ? 9 : 18) +
      '<div class="v2-medal">' + (isBirthday ? cake : icon('check',36)) + '</div>' + details + '</div>' +
      '<div class="form-footer">' + btn(isBirthday ? 'dismiss' : 'receipt',isBirthday ? 'ปิดคำอวยพร' : 'ดูใบรับชำระตัวอย่าง',true) + '</div>','v2-celebration');
  }
  function checkBirthday() {
    if (!api.account() || api.page() === 'hero' || !api.prefs().birthday || document.querySelector('dialog[open]')) return;
    const p = api.prefs();
    const now = birthdayDate();
    const year = Number(now.year);
    const day = p.birthdayMonth === 2 && p.birthdayDay === 29 && new Date(Date.UTC(year,1,29)).getUTCMonth() !== 1 ? 28 : p.birthdayDay;
    if (p.birthdayMonth !== Number(now.month) || day !== Number(now.day) || p.birthdaySeen === year) return;
    api.settings({birthdaySeen:year});
    celebrate('birthday');
  }
  function paymentForm(id) {
    if (!staff()) return;
    const c = lookup(id) || contracts().find(row=>row.type === 'loan' && row.balance > 0);
    if (!c) return;
    sound();
    const remaining = c.balance - d.sum(readList('demo-payments').filter(receipt => receipt.contract === c.id),'amount');
    if (remaining <= 0) { notice('สัญญานี้ปิดยอดในพื้นที่ทดลองแล้ว'); return; }
    const request = crypto.randomUUID();
    open('ทดลองบันทึกรับชำระ',
      '<form id="v2-payment" class="editor" data-request="' + request + '" data-contract-id="' + c.id + '"><p>รายการจำลอง · ' + c.id +
      ' · ยอดคงเหลือ ' + baht(remaining) + '</p><label>จำนวนเงิน (บาท)<input name="amount" type="number" min="0.01" max="' +
      remaining + '" step="0.01" value="' + Math.min(15000,remaining) + '" required></label>' + errorLine +
      formFooter('ยืนยันรายการจำลอง',btn('fill-balance','ใช้ยอดปิดทั้งหมด')) + '</form>','v2-payment');
  }
  function submitPayment(form,values) {
    if (!staff() || payInProgress || attempted.has(form.dataset.request)) return;
    const c = lookup(form.dataset.contractId);
    if (!c) return;
    const previous = readList('demo-payments');
    const cents = Math.round(Number(values.amount)*100);
    const left = c.balance * 100 - Math.round(d.sum(previous.filter(item => item.contract === c.id),'amount')*100);
    if (!Number.isSafeInteger(cents) || cents <= 0 || cents > left) { error(form,'ระบุยอดภายในยอดคงเหลือ'); return; }
    payInProgress = true;
    attempted.add(form.dataset.request);
    form.querySelector('[type="submit"]').disabled = true;
    const receipt = {id:'DEMO-R' + String(previous.length+1).padStart(4,'0'), contract:c.id, amount:cents/100,
      remaining:(left-cents)/100, timestamp:new Date().toISOString()};
    if (!write('demo-payments',[...previous,receipt])) {
      error(form,'บันทึกรายการจำลองไม่สำเร็จ');
      attempted.delete(form.dataset.request);
      form.querySelector('[type="submit"]').disabled = false;
    } else {
      celebrate(receipt.remaining === 0 ? 'close' : 'success',receipt);
    }
    payInProgress = false;
  }
  function receiptView() {
    if (!staff()) return;
    const r = readList('demo-payments').at(-1);
    if (!r) return;
    open('ใบรับชำระตัวอย่าง','<dl class="details"><div><dt>เลขที่</dt><dd>' + r.id + '</dd></div><div><dt>สัญญา</dt><dd>' + r.contract +
      '</dd></div><div><dt>ยอดที่รับ</dt><dd>' + baht(r.amount) + '</dd></div><div><dt>วันที่บันทึก</dt><dd>' +
      new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(r.timestamp)) +
      '</dd></div></dl>','v2-receipt');
  }

  const questions = {
    client: [
      ['balance','ยอดคงเหลือเท่าไหร่'],['installments','ชำระมาแล้วกี่งวด'],['arrears','ค้างชำระเท่าไหร่'],
      ['due','ใกล้ครบกำหนดหรือยัง'],['contact','ติดต่อทีมดูแล'],
    ],
    staff: [['due','สัญญาใกล้ครบกำหนด'],['arrears','สัญญาที่เกินกำหนด'],['cost','รายจ่ายรอตรวจ'],
      ['balance','ยอดเงินต้นคงค้าง'],['contact','ขั้นตอนติดต่อทีมดูแล']],
    partner: [['ownAmount','ยอดลงทุนของฉัน'],['ownShare','สัดส่วนของฉันในแต่ละดีล'],['ownReturns','ส่วนแบ่งของฉัน'],['contact','ติดต่อทีมดูแล']],
  };
  const general = [['generalRedemption','ขายฝากและสินไถ่คืออะไร'],['generalDue','ต้องเตรียมอะไรเมื่อถึงกำหนด']];
  function topicFrom(text) {
    const patterns = [
      ['generalRedemption', /สินไถ่.*คือ|ขายฝาก.*คือ|sale.redemption.*mean/i],
      ['generalDue', /เตรียม|เอกสาร.*ครบกำหนด/],
      ['installments', /งวด|installment/i], ['arrears', /ค้างชำระ|ค้างจ่าย|เกินกำหนด|overdue/i],
      ['due', /ครบกำหนด|วันไถ่|due date/i], ['cost', /รายจ่าย|ค่าใช้จ่าย/],
      ['ownReturns', /ส่วนแบ่ง|ผลตอบแทน/], ['ownShare', /เปอร์เซ็นต์|สัดส่วน/],
      ['ownAmount', /ลงทุน/], ['contact', /ติดต่อ|เบอร์/], ['balance', /ยอด|หนี้|สินไถ่|balance/i],
    ];
    return patterns.find(([,pattern])=>pattern.test(text))?.[0];
  }
  function answer(topic,id) {
    const role = actor();
    if (topic === 'generalRedemption') return {text:'ขายฝากเป็นนิติกรรมที่สงวนสิทธิไถ่ตามเงื่อนไข สินไถ่คือจำนวนสำหรับใช้สิทธิไถ่ ตรวจยอดและวันจากสัญญาของคุณ',
      link:'https://www.dol.go.th/dol-services/public-service-manual/citizen-guide/', label:'คู่มือกรมที่ดิน'};
    if (topic === 'generalDue') return {text:'เปิดสัญญาและตรวจวันครบกำหนด ยอดตามเอกสาร และหลักฐานชำระรายการก่อนหน้า หากต้องนัดหมายหรือยอดไม่ชัด ให้ติดต่อทีมดูแลจากหน้าสัญญา'};
    if (!questions[role].some(([allowed]) => allowed === topic)) return {text:'เลือกคำถามที่ตรงกับข้อมูลในบัญชีของคุณ หรือถามเรื่องทั่วไป เช่น “ขายฝากคืออะไร”'};
    if (topic === 'contact') return {text:contact};
    if (role === 'partner') {
      const rows = investments().flatMap(deal => deal.allocations
        .filter(row=>row.person === api.account()).map(row=>({...row,deal:deal.name})));
      if (!rows.length) return {text:'บัญชีนี้ยังไม่มีข้อมูลดีลที่ได้รับสิทธิ์'};
      const text = topic === 'ownAmount' ? 'ยอดลงเงินจริงรวม ' + baht(d.sum(rows,'paid')) :
        topic === 'ownReturns' ? 'ส่วนแบ่งที่บันทึก ' + baht(d.sum(rows,'returns')) :
          rows.map(row=>row.deal + ' ' + shareLabel(row)).join(' · ');
      return {text,link:'#investments',label:'เปิดการลงทุนของฉัน'};
    }
    const c = id ? lookup(id) : null;
    if (id && !c) return {text:'ไม่พบสัญญาในขอบเขตบัญชีนี้'};
    if (role === 'staff') {
      const rows = c ? [c] : contracts();
      const text = topic === 'cost' ? 'รายจ่ายรอตรวจ ' + expenses().filter(item=>!item.confirmed && (!c || item.contract === c.id)).length + ' รายการ' :
        topic === 'due' ? 'สัญญาใกล้ครบกำหนด ' + rows.filter(row=>row.status === 'soon').length + ' รายการ' :
          topic === 'arrears' ? 'สัญญาเกินกำหนด ' + rows.filter(row=>row.status === 'overdue').length + ' รายการ' :
            'เงินต้นคงค้าง ' + baht(d.sum(rows,'balance'));
      return {text,link:'#lending',label:'เปิดทะเบียนสัญญา'};
    }
    if (!c) return {text:'เลือกสัญญาของคุณเพื่อดูข้อมูล ณ วันที่สรุป'};
    const text = topic === 'balance' ? loanLabel(c) + ' ' + baht(balance(c)) :
      topic === 'due' ? (c.type === 'redemption' ? 'กำหนดไถ่ ' : 'กำหนดสิ้นสุดสัญญา ') + d.formatDate(c.due) :
        c.type === 'redemption' ? 'สัญญาขายฝากตัวอย่างนี้ไม่มีตารางผ่อน เปิดดูวันไถ่และสินไถ่ได้จากรายละเอียด' :
          topic === 'arrears' ? 'ยอดค้างตามตารางตัวอย่าง ' + baht(42000) :
            'ชำระแล้ว ' + c.repayments.filter(row=>row.date<=d.asOf).length + ' งวดตามตารางตัวอย่าง';
    return {text,contract:c.id,label:'เปิดสัญญา'};
  }

  function chatPanel() {
    if (chatOwner !== api.account()) { chat = []; chatOwner = api.account(); }
    const role = actor();
    const choices = questions[role];
    open('ผู้ช่วย Sunday Estate','<div class="v2-chat"><p class="v2-chat-note">ข้อมูลจำลอง · คำตอบตามสิทธิ์ของบัญชีที่กำลังทดลอง</p>' +
      (role === 'partner' ? '' : '<label class="v2-chat-scope">ขอบเขตข้อมูล<select id="v2-chat-scope">' +
      (staff() ? '<option value="">พอร์ตในขอบเขตบัญชี</option>' : '<option value="">เลือกสัญญาของคุณ</option>') + contractOptions() + '</select></label>') +
      '<div class="v2-chat-log" aria-live="polite" role="log"></div><div class="v2-prompts" aria-label="คำถามแนะนำ">' +
      [...choices, ...general.slice(0,choices.length < 5 ? 1 : 0)].map(([id,label])=>btn('ask:'+id,label)).join('') + '</div>' +
      '<form class="v2-chat-input" id="v2-chat-form"><input name="message" type="text" maxlength="250" aria-label="พิมพ์คำถาม" placeholder="พิมพ์คำถาม…" required>' +
      '<button class="primary" type="submit">ส่ง</button></form></div>','v2-chat');
    if (role === 'client' && contracts().length) document.getElementById('v2-chat-scope').value = contracts()[0].id;
    paintChat();
  }
  function paintChat() {
    const log = document.querySelector('.v2-chat-log');
    log.innerHTML = chat.length ? chat.map(entry => '<div class="v2-message me">' + escape(entry.question) + '</div>' +
      '<div class="v2-message estate"><strong>Sunday Estate</strong><p>' + escape(entry.text) + '</p>' +
      (entry.link ? '<a href="' + entry.link + '">' + escape(entry.label) + ' →</a>' :
        entry.contract ? '<button class="subtle" type="button" data-contract="' + entry.contract + '">' + escape(entry.label) + ' →</button>' : '') +
      (entry.contract || entry.link?.startsWith('#') ? '<small>ข้อมูล ณ ' + d.formatDate(d.asOf) + '</small>' : '') + '</div>').join('') :
      '<div class="v2-message estate"><strong>Sunday Estate</strong><p>เลือกคำถามด้านล่าง หรือพิมพ์เรื่องที่อยากทราบได้เลย</p></div>';
    log.scrollTop = log.scrollHeight;
  }
  function ask(input,topic) {
    const normalized = input.trim();
    if (!normalized) return;
    const selected = document.getElementById('v2-chat-scope')?.value ?? '';
    const explicitIds = normalized.match(/\bSE-\d{4}\b/gi);
    const id = explicitIds ? explicitIds[0].toUpperCase() : selected;
    const result = explicitIds?.some(code=>!lookup(code.toUpperCase())) ? {text:'ไม่พบสัญญาในขอบเขตบัญชีนี้'} :
      answer(topic ?? topicFrom(normalized),id);
    chat.push({question:normalized,...result});
    chat = chat.slice(-16);
    paintChat();
  }

  const startingDeals = [
    {id:'INV-001',name:'ที่ดินคลองหลวง',mode:'ร่วมทุน',basis:'amount',
      deeds:[{name:'โฉนดตัวอย่าง K-014'},{name:'โฉนดตัวอย่าง K-015'}],
      allocations:[{person:'company',share:57.22,pledged:2060000,paid:2060000,returns:0},
        {person:'partner',share:27.22,pledged:980000,paid:920000,returns:21600},
        {person:'partner2',share:15.56,pledged:560000,paid:550000,returns:12200}]},
    {id:'INV-002',name:'ที่ดินบางใหญ่',mode:'บริษัท',basis:'amount',
      deeds:[{name:'โฉนดตัวอย่าง B-021'}],allocations:[{person:'company',share:100,pledged:3200000,paid:3200000,returns:0}]},
    {id:'INV-003',name:'ที่ดินลำลูกกา',mode:'ส่วนบุคคล',basis:'amount',
      deeds:[{name:'โฉนดตัวอย่าง L-008'}],allocations:[{person:'portfolio',share:100,pledged:1800000,paid:1800000,returns:0}]},
  ];
  const memberNames = {company:'Sunday Estate · บริษัท', portfolio:'กิตติพงศ์ · ส่วนบุคคล', partner:'นพดล · ผู้ร่วมทุน', partner2:'ดาริน · ผู้ร่วมทุน'};
  const memberEmails = {partner:'partner@example.test',partner2:'partner2@example.test'};
  const defaultGrants = {'INV-001':['partner','partner2']};
  const grants = () => read('investment-grants') ?? defaultGrants;
  const investment = window.EstateInvestment;
  const allDeals = () => (read('investment-deals') ?? startingDeals).map(investment.normalize);
  const hasMember = (deal,person) => deal?.allocations.some(row=>row.person === person);

  function investments() {
    const deals = allDeals();
    if (staff()) return admin() ? deals : deals.filter(deal=>deal.mode !== 'ส่วนบุคคล');
    return deals.filter(deal => grants()[deal.id]?.includes(api.account()) && hasMember(deal,api.account()));
  }

  const shareText = share => share.toLocaleString('th-TH', {maximumFractionDigits:2}) + '%';
  const shareLabel = row => row.pledged > 0 && !row.share ? '<0.01%' : shareText(row.share);
  function investmentPage() {
    const deals = investments();
    const isStaff = staff();
    return moduleHeader('investments',{title:'ลงทุนที่ดิน',
      description:isStaff ? 'ติดตามโฉนดและเงินลงทุนในแต่ละโครงการ · ข้อมูลจำลอง' : 'เงินลงทุนและผลตอบแทนของบัญชีนี้ · ข้อมูลจำลอง',
      details:admin() ? '<div class="module-actions">' + btn('deal-edit:new','สร้างดีลจำลอง',true) + '</div>' : ''}) +
      (deals.length ? '<div class="v2-invest-grid">' + deals.map(deal => {
        const visible = isStaff ? deal.allocations : deal.allocations.filter(row=>row.person === api.account());
        const pledged = baht(d.sum(visible,'pledged'));
        return '<article class="card panel v2-invest">' + copy(escape(deal.name),escape(deal.mode) + ' · ' + deal.deeds.length + ' โฉนด') +
          '<div class="v2-invest-total"><span>' + (isStaff ? 'ทุนตกลงทั้งโครงการ' : 'ทุนตกลงของฉัน') + '</span><strong>' +
          pledged + '</strong><small>จ่ายจริงแล้ว ' + baht(d.sum(visible,'paid')) + '</small></div>' +
          '<section class="v2-deed"><h3>โฉนดในดีล</h3><ul class="v2-deed-list">' +
          deal.deeds.map(deed=>'<li>' + escape(deed.name) + '</li>').join('') + '</ul></section>' +
          '<section class="v2-deed"><h3>' + (isStaff ? 'สัดส่วนผู้ร่วมลงทุนทั้งดีล' : 'สัดส่วนของฉันในดีล') + '</h3>' +
          visible.map(row=>'<div><span><b>' + escape(isStaff ? memberNames[row.person] : 'เงินลงทุนที่ตกลง') + '</b><small>' +
            baht(row.pledged) + '</small></span><strong>' + escape(shareLabel(row)) + '</strong></div>').join('') +
          (!isStaff ? '<p class="muted">ส่วนแบ่งที่บันทึก ' + baht(d.sum(visible,'returns')) + '</p>' : '') + '</section>' +
          (admin() && deal.needsReview ? '<p class="muted">รวมยอดจากข้อมูลเดิมรายโฉนดแล้ว โปรดตรวจสัดส่วนทั้งดีลก่อนยืนยัน</p>' : '') +
          (admin() ? '<div class="v2-inline">' + btn('deal-edit:'+deal.id,'แก้ไขดีล') + btn('grants:'+deal.id,'จัดการสิทธิ์') + '</div>' : '') + '</article>';
      }).join('') + '</div>' : '<p class="card panel">ยังไม่มีดีลในบัญชีที่ได้รับสิทธิ์</p>');
  }

  let dealDraft;
  const newAllocation = person => ({person,share:'',pledged:'',paid:'',returns:0});
  function dealEdit(id) {
    if (!admin()) return;
    const existing = investments().find(deal=>deal.id === id);
    dealDraft = existing ? structuredClone(existing) : {name:'',mode:'ร่วมทุน',basis:'percent',deeds:[{name:''}],allocations:[newAllocation('company')]};
    paintDeal();
  }

  function fundingInput(label,name,value,max,min,optional = false) {
    return '<label>' + label + '<input name="' + name + '" type="number" inputmode="decimal" step="0.01" min="' + min +
      '" max="' + max + '" value="' + escape(String(value ?? '')) + '"' + (optional ? '' : ' required') + '></label>';
  }

  function paintDeal() {
    const deal = dealDraft;
    const percent = deal.basis === 'percent';
    const maxMoney = 1e10;
    const fields = deal.allocations.map((row,index) => {
      const share = percent ? fundingInput('สัดส่วน (%)','share-'+index,row.share,100,0.01) :
        '<div class="v2-deal-output"><span>สัดส่วนที่คำนวณ</span><output data-result-share="' + index + '">—</output></div>';
      const money = percent && index !== 0 ?
        '<div class="v2-deal-output"><span>เงินลงทุนที่คำนวณ</span><output data-result-amount="' + index + '">—</output></div>' :
        fundingInput(percent ? 'เงินลงทุนอ้างอิง (บาท)' : 'เงินลงทุน (บาท)','pledged-'+index,row.pledged,maxMoney,0.01);
      return '<div class="v2-allocation"><label>' + (index === 0 && percent ? 'ผู้ร่วมทุนคนแรก · ใช้อ้างอิง' : 'ผู้ร่วมทุน ' + (index+1)) +
        '<select name="person-' + index + '" data-deal-person="' + index + '">' +
        Object.entries(memberNames).map(([key,name])=>option(key,name,row.person)).join('') + '</select></label>' +
        '<div class="v2-funding-fields">' + share + money + '</div>' +
        (percent ? '<small class="v2-cap" id="v2-cap-' + index + '" data-cap="' + index + '"></small>' : '') +
        '<details' + (Number(row.paid) > 0 ? ' open' : '') + '><summary>เงินที่จ่ายจริง (ถ้ามี)</summary>' +
        fundingInput('จ่ายจริง (บาท)','paid-'+index,row.paid,maxMoney,0,true) + '</details>' +
        (deal.allocations.length > 1 ? btn('remove-allocation:'+index,'ลบผู้ร่วมทุน') : '') + '</div>';
    }).join('');
    open(deal.id ? 'แก้ไขดีลจำลอง' : 'สร้างดีลจำลอง','<form class="editor" id="v2-deal"><div class="form-grid">' +
      '<label>ชื่อโครงการ<input name="name" maxlength="70" value="' + escape(deal.name) + '" required></label>' +
      '<label>รูปแบบ<select name="mode">' + ['ส่วนบุคคล','บริษัท','ร่วมทุน'].map(mode=>option(mode,mode,deal.mode)).join('') + '</select></label></div>' +
      '<fieldset class="v2-fieldset"><legend>โฉนดในดีล</legend><p class="v2-deal-hint">เพิ่มทุกแปลงที่ซื้อในโครงการนี้</p>' +
      deal.deeds.map((deed,index)=>'<div class="v2-deed-input"><label>เลขโฉนด / ชื่อแปลง ' + (index+1) +
        '<input name="deed-' + index + '" value="' + escape(deed.name) + '" maxlength="70" required></label>' +
        (deal.deeds.length > 1 ? btn('remove-deed:'+index,'ลบแปลง') : '') + '</div>').join('') +
      '<div class="v2-inline">' + btn('add-deed','เพิ่มโฉนด') + '</div></fieldset>' +
      '<fieldset class="v2-fieldset"><legend>ผู้ร่วมลงทุนทั้งดีล</legend><p class="v2-deal-hint">ตั้งสัดส่วนครั้งเดียว ใช้กับทุกโฉนดในโครงการ</p>' +
      '<label>วิธีคำนวณ<select name="basis">' + option('percent','กรอกเปอร์เซ็นต์ → คำนวณเงิน',deal.basis) +
      option('amount','กรอกจำนวนเงิน → คำนวณเปอร์เซ็นต์',deal.basis) + '</select></label>' +
      '<p class="v2-deal-hint">' + (percent ? 'กรอกเปอร์เซ็นต์และยอดเงินของคนแรกเพื่อคำนวณทุนทั้งดีล แล้วกรอกเปอร์เซ็นต์คนที่เหลือให้ครบ 100%' :
        'กรอกเงินลงทุนของแต่ละคน ระบบรวมยอดและคำนวณเปอร์เซ็นต์ก่อนบันทึก') + '</p>' + fields +
      (deal.allocations.length < Object.keys(memberNames).length ? '<div class="v2-inline">' + btn('add-allocation','เพิ่มผู้ร่วมทุน') + '</div>' : '') +
      '<div class="v2-deal-summary"><span>ทุนทั้งดีล</span><strong data-deal-total>—</strong><p data-share-total role="status"></p></div>' +
      '</fieldset>' + errorLine + formFooter('บันทึกดีลจำลอง') + '</form>','v2-deal');
    updateDeal(document.getElementById('v2-deal'));
  }

  function fundingRows(form) {
    return dealDraft.allocations.map((row,index)=>({
      ...row,
      share:form.elements['share-'+index]?.value ?? row.share,
      pledged:form.elements['pledged-'+index]?.value ?? row.pledged,
    }));
  }

  function updateDeal(form) {
    const percent = dealDraft.basis === 'percent';
    const result = investment.calculate(fundingRows(form),dealDraft.basis);
    let allocated = 0;
    result.shares.forEach((share,index) => {
      if (percent) {
        const input = form.elements['share-'+index];
        const cap = Math.max(10000 - allocated,0) / 100;
        const hint = form.querySelector('[data-cap="' + index + '"]');
        input.max = String(cap);
        input.setAttribute('aria-describedby',hint.id);
        hint.textContent = 'ลงได้สูงสุด ' + shareText(cap);
        const overflow = input.validity.rangeOverflow;
        input.setAttribute('aria-invalid',String(overflow));
        input.setCustomValidity(overflow ? 'ดีลนี้เหลือให้ลงได้ไม่เกิน ' + shareText(cap) : '');
        allocated += Number.isFinite(Number(input.value)) ? Math.max(investment.units(input.value),0) : 0;
        const output = form.querySelector('[data-result-amount="' + index + '"]');
        if (output) output.value = result.amounts[index] === null ? '—' : baht(result.amounts[index]);
      } else {
        const output = form.querySelector('[data-result-share="' + index + '"]');
        output.value = share === null || result.amounts[index] === 0 ? '—' : shareLabel({share,pledged:result.amounts[index]});
      }
    });
    form.querySelector('[data-deal-total]').textContent = result.total > 0 ? baht(result.total) : '—';
    const status = form.querySelector('[data-share-total]');
    const delta = 10000 - allocated;
    status.classList.toggle('risk-text',percent && delta < 0);
    status.textContent = percent ? delta < 0 ? 'สัดส่วนเกิน ' + shareText(-delta / 100) :
      delta === 0 ? 'จัดสรรครบ 100%' : 'สัดส่วนคงเหลือ ' + shareText(delta / 100) :
      result.total > 0 ? 'สัดส่วนคำนวณจากทุนรวม' : 'กรอกเงินลงทุนเพื่อคำนวณสัดส่วน';
    return result;
  }

  function readDeal(form) {
    dealDraft.name = form.elements.name.value.trim();
    dealDraft.mode = form.elements.mode.value;
    dealDraft.deeds.forEach((deed,index)=>{ deed.name = form.elements['deed-'+index].value.trim(); });
    const result = updateDeal(form);
    dealDraft.allocations = dealDraft.allocations.map((row,index)=>{
      const person = form.elements['person-'+index].value;
      return {
        person,
        share:form.elements['share-'+index]?.value || result.shares[index] || '',
        pledged:form.elements['pledged-'+index]?.value || result.amounts[index] || '',
        paid:form.elements['paid-'+index].value,
        returns:person === row.person ? row.returns : 0,
      };
    });
    return result;
  }

  function changeDeal(form,target) {
    if (target.name === 'basis') {
      readDeal(form);
      dealDraft.basis = target.value;
      paintDeal();
      document.getElementById('v2-deal').elements.basis.focus();
    }
    if (target.dataset.dealPerson !== undefined) {
      const index = Number(target.dataset.dealPerson);
      if (target.value !== dealDraft.allocations[index].person) form.elements['paid-'+index].value = '';
    }
  }

  function submitDeal(form) {
    if (!admin()) return;
    const {shares,amounts,total} = readDeal(form);
    if (!dealDraft.name || dealDraft.deeds.some(deed=>!deed.name) ||
      new Set(dealDraft.deeds.map(deed=>deed.name.toLowerCase())).size !== dealDraft.deeds.length) {
      return error(form,'กรอกชื่อโครงการและเลขโฉนด / ชื่อแปลงให้ครบและไม่ซ้ำกัน');
    }
    if (new Set(dealDraft.allocations.map(row=>row.person)).size !== dealDraft.allocations.length) {
      return error(form,'เลือกผู้ร่วมทุนแต่ละคนเพียงครั้งเดียว');
    }
    if (!(total > 0) || shares.reduce((sum,share)=>sum+investment.units(share),0) !== 10000 ||
        amounts.some(amount=>!investment.validMoney(amount) || amount <= 0)) {
      return error(form,dealDraft.basis === 'percent' ? 'ตรวจยอดเงินอ้างอิง และจัดสัดส่วนทั้งดีลให้ครบ 100%' : 'กรอกเงินลงทุนของผู้ร่วมทุนทุกคน');
    }
    const allocations = dealDraft.allocations.map((row,index)=>({...row,share:shares[index],pledged:amounts[index],paid:Number(row.paid)}));
    if (allocations.some(row=>!investment.validMoney(row.paid) || row.paid > row.pledged)) {
      return error(form,'ยอดจ่ายจริงต้องไม่เกินเงินลงทุนที่ตกลงของแต่ละคน');
    }
    const id = dealDraft.id ?? 'INV-' + crypto.randomUUID().slice(0,8);
    const deal = {...dealDraft,id,allocations,needsReview:false};
    if (!write('investment-deals',[...allDeals().filter(record=>record.id !== id),deal])) return;
    close();
    api.render();
    notice('บันทึกดีลจำลองแล้ว');
  }
  function grantsDialog(id) {
    if (!admin()) return;
    const deal = investments().find(row=>row.id === id);
    if (!deal) return;
    const granted = grants()[id] ?? [];
    open('การเข้าถึงดีล','<form id="v2-grants" data-deal-id="' + id + '" class="editor"><p>' + escape(deal.name) +
      ' · อีเมลตัวอย่างที่ยืนยันแล้ว</p><ul class="v2-grants">' + Object.entries(memberEmails).map(([person,email])=>{
        const eligible = hasMember(deal,person);
        return '<li><span>' + escape(email) + '</span>' + (eligible ? (granted.includes(person) ?
          btn('revoke:'+id+','+person,'เพิกถอน') : '<small>ยังไม่มีสิทธิ์</small>') : '<small>ไม่มีส่วนลงทุน</small>') + '</li>';
      }).join('') + '</ul><label>อีเมลผู้ร่วมทุน<input name="email" type="email" required></label>' + errorLine +
      formFooter('กำหนดสิทธิ์จำลอง') + '</form>','v2-grants');
  }
  function submitGrant(form,values) {
    if (!admin()) return;
    const id = form.dataset.dealId;
    const deal = investments().find(row=>row.id===id);
    const match = Object.entries(memberEmails).find(([,email])=>email === values.email.trim().toLowerCase());
    if (!match || !hasMember(deal,match[0])) {
      error(form,'เลือกอีเมลบัญชีตัวอย่างที่มีส่วนลงทุนในดีลนี้'); return;
    }
    const next = {...grants(),[id]:[...new Set([...(grants()[id] ?? []),match[0]])]};
    if (write('investment-grants',next)) { grantsDialog(id); notice('กำหนดสิทธิ์แล้ว'); }
  }

  const categories = ['ค่าเดินทาง','ค่านายหน้า','ค่าปากถุง','ภาษีธุรกิจเฉพาะ','ค่าธรรมเนียมโอน','อากรแสตมป์'];
  const mockExpenses = [{id:'X-301',contract:'SE-1028',category:'ค่าธรรมเนียมโอน',amount:3000, payer:'ทีมดูแลสัญญา',
    date:d.asOf,confirmed:true}];
  const expenses = () => read('contract-expenses') ?? mockExpenses;
  const visibleExpenses = id => expenses().filter(e => (!id || e.contract === id) && lookup(e.contract) && (staff() || e.confirmed));
  function expenseList(id) {
    const rows = visibleExpenses(id);
    return rows.length ? '<div class="v2-expense-list">' + rows.map(e => '<div class="v2-expense-item"><span><b>' + escape(e.category) +
      '</b><small>' + escape(e.contract) + ' · ' + escape(e.payer) + ' · ' + d.formatDate(e.date) + '</small>' +
      (e.usedRule ? '<small>กฎวันที่ ' + d.formatDate(e.usedRule.effective) + ' · ' + e.usedRule.rate + '% × ' + baht(e.base) + '</small>' : '') +
      '</span><span><strong>' + baht(e.amount) + '</strong>' + (!e.confirmed ? btn('expense-confirm:'+e.id,'ยืนยัน') : '') + '</span></div>').join('') +
      '</div>' : '<p class="muted">ไม่มีรายการในมุมมองนี้</p>';
  }
  function expenseDialog(id) {
    if (id && !lookup(id)) return;
    open('รายจ่ายเพื่อรับทราบ', '<p class="v2-chat-note">รายการเหล่านี้แสดงแยกจากยอดหนี้และสินไถ่</p>' + expenseList(id) +
      (staff() ? '<div class="form-footer">' + (admin() ? btn('rules','กฎภาษีและค่าธรรมเนียม') : '') + btn('expense-add:'+(id || ''),'บันทึกรายจ่าย',true) + '</div>' : ''),'v2-expenses');
  }
  function expenseForm(id) {
    if (!staff()) return;
    open('บันทึกรายจ่ายจำลอง','<form class="editor" id="v2-expense"><div class="form-grid"><label>สัญญา<select name="contract" required>' +
      contractOptions() + '</select></label><label>ประเภท<select name="category">' + categories.map(name=>option(name,name)).join('') +
      '</select></label><label>ผู้รับผิดชอบ<select name="payer"><option>ทีมดูแลสัญญา</option><option>คู่สัญญา</option><option>ร่วมกัน</option></select></label>' +
      '<label>วันที่<input type="date" name="date" value="' + d.asOf + '" required></label></div><label>วิธีกรอก<select name="mode">' +
      '<option value="manual">กรอกยอดเอง</option><option value="principal">เปอร์เซ็นต์เงินต้น</option><option value="versioned">กฎที่ตั้งไว้</option></select></label>' +
      '<label id="v2-expense-value-label">ยอด (บาท)<input type="number" name="value" min="0.01" max="100000000" step="0.01" required></label>' +
      '<p data-expense-preview class="muted" aria-live="polite"></p><label data-rule-review hidden><span>ตรวจเงื่อนไขและข้อยกเว้นแล้ว</span><input type="checkbox" name="reviewed"></label>' + errorLine + formFooter('บันทึกฉบับร่าง') + '</form>','v2-expense');
    const form = document.getElementById('v2-expense');
    if (lookup(id)) form.elements.contract.value = id;
    updateExpensePreview(form);
  }
  const rules = () => readList('expense-rules');
  function estimateExpense(values) {
    const c = lookup(values.contract);
    if (!c) return null;
    const numeric = Number(values.value);
    if (values.mode === 'manual') return numeric > 0 ? {amount:numeric} : null;
    if (values.mode === 'principal') return numeric > 0 && numeric <= 100 ?
      {amount:Math.round(c.principal*numeric)/100,base:c.principal,rate:numeric} : null;
    const version = rules().filter(r=>r.category === values.category && r.type === c.type && r.effective<=values.date).sort((a,b)=>b.effective.localeCompare(a.effective))[0];
    if (!version) return null;
    const base = version.basis === 'appraisal' ? c.appraisal : c.principal;
    return {amount:Math.round(base*version.rate)/100,base,rate:version.rate,usedRule:version};
  }
  function updateExpensePreview(form) {
    const mode = form.elements.mode.value;
    const field = form.elements.value;
    field.disabled = mode === 'versioned';
    const review = form.querySelector('[data-rule-review]');
    review.hidden = mode !== 'versioned';
    review.querySelector('input').required = mode === 'versioned';
    field.max = mode === 'principal' ? 100 : 100000000;
    document.getElementById('v2-expense-value-label').firstChild.textContent = mode === 'principal' ? 'เปอร์เซ็นต์' : 'ยอด (บาท)';
    const estimate = estimateExpense(Object.fromEntries(new FormData(form)));
    form.querySelector('[data-expense-preview]').textContent = estimate ? 'ยอดก่อนยืนยัน ' + baht(estimate.amount) +
      (estimate.base ? ' · ' + estimate.rate + '% ของ ' + baht(estimate.base) : '') +
      (estimate.usedRule ? ' · เงื่อนไข ' + estimate.usedRule.conditions : '') :
        mode === 'versioned' ? 'ยังไม่มีกฎที่ใช้ได้ในวันและประเภทที่เลือก' : 'ยอดจะแสดงหลังใส่ตัวเลข';
  }
  function submitExpense(form,values) {
    if (!staff() || !categories.includes(values.category)) return;
    const estimate = estimateExpense(values);
    if (!estimate || (estimate.usedRule && values.reviewed !== 'on')) { error(form,'ตรวจสอบยอดหรือกฎที่เลือก'); return; }
    const rows = expenses();
    if (rows.some(row=>row.contract === values.contract && row.category === values.category && row.date === values.date && row.amount === estimate.amount)) {
      error(form,'พบรายการประเภท วัน และยอดเดียวกันในสัญญานี้'); return;
    }
    const row = {id:crypto.randomUUID(),contract:values.contract,category:values.category,payer:values.payer,date:values.date,confirmed:false,...estimate};
    if (write('contract-expenses',[...rows,row])) { expenseDialog(row.contract); notice('บันทึกฉบับร่างแล้ว'); }
  }
  function rulesDialog() {
    if (!admin()) return;
    open('กฎรายจ่ายตัวอย่าง','<form id="v2-rules" class="editor"><p>ตั้งสูตรจำลองพร้อมวันเริ่มใช้และแหล่งอ้างอิง ก่อนใช้จริงให้ตรวจเงื่อนไขตามประเภทนิติกรรม</p>' +
      '<div class="form-grid"><label>ประเภท<select name="category">' + categories.slice(3).map(name=>option(name,name)).join('') +
      '</select></label><label>นิติกรรม<select name="type"><option value="loan">ปล่อยกู้</option><option value="redemption">ขายฝาก</option></select></label>' +
      '<label>ฐาน<select name="basis"><option value="principal">เงินต้น / ราคาขายฝากตัวอย่าง</option><option value="appraisal">ราคาประเมินตัวอย่าง</option></select></label>' +
      '<label>อัตรา (%)<input name="rate" type="number" min="0.01" max="100" step="0.01" required></label>' +
      '<label>เริ่มใช้<input name="effective" type="date" required></label><label>แหล่งอ้างอิง<input name="source" type="url" required placeholder="https://…"></label></div>' +
      '<label>เงื่อนไข / ข้อยกเว้น<input name="conditions" maxlength="180" required></label>' + errorLine + formFooter('เพิ่มรุ่นกฎ') + '</form>' +
      '<div class="v2-expense-list">' + rules().map(row=>'<div class="v2-expense-item"><span><b>' + escape(row.category) + ' · ' +
      escape(d.labels[row.type]) + '</b><small>' + d.formatDate(row.effective) + ' · ' + escape(row.conditions) + '</small></span><strong>' +
      row.rate + '%</strong></div>').join('') + '</div>','v2-rules');
  }
  function submitRule(form,values) {
    if (!admin()) return;
    if (!/^https:\/\//i.test(values.source)) { error(form,'ใช้ URL แหล่งอ้างอิง HTTPS'); return; }
    const list = rules();
    if (list.some(row=>row.category === values.category && row.type === values.type && row.effective === values.effective)) {
      error(form,'มีกฎประเภทและวันเริ่มใช้นี้อยู่แล้ว'); return;
    }
    if (write('expense-rules',[...list,{...values,rate:Number(values.rate)}])) { rulesDialog(); notice('บันทึกรุ่นกฎแล้ว'); }
  }

  let galleryDraft;
  function galleryDialog(fresh = true) {
    if (!admin()) return;
    if (fresh) galleryDraft = structuredClone(read('gallery-published') ?? window.EstateScenes.defaultGallery);
    open('จัดการแกลเลอรี','<div class="editor"><p>รูปและลำดับที่เผยแพร่จะปรากฏในแกลเลอรีบนเบราว์เซอร์นี้</p><ol class="v2-gallery-list">' +
      galleryDraft.map((row,i)=>'<li><img src="' + window.EstateScenes.asset(row.src) + '" alt="' + escape(row.alt) +
        '"><div><strong>' + escape(row.caption) + '</strong><small>' + escape(row.alt) + '</small><div class="v2-inline">' +
        (i>0 ? btn('gallery-shift:'+i+',-1','ขึ้น') : '') + (i<galleryDraft.length-1 ? btn('gallery-shift:'+i+',1','ลง') : '') +
        (galleryDraft.length>1 ? btn('gallery-delete:'+i,'นำออก') : '') + '</div></div></li>').join('') + '</ol>' +
      (galleryDraft.length < 10 ? '<form id="v2-gallery-upload" class="editor"><label>ภาพใหม่<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required></label>' +
      '<div class="form-grid"><label>คำบรรยาย<input name="caption" maxlength="80" required></label><label>ข้อความทดแทน<input name="alt" maxlength="130" required></label>' +
      '</div>' + errorLine + formFooter('เพิ่มในฉบับร่าง') + '</form>' : '') +
      '<div class="form-footer">' + btn('gallery-preview','ดูตัวอย่าง') + btn('gallery-publish','เผยแพร่จำลอง',true) + '</div></div>','v2-gallery');
  }
  async function uploadGallery(form,values) {
    if (!admin() || galleryDraft.length >= 10) return;
    const file = values.image;
    if (!file?.size || file.size>8e6 || !/^image\/(jpeg|png|webp)$/.test(file.type)) { error(form,'เลือกภาพ JPEG, PNG หรือ WebP ขนาดไม่เกิน 8 MB'); return; }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const img = await createImageBitmap(file);
      const scale = Math.min(1,1000/Math.max(img.width,img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(img.width*scale));
      canvas.height = Math.max(1,Math.round(img.height*scale));
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      img.close();
      if (!admin() || !form.isConnected || !form.closest('dialog').open) return;
      galleryDraft.push({src:canvas.toDataURL('image/webp',.75),alt:values.alt.trim(),caption:values.caption.trim()});
      galleryDialog(false);
    } catch { error(form,'เปิดรูปนี้ไม่ได้'); }
    finally { submit.disabled = false; }
  }
  function modelSettings() {
    if (!admin()) return;
    const current = read('chat-config') ?? {provider:'ปิดโมเดลภายนอก',model:'',limit:30};
    open('ตั้งค่าผู้ช่วย AI','<form id="v2-model" class="editor"><p>ตั้งค่าสำหรับทดสอบหน้าจอ ระบบจริงจะจัดเก็บกุญแจ API ฝั่งเซิร์ฟเวอร์</p>' +
      '<label>ผู้ให้บริการ<select name="provider">' + ['ปิดโมเดลภายนอก','OpenAI · ตัวอย่าง','Gemini · ตัวอย่าง'].map(v=>option(v,v,current.provider)).join('') +
      '</select></label><label>ชื่อโมเดล<input name="model" value="' + escape(current.model) +
      '" maxlength="64"></label><label>คำขอสูงสุดต่อบัญชีต่อวัน<input name="limit" type="number" min="1" max="1000" value="' +
      Number(current.limit) + '" required></label>' + formFooter('บันทึกค่าจำลอง') + '</form>','v2-model');
  }
  function adminTools() {
    return (staff() ? '<article class="card panel v2-workflows">' + copy('เครื่องมือสัญญา','ทดลองขั้นตอนโดยใช้ข้อมูลจำลอง') +
      '<div class="v2-inline">' + btn('payment','ทดลองรับชำระ') + btn('expenses','รายจ่ายสัญญา') +
      (admin() ? btn('models','ตั้งค่า AI') + btn('gallery','จัดการแกลเลอรี') : '') + '</div></article>' : '');
  }
  function memberHome() {
    if (actor() === 'partner') return investmentPage();
    return moduleHeader('contracts',{title:'สัญญาของฉัน',description:'ยอดและกำหนดตามข้อมูลจำลอง ณ ' + d.formatDate(d.asOf)}) +
      '<div class="v2-invest-grid">' + contracts().map(c=>'<article class="card panel v2-invest">' +
        copy(c.id + ' · ' + c.property,d.labels[c.type] + ' · กำหนด ' + d.formatDate(c.due)) +
        '<div class="v2-invest-total"><span>' + loanLabel(c) + '</span><strong>' + baht(balance(c)) +
        '</strong></div><div class="v2-inline"><button class="control" type="button" data-contract="' + c.id + '">ดูสัญญา</button>' +
        btn('expenses:'+c.id,'รายจ่ายเพื่อรับทราบ') + '</div></article>').join('') + '</div>';
  }
  function launchers() {
    return '<button class="v2-ai-launch" type="button" data-v2="chat" aria-label="เปิดผู้ช่วย Sunday Estate">' +
      icon('ai',24) + '<span>ผู้ช่วย AI</span></button>';
  }
  function actionsForContract(c) {
    return '<div class="v2-inline">' + btn('expenses:'+c.id,'รายจ่ายเพื่อรับทราบ') +
      (staff() && c.type === 'loan' && c.balance > 0 ? btn('payment:'+c.id,'ทดลองรับชำระ') : '') + '</div>';
  }
  function handleClick(button) {
    const [name,arg=''] = button.dataset.v2.split(':');
    if (!api.account()) return;
    switch (name) {
      case 'chat': sound(); chatPanel(); break;
      case 'ask': ask([...questions[actor()], ...general].find(([id])=>id === arg)?.[1] ?? '',arg); break;
      case 'dismiss': close(); break;
      case 'payment': paymentForm(arg); break;
      case 'fill-balance': {
        const field = document.querySelector('#v2-payment [name="amount"]');
        field.value = field.max;
        break;
      }
      case 'receipt': receiptView(); break;
      case 'expenses': expenseDialog(arg); break;
      case 'expense-add': expenseForm(arg); break;
      case 'expense-confirm': {
        if (!staff()) return;
        const row = visibleExpenses().find(e=>e.id===arg && !e.confirmed);
        if (row && write('contract-expenses',expenses().map(e=>e.id===arg ? {...e,confirmed:true} : e))) {
          expenseDialog(row.contract);
          notice('ยืนยันรายจ่ายเพื่อรับทราบแล้ว');
        }
        break;
      }
      case 'rules': rulesDialog(); break;
      case 'deal-edit': dealEdit(arg); break;
      case 'grants': grantsDialog(arg); break;
      case 'revoke': {
        if (!admin()) return;
        const [id,person] = arg.split(',');
        if (write('investment-grants',{...grants(),[id]:(grants()[id] ?? []).filter(key=>key!==person)})) grantsDialog(id);
        break;
      }
      case 'add-deed': case 'remove-deed': case 'add-allocation': case 'remove-allocation': {
        const form = document.getElementById('v2-deal');
        if (!admin() || !form) return;
        readDeal(form);
        const index = Number(arg);
        const rows = dealDraft.allocations;
        let focus;
        if (name === 'add-deed') {
          dealDraft.deeds.push({name:''});
          focus = 'deed-' + (dealDraft.deeds.length - 1);
        }
        if (name === 'remove-deed') {
          dealDraft.deeds.splice(index,1);
          focus = 'deed-' + Math.min(index,dealDraft.deeds.length-1);
        }
        if (name === 'add-allocation') {
          const person = Object.keys(memberNames).find(key=>!rows.some(row=>row.person === key));
          if (!person) return;
          rows.push(newAllocation(person));
          focus = (dealDraft.basis === 'percent' ? 'share-' : 'pledged-') + (rows.length - 1);
        }
        if (name === 'remove-allocation') {
          rows.splice(index,1);
          focus = 'person-' + Math.min(index,rows.length-1);
        }
        paintDeal();
        document.getElementById('v2-deal').elements[focus]?.focus();
        break;
      }
      case 'gallery': galleryDialog(); break;
      case 'gallery-shift': {
        if (!admin()) return;
        const [i,delta] = arg.split(',').map(Number);
        [galleryDraft[i],galleryDraft[i+delta]] = [galleryDraft[i+delta],galleryDraft[i]];
        galleryDialog(false);
        break;
      }
      case 'gallery-delete':
        if (admin() && galleryDraft.length>1) { galleryDraft.splice(Number(arg),1); galleryDialog(false); }
        break;
      case 'gallery-preview':
        if (admin()) open('ดูตัวอย่างฉบับร่าง','<div class="v2-gallery-preview">' + galleryDraft.map(row=>'<figure><img src="' +
          window.EstateScenes.asset(row.src) + '" alt="' + escape(row.alt) + '"><figcaption>' + escape(row.caption) +
          '</figcaption></figure>').join('') + '</div>' + formFooter('',btn('gallery-back','กลับไปแก้ไข')).replace('<button class="primary" type="submit"></button>',''),'v2-gallery-preview');
        break;
      case 'gallery-back': if (admin()) galleryDialog(false); break;
      case 'gallery-publish':
        if (admin() && write('gallery-published',galleryDraft)) { close(); notice('เผยแพร่แกลเลอรีจำลองแล้ว'); }
        break;
      case 'models': modelSettings(); break;
    }
  }
  function handleSubmit(form,values) {
    switch (form.id) {
      case 'v2-chat-form': ask(values.message); form.reset(); break;
      case 'v2-payment': submitPayment(form,values); break;
      case 'v2-deal': submitDeal(form); break;
      case 'v2-grants': submitGrant(form,values); break;
      case 'v2-expense': submitExpense(form,values); break;
      case 'v2-rules': submitRule(form,values); break;
      case 'v2-gallery-upload': void uploadGallery(form,values); break;
      case 'v2-model':
        if (admin() && write('chat-config',{...values,limit:Number(values.limit)})) { close(); notice('บันทึกค่าจำลองแล้ว'); }
        break;
    }
  }
  return {allowedRoute,staff,actor,launchers,memberHome,investmentPage,adminTools,birthdayInputs,birthdayPatch,checkBirthday,
    sound,lookup,contracts,scope,actionsForContract,handleClick,handleSubmit,updateExpensePreview,updateDeal,changeDeal};
};
