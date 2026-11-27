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
  let origin;
  let windX = 0;
  let windY = 0;
  let puffs;

  function smokePuff(colors) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    const paint = sprite.getContext('2d');
    const fade = paint.createRadialGradient(24,24,1,24,24,24);
    fade.addColorStop(0,colors[0]);
    fade.addColorStop(.43,colors[1]);
    fade.addColorStop(1,'transparent');
    paint.fillStyle = fade;
    paint.fillRect(0,0,48,48);
    return sprite;
  }

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
    previous = strength = windX = windY = 0;
    origin = undefined;
    if (canvas.hidden) return;
    canvas.hidden = true;
    ink.removeAttribute('mask');
    logo.style.maskImage = '';
    samples?.forEach(sample=>{sample.dx=sample.dy=0;});
  }

  function distanceFrom(box,x,y) {
    return Math.hypot(Math.max(box.left-x,0,x-box.right),Math.max(box.top-y,0,y-box.bottom));
  }

  function render(now) {
    frame = 0;
    if (!point || motion.matches || document.hidden) { clear(); return; }
    const root = scene.getBoundingClientRect();
    const boxes = [gold.getBoundingClientRect(),logo.getBoundingClientRect()];
    const radius = root.width < 640 ? Math.max(118,Math.min(153,root.width*.37)) : Math.min(225,Math.max(170,root.width*.22));
    if (root.bottom < 0 || root.top > innerHeight || Number(getComputedStyle(gold).opacity) < .9) { clear(); return; }
    const active = !point.released && boxes.some(box=>distanceFrom(box,point.x,point.y)<radius*.89);
    if (active) origin = point;
    const nextKey = boxes.map(box=>Math.round(box.width)+'x'+Math.round(box.height)).join('/');
    if (active && (nextKey!==rasterKey || !samples)) {
      if (!logo.complete || !logo.naturalWidth || boxes.some(box=>!box.width||!box.height)) { clear(); return; }
      try {
        samples = makeSamples(...boxes);
        puffs ??= [
          smokePuff(['#df9521b0','#e9ad4b58']),
          smokePuff(['#12366ca8','#5477a852']),
        ];
      }
      catch { clear(); return; }
      if (!samples.length) { clear(); return; }
      rasterKey = nextKey;
    }

    const elapsed = Math.min(40,previous ? now-previous : 16);
    const damping = 1-Math.exp(-elapsed/(active?95:130));
    previous = now;
    strength += ((active?1:0)-strength)*damping;
    if (!samples || !origin || (!active && strength < .028)) { clear(); return; }
    const windDamping = Math.exp(-elapsed/290);
    windX *= windDamping;
    windY *= windDamping;

    const dpr = Math.min(devicePixelRatio||1,1.6);
    const width = Math.ceil(root.width*dpr);
    const height = Math.ceil(root.height*dpr);
    if (canvas.width!==width || canvas.height!==height) { canvas.width=width; canvas.height=height; }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,root.width,root.height);
    const x = origin.x-root.left;
    const y = origin.y-root.top;
    hole.setAttribute('cx',x);
    hole.setAttribute('cy',y);
    hole.setAttribute('r',radius);
    hole.setAttribute('opacity',strength);
    if (canvas.hidden) ink.setAttribute('mask','url(#opening-dust-mask)');
    const logoX = origin.x-boxes[1].left;
    const logoY = origin.y-boxes[1].top;
    logo.style.maskImage = 'radial-gradient(circle '+radius+'px at '+logoX+'px '+logoY+'px, rgba(0,0,0,'+
      (1-strength)+') 30%, rgba(0,0,0,'+(1-strength*.45)+') 72%, #000 100%)';
    canvas.hidden = false;

    const clock = now*.001;
    for (const sample of samples) {
      const box = boxes[sample.index];
      const baseX = box.left-root.left+sample.x*box.width;
      const baseY = box.top-root.top+sample.y*box.height;
      const dx = baseX-x;
      const dy = baseY-y;
      const distance = Math.hypot(dx,dy);
      const force = Math.pow(Math.max(0,1-distance/radius),.8)*strength;
      if (!force && Math.abs(sample.dx)+Math.abs(sample.dy)<.18) continue;
      const turbulence = Math.sin(baseX*.043 + baseY*.028 - clock*2.8);
      const angle = Math.atan2(dy,dx)+turbulence*.44+Math.sin(sample.seed)*.58;
      const travel = force**.82 * (radius*.66+sample.seed*1.16);
      sample.dx += (Math.cos(angle)*travel+windX*force-sample.dx)*damping;
      sample.dy += (Math.sin(angle)*travel+windY*force-force*radius*.24-sample.dy)*damping;
      const age = (clock*.52 + sample.seed*.037)%1;
      const spread = .43+age*.87;
      const drift = turbulence*force*(7+age*15);
      const drawX = baseX+sample.dx*spread+drift;
      const drawY = baseY+sample.dy*spread-drift*.65;
      const fade = Math.sin(age*Math.PI);
      if (sample.seed%11===0 && force>.065) {
        const diameter = 15+age*30+force*19;
        ctx.globalAlpha = Math.min(.21,force*.43*fade);
        ctx.drawImage(puffs[sample.index],drawX-diameter/2,drawY-diameter/2,diameter,diameter);
      }
      const size = Math.max(.65,1.64-force*.79) + sample.seed%5*.12;
      ctx.globalAlpha = Math.min(.92,force*1.77)*(.37+fade*.63);
      ctx.fillStyle = sample.color;
      ctx.fillRect(drawX,drawY,size*(1+force*.58),size);
    }
    frame = requestAnimationFrame(render);
  }

  function update(event) {
    if (motion.matches) return;
    const time = event.timeStamp;
    if (point && !point.released && time-point.time<120) {
      const elapsed = Math.max(12,time-point.time);
      const velocityX = Math.max(-55,Math.min(55,(event.clientX-point.x)*29/elapsed));
      const velocityY = Math.max(-55,Math.min(55,(event.clientY-point.y)*29/elapsed));
      windX = windX*.45+velocityX*.55;
      windY = windY*.45+velocityY*.55;
    }
    point = {x:event.clientX,y:event.clientY,time,released:false};
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
    releaseTimer = setTimeout(release,600);
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
