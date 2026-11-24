window.createEstateToast = ({root, dialog, icon}) => {
  const entries = new Map();
  const exiting = new Set();
  const small = matchMedia('(max-width: 639px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const live = root.querySelector('.toast-live');
  const list = root.querySelector('.toast-list');
  const types = {
    success: ['สำเร็จ','check'],
    error: ['เกิดข้อผิดพลาด','errorCircle'],
    warning: ['คำเตือน','alert'],
    info: ['แจ้งให้ทราบ','infoCircle'],
  };
  let sequence = 0;

  function sync() {
    const parent = dialog.open ? dialog : document.body;
    if (root.parentNode !== parent) parent.append(root);
  }

  function dismiss(id, immediate = false) {
    const entry = entries.get(id);
    if (!entry) return;
    entries.delete(id);
    entry.clock.cancel();
    entry.enter?.cancel();
    entry.announcement.remove();
    const {card} = entry;
    if (immediate || motion.matches) { card.remove(); return; }
    card.inert = true;
    const height = card.offsetHeight;
    const exit = card.animate([
      {opacity:1,transform:'none',maxHeight:height+'px'},
      {opacity:0,transform:'translateX(60%) scale(.9)',maxHeight:height+'px',offset:.55},
      {opacity:0,transform:'translateX(60%) scale(.9)',maxHeight:'0px',marginBottom:'-10px'},
    ], {duration:300,easing:'cubic-bezier(.33,0,.67,0)',fill:'forwards'});
    const remove = () => { card.remove(); exiting.delete(exit); };
    exiting.add(exit);
    exit.onfinish = remove;
    exit.oncancel = remove;
  }

  function trim() {
    const limit = small.matches ? 2 : 5;
    while (entries.size > limit) dismiss(entries.keys().next().value,true);
  }

  function show({type = 'info', title, message = '', duration = 5000}) {
    type = Object.hasOwn(types,type) ? type : 'info';
    const [label,glyph] = types[type];
    const id = ++sequence;
    const card = document.createElement('li');
    card.className = 'toast-card';
    card.dataset.type = type;
    card.innerHTML = '<div class="toast-body"><span class="toast-icon">' + icon(glyph,18) +
      '</span><div><strong></strong><p></p></div><button type="button" class="toast-dismiss" aria-label="ปิดการแจ้งเตือน">' +
      icon('x',16) + '</button></div><div class="toast-timer" aria-hidden="true"></div>';
    card.querySelector('strong').textContent = title || label;
    const copy = card.querySelector('p');
    copy.textContent = message;
    copy.hidden = !message;
    sync();
    list.prepend(card);
    const announcement = document.createElement('p');
    announcement.textContent = [title || label,message].filter(Boolean).join(' ');
    live.append(announcement);
    const clock = card.querySelector('.toast-timer').animate(
      [{transform:'scaleX(1)'},{transform:'scaleX(0)'}],
      {duration:Number.isFinite(duration) && duration > 0 ? duration : 5000,fill:'forwards'});
    const enter = motion.matches ? null : card.animate(
      [{transform:'translateX(100%) scale(.95)',opacity:0},{transform:'none',opacity:1}],
      {duration:350,easing:'cubic-bezier(.21,1.02,.73,1)'});
    entries.set(id,{card,clock,enter,announcement});
    trim();
    clock.onfinish = () => dismiss(id);
    let hovered = false;
    let focused = false;
    const pause = () => {
      if (clock.playState === 'idle' || clock.playState === 'finished') return;
      if (hovered || focused) clock.pause();
      else clock.play();
    };
    card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; pause(); } });
    card.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; pause(); } });
    card.addEventListener('focusin', () => { focused = true; pause(); });
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) { focused = false; pause(); } });
    card.querySelector('button').addEventListener('click', () => dismiss(id));
    return id;
  }

  function clear() {
    for (const id of entries.keys()) dismiss(id,true);
    for (const exit of exiting) exit.cancel();
    list.replaceChildren();
    live.replaceChildren();
  }

  small.addEventListener('change',trim);
  motion.addEventListener('change',() => {
    if (!motion.matches) return;
    for (const entry of entries.values()) entry.enter?.cancel();
    for (const exit of exiting) exit.cancel();
  });
  return {show,dismiss,clear,sync};
};
