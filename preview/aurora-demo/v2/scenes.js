window.EstateScenes = (() => {
  const media = window.EstateMedia;
  // Public-facing fields from the existing Sunday Estate landing company profile.
  const company = {
    name:'บริษัท ซันเดย์ เอสเตท จำกัด',
    nameEn:'SUNDAY ESTATE CO., LTD.',
    registration:'0105568042151',
    address:'เลขที่ 21 ซอยสังคมสงเคราะห์ 30 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230',
    phone:'099-265-4265',
    email:'aase7en@sunday-estate.com',
  };
  const scenes = [
    {src:'assets/aurora-estate.webp', label:'บ้าน', title:'บ้านที่อยากกลับมา', alt:'บ้านร่วมสมัยริมสระในแสงเช้า', copy:'ให้ทุกวันเริ่มและจบในพื้นที่ที่รู้สึกเป็นของคุณ'},
    {key:'business', src:'assets/scenes/business.webp', mobile:'assets/scenes/business-828.webp', label:'ธุรกิจ', title:'พื้นที่ให้ธุรกิจในฝัน', alt:'ผู้ประกอบการในร้านกาแฟขนาดเล็ก', copy:'เริ่มต้นจากพื้นที่ที่เหมาะกับสิ่งที่คุณอยากทำ'},
    {key:'land', src:'assets/scenes/land.webp', label:'ที่ดิน', title:'ที่ดินที่เลี้ยงชีวิต', alt:'ทิวทัศน์ที่ดินและพื้นที่สีเขียว', copy:'ที่ดินสำหรับเพาะปลูก ลงมือทำ และสร้างรายได้'},
    {key:'retirement', src:'assets/scenes/retirement.webp', mobile:'assets/scenes/retirement-828.webp', label:'วัยเกษียณ', title:'วางแผนทุนเพื่อวัยเกษียณ', alt:'คู่สูงวัยดูแลต้นสมุนไพรบนระเบียงบ้าน', copy:'เตรียมเงินลงทุนวันนี้ เพื่อให้วันข้างหน้ามีพื้นที่สำหรับสิ่งที่อยากทำ'},
    {key:'family', src:'assets/scenes/family.webp', mobile:'assets/scenes/family-828.webp', label:'ครอบครัว', title:'อยู่ใกล้คนที่เรารัก', alt:'ครอบครัวรับประทานอาหารร่วมกันในบ้าน', copy:'มีพื้นที่ให้ครอบครัวได้ใช้เวลาด้วยกัน'},
  ];
  const statuses = {sold:'ขายแล้ว',available:'เปิดขาย',promotion:'โปรโมชั่น',booking:'เปิดจอง'};
  const bookable = status => status === 'available' || status === 'booking';
  const defaultListings = [
    {id:'SE-DEMO-01',title:'บ้านร่วมสมัยริมสระ',area:'ชานเมือง',group:'บ้านและที่อยู่อาศัย',status:'sold',src:scenes[0].src,
      description:'พื้นที่นั่งเล่นเปิดสู่สวนและสระ แสดงตัวอย่างการนำเสนอผลงานที่ปิดการขายแล้ว'},
    {id:'SE-DEMO-02',title:'ที่ดินสำหรับทำสวน',area:'พื้นที่เกษตร',group:'ที่ดิน',status:'available',src:scenes[2].src,
      description:'แปลงตัวอย่างสำหรับทำสวนและวางแผนใช้พื้นที่ ใช้สาธิตการนำเสนอทรัพย์ที่เปิดขาย'},
    {id:'SE-DEMO-03',title:'พื้นที่สำหรับร้านกาแฟ',area:'ย่านชุมชน',group:'พื้นที่ธุรกิจ',status:'promotion',src:scenes[1].src,
      description:'ตัวอย่างพื้นที่ธุรกิจขนาดเล็กพร้อมมุมนั่งเล่น ป้ายโปรโมชั่นใช้สาธิตการจัดวางบนภาพ'},
    {id:'SE-DEMO-04',title:'บ้านพักในสวน',area:'ทำเลเงียบสงบ',group:'บ้านและที่อยู่อาศัย',status:'booking',src:scenes[4].src,
      description:'ตัวอย่างโครงการพักอาศัยขนาดเล็กท่ามกลางพื้นที่สีเขียว แสดงรูปแบบการ์ดเปิดจอง'},
  ];
  const defaultGallery = [
    ...scenes.map(({src,alt,title}) => ({src,alt,caption:title})),
    {src:'assets/scenes/opening-dawn.webp', alt:'บ้านไทยร่วมสมัยริมสระและแนวเขาในแสงเช้า', caption:'รุ่งเช้าเหนือแนวเขา'},
    {src:'assets/mastheads/overview-mobile.webp', alt:'บ้านไม้และหินธรรมชาติริมสระสะท้อนแสง', caption:'บ้านพักริมสระ'},
    {src:'assets/mastheads/investments-mobile.webp', alt:'แปลงเกษตรที่มีแนวต้นไม้และถนนแบ่งพื้นที่', caption:'มุมสูงเหนือแปลงเกษตร'},
    {src:'assets/mastheads/lending-mobile.webp', alt:'ร้านกาแฟไม้และกระจกท่ามกลางสวน', caption:'ร้านกาแฟในสวน'},
  ];
  const asset = value => typeof value === 'string' && (/^data:image\/(jpeg|webp|png);base64,[\w+/=]+$/.test(value) ||
    value === 'assets/scenes/future.webp' || defaultGallery.some(image => image.src === value)) ? value : '';
  const ribbon = (listing,escape) => listing.status ? '<span class="estate-ribbon" data-tone="'+
    (Object.hasOwn(statuses,listing.status) ? listing.status : 'custom')+'">'+
    escape(listing.ribbon || statuses[listing.status] || '')+'</span>' : '';
  const bookingEmail = listing => 'mailto:'+company.email+'?subject='+
    encodeURIComponent('[เดโม] สอบถามทรัพย์ '+listing.title)+'&body='+encodeURIComponent(
      'สวัสดีค่ะ/ครับ\n\nสนใจสอบถามรายละเอียดหรือนัดชมทรัพย์ตัวอย่าง '+listing.title+' ('+listing.id+')\n\n');
  const listingCards = (list,escape,icon,withInquiry = false) => '<div class="estate-listings">'+list.map(listing =>
    '<article class="estate-listing" data-listing-group="'+escape(listing.group)+'" data-listing-status="'+escape(listing.status)+'"><details><summary>'+
      '<div class="estate-listing-photo"><img loading="lazy" decoding="async" src="'+
      (asset(listing.src) || defaultGallery[0].src)+'" alt="">'+ribbon(listing,escape)+'</div>'+
      '<div class="estate-listing-copy"><div><h3>'+escape(listing.title)+'</h3><p>'+
      escape(listing.group+' · '+listing.area)+'</p></div><span class="estate-listing-expand">'+
      '<span class="estate-open-label">ดูรายละเอียด</span><span class="estate-close-label">ย่อรายละเอียด</span>'+
      icon('chevron',16)+'</span></div></summary><div class="estate-listing-details"><p>'+
      escape(listing.description)+'</p>'+(withInquiry && bookable(listing.status) ?
        '<a class="cinema-cta estate-inquiry" href="'+escape(bookingEmail(listing))+'">'+icon('mail',17)+' ร่างอีเมลสอบถามทรัพย์</a>' : '')+
      '</div></details></article>').join('')+'</div>';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let stopCurrent = () => {};

  function navigation(icon, brandImage, signedIn) {
    const accessLabel = signedIn ? 'เปิดแดชบอร์ด' : 'เข้าสู่ระบบ';
    const links = [
      ['properties','จองซื้อ / นัดชม','calendar',' data-booking-link'],
      ['properties','ผลงานและทรัพย์เปิดขาย','home'],
      ['company','เกี่ยวกับบริษัท','globe'],
      ['contact','ติดต่อเรา','phone'],
      ['gallery','แกลเลอรี','image'],
    ];
    return '<header class="cinema-nav"><a class="cinema-brand" href="#scene-0" data-scene-scroll="scene-0">'+
      brandImage+'<span>Sunday Estate</span></a><div class="cinema-nav-actions">'+
      '<a class="cinema-cta cinema-access" href="#overview">'+accessLabel+' '+icon('arrow',17)+'</a>'+
      '<button class="cinema-menu-toggle" type="button" aria-label="เปิดเมนู" aria-expanded="false" aria-controls="cinema-menu" data-cinema-toggle>'+
      '<span class="cinema-menu-open">'+icon('menu',22)+'</span><span class="cinema-menu-close">'+icon('x',22)+'</span></button></div>'+
      '<nav id="cinema-menu" class="cinema-menu" aria-label="เมนูเว็บไซต์" hidden><a class="cinema-menu-access" href="#overview">'+
      icon('user',19)+'<span>'+accessLabel+'</span>'+icon('arrow',16)+'</a>'+
      links.map(([id,label,glyph,extra=''])=>'<a href="#'+id+'" data-scene-scroll="'+id+'"'+extra+'>'+icon(glyph,19)+
        '<span>'+label+'</span>'+icon('right',16)+'</a>').join('')+'</nav></header>';
  }

  function companyFooter(icon, brandImage) {
    const map = 'https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(company.address);
    return '<footer class="cinema-footer" aria-label="ข้อมูลและช่องทางติดต่อบริษัท"><div class="company-grid">'+
      '<section id="company" class="company-section" aria-labelledby="company-heading">'+
      '<h2 id="company-heading" tabindex="-1">เกี่ยวกับบริษัท</h2><div class="company-identity">'+brandImage+
      '<div><h3>'+company.name+'</h3><p lang="en">'+company.nameEn+'</p></div></div>'+
      '<p class="company-description">ทำงานด้านที่ดินและอสังหาริมทรัพย์ ตั้งแต่การซื้อขายและจัดสรรที่ดิน ไปจนถึงการพัฒนาและบริหารทรัพย์สิน</p>'+
      '<dl class="company-meta"><div><dt>เลขทะเบียนนิติบุคคล</dt><dd>'+company.registration+'</dd></div></dl></section>'+
      '<section id="contact" class="company-section" aria-labelledby="contact-heading"><h2 id="contact-heading" tabindex="-1">ติดต่อเรา</h2>'+
      '<address class="company-contacts"><a href="tel:'+company.phone.replaceAll('-','')+'">'+icon('phone',20)+
      '<span><small>โทรศัพท์</small><strong>'+company.phone+'</strong></span></a><a href="mailto:'+company.email+'">'+icon('mail',20)+
      '<span><small>อีเมล</small><strong>'+company.email+'</strong></span></a><a href="'+map+'" target="_blank" rel="noopener noreferrer">'+icon('pin',20)+
      '<span><small>ค้นหาที่อยู่บนแผนที่</small><strong>'+company.address+'</strong></span></a></address></section></div></footer>';
  }

  function landing(api) {
    const {icon, escape, brandImage, read} = api;
    const savedList = read('listings-published');
    const listings = Array.isArray(savedList) ? savedList : defaultListings;
    const groups = [...new Set(listings.map(listing => listing.group))];
    const savedGallery = read('gallery-published');
    const gallery = Array.isArray(savedGallery) && savedGallery.length ? savedGallery : defaultGallery;
    const anchor = i => '<div class="cinema-anchor" id="scene-' + i + '" aria-hidden="true"></div>';
    const house = scenes[0];
    const openingStyle = [['intro','wide'],['intro-mobile','mobile']].filter(([key])=>media.has(key))
      .map(([key,variant])=>'--opening-photo-'+variant+':url('+media.source(key)+');--opening-cut-'+variant+':inset(42% 0 0)').join(';');
    const wordmark = '<svg class="opening-wordmark" width="100%" height="100%" aria-hidden="true" focusable="false">' +
      '<defs><g id="opening-letterforms" text-anchor="middle">' +
      '<text x="50%" y="62%" dy=".73em">SUNDAY</text><text class="opening-estate" x="50%" y="62%" dy="2.76em">ESTATE</text></g>' +
      '<linearGradient id="opening-gold-paint" x1="0" y1="0" x2=".13" y2="1">' +
      '<stop stop-color="#ffe36a"/><stop offset=".54" stop-color="#ffc423"/><stop offset="1" stop-color="#e7a00a"/></linearGradient>' +
      '<radialGradient id="opening-fog-glow" cx=".53" cy=".27" r=".47">' +
      '<stop stop-color="#fff9e3" stop-opacity=".70"/><stop offset=".28" stop-color="#ffd499" stop-opacity=".39"/>' +
      '<stop offset=".57" stop-color="#ffbe75" stop-opacity=".18"/><stop offset="1" stop-color="#ffbe75" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="opening-edge-shade" x2="0" y2="1">' +
      '<stop stop-color="#131829" stop-opacity=".08"/><stop offset=".22" stop-color="#131829" stop-opacity="0"/>' +
      '<stop offset=".65" stop-color="#0a1529" stop-opacity="0"/><stop offset=".94" stop-color="#0a1529" stop-opacity=".62"/>' +
      '<stop offset="1" stop-color="#101d32"/></linearGradient>' +
      '<mask id="opening-fog-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">' +
      '<rect width="100%" height="100%" fill="white"/><g class="opening-rise"><use class="opening-aperture" href="#opening-letterforms" fill="black"/></g></mask></defs>' +
      '<g class="opening-fog-group" mask="url(#opening-fog-mask)">' +
      '<g class="opening-veil"><image href="'+media.source('intro-sky')+'" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>' +
      '<rect class="opening-afterglow" width="100%" height="100%" fill="url(#opening-fog-glow)"/></g>' +
      '<image class="opening-mist opening-mist-wide" x="-24%" y="17%" width="148%" height="101%" href="'+media.source('intro-mist')+'" preserveAspectRatio="none"/>' +
      '<image class="opening-mist opening-mist-narrow" x="-75%" y="17%" width="250%" height="101%" href="'+media.source('intro-mist')+'" preserveAspectRatio="none"/></g>' +
      '<rect width="100%" height="100%" fill="url(#opening-edge-shade)"/>' +
      '<g class="opening-rise"><use class="opening-gold" href="#opening-letterforms" fill="url(#opening-gold-paint)"/>' +
      '<use class="opening-outline" href="#opening-letterforms"/></g></svg>';
    const opening = anchor(0) + '<div class="opening-track"'+(openingStyle?' style="'+openingStyle+'"':'')+'><section class="cinema-scene cinema-opening" aria-labelledby="scene-title-0">' +
      '<div class="opening-camera"><div class="opening-plate">' +
      '<picture class="opening-visual"><source media="(max-width:639px)" srcset="'+media.source('intro-mobile')+'">' +
      '<img class="opening-photo" src="'+media.source('intro')+'" alt="'+(openingStyle?'ภาพประกอบฉากเปิด':'ภาพประกอบบ้านไทยร่วมสมัยริมสระในแสงเช้า')+'" width="1536" height="1024" fetchpriority="high"></picture>' +
      '<div class="opening-sun" aria-hidden="true"></div>' +
      '<div class="opening-message"><h1 id="scene-title-0" tabindex="-1">' + house.title + '</h1><p>' + house.copy + '</p></div>' +
      '<div class="opening-foreground" aria-hidden="true"></div></div></div>' +
      wordmark +
      '<div class="opening-reveal opening-rise" aria-hidden="true">' + brandImage + '</div>' +
      '<div class="opening-footer"><p class="opening-cue" aria-hidden="true">' + icon('chevron',16) + ' เลื่อนเพื่อชมฉากเปิด</p>' +
      '<div class="cinema-actions opening-actions"><a class="cinema-cta" href="#scene-1" data-scene-scroll="scene-1">ฉากถัดไป ' +
      icon('chevron',16) + '</a><a class="cinema-cta" href="#properties" data-scene-scroll="properties">ดูผลงานและทรัพย์</a></div></div></section></div>';
    const chapters = scenes.slice(1).map((scene,index) => {
      const i = index + 1;
      const key = 'chapter-'+scene.key;
      const mobileKey = key+'-mobile';
      const mobileSrc = !media.has(mobileKey) && scene.mobile ? scene.mobile+' 828w, '+scene.src+' 1440w' : media.source(mobileKey);
      const alt = media.has(key)||media.has(mobileKey) ? 'ภาพประกอบฉาก'+scene.label : scene.alt;
      return '<div class="chapter-track">' + anchor(i) + '<section class="cinema-scene" aria-labelledby="scene-title-' + i + '">' +
        '<picture><source media="(max-width:639px)" srcset="'+mobileSrc+'" sizes="100vw">'+
        '<img class="cinema-photo" src="'+media.source(key)+'" alt="'+escape(alt)+'"'+
        (media.has(mobileKey)?' data-custom-mobile':'')+' loading="lazy" decoding="async"></picture><div class="cinema-scrim" aria-hidden="true"></div>' +
        '<div class="cinema-content"><p class="cinema-chapter">' + scene.label + '</p><h2 id="scene-title-' + i + '" tabindex="-1">' +
        scene.title + '</h2><p class="cinema-copy">' + scene.copy + '</p></div></section></div>';
    }).join('');
    return '<div class="cinema-page">'+navigation(icon,brandImage,api.signedIn)+
      '<main id="workspace" tabindex="-1"><div class="cinema-story">' + opening + chapters + '</div>' +
      '<section id="properties" class="cinema-properties" aria-labelledby="properties-heading"><h2 id="properties-heading" tabindex="-1">ผลงานและทรัพย์เปิดขาย</h2>' +
      '<p>ภาพและสถานะทรัพย์เป็นตัวอย่าง ปุ่มสอบถามจะเปิดอีเมลร่างให้ตรวจและส่งเอง</p>'+
      '<div class="estate-filters" role="group" aria-label="กรองรายการทรัพย์">' +
        '<button class="control" type="button" data-estate-all aria-pressed="true">ทั้งหมด</button>' +
        '<button class="control" type="button" data-estate-bookable aria-pressed="false">เปิดขาย / เปิดจอง</button>'+
        groups.map(group => '<button class="control" type="button" data-estate-group="'+escape(group)+
          '" aria-pressed="false">'+escape(group)+'</button>').join('')+'</div>'+
      '<p data-estate-empty role="status"'+(listings.length?' hidden':'')+'>ไม่มีทรัพย์ในรายการที่เลือก</p>'+
      listingCards(listings,escape,icon,true) + '</section>' +
      '<section id="gallery" class="cinema-gallery" aria-labelledby="gallery-heading"><div class="gallery-heading"><div>' +
      '<h2 id="gallery-heading" tabindex="-1">แกลเลอรี</h2><p id="gallery-hint">ปัด ลาก หรือแตะภาพเพื่อเลื่อนมาด้านหน้า</p></div>' +
      '<button class="control" type="button" data-gallery-control="toggle" aria-pressed="false" hidden>หยุดภาพ</button></div>' +
      '<figure class="gallery-figure"><div class="gallery-stage" role="group" tabindex="0" aria-label="วงล้อภาพ" aria-describedby="gallery-hint" data-current="0">' +
      gallery.map((row,i) => '<div class="gallery-card'+(i===0?' is-current':'')+'" data-gallery-image="'+i+'">'+
        '<img src="'+(asset(row.src) || defaultGallery[0].src)+'" alt="" draggable="false" loading="lazy" decoding="async">'+
        '</div>').join('')+'</div><figcaption></figcaption></figure>'+
      '<div class="gallery-controls"><div class="gallery-navigation"><button type="button" class="control gallery-prev" data-gallery-control="prev" aria-label="ภาพก่อนหน้า">'+icon('arrow',19)+'</button>'+
      '<span class="gallery-count" aria-live="off" aria-atomic="true"></span>'+
      '<button type="button" class="control" data-gallery-control="next" aria-label="ภาพถัดไป">'+icon('arrow',19)+'</button>'+
      '</div></div></section></main>'+companyFooter(icon,brandImage)+'</div>';
  }

  function mountChapterMotion(page) {
    if (CSS.supports('animation-timeline: view()')) return () => {};
    const chapters = [...page.querySelectorAll('.chapter-track')];
    let frame = 0;

    function update() {
      frame = 0;
      if (motion.matches) return;
      const height = document.documentElement.clientHeight;
      if (!height) return;
      const progress = chapters.map(chapter =>
        String(Math.max(0, Math.min(2, 1 - chapter.getBoundingClientRect().top / height))));
      chapters.forEach((chapter, index) => {
        if (chapter.style.getPropertyValue('--chapter-progress') !== progress[index]) {
          chapter.style.setProperty('--chapter-progress', progress[index]);
          chapter.setAttribute('data-chapter-motion', '');
        }
      });
    }

    function schedule() {
      if (!frame && !motion.matches) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      motion.removeEventListener('change', schedule);
    };
  }

  function mount(api) {
    stopCurrent();
    const page = document.querySelector('.cinema-page');
    if (!page) return;
    const stored = api.read('gallery-published');
    const list = Array.isArray(stored) && stored.length ? stored : defaultGallery;
    const gallery = page.querySelector('#gallery');
    const stopGallery = window.mountEstateGallery(gallery,list,motion);
    const stopChapterMotion = mountChapterMotion(page);
    const skip = document.querySelector('.skip');
    const onSkip = event => {
      event.preventDefault();
      page.querySelector('main').focus();
    };
    const filterSelector = '[data-estate-all],[data-estate-bookable],[data-estate-group]';
    const filters = [...page.querySelectorAll(filterSelector)];
    const properties = [...page.querySelectorAll('[data-listing-group]')];
    const empty = page.querySelector('[data-estate-empty]');
    const toggle = page.querySelector('[data-cinema-toggle]');
    const menu = page.querySelector('#cinema-menu');
    const events = new AbortController();
    const listenerOptions = {signal:events.signal};
    function showMenu(open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู');
    }
    function filterListings(filter) {
      filters.forEach(button=>button.setAttribute('aria-pressed',String(button===filter)));
      const group = filter.dataset.estateGroup;
      const onlyBookable = filter.hasAttribute('data-estate-bookable');
      properties.forEach(card=>{
        card.hidden = (onlyBookable && !bookable(card.dataset.listingStatus)) || (group !== undefined && group !== card.dataset.listingGroup);
      });
      empty.hidden = properties.some(card=>!card.hidden);
    }
    const onClick = event => {
      if (toggle.contains(event.target)) {
        showMenu(menu.hidden);
        if (!menu.hidden && event.detail === 0) menu.querySelector('a').focus({preventScroll:true});
        return;
      }
      const filter = event.target.closest(filterSelector);
      if (filter) filterListings(filter);
      const jump = event.target.closest('[data-scene-scroll]');
      if (jump) {
        event.preventDefault();
        if (jump.dataset.sceneScroll === 'properties') {
          filterListings(page.querySelector(jump.hasAttribute('data-booking-link')?'[data-estate-bookable]':'[data-estate-all]'));
        }
        showMenu(false);
        const destination = document.getElementById(jump.dataset.sceneScroll);
        destination.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth'});
        const heading = destination.matches('.cinema-anchor') ? destination.nextElementSibling.querySelector('h1,h2') : destination.querySelector('h2');
        heading?.focus({preventScroll:true});
      }
    };
    function dismissOutside(event) {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) showMenu(false);
    }
    page.addEventListener('click',onClick,listenerOptions);
    skip.addEventListener('click',onSkip,listenerOptions);
    document.addEventListener('pointerdown',dismissOutside,listenerOptions);
    document.addEventListener('focusin',dismissOutside,listenerOptions);
    document.addEventListener('keydown',event=>{
      if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault();
        showMenu(false);
        toggle.focus({preventScroll:true});
      }
    },listenerOptions);
    const entry = new URLSearchParams(location.search).get('section');
    let jumpFrame;
    if (['gallery','properties','booking','company','contact'].includes(entry)) {
      const target = entry === 'booking' ? 'properties' : entry;
      if (entry === 'booking') filterListings(page.querySelector('[data-estate-bookable]'));
      jumpFrame = requestAnimationFrame(() => page.querySelector('#'+target).scrollIntoView({behavior:'instant'}));
    }
    stopCurrent = () => {
      cancelAnimationFrame(jumpFrame);
      stopGallery();
      stopChapterMotion();
      events.abort();
    };
  }

  return {landing,mount,defaultGallery,defaultListings,statuses,listingCards,asset};
})();
