window.mountOpeningDust = (scene, motion) => {
  const logo = scene.querySelector('.opening-reveal img');
  const letters = scene.querySelector('#opening-letterforms');
  const gold = scene.querySelector('.opening-gold');
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
  let fragments;
  let fragmentTravel = 0;
  const splitAt = [.22,.44,.66];

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

  function rasterize(wordBox, logoBox) {
    const tiles = [];
    const grains = [];
    const stamp = (index, box, spacing, tileSize, draw) => {
      const surface = document.createElement('canvas');
      const sampler = surface.getContext('2d',{willReadFrequently:true});
      const scale = 2;
      const pad = 5;
      surface.width = Math.ceil((box.width+2*pad)*scale);
      surface.height = Math.ceil((box.height+2*pad)*scale);
      sampler.scale(scale,scale);
      sampler.translate(pad,pad);
      draw(sampler);
      const pixels = sampler.getImageData(0,0,surface.width,surface.height).data;
      const pixelAt = (x,y) => (y*surface.width+x)*4;
      for (let y=1;y<surface.height;y+=spacing*scale) {
        for (let x=1;x<surface.width;x+=spacing*scale) {
          const offset = pixelAt(x,y);
          if (pixels[offset+3] < 145) continue;
          grains.push({index,x:(x/scale-pad)/box.width,y:(y/scale-pad)/box.height,
            color:'rgb('+pixels.slice(offset,offset+3).join(',')+')',dx:0,dy:0,seed:(x*17+y*29)%125});
        }
      }
      for (let y=0;y<surface.height;) {
        const h = Math.min(surface.height-y,(tileSize+(y*11)%7-3)*scale);
        for (let x=0;x<surface.width;) {
          const w = Math.min(surface.width-x,(tileSize+(x*7+y*5)%9-4)*scale);
          let filled = false;
          for (let sy=y;sy<y+h&&!filled;sy+=2) {
            for (let sx=x;sx<x+w;sx+=2) {
              if (pixels[pixelAt(sx,sy)+3] > 9) { filled = true; break; }
            }
          }
          if (filled) tiles.push({index,surface,x,y,w,h,scale,pad,dx:0,dy:0,pressure:0,seed:(x*13+y*7)%131});
          x += w;
        }
        y += h;
      }
    };
    stamp(0,wordBox,Math.max(2,Math.round(wordBox.width/138)),Math.max(10,Math.round(wordBox.width/19)),sampler => {
      const origin = letters.getBBox();
      const outline = getComputedStyle(gold);
      sampler.strokeStyle = outline.stroke;
      sampler.lineWidth = parseFloat(outline.strokeWidth);
      sampler.lineJoin = 'round';
      sampler.shadowColor = '#1c141b82';
      sampler.shadowBlur = 4;
      sampler.shadowOffsetY = 2;
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
          sampler.strokeText(char,start.x-origin.x,start.y-origin.y);
          sampler.fillText(char,start.x-origin.x,start.y-origin.y);
        }
      }
    });
    stamp(1,logoBox,2,8,sampler => sampler.drawImage(logo,0,0,logoBox.width,logoBox.height));
    return {grains,tiles};
  }

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = strength = windX = windY = 0;
    origin = undefined;
    fragmentTravel = 0;
    if (canvas.hidden) return;
    canvas.hidden = true;
    scene.classList.remove('is-dispersing');
    samples?.forEach(sample=>{sample.dx=sample.dy=0;});
    fragments?.forEach(tile=>{tile.dx=tile.dy=tile.pressure=0;});
  }

  function distanceFrom(box,x,y) {
    return Math.hypot(Math.max(box.left-x,0,x-box.right),Math.max(box.top-y,0,y-box.bottom));
  }

  function drawFragment(surface,x,y,w,h,ratio,pressure,depth = 0) {
    const width = w/ratio;
    const height = h/ratio;
    const threshold = splitAt[depth];
    if (depth === splitAt.length || pressure <= threshold || Math.min(w,h) < 4) {
      ctx.drawImage(surface,x,y,w,h,-width/2,-height/2,width,height);
      return;
    }

    // The four pieces first share the parent's shape, then separate as pressure rises.
    const amount = Math.min(1,(pressure-threshold)/.19);
    const separation = amount*amount*(3-2*amount);
    const separate = separation*(3.8-depth*.95);
    const halfWidth = Math.floor(w/2);
    const halfHeight = Math.floor(h/2);
    for (let row=0;row<2;row++) {
      const offsetY = row*halfHeight;
      const shardHeight = row ? h-halfHeight : halfHeight;
      for (let col=0;col<2;col++) {
        const offsetX = col*halfWidth;
        const shardWidth = col ? w-halfWidth : halfWidth;
        const drift = Math.sin((x+offsetX)*.67+(y+offsetY)*.39);
        ctx.save();
        ctx.translate((offsetX+shardWidth/2)/ratio-width/2+(col*2-1)*separate*(1+drift*.3),
          (offsetY+shardHeight/2)/ratio-height/2+(row*2-1)*separate*(1-drift*.3));
        ctx.rotate(drift*separation*.44);
        drawFragment(surface,x+offsetX,y+offsetY,shardWidth,shardHeight,ratio,pressure,depth+1);
        ctx.restore();
      }
    }
  }

  function render(now) {
    frame = 0;
    if (!point || motion.matches || document.hidden) { clear(); return; }
    const root = scene.getBoundingClientRect();
    const boxes = [gold.getBoundingClientRect(),logo.getBoundingClientRect()];
    const radius = root.width < 640 ? Math.max(118,Math.min(153,root.width*.37)) : Math.min(225,Math.max(170,root.width*.22));
    const goldOpacity = Number(getComputedStyle(gold).opacity);
    if (root.bottom < 0 || root.top > innerHeight || goldOpacity < .9) { clear(); return; }
    const active = !point.released && boxes.some(box=>distanceFrom(box,point.x,point.y)<radius*.89);
    if (active) origin = point;
    const nextKey = boxes.map(box=>Math.round(box.width)+'x'+Math.round(box.height)).join('/');
    if (active && (nextKey!==rasterKey || !samples)) {
      if (!logo.complete || !logo.naturalWidth || boxes.some(box=>!box.width||!box.height)) { clear(); return; }
      try {
        const raster = rasterize(...boxes);
        samples = raster.grains;
        fragments = raster.tiles;
        puffs ??= [
          smokePuff(['#df9521b0','#e9ad4b58']),
          smokePuff(['#12366ca8','#5477a852']),
        ];
      }
      catch { clear(); return; }
      if (!samples.length || !fragments.length) { clear(); return; }
      rasterKey = nextKey;
    }

    const elapsed = Math.min(40,previous ? now-previous : 16);
    const damping = 1-Math.exp(-elapsed/(active?95:130));
    previous = now;
    strength += ((active?1:0)-strength)*damping;
    if (!samples || !origin || (!active && strength < .015 && fragmentTravel < 2)) { clear(); return; }
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
    if (canvas.hidden) scene.classList.add('is-dispersing');
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
    // Move the original artwork in pieces over the finer smoke.
    fragmentTravel = 0;
    for (const tile of fragments) {
      const box = boxes[tile.index];
      const w = tile.w/tile.scale;
      const h = tile.h/tile.scale;
      const baseX = box.left-root.left+tile.x/tile.scale-tile.pad+w/2;
      const baseY = box.top-root.top+tile.y/tile.scale-tile.pad+h/2;
      const dx = baseX-x;
      const dy = baseY-y;
      const distance = Math.hypot(dx,dy);
      const force = Math.max(0,1-distance/radius)*strength;
      tile.pressure += (force-tile.pressure)*damping;
      const heading = Math.atan2(dy,dx)+Math.sin(tile.seed)*.21;
      const lift = force**1.08*(radius*.72+tile.seed*.61);
      tile.dx += (Math.cos(heading)*lift+windX*force-tile.dx)*damping;
      tile.dy += (Math.sin(heading)*lift+windY*force-lift*.28-tile.dy)*damping;
      const travel = Math.hypot(tile.dx,tile.dy);
      fragmentTravel = Math.max(fragmentTravel,travel);
      const dissolve = Math.max(0,Math.min(1,(travel-12)/(radius*.8)));
      const scale = 1-dissolve*(.69-tile.pressure*.26);
      const turn = Math.sin(tile.seed*2)*dissolve*.84;
      ctx.globalAlpha = (1-dissolve*.7)*(tile.index===0?goldOpacity:1);
      ctx.save();
      ctx.translate(baseX+tile.dx,baseY+tile.dy);
      if (turn) ctx.rotate(turn);
      if (scale !== 1) ctx.scale(scale,scale);
      drawFragment(tile.surface,tile.x,tile.y,tile.w,tile.h,tile.scale,tile.pressure);
      ctx.restore();
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
