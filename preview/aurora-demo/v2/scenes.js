window.EstateScenes = (() => {
  const scenes = [
    {src:'assets/aurora-estate.webp', title:'บ้านที่อยากกลับมา', alt:'บ้านร่วมสมัยริมสระในแสงเช้า', copy:'พื้นที่ที่ให้ชีวิตค่อย ๆ เป็นไปในจังหวะของคุณ'},
    {src:'assets/scenes/business.webp', title:'พื้นที่ให้ธุรกิจในฝัน', alt:'ผู้ประกอบการในร้านกาแฟขนาดเล็ก', copy:'ให้ความตั้งใจเริ่มต้นได้จากพื้นที่ที่เหมาะสม'},
    {src:'assets/scenes/land.webp', title:'ที่ดินที่เลี้ยงชีวิต', alt:'ทิวทัศน์ที่ดินและพื้นที่สีเขียว', copy:'มองเห็นศักยภาพของที่ดินผ่านการใช้งานจริง'},
    {src:'assets/scenes/future.webp', title:'วางแผนเงินลงทุนเพื่อวัยเกษียณ', alt:'พื้นที่พักอาศัยท่ามกลางบรรยากาศสงบ', copy:'มองไปถึงวันที่อยากใช้เวลาในแบบของคุณ'},
    {src:'assets/scenes/family.webp', title:'ช่วงเวลาที่มีความหมาย', alt:'ครอบครัวรับประทานอาหารร่วมกันในบ้าน', copy:'มีพื้นที่สำหรับคนที่คุณอยากใช้เวลาด้วย'},
  ];
  const defaultGallery = scenes.map(({src,alt,title}) => ({src,alt,caption:title}));
  const asset = value => typeof value === 'string' && (/^data:image\/(jpeg|webp|png);base64,[\w+/=]+$/.test(value) ||
    defaultGallery.some(image => image.src === value)) ? value : '';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stopCurrent = () => {};

  function landing(api) {
    const {icon, escape} = api;
    return '<div class="cinema-page"><header class="cinema-nav"><a class="cinema-brand" href="#hero">' +
      icon('brand',23) + '<span>Sunday Estate</span></a><nav aria-label="หน้าแรก"><a href="#gallery" data-scene-scroll="gallery">แกลเลอรี</a>' +
      '<a class="cinema-cta" href="#overview">เปิดแดชบอร์ด ' + icon('arrow',17) + '</a></nav></header><main id="workspace" tabindex="-1">' +
      scenes.map((scene,i) => '<section class="cinema-scene' + (i === 0 ? ' cinema-opening' : '') + '" id="scene-' + i +
      '"><img src="' + scene.src + '" alt="' + escape(scene.alt) + '"' + ([1,4].includes(i) ? ' srcset="' + scene.src.replace('.webp','-828.webp') + ' 828w, ' + scene.src + ' 1440w" sizes="100vw"' : '') + (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') +
      '><div class="cinema-scrim"></div><div class="cinema-content">' +
      (i === 0 ? '<h1>' : '<h2>') + scene.title + (i === 0 ? '</h1>' : '</h2>') +
      '<p>' + scene.copy + '</p>' + (i ? '' : '<a class="cinema-cta" href="#scene-1" data-scene-scroll="scene-1">เลื่อนดูเรื่องราว ' +
      icon('chevron',16) + '</a><a class="cinema-skip" href="#gallery" data-scene-scroll="gallery">ข้ามไปแกลเลอรี</a>') + '</div></section>').join('') +
      '<section id="gallery" class="cinema-gallery" aria-labelledby="gallery-heading"><div class="gallery-heading"><div><h2 id="gallery-heading">แกลเลอรี</h2>' +
      '<p>ภาพประกอบแนวคิด</p></div><button class="control" type="button" data-gallery-control="toggle" aria-pressed="false">หยุดภาพ</button></div>' +
      '<figure class="gallery-stage"><img alt="" loading="lazy"><figcaption aria-live="off"></figcaption></figure>' +
      '<div class="gallery-controls"><button type="button" class="control" data-gallery-control="prev">ภาพก่อนหน้า</button><span aria-live="polite"></span>' +
      '<button type="button" class="control" data-gallery-control="next">ภาพถัดไป</button></div></section></main></div>';
  }

  function mount(api) {
    stopCurrent();
    const page = document.querySelector('.cinema-page');
    if (!page) return;
    const stored = api.read('gallery-published');
    const list = Array.isArray(stored) && stored.length ? stored : defaultGallery;
    const stage = page.querySelector('.gallery-stage');
    const gallery = stage.closest('section');
    const img = stage.querySelector('img');
    const caption = stage.querySelector('figcaption');
    const count = page.querySelector('.gallery-controls span');
    const toggle = page.querySelector('[data-gallery-control="toggle"]');
    let index = 0;
    let paused = reduced();
    let visible = false;
    let initialized = false;
    let interval;
    const show = manual => {
      initialized = true;
      img.src = asset(list[index].src) || defaultGallery[0].src;
      img.alt = list[index].alt;
      caption.textContent = list[index].caption;
      count.setAttribute('aria-live', manual ? 'polite' : 'off');
      count.textContent = (index + 1) + ' / ' + list.length;
      stage.getAnimations().forEach(animation => animation.cancel());
      if (!reduced()) stage.animate([{opacity:.76},{opacity:1}],{duration:520});
    };
    const step = (delta, manual) => {
      index = (index + delta + list.length) % list.length;
      show(manual);
    };
    const sync = () => {
      clearInterval(interval);
      toggle.textContent = paused ? 'เล่นภาพต่อ' : 'หยุดภาพ';
      toggle.setAttribute('aria-pressed', String(paused));
      if (visible && !paused && !document.hidden && !reduced() && list.length > 1) {
        interval = setInterval(() => step(1,false),8000);
      }
    };
    const observer = new IntersectionObserver(entries => {
      for (const {target,isIntersecting} of entries) {
        if (target === gallery) {
          visible = isIntersecting;
          if (visible && !initialized) show(false);
          sync();
        } else {
          target.classList.toggle('in-view',isIntersecting);
        }
      }
    }, {threshold:.24});
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = e => {
      if (e.matches) paused = true;
      sync();
    };
    motionPreference.addEventListener('change',onMotion);
    observer.observe(gallery);
    page.querySelectorAll('.cinema-scene').forEach(scene => observer.observe(scene));
    const onClick = event => {
      const jump = event.target.closest('[data-scene-scroll]');
      if (jump) {
        event.preventDefault();
        document.getElementById(jump.dataset.sceneScroll).scrollIntoView({behavior:reduced() ? 'instant' : 'smooth'});
      }
      const control = event.target.closest('[data-gallery-control]');
      if (!control) return;
      const action = control.dataset.galleryControl;
      if (action === 'toggle') paused = !paused;
      else step(action === 'prev' ? -1 : 1,true);
      sync();
    };
    page.addEventListener('click',onClick);
    document.addEventListener('visibilitychange',sync);
    sync();
    stopCurrent = () => {
      clearInterval(interval);
      observer.disconnect();
      motionPreference.removeEventListener('change',onMotion);
      document.removeEventListener('visibilitychange',sync);
    };
  }

  return {landing,mount,defaultGallery,asset};
})();
