window.mountEstateGallery = (gallery, rows, motion) => {
  const stage = gallery.querySelector('.gallery-stage');
  const cards = [...stage.querySelectorAll('[data-gallery-image]')];
  const caption = gallery.querySelector('figcaption');
  const count = gallery.querySelector('.gallery-count');
  const toggle = gallery.querySelector('[data-gallery-control="toggle"]');
  const navigation = gallery.querySelector('.gallery-navigation');
  const size = rows.length;
  const autoplayDelay = 3200;
  const listeners = new AbortController();
  const opts = {signal:listeners.signal};
  const wrap = value => ((value % size) + size) % size;
  const relative = value => wrap(value + size/2) - size/2;
  let position = 0;
  let target = 0;
  let animation;
  let timer;
  let drag;
  let liftedCard;
  let liftTimer;
  let hovering = false;
  let suppressClick = false;
  let paused = false;
  let visible = false;

  function paint() {
    cards.forEach((card,index) => {
      const offset = relative(index-position);
      const distance = Math.abs(offset);
      const angle = Math.min(distance,2.2) * .91;
      const depth = (1-Math.cos(angle))/2;
      const x = Math.sin(angle) * Math.sign(offset) * 92;
      card.style.transform = 'translate3d('+x+'%, '+(depth*17)+'%, '+(-depth*125)+'px) rotateY('+(Math.sign(offset)*Math.min(distance*25,56))+'deg) scale('+(1-depth*.5)+')';
      card.style.zIndex = String(100-Math.round(distance*30));
      card.style.opacity = String(Math.max(0, Math.min(1-depth*.66, 2.35-distance)));
      card.style.visibility = distance >= 2.35 ? 'hidden' : 'visible';
    });
  }

  function settled(manual) {
    position = target = wrap(target);
    paint();
    const active = Math.round(position);
    cards.forEach((card,i) => {
      card.classList.toggle('is-current',i === active);
      card.querySelector('img').alt = i === active ? rows[i].alt : '';
    });
    stage.dataset.current = String(active);
    caption.textContent = rows[active].caption;
    count.setAttribute('aria-live',manual ? 'polite' : 'off');
    count.textContent = (active+1)+' / '+size;
    if (manual) {
      const announced = document.createElement('span');
      announced.className = 'sr-only';
      announced.textContent = ' '+rows[active].caption;
      count.append(announced);
    }
  }

  function stopAutoplay() {
    clearTimeout(timer);
  }

  function sync() {
    stopAutoplay();
    toggle.hidden = motion.matches || size < 2;
    toggle.textContent = paused ? 'เล่นภาพต่อ' : 'หยุดภาพ';
    toggle.setAttribute('aria-pressed',String(paused));
    if (visible && !paused && !hovering && !document.hidden && !motion.matches && !drag &&
      !gallery.querySelector('.gallery-stage:focus-visible,button:focus-visible') && size > 1) {
      timer = setTimeout(() => rotate(target+1,false),autoplayDelay);
    }
  }

  function rotate(next,manual) {
    cancelAnimationFrame(animation);
    target = next;
    const start = position;
    const delta = target-start;
    if (motion.matches || Math.abs(delta) < .004) {
      settled(manual);
      sync();
      return;
    }
    const started = performance.now();
    const duration = Math.min(730,410+120*Math.abs(delta));
    function frame(now) {
      const progress = Math.min(1,Math.max(0,(now-started)/duration));
      position = start+delta*(1-(1-progress)**4);
      paint();
      if (progress < 1) animation = requestAnimationFrame(frame);
      else { settled(manual); sync(); }
    }
    stopAutoplay();
    animation = requestAnimationFrame(frame);
  }

  function clearLift() {
    clearTimeout(liftTimer);
    liftedCard?.classList.remove('is-lifted');
    liftedCard = undefined;
  }

  stage.addEventListener('pointerdown',event => {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.pointerType !== 'mouse' && !motion.matches) {
      clearLift();
      liftedCard = event.target.closest('[data-gallery-image]');
      liftedCard?.classList.add('is-lifted');
    }
    if (size < 2) return;
    suppressClick = false;
    drag = {id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:event.timeStamp,
      velocity:0,step:Math.min(230,stage.clientWidth*.37),moved:false};
    stopAutoplay();
  },opts);
  stage.addEventListener('pointermove',event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX-drag.startX;
    const dy = event.clientY-drag.startY;
    if (!drag.moved) {
      if (Math.abs(dx) < 7 || Math.abs(dy) > Math.abs(dx)) return;
      clearLift();
      cancelAnimationFrame(animation);
      drag.origin = position;
      drag.moved = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    const elapsed = event.timeStamp-drag.time;
    if (elapsed > 0) drag.velocity = .35*drag.velocity+.65*(event.clientX-drag.x)/elapsed;
    drag.x = event.clientX;
    drag.time = event.timeStamp;
    position = drag.origin-dx/drag.step;
    paint();
  },opts);
  function release(event) {
    if (!event.isPrimary) return;
    if (event.type === 'pointerup' && liftedCard) liftTimer = setTimeout(clearLift,330);
    if (event.type === 'pointercancel') clearLift();
    if (drag?.id !== event.pointerId) return;
    const gesture = drag;
    drag = undefined;
    stage.classList.remove('is-dragging');
    if (gesture.moved) {
      suppressClick = true;
      const speed = event.type === 'pointerup' && event.timeStamp-gesture.time < 95 && !motion.matches ? gesture.velocity : 0;
      const momentum = Math.max(-1.55,Math.min(1.55,speed*165/gesture.step));
      rotate(Math.round(position-momentum),true);
    } else sync();
  }
  stage.addEventListener('pointerup',release,opts);
  stage.addEventListener('pointercancel',release,opts);
  stage.addEventListener('lostpointercapture',event => {
    if (event.target === stage) release(event);
  },opts);
  stage.addEventListener('pointerenter',event => {
    if (event.pointerType === 'mouse') { hovering = true; sync(); }
  },opts);
  stage.addEventListener('pointerleave',event => {
    if (!drag?.moved) release(event);
    if (event.pointerType === 'mouse') { hovering = false; sync(); }
  },opts);
  stage.addEventListener('click',event => {
    const card = event.target.closest('[data-gallery-image]');
    if (suppressClick) { suppressClick = false; return; }
    if (card) {
      rotate(Math.round(position+relative(Number(card.dataset.galleryImage)-position)),true);
    }
  },opts);
  stage.addEventListener('keydown',event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    rotate(target+(event.key === 'ArrowLeft' ? -1 : 1),true);
  },opts);
  gallery.addEventListener('click',event => {
    const action = event.target.closest('[data-gallery-control]')?.dataset.galleryControl;
    if (action === 'toggle') { paused = !paused; sync(); }
    if (action === 'prev' || action === 'next') rotate(target+(action === 'prev' ? -1 : 1),true);
  },opts);
  gallery.addEventListener('focusin',sync,opts);
  gallery.addEventListener('focusout',() => queueMicrotask(() => {
    if (!listeners.signal.aborted) sync();
  }),opts);
  document.addEventListener('visibilitychange',sync,opts);
  motion.addEventListener('change',() => {
    clearLift();
    rotate(target,false);
  },opts);

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .2;
    sync();
  },{threshold:.2});
  observer.observe(stage);
  navigation.hidden = size < 2;
  settled(false);
  sync();
  return () => {
    listeners.abort();
    observer.disconnect();
    clearLift();
    cancelAnimationFrame(animation);
    stopAutoplay();
  };
};
