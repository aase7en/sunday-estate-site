window.EstateScenes = (() => {
  const scenes = [
    {src:'assets/aurora-estate.webp', label:'บ้าน', title:'บ้านที่อยากกลับมา', alt:'บ้านร่วมสมัยริมสระในแสงเช้า', copy:'ให้ทุกวันเริ่มและจบในพื้นที่ที่รู้สึกเป็นของคุณ'},
    {src:'assets/scenes/business.webp', mobile:'assets/scenes/business-828.webp', label:'ธุรกิจ', title:'พื้นที่ให้ธุรกิจในฝัน', alt:'ผู้ประกอบการในร้านกาแฟขนาดเล็ก', copy:'เริ่มต้นจากพื้นที่ที่เหมาะกับสิ่งที่คุณอยากทำ'},
    {src:'assets/scenes/land.webp', label:'ที่ดิน', title:'ที่ดินที่เลี้ยงชีวิต', alt:'ทิวทัศน์ที่ดินและพื้นที่สีเขียว', copy:'ที่ดินสำหรับเพาะปลูก ลงมือทำ และสร้างรายได้'},
    {src:'assets/scenes/future.webp', label:'วัยเกษียณ', title:'วางแผนทุนเพื่อวัยเกษียณ', alt:'พื้นที่พักอาศัยท่ามกลางบรรยากาศสงบ', copy:'เตรียมเงินลงทุนวันนี้ เพื่อให้วันข้างหน้ามีพื้นที่สำหรับสิ่งที่อยากทำ'},
    {src:'assets/scenes/family.webp', mobile:'assets/scenes/family-828.webp', label:'ครอบครัว', title:'อยู่ใกล้คนที่เรารัก', alt:'ครอบครัวรับประทานอาหารร่วมกันในบ้าน', copy:'มีพื้นที่ให้ครอบครัวได้ใช้เวลาด้วยกัน'},
  ];
  const defaultGallery = scenes.map(({src,alt,title}) => ({src,alt,caption:title}));
  const asset = value => typeof value === 'string' && (/^data:image\/(jpeg|webp|png);base64,[\w+/=]+$/.test(value) ||
    defaultGallery.some(image => image.src === value)) ? value : '';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let stopCurrent = () => {};

  function landing(api) {
    const {icon, escape, brandImage} = api;
    const chapters = scenes.map((scene,i) =>
      '<div class="cinema-anchor" id="scene-' + i + '" aria-hidden="true"></div><section class="cinema-scene' +
      (i === 0 ? ' cinema-opening' : '') + '" aria-labelledby="scene-title-' + i + '">' +
      '<img class="cinema-photo" src="' + scene.src + '" alt="' + escape(scene.alt) + '"' +
      (scene.mobile ? ' srcset="' + scene.mobile + ' 828w, ' + scene.src + ' 1440w" sizes="100vw"' : '') +
      (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') + '>' +
      '<div class="cinema-scrim"></div><div class="cinema-content"><p class="cinema-chapter">' + scene.label + '</p>' +
      (i === 0 ? '<h1' : '<h2') + ' id="scene-title-' + i + '" tabindex="-1">' + scene.title + (i === 0 ? '</h1>' : '</h2>') +
      '<p class="cinema-copy">' + scene.copy + '</p>' + (i ? '' :
        '<div class="cinema-actions"><a class="cinema-cta" href="#scene-1" data-scene-scroll="scene-1">เลื่อนดูเรื่องราว ' +
        icon('chevron',16) + '</a></div>') + '</div></section>').join('');
    return '<div class="cinema-page"><header class="cinema-nav"><a class="cinema-brand" href="#scene-0" data-scene-scroll="scene-0">' +
      brandImage + '<span>Sunday Estate</span></a>' +
      '<nav aria-label="หน้าแรก"><a href="#gallery" data-scene-scroll="gallery">แกลเลอรี</a>' +
      '<a class="cinema-cta" href="#overview">เปิดแดชบอร์ด ' + icon('arrow',17) + '</a></nav></header>' +
      '<main id="workspace" tabindex="-1"><div class="cinema-story">' + chapters + '</div>' +
      '<section id="gallery" class="cinema-gallery" aria-labelledby="gallery-heading"><div class="gallery-heading"><div>' +
      '<h2 id="gallery-heading" tabindex="-1">แกลเลอรี</h2><p>ภาพประกอบแนวคิด</p></div>' +
      '<button class="control" type="button" data-gallery-control="toggle" aria-pressed="false">หยุดภาพ</button></div>' +
      '<figure class="gallery-stage"><img class="gallery-photo" alt=""><img class="gallery-photo" alt="" aria-hidden="true">' +
      '<figcaption></figcaption></figure><div class="gallery-controls">' +
      '<button type="button" class="control" data-gallery-control="prev">ภาพก่อนหน้า</button><span aria-live="polite"></span>' +
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
    const photos = [...stage.querySelectorAll('img')];
    const caption = stage.querySelector('figcaption');
    const count = page.querySelector('.gallery-controls span');
    const toggle = page.querySelector('[data-gallery-control="toggle"]');
    const cards = [...page.querySelectorAll('.cinema-scene')];
    const anchors = [...page.querySelectorAll('.cinema-anchor')];
    const nav = page.querySelector('.cinema-nav');
    const introActions = cards[0].querySelector('.cinema-actions');
    const compact = matchMedia('(max-height:540px)');
    const skip = document.querySelector('.skip');
    const onSkip = event => {
      event.preventDefault();
      page.querySelector('main').focus();
    };
    let frame = 0;
    let active = -1;

    function updateChapter() {
      frame = 0;
      const navBottom = nav.getBoundingClientRect().bottom;
      const next = anchors.reduce((current, anchor, i) => anchor.getBoundingClientRect().top <= navBottom + 45 ? i : current,0);
      if (next === active) return;
      cards[active]?.classList.remove('in-view');
      active = next;
      cards[active].classList.add('in-view');
      syncIntro();
    }
    const syncIntro = () => { introActions.inert = active > 0 && !motion.matches && !compact.matches; };
    const queueChapter = () => { if (!frame) frame = requestAnimationFrame(updateChapter); };

    let index = 0;
    let current = -1;
    let request = 0;
    let userPaused = false;
    let visible = false;
    let interval;
    const show = async manual => {
      const revision = ++request;
      const next = current === 0 ? 1 : 0;
      const incoming = photos[next];
      const outgoing = photos[current];
      const row = list[index];
      incoming.src = asset(row.src) || defaultGallery[0].src;
      incoming.alt = row.alt;
      try { await incoming.decode(); }
      catch {
        if (revision !== request) return;
        incoming.src = defaultGallery[0].src;
        incoming.alt = defaultGallery[0].alt;
        try { await incoming.decode(); } catch { return; }
      }
      if (revision !== request) return;
      outgoing?.classList.remove('is-current');
      outgoing?.setAttribute('aria-hidden','true');
      incoming.classList.add('is-current');
      incoming.removeAttribute('aria-hidden');
      current = next;
      caption.textContent = row.caption;
      count.setAttribute('aria-live', manual ? 'polite' : 'off');
      count.textContent = (index + 1) + ' / ' + list.length;
    };
    const step = (delta, manual) => {
      index = (index + delta + list.length) % list.length;
      void show(manual);
    };
    const sync = () => {
      clearInterval(interval);
      toggle.hidden = motion.matches || list.length < 2;
      toggle.textContent = userPaused ? 'เล่นภาพต่อ' : 'หยุดภาพ';
      toggle.setAttribute('aria-pressed', String(userPaused));
      if (visible && !userPaused && !document.hidden && !motion.matches && list.length > 1) {
        interval = setInterval(() => step(1,false),8000);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && request === 0) void show(false);
      sync();
    }, {threshold:.15});
    const onMotion = () => {
      syncIntro();
      sync();
    };
    const onClick = event => {
      const jump = event.target.closest('[data-scene-scroll]');
      if (jump) {
        event.preventDefault();
        const destination = document.getElementById(jump.dataset.sceneScroll);
        destination.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth'});
        const heading = destination.matches('.cinema-anchor') ? destination.nextElementSibling.querySelector('h1,h2') : destination.querySelector('h2');
        heading?.focus({preventScroll:true});
      }
      const control = event.target.closest('[data-gallery-control]');
      if (!control) return;
      const action = control.dataset.galleryControl;
      if (action === 'toggle') userPaused = !userPaused;
      else step(action === 'prev' ? -1 : 1,true);
      sync();
    };

    page.addEventListener('click',onClick);
    window.addEventListener('scroll',queueChapter,{passive:true});
    window.addEventListener('resize',queueChapter);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',onMotion);
    compact.addEventListener('change',syncIntro);
    skip.addEventListener('click',onSkip);
    observer.observe(gallery);
    updateChapter();
    sync();
    stopCurrent = () => {
      ++request;
      clearInterval(interval);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll',queueChapter);
      window.removeEventListener('resize',queueChapter);
      motion.removeEventListener('change',onMotion);
      compact.removeEventListener('change',syncIntro);
      skip.removeEventListener('click',onSkip);
      document.removeEventListener('visibilitychange',sync);
    };
  }

  return {landing,mount,defaultGallery,asset};
})();
