window.EstateScenes = (() => {
  const scenes = [
    {src:'assets/aurora-estate.webp', label:'บ้าน', title:'บ้านที่อยากกลับมา', alt:'บ้านร่วมสมัยริมสระในแสงเช้า', copy:'ให้ทุกวันเริ่มและจบในพื้นที่ที่รู้สึกเป็นของคุณ'},
    {src:'assets/scenes/business.webp', mobile:'assets/scenes/business-828.webp', label:'ธุรกิจ', title:'พื้นที่ให้ธุรกิจในฝัน', alt:'ผู้ประกอบการในร้านกาแฟขนาดเล็ก', copy:'เริ่มต้นจากพื้นที่ที่เหมาะกับสิ่งที่คุณอยากทำ'},
    {src:'assets/scenes/land.webp', label:'ที่ดิน', title:'ที่ดินที่เลี้ยงชีวิต', alt:'ทิวทัศน์ที่ดินและพื้นที่สีเขียว', copy:'ที่ดินสำหรับเพาะปลูก ลงมือทำ และสร้างรายได้'},
    {src:'assets/scenes/retirement.webp', mobile:'assets/scenes/retirement-828.webp', label:'วัยเกษียณ', title:'วางแผนทุนเพื่อวัยเกษียณ', alt:'คู่สูงวัยดูแลต้นสมุนไพรบนระเบียงบ้าน', copy:'เตรียมเงินลงทุนวันนี้ เพื่อให้วันข้างหน้ามีพื้นที่สำหรับสิ่งที่อยากทำ'},
    {src:'assets/scenes/family.webp', mobile:'assets/scenes/family-828.webp', label:'ครอบครัว', title:'อยู่ใกล้คนที่เรารัก', alt:'ครอบครัวรับประทานอาหารร่วมกันในบ้าน', copy:'มีพื้นที่ให้ครอบครัวได้ใช้เวลาด้วยกัน'},
  ];
  const statuses = {sold:'ขายแล้ว',available:'เปิดขาย',promotion:'โปรโมชั่น',booking:'เปิดจอง'};
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
  const defaultGallery = scenes.map(({src,alt,title}) => ({src,alt,caption:title}));
  const asset = value => typeof value === 'string' && (/^data:image\/(jpeg|webp|png);base64,[\w+/=]+$/.test(value) ||
    value === 'assets/scenes/future.webp' || defaultGallery.some(image => image.src === value)) ? value : '';
  const ribbon = (listing,escape) => listing.status ? '<span class="estate-ribbon" data-tone="'+
    (Object.hasOwn(statuses,listing.status) ? listing.status : 'custom')+'">'+
    escape(listing.ribbon || statuses[listing.status] || '')+'</span>' : '';
  const listingCards = (list,escape,icon) => '<div class="estate-listings">'+list.map(listing =>
    '<article class="estate-listing" data-listing-group="'+escape(listing.group)+'"><details><summary>'+
      '<div class="estate-listing-photo"><img loading="lazy" decoding="async" src="'+
      (asset(listing.src) || defaultGallery[0].src)+'" alt="">'+ribbon(listing,escape)+'</div>'+
      '<div class="estate-listing-copy"><div><h3>'+escape(listing.title)+'</h3><p>'+
      escape(listing.group+' · '+listing.area)+'</p></div><span class="estate-listing-expand">'+
      '<span class="estate-open-label">ดูรายละเอียด</span><span class="estate-close-label">ย่อรายละเอียด</span>'+
      icon('chevron',16)+'</span></div></summary><div class="estate-listing-details"><p>'+
      escape(listing.description)+'</p></div></details></article>').join('')+'</div>';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let stopCurrent = () => {};

  function landing(api) {
    const {icon, escape, brandImage, read} = api;
    const savedList = read('listings-published');
    const listings = Array.isArray(savedList) ? savedList : defaultListings;
    const groups = [...new Set(listings.map(listing => listing.group))];
    const savedGallery = read('gallery-published');
    const gallery = Array.isArray(savedGallery) && savedGallery.length ? savedGallery : defaultGallery;
    const anchor = i => '<div class="cinema-anchor" id="scene-' + i + '" aria-hidden="true"></div>';
    const house = scenes[0];
    const wordmark = '<svg class="opening-wordmark" width="100%" height="100%" aria-hidden="true" focusable="false">' +
      '<defs><g id="opening-letterforms" text-anchor="middle">' +
      '<text x="50%" y="62%" dy=".73em">SUNDAY</text><text class="opening-estate" x="50%" y="62%" dy="2.76em">ESTATE</text></g>' +
      '<linearGradient id="opening-gold-paint" x1="0" y1="0" x2=".13" y2="1">' +
      '<stop stop-color="#fff5dd"/><stop offset=".54" stop-color="#ffe6b1"/><stop offset="1" stop-color="#d0a461"/></linearGradient>' +
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
      '<g class="opening-veil"><image href="assets/scenes/opening-sky.webp" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>' +
      '<rect class="opening-afterglow" width="100%" height="100%" fill="url(#opening-fog-glow)"/></g>' +
      '<image class="opening-mist opening-mist-wide" x="-24%" y="17%" width="148%" height="101%" href="assets/scenes/opening-mist.webp" preserveAspectRatio="none"/>' +
      '<image class="opening-mist opening-mist-narrow" x="-75%" y="17%" width="250%" height="101%" href="assets/scenes/opening-mist.webp" preserveAspectRatio="none"/></g>' +
      '<rect width="100%" height="100%" fill="url(#opening-edge-shade)"/>' +
      '<g class="opening-rise"><use class="opening-gold" href="#opening-letterforms" fill="url(#opening-gold-paint)"/>' +
      '<use class="opening-outline" href="#opening-letterforms"/></g></svg>';
    const opening = anchor(0) + '<div class="opening-track"><section class="cinema-scene cinema-opening" aria-labelledby="scene-title-0">' +
      '<div class="opening-camera"><div class="opening-plate">' +
      '<picture class="opening-visual"><source media="(max-width:639px)" srcset="assets/scenes/opening-dawn-mobile.webp">' +
      '<img class="opening-photo" src="assets/scenes/opening-dawn.webp" alt="ภาพประกอบบ้านไทยร่วมสมัยริมสระในแสงเช้า" width="1536" height="1024" fetchpriority="high"></picture>' +
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
      return '<div class="chapter-track">' + anchor(i) + '<section class="cinema-scene" aria-labelledby="scene-title-' + i + '">' +
        '<img class="cinema-photo" src="' + scene.src + '" alt="' + escape(scene.alt) + '"' +
        (scene.mobile ? ' srcset="' + scene.mobile + ' 828w, ' + scene.src + ' 1440w" sizes="100vw"' : '') +
        ' loading="lazy" decoding="async"><div class="cinema-scrim" aria-hidden="true"></div>' +
        '<div class="cinema-content"><p class="cinema-chapter">' + scene.label + '</p><h2 id="scene-title-' + i + '" tabindex="-1">' +
        scene.title + '</h2><p class="cinema-copy">' + scene.copy + '</p></div></section></div>';
    }).join('');
    return '<div class="cinema-page"><header class="cinema-nav"><a class="cinema-brand" href="#scene-0" data-scene-scroll="scene-0">' +
      brandImage + '<span>Sunday Estate</span></a>' +
      '<nav aria-label="หน้าแรก"><a href="#gallery" data-scene-scroll="gallery">แกลเลอรี</a>' +
      '<a class="cinema-cta" href="#overview">' + (api.signedIn ? 'เปิดแดชบอร์ด ' : 'เข้าสู่ระบบ ') + icon('arrow',17) + '</a></nav></header>' +
      '<main id="workspace" tabindex="-1"><div class="cinema-story">' + opening + chapters + '</div>' +
      '<section id="properties" class="cinema-properties" aria-labelledby="properties-heading"><h2 id="properties-heading" tabindex="-1">ผลงานและทรัพย์เปิดขาย</h2>' +
      '<p>ภาพและสถานะทั้งหมดเป็นตัวอย่างสำหรับทดลองใช้งาน</p>'+
      (groups.length ? '<div class="estate-filters" role="group" aria-label="กรองตามกลุ่มทรัพย์">' +
        '<button class="control" type="button" data-estate-all aria-pressed="true">ทั้งหมด</button>' +
        groups.map(group => '<button class="control" type="button" data-estate-group="'+escape(group)+
          '" aria-pressed="false">'+escape(group)+'</button>').join('')+'</div>' :
        '<p>ยังไม่มีรายการแสดง</p>') + listingCards(listings,escape,icon) + '</section>' +
      '<section id="gallery" class="cinema-gallery" aria-labelledby="gallery-heading"><div class="gallery-heading"><div>' +
      '<h2 id="gallery-heading" tabindex="-1">แกลเลอรี</h2><p id="gallery-hint">ปัด ลาก หรือแตะภาพด้านข้างเพื่อเลือก</p></div>' +
      '<button class="control" type="button" data-gallery-control="toggle" aria-pressed="false" hidden>หยุดภาพ</button></div>' +
      '<figure class="gallery-figure"><div class="gallery-stage" role="group" tabindex="0" aria-label="วงล้อภาพ" aria-describedby="gallery-hint" data-current="0">' +
      gallery.map((row,i) => '<div class="gallery-card'+(i===0?' is-current':'')+'" data-gallery-image="'+i+'">'+
        '<img src="'+(asset(row.src) || defaultGallery[0].src)+'" alt="" draggable="false" loading="lazy" decoding="async">'+
        '</div>').join('')+'</div><figcaption></figcaption></figure>'+
      '<div class="gallery-controls"><div class="gallery-navigation"><button type="button" class="control gallery-prev" data-gallery-control="prev" aria-label="ภาพก่อนหน้า">'+icon('arrow',19)+'</button>'+
      '<span class="gallery-count" aria-live="off" aria-atomic="true"></span>'+
      '<button type="button" class="control" data-gallery-control="next" aria-label="ภาพถัดไป">'+icon('arrow',19)+'</button>'+
      '</div></div></section></main></div>';
  }

  function mount(api) {
    stopCurrent();
    const page = document.querySelector('.cinema-page');
    if (!page) return;
    const stored = api.read('gallery-published');
    const list = Array.isArray(stored) && stored.length ? stored : defaultGallery;
    const gallery = page.querySelector('#gallery');
    const stopGallery = window.mountEstateGallery(gallery,list,motion);
    const skip = document.querySelector('.skip');
    const onSkip = event => {
      event.preventDefault();
      page.querySelector('main').focus();
    };
    const filters = [...page.querySelectorAll('[data-estate-all],[data-estate-group]')];
    const properties = [...page.querySelectorAll('[data-listing-group]')];
    const onClick = event => {
      const filter = event.target.closest('[data-estate-all],[data-estate-group]');
      if (filter) {
        filters.forEach(button => button.setAttribute('aria-pressed',String(button===filter)));
        properties.forEach(card => { card.hidden = !!filter.dataset.estateGroup && card.dataset.listingGroup !== filter.dataset.estateGroup; });
      }
      const jump = event.target.closest('[data-scene-scroll]');
      if (jump) {
        event.preventDefault();
        const destination = document.getElementById(jump.dataset.sceneScroll);
        destination.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth'});
        const heading = destination.matches('.cinema-anchor') ? destination.nextElementSibling.querySelector('h1,h2') : destination.querySelector('h2');
        heading?.focus({preventScroll:true});
      }
    };

    page.addEventListener('click',onClick);
    skip.addEventListener('click',onSkip);
    const entry = new URLSearchParams(location.search).get('section');
    let jumpFrame;
    if (entry === 'gallery' || entry === 'properties') {
      jumpFrame = requestAnimationFrame(() => page.querySelector('#'+entry).scrollIntoView({behavior:'instant'}));
    }
    stopCurrent = () => {
      cancelAnimationFrame(jumpFrame);
      stopGallery();
      skip.removeEventListener('click',onSkip);
      page.removeEventListener('click',onClick);
    };
  }

  return {landing,mount,defaultGallery,defaultListings,statuses,listingCards,asset};
})();
