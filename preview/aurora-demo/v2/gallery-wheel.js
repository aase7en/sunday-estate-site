window.mountEstateGallery = (gallery, rows, motion) => {
  const stage = gallery.querySelector('.gallery-stage');
  const cards = [...stage.querySelectorAll('[data-gallery-image]')];
  const caption = gallery.querySelector('figcaption');
  const count = gallery.querySelector('.gallery-count');
  const toggle = gallery.querySelector('[data-gallery-control="toggle"]');
  const navigation = gallery.querySelector('.gallery-navigation');
  const size = rows.length;
  const cruiseSpeed = Math.min(.48, size/12);
  const listeners = new AbortController();
  const opts = {signal:listeners.signal};
  const wrap = value => ((value % size) + size) % size;
  const relative = value => wrap(value + size/2) - size/2;
  let position = 0;
  let target;
  let animation = 0;
  let autoplay = 0;
  let lastFrame;
  let runningTime = 0;
  let width = stage.clientWidth;
  let height = stage.clientHeight;
  let current = -1;
  let drag;
  let liftedCard;
  let liftTimer;
  let hovering = false;
  let suppressClick = false;
  let paused = false;
  let visible = false;

  function paint() {
    cards.forEach((card,index) => {
      const angle = (index-position) * 2*Math.PI/size;
      const side = Math.sin(angle);
      const depth = (1+Math.cos(angle))/2;
      const x = width*.446*side;
      const y = size > 1 ? height*.46*(depth-.64) : 0;
      card.style.transform = `translate3d(${x}px,${y}px,0) rotateY(${-side*39}deg) rotateZ(${side*7}deg) scale(${.48+depth*.52})`;
      card.style.zIndex = String(Math.round(depth*1000));
      card.style.opacity = String(.68+depth*.32);
    });
  }

  function showCurrent(manual = false) {
    const active = wrap(Math.round(position));
    if (active === current && !manual) return;
    current = active;
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
    cancelAnimationFrame(autoplay);
    autoplay = 0;
    lastFrame = undefined;
    runningTime = 0;
  }

  function advance(now) {
    const elapsed = lastFrame === undefined ? 0 : Math.min(48, now-lastFrame)/1000;
    lastFrame = now;
    runningTime += elapsed;
    const ramp = Math.min(1,runningTime/5);
    const speed = .10+(cruiseSpeed-.10)*ramp*ramp*(3-2*ramp);
    position = wrap(position+speed*elapsed);
    paint();
    showCurrent();
    autoplay = requestAnimationFrame(advance);
  }

  function sync() {
    toggle.hidden = motion.matches || size < 2;
    toggle.textContent = paused ? 'เล่นภาพต่อ' : 'หยุดภาพ';
    toggle.setAttribute('aria-pressed',String(paused));
    const canPlay = visible && !paused && !hovering && !document.hidden && !motion.matches && !drag && target === undefined &&
      !gallery.querySelector('.gallery-stage:focus-visible,button:focus-visible') && size > 1;
    if (canPlay && !autoplay) autoplay = requestAnimationFrame(advance);
    if (!canPlay && autoplay) stopAutoplay();
  }

  function rotate(next,manual) {
    stopAutoplay();
    cancelAnimationFrame(animation);
    target = next;
    const start = position;
    const delta = target-start;
    function settle() {
      position = wrap(next);
      target = undefined;
      paint();
      showCurrent(manual);
      sync();
    }
    if (motion.matches || Math.abs(delta) < .004) {
      settle();
      return;
    }

    const started = performance.now();
    const duration = Math.min(730,350+105*Math.abs(delta));
    function frame(now) {
      const progress = Math.min(1,Math.max(0,(now-started)/duration));
      position = start+delta*(1-(1-progress)**4);
      if (progress < 1) {
        paint();
        animation = requestAnimationFrame(frame);
      } else settle();
    }
    animation = requestAnimationFrame(frame);
  }

  function step(direction) {
    rotate((target ?? Math.round(position))+direction,true);
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
      target = undefined;
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
    step(event.key === 'ArrowLeft' ? -1 : 1);
  },opts);
  gallery.addEventListener('click',event => {
    const action = event.target.closest('[data-gallery-control]')?.dataset.galleryControl;
    if (action === 'toggle') { paused = !paused; sync(); }
    if (action === 'prev' || action === 'next') step(action === 'prev' ? -1 : 1);
  },opts);
  gallery.addEventListener('focusin',sync,opts);
  gallery.addEventListener('focusout',() => queueMicrotask(() => {
    if (!listeners.signal.aborted) sync();
  }),opts);
  document.addEventListener('visibilitychange',sync,opts);
  motion.addEventListener('change',() => {
    clearLift();
    rotate(target ?? Math.round(position),false);
  },opts);

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .2;
    sync();
  },{threshold:.2});
  observer.observe(stage);
  const resize = new ResizeObserver(() => {
    width = stage.clientWidth;
    height = stage.clientHeight;
    paint();
  });
  resize.observe(stage);
  navigation.hidden = size < 2;
  paint();
  showCurrent();
  sync();
  return () => {
    listeners.abort();
    observer.disconnect();
    resize.disconnect();
    clearLift();
    cancelAnimationFrame(animation);
    stopAutoplay();
  };
};
