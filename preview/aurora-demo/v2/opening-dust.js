window.mountOpeningDust = (scene, motion) => {
  const logo = scene.querySelector('.opening-reveal img');
  const letters = scene.querySelector('#opening-letterforms');
  const gold = scene.querySelector('.opening-gold');
  const ink = scene.querySelector('.opening-brand-ink');
  const hole = scene.querySelector('#opening-dust-mask circle');
  const canvas = scene.querySelector('.opening-dust');
  const ctx = canvas.getContext('2d');
  if (!ctx || !logo) return () => {};

  const listeners = new AbortController();
  const opts = {signal:listeners.signal,passive:true};
  let point;
  let touch;
  let releaseTimer;
  let frame = 0;
  let previous = 0;
  let strength = 0;
  let samples;
  let rasterKey;

  function makeSamples(wordBox, logoBox) {
    const surface = document.createElement('canvas');
    const sampler = surface.getContext('2d',{willReadFrequently:true});
    if (!sampler) return [];
    const stamp = (index, box, spacing, draw) => {
      surface.width = Math.ceil(box.width);
      surface.height = Math.ceil(box.height);
      draw();
      const pixels = sampler.getImageData(0,0,surface.width,surface.height).data;
      const points = [];
      for (let y=1;y<surface.height;y+=spacing) {
        for (let x=1;x<surface.width;x+=spacing) {
          const offset = (y*surface.width+x)*4;
          if (pixels[offset+3] < 145) continue;
          points.push({index,x:x/box.width,y:y/box.height,color:'rgb('+pixels.slice(offset,offset+3).join(',')+')',
            dx:0,dy:0,seed:(x*17+y*29)%125});
        }
      }
      return points;
    };
    const word = stamp(0,wordBox,Math.max(2,Math.round(wordBox.width/138)),() => {
      const origin = letters.getBBox();
      for (const text of letters.querySelectorAll('text')) {
        const style = getComputedStyle(text);
        sampler.font = style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
        const box = text.getBBox();
        const gradient = sampler.createLinearGradient(0,box.y-origin.y,0,box.y+box.height-origin.y);
        for (const stop of scene.querySelectorAll('#opening-gold-paint stop')) {
          gradient.addColorStop(Number(stop.getAttribute('offset')||0),stop.getAttribute('stop-color'));
        }
        sampler.fillStyle = gradient;
        for (const [index,char] of [...text.textContent].entries()) {
          const start = text.getStartPositionOfChar(index);
          sampler.fillText(char,start.x-origin.x,start.y-origin.y);
        }
      }
    });
    return word.concat(stamp(1,logoBox,2,() => sampler.drawImage(logo,0,0,surface.width,surface.height)));
  }

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = strength = 0;
    if (canvas.hidden) return;
    canvas.hidden = true;
    ink.removeAttribute('mask');
    logo.style.maskImage = '';
    samples?.forEach(sample=>{sample.dx=sample.dy=0;});
  }

  function isNear(box,x,y,margin) {
    return x>=box.left-margin && x<=box.right+margin && y>=box.top-margin && y<=box.bottom+margin;
  }

  function render(now) {
    frame = 0;
    if (!point || motion.matches || document.hidden) { clear(); return; }
    const root = scene.getBoundingClientRect();
    const boxes = [gold.getBoundingClientRect(),logo.getBoundingClientRect()];
    const radius = root.width < 640 ? 58 : 86;
    if (root.bottom < 0 || root.top > innerHeight || Number(getComputedStyle(gold).opacity) < .9) { clear(); return; }
    const active = !point.released && boxes.some(box=>isNear(box,point.x,point.y,14));
    const nextKey = boxes.map(box=>Math.round(box.width)+'x'+Math.round(box.height)).join('/');
    if (active && (nextKey!==rasterKey || !samples)) {
      if (!logo.complete || !logo.naturalWidth || boxes.some(box=>!box.width||!box.height)) { clear(); return; }
      try { samples = makeSamples(...boxes); }
      catch { clear(); return; }
      if (!samples.length) { clear(); return; }
      rasterKey = nextKey;
    }

    const damping = 1-Math.exp(-Math.min(40,previous ? now-previous : 16)/75);
    previous = now;
    strength += ((active?1:0)-strength)*damping;
    if (!samples || (!active && strength < .028)) { clear(); return; }

    const dpr = Math.min(devicePixelRatio||1,1.6);
    const width = Math.ceil(root.width*dpr);
    const height = Math.ceil(root.height*dpr);
    if (canvas.width!==width || canvas.height!==height) { canvas.width=width; canvas.height=height; }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,root.width,root.height);
    const x = point.x-root.left;
    const y = point.y-root.top;
    hole.setAttribute('cx',x);
    hole.setAttribute('cy',y);
    hole.setAttribute('r',radius);
    hole.setAttribute('opacity',strength);
    ink.setAttribute('mask','url(#opening-dust-mask)');
    const logoX = point.x-boxes[1].left;
    const logoY = point.y-boxes[1].top;
    logo.style.maskImage = 'radial-gradient(circle '+radius+'px at '+logoX+'px '+logoY+'px, rgba(0,0,0,'+
      (1-strength)+') 40%, #000 100%)';
    canvas.hidden = false;

    for (const sample of samples) {
      const box = boxes[sample.index];
      const baseX = box.left-root.left+sample.x*box.width;
      const baseY = box.top-root.top+sample.y*box.height;
      const dx = baseX-x;
      const dy = baseY-y;
      const distance = Math.hypot(dx,dy);
      const force = Math.max(0,1-distance/radius) * strength;
      if (!force && Math.abs(sample.dx)+Math.abs(sample.dy)<.18) continue;
      const angle = Math.atan2(dy,dx)+Math.sin(sample.seed)*.7;
      const travel = force**1.3 * (33+sample.seed%75);
      sample.dx += (Math.cos(angle)*travel-sample.dx)*damping;
      sample.dy += (Math.sin(angle)*travel-force*11-sample.dy)*damping;
      const drift = Math.sin(now*.003+sample.seed)*force*3;
      const size = Math.max(.65,1.55-force*.72) + sample.seed%5*.14;
      ctx.globalAlpha = Math.min(.95,force*1.75+(Math.abs(sample.dx)+Math.abs(sample.dy))*.009);
      ctx.fillStyle = sample.color;
      ctx.fillRect(baseX+sample.dx+drift,baseY+sample.dy+drift*.5,size,size);
    }
    frame = requestAnimationFrame(render);
  }

  function update(event) {
    if (motion.matches) return;
    point = {x:event.clientX,y:event.clientY,released:false};
    if (!frame) frame = requestAnimationFrame(render);
  }

  function release() {
    if (point) point.released = true;
  }

  scene.addEventListener('pointermove',event=>{
    if (event.pointerType==='mouse' || event.pointerId===touch) update(event);
  },opts);
  scene.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button!==0 || event.pointerType==='mouse') return;
    clearTimeout(releaseTimer);
    touch = event.pointerId;
    update(event);
  },opts);
  window.addEventListener('pointerup',event=>{
    if (event.pointerId!==touch) return;
    touch = undefined;
    releaseTimer = setTimeout(release,420);
  },opts);
  scene.addEventListener('pointerleave',event=>{ if (event.pointerType==='mouse') release(); },opts);
  scene.addEventListener('pointercancel',event=>{ if (event.pointerId===touch) { touch=undefined; release(); } },opts);
  motion.addEventListener('change',clear,opts);
  document.addEventListener('visibilitychange',()=>{ if (document.hidden) clear(); },opts);
  return () => {
    listeners.abort();
    clearTimeout(releaseTimer);
    clear();
  };
};
