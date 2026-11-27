window.mountEstateGallery = (gallery, rows, motion) => {
  const stage = gallery.querySelector('.gallery-stage');
  const wheel = stage.parentElement;
  const cards = [...stage.querySelectorAll('[data-gallery-image]')];
  const images = cards.map(card => card.querySelector('img'));
  const caption = gallery.querySelector('figcaption');
  const dots = [...gallery.querySelectorAll('[data-gallery-dot]')];
  const announcement = gallery.querySelector('.gallery-announcement');
  const toggle = gallery.querySelector('[data-gallery-control="toggle"]');
  const navigation = gallery.querySelector('.gallery-navigation');
  const size = rows.length;
  const cruiseSpeed = Math.min(.68, size/9);
  const visibleArc = Math.min(size/2,3.9);
  const hasRearQueue = size/2 > visibleArc;
  const ease = value => value*value*(3-2*value);
  const hoverCapable = matchMedia('(any-hover: hover)');
  const listeners = new AbortController();
  const opts = {signal:listeners.signal};
  const wrap = value => ((value % size) + size) % size;
  const relative = value => wrap(value + size/2) - size/2;
  let position = 0;
  let target;
  let animation = 0;
  let coasting = false;
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

  function paint(manual = false) {
    cards.forEach((card,index) => {
      const offset = relative(index-position);
      const distance = Math.abs(offset);
      // Long collections share the same arc. Extra photos fade in at the rear.
      const rearFade = hasRearQueue ? ease(Math.max(0,Math.min(1,(visibleArc-distance)/.52))) : 1;
      const hidden = rearFade === 0;
      if (card.hidden !== hidden) card.hidden = hidden;
      if (hidden) return;

      const travel = Math.PI*distance/visibleArc;
      const angle = hasRearQueue ? .78*travel+.58*Math.sin(travel) : travel+.29*Math.sin(travel);
      const depth = (1+Math.cos(angle))/2;
      const side = Math.sin(angle)*Math.sign(offset);
      const focus = ease(Math.max(0,1-distance/.9));
      const blurProgress = ease(Math.max(0,Math.min(1,(distance-.4)/.6)));
      const scale = .49+.28*depth+.40*focus;
      const x = Math.min(width*.49,415)*side;
      const y = size > 1 ? height*.40*(depth-.79) : 0;
      const z = -Math.min(width*.46,390)*(1-depth);
      const yaw = -side*(38+32*(1-depth));
      card.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${yaw}deg) scale(${scale})`;
      // Layer bands keep each flank in order, including while the rear photos fade in.
      card.style.zIndex = String(20-2*Math.floor(distance)+Number(offset < 0));
      card.style.opacity = String(rearFade*(.76+.20*depth+.04*focus));
      card.style.setProperty('--gallery-blur',`${blurProgress*(1.25+.40*(1-depth))}px`);
    });
    showCurrent(manual);
  }

  function preloadNearby() {
    if (!visible) return;
    const preloadRadius = Math.ceil(visibleArc)+1;
    for (let offset=-preloadRadius;offset<=preloadRadius;offset++) {
      const image = images[wrap(current+offset)];
      if (image.loading === 'lazy') image.loading = 'eager';
    }
  }

  function showCurrent(manual = false) {
    const active = wrap(Math.round(position));
    if (active === current && !manual) return;
    current = active;
    cards.forEach((card,i) => {
      card.classList.toggle('is-current',i === active);
      images[i].alt = i === active ? rows[i].alt : '';
      if (i === active) dots[i].setAttribute('aria-current','true');
      else dots[i].removeAttribute('aria-current');
    });
    preloadNearby();
    stage.dataset.current = String(active);
    caption.textContent = rows[active].caption;
    if (manual) announcement.textContent = 'ภาพที่ '+(active+1)+' '+rows[active].caption;
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
    const ramp = ease(Math.min(1,runningTime/3.7));
    const speed = .18+(cruiseSpeed-.18)*ramp;
    position = wrap(position+speed*elapsed);
    paint();
    autoplay = requestAnimationFrame(advance);
  }

  function sync() {
    toggle.hidden = motion.matches || size < 2;
    toggle.textContent = paused ? 'เล่นภาพต่อ' : 'หยุดภาพ';
    toggle.setAttribute('aria-pressed',String(paused));
    const canPlay = visible && !paused && !hovering && !document.hidden && !motion.matches && !drag && !coasting && target === undefined &&
      !gallery.querySelector('.gallery-stage:focus-visible,button:focus-visible') && size > 1;
    if (canPlay && !autoplay) autoplay = requestAnimationFrame(advance);
    if (!canPlay && autoplay) stopAutoplay();
  }

  function stopRotation() {
    cancelAnimationFrame(animation);
    animation = 0;
    target = undefined;
    coasting = false;
  }

  function rotate(next,manual,settling = false) {
    stopAutoplay();
    stopRotation();
    target = next;
    const start = position;
    const delta = target-start;
    function settle() {
      position = wrap(next);
      target = undefined;
      animation = 0;
      paint(manual);
      sync();
    }
    if (motion.matches || Math.abs(delta) < .004) {
      settle();
      return;
    }

    const started = performance.now();
    const duration = settling ? 280 : Math.min(670,310+95*Math.abs(delta));
    function frame(now) {
      const progress = Math.min(1,Math.max(0,(now-started)/duration));
      position = start+delta*(settling ? ease(progress) : 1-(1-progress)**4);
      if (progress < 1) {
        paint();
        animation = requestAnimationFrame(frame);
      } else settle();
    }
    animation = requestAnimationFrame(frame);
  }

  function coast(speed) {
    if (Math.abs(speed) < .48) {
      rotate(Math.round(position),true,true);
      return;
    }
    const friction = 3.15;
    let velocity = Math.max(-15,Math.min(15,speed));
    let previous = performance.now();
    coasting = true;
    function frame(now) {
      const elapsed = Math.max(0,Math.min(.05,(now-previous)/1000));
      previous = now;
      const decay = Math.exp(-friction*elapsed);
      position = wrap(position+velocity*(1-decay)/friction);
      velocity *= decay;
      paint();
      if (Math.abs(velocity) > .42) animation = requestAnimationFrame(frame);
      else rotate(Math.round(position+velocity/friction),true,true);
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
    stopRotation();
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
      const age = event.timeStamp-gesture.time;
      const speed = event.type === 'pointerup' && age < 100 && !motion.matches
        ? -gesture.velocity*1000/gesture.step*Math.exp(-age/95) : 0;
      coast(speed);
    } else if (paused) rotate(Math.round(position),false,true);
    else sync();
  }
  stage.addEventListener('pointerup',release,opts);
  stage.addEventListener('pointercancel',release,opts);
  stage.addEventListener('lostpointercapture',event => {
    if (event.target === stage) release(event);
  },opts);
  wheel.addEventListener('pointerenter',event => {
    if (event.pointerType === 'mouse' && hoverCapable.matches) { hovering = true; sync(); }
  },opts);
  stage.addEventListener('pointerleave',event => {
    if (!drag?.moved) release(event);
  },opts);
  wheel.addEventListener('pointerleave',event => {
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
    const dot = event.target.closest('[data-gallery-dot]');
    if (dot) {
      rotate(Math.round(position+relative(Number(dot.dataset.galleryDot)-position)),true);
      return;
    }
    const action = event.target.closest('[data-gallery-control]')?.dataset.galleryControl;
    if (action === 'toggle') {
      paused = !paused;
      sync();
      if (paused && !drag && target === undefined) rotate(Math.round(position),false);
    }
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
    preloadNearby();
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
  gallery.querySelector('.gallery-dots').hidden = size < 2;
  paint();
  sync();
  return () => {
    listeners.abort();
    observer.disconnect();
    resize.disconnect();
    clearLift();
    stopRotation();
    stopAutoplay();
  };
};
